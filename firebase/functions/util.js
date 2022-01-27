const admin = require("firebase-admin");
const randomstring = require("randomstring");

// Private service account key
const serviceAccount = require("./permissions.json");

// Authorise Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// Assign database reference
const db = admin.firestore();

// Initialise constants
const HTTP400 = "400 Bad Request: ";
const HTTP404 = "404 Not Found: ";
const HTTP500 = "500 Internal Server Error: ";

/*      ======== GENERAL UTIL FUNCTIONS ========      */

// general function for modifying the date-containing parameters of temp objects into formatted strings
function formatTimestamps(dataObject) {
  if (!dataObject) {
    return;
  }
  for (fieldName of ["date", "modified"]) {
    if (!dataObject[fieldName]) {
      // document does not contain the given field; skip it
      continue;
    }
    // cast field value as JS date object which has a built-in function to format it as a string
    date = new Date(dataObject[fieldName]._seconds * 1000); // Date object constructor takes milliseconds
    // formatting using specified locale, default en-GB uses dd/mm/YYYY
    dataObject[fieldName] = date.toJSON();
  }
}

// general function for performing action on single document
function executeQuery(req, res, collectionName, onSuccessCallback) {
  // get id from url parameters or arguments, e.g. /api/news/foo or /api/news/?id=foo
  const id = req.params.id || req.query.id;
  // check if the id was provided in the query parameters
  if (id) {
    // initialise query
    const docRef = db.collection(collectionName).doc(id);
    // validation success; execute the given callback function
    onSuccessCallback(docRef);
  } else {
    // return an error if the query parameters do not contain the id of the document to be updated
    return res
      .status(400)
      .json({ errorDescription: HTTP400 + "No document ID specified." });
  }
}

// .thennable function for generating a random shortened URL
function generateRandomURL(length = 7) {
  // generate new URLs until it finds one that hasn't been used yet
  const shortURLs = db.collection("links");
  let continueLooping = true;

  function resolve(_resolve, _reject) {
    while (continueLooping) {
      // generate alphanumeric string with given length
      const randStr = randomstring.generate(length);
      // regenerate if the link is taken
      shortURLs
        .doc(randStr)
        .get()
        .then((doc) => {
          if (!doc.data()) {
            continueLooping = false;
            _resolve(randStr);
          }
        });
    }
  }

  return { then: resolve };
}

function createShortenedURL(res, destination, customURL) {
  // initialise the links collection reference
  const shortURLs = db.collection("links");

  // initialise query to check if there is already a short url for the given destination
  const existingDestinationQuery = shortURLs
    .where("destination", "==", destination)
    .limit(1);

  function createDocument(id) {
    shortURLs.doc(id).set({
      destination,
      views: 0,
    });
    return res.status(200).json({
      msg: `Success! Created shortened URl with destination '${destination}'.`,
      url: id,
    });
  }

  // determine if the URL should be generated, and if so, generate it
  existingDestinationQuery.get().then((querySnapshot) => {
    // if the destination already has a link, return it. If not, generate a new one.

    if (!querySnapshot.empty) {
      // already exists; return the existing short URL
      return res.status(400).json({
        errorDescription:
          HTTP400 + `There is already a URL for destination '${destination}'.`,
        url: "/" + querySnapshot.docs[0].id,
      });
    }

    if (!customURL) {
      // generate random URL if there is none provided
      return generateRandomURL().then(createDocument);
    }

    shortURLs
      .doc(customURL)
      .get()
      .then((doc) => {
        if (doc.data()) {
          return res.status(400).json({
            errorDescription: HTTP400 + "That custom URL is taken.",
          });
        }
        return createDocument(customURL);
      });
  });
}

/*      ======== GENERAL CRUD FUNCTIONS ========      */

// general function for creating a single document
function createSingleDocument(data, collectionName, res) {
  // attempts to add the data to the given collection
  db.collection(collectionName)
    .add(data)
    .then((doc) => {
      // success; return the data along with the document id
      return res.status(200).json({ id: doc.id, ...data });
    })
    .catch((error) => {
      // return an error when the document could not be added, e.g. invalid collection name
      return res.status(500).json({
        errorDescription: HTTP500 + "Could not create document.",
        error,
      });
    });
}

// general function for sending back a single document
function sendSingleResponse(docQuery, res) {
  // send the query to database
  docQuery.get().then((doc) => {
    // check if the document was found
    const data = doc.data();
    if (data) {
      // formats all existing date fields as timestamp strings
      formatTimestamps(data);
      // increment the views count or start at 1 if it doesn't exist
      const views = (data.views || 0) + 1;
      // update views count in database
      docQuery.update({ views }).then(() => {
        // send document id with rest of the data
        return res.status(200).json({ id: doc.id, ...data, views });
      });
    } else {
      // return an error if the document was not found
      return res.status(404).json({
        errorDescription: HTTP404 + "The requested document was not located.",
      });
    }
  });
}

// general function for sending back a list of documents
function sendListResponse(docListQuery, req, res) {
  /* -- Pagination -- */
  // initialise parameters
  const page = Math.max(parseInt(req.query.page || 1), 1);
  const items = Math.max(parseInt(req.query.items || 25), 1);
  // will only get the documents after startIndex
  const startIndex = items * (page - 1);
  const endIndex = items * page;

  // initialise response as an empty array
  const response = [];
  // send the query to database
  docListQuery
    .limit(endIndex)
    .get()
    .then((querySnapshot) => {
      // initialise extra info variables
      let last = 0;
      // loop through every document
      let index = 0;
      querySnapshot.forEach((doc) => {
        // increments index after evaluating it to see if it should be included in the response
        if (index++ >= startIndex) {
          last++;
          // read the document
          const temp = doc.data();
          if (temp) {
            // formats all specified date fields as strings if they exist
            formatTimestamps(temp);
            response.push({ id: doc.id, ...temp });
          } else {
            // return an error if any document was not found
            // index has already been incremented so it is 1-based
            return res.status(404).json({
              errorDescription: `${HTTP404}Document ${index} was not located.`,
            });
          }
        }
      });
      return res.status(200).json({
        // add extra info for messages such as "showing items X-Y of Z"
        firstOnPage: startIndex + !!querySnapshot.docs.length, // increment by 1 if there is at least 1 document in the list
        totalOnPage: querySnapshot.docs.length,
        contents: response,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        errorDescription: HTTP500 + "Could not retrieve documents.",
        error,
      });
    });
}

// general function for updating a single document
function updateSingleDocument(
  docQuery,
  res,
  requestParams,
  attributesToUpdate = []
) {
  // initialise new data
  const newData = {
    // add parameter indicating when the news was last edited
    modified: dateToTimestamp(new Date()),
  };
  // initialise boolean to indicate if any parameters were updated
  let dataUpdated = false;
  // loop through each attribute that should be set
  attributesToUpdate.forEach((attrib) => {
    // check if object attribute is provided in the request query
    if (requestParams[attrib]) {
      // it is; assign parameter to object attributes
      newData[attrib] = requestParams[attrib];
      // mark data as updated
      dataUpdated = true;
    }
  });
  if (!dataUpdated) {
    // return an error if the query does not contain any new assignments
    return res.status(400).json({
      errorDescription: HTTP400 + "There were no updated fields provided.",
    });
  }
  // send the query to database
  docQuery
    .update(newData)
    .then(() => {
      // send query to db
      sendSingleResponse(docQuery, res);
    })
    .catch((error) => {
      // return an error when the document was not found/could not be updated
      return res.status(400).json({
        errorDescription:
          HTTP400 + "Could not update document. It most likely does not exist.",
        error,
      });
    });
}

// general function for deleting a single document
function deleteSingleDocument(docQuery, res) {
  docQuery
    .delete()
    .then(() => {
      // success deleting document
      // this may occur even if the document did not exist to begin with
      return res.status(200).json({
        msg: `Success! Document with ID '${docQuery.id}' has been deleted.`,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        errorDescription:
          HTTP500 + "The specified document could not be deleted.",
        error,
      });
    });
}

/**Generate a random integer between the given interval, inclusively. */
function randomIntFromInterval(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function randomDateFromInterval(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

/** Convert a JavaScript Date object into a Firestore timestamp. */
function dateToTimestamp(date) {
  return admin.firestore.Timestamp.fromDate(date);
}

/** Returns an array made from the given range. E.g. (2, 5) => [2, 3, 4, 5]. */
function arrayFromRange(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

/**Returns the index of a random item in the given array. */
function randomArraySelection(array) {
  if (!array || !array.length) {
    return null;
  }
  const randomIndex = randomIntFromInterval(0, array.length - 1);
  return randomIndex;
}

module.exports = {
  admin,
  db,
  HTTP: {
    Err400: HTTP400,
    Err404: HTTP404,
    Err500: HTTP500,
  },
  executeQuery,
  createShortenedURL,
  createSingleDocument,
  sendSingleResponse,
  sendListResponse,
  updateSingleDocument,
  deleteSingleDocument,
  randomIntFromInterval,
  randomDateFromInterval,
  dateToTimestamp,
  formatTimestamps,
  arrayFromRange,
  randomArraySelection,
};
