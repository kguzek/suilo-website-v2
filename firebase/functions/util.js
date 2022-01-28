const admin = require("firebase-admin");

// Private service account key
const serviceAccount = require("./permissions.json");

// Authorise Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// Assign database reference
const db = admin.firestore();

// Initialise HTTP error constants
const HTTP400 = "400 Bad Request: ";
const HTTP404 = "404 Not Found: ";
const HTTP405 = "405 Method Not Allowed: ";
const HTTP500 = "500 Internal Server Error: ";

const SERVER_REGION = "europe-west1";

/*      ======== GENERAL UTIL FUNCTIONS ========      */

/**Custom method definition for replacing all instances of a substring within a string instance. */
String.prototype.replaceAll = function replaceAll(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

/** If the object contains fields 'date' or 'modified', converts the
 * values from Firebase timestamps to JavaScript Date objects. */
function formatTimestamps(dataObject) {
  if (!dataObject) {
    return;
  }
  for (fieldName of ["date", "modified"]) {
    const fieldValue = dataObject[fieldName];
    if (!fieldValue || !fieldValue._seconds) {
      // the field does not exist or it is not a Firebase timestamp; skip it
      continue;
    }
    // cast field value as JS date object which has a built-in function to format it as a string
    date = new Date(fieldValue._seconds * 1000); // Date object constructor takes milliseconds
    // formatting using specified locale, default en-GB uses dd/mm/YYYY
    dataObject[fieldName] = date.toJSON();
  }
}

/** Checks if the request params or query contains a document ID.
 * If so, calls the success callback with a reference to the document with the specified ID.
 * Otherwise calls the failure callback if specified, or sends a HTTP 400 response.  */
function getDocRef(req, res, collectionName) {
  // get id from url parameters or arguments, e.g. /api/news/foo or /api/news/?id=foo
  const id = req.params.id || req.query.id;

  function resolve(_resolve, _reject) {
    // check if the id was provided in the query parameters
    if (id) {
      // initialise query
      const docRef = db.collection(collectionName).doc(id);
      // validation success; execute the given callback function
      _resolve(docRef);
    } else {
      // id not provided, check if the failure callback is specified
      if (_reject) {
        // call the failure callback
        return _reject();
      }
      // default to sending a HTTP 400 response
      res
        .status(400)
        .json({ errorDescription: HTTP400 + "No document ID specified." });
    }
  }
  return { then: resolve };
}

/** Converts a JavaScript Date object into a Firestore timestamp. */
function dateToTimestamp(date) {
  return admin.firestore.Timestamp.fromDate(date);
}

/*      ======== GENERAL CRUD FUNCTIONS ========      */

/** Creates a single document with the specified data in the specified collection and sends the appropriate response. */
function createSingleDocument(data, res, { collectionName, collectionRef }) {
  // attempts to add the data to the given collection
  (collectionRef || db.collection(collectionName))
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

/** Sends a response containing the data of the specified document query. */
function sendSingleResponse(docQuery, res) {
  // send the query to database
  docQuery.get().then((doc) => {
    // check if the document was found
    const data = doc.data();
    if (!data) {
      // return an error if the document was not found
      return res.status(404).json({
        errorDescription: HTTP404 + "The requested document was not located.",
      });
    }
    // formats all existing date fields as timestamp strings
    formatTimestamps(data);
    // increment the views count or start at 1 if it doesn't exist
    const views = (data.views || 0) + 1;
    // update views count in database
    docQuery.update({ views }).then(() => {
      // send document id with rest of the data
      return res.status(200).json({ id: doc.id, ...data, views });
    });
  });
}

/** Sends a response containing an array with the contents of the collection query.
 *
 * @param {FirebaseFirestore.Query<FirebaseFirestore.DocumentData>} docListQuery the query to execute
 * @param {object} queryOptions an object with defaults: { page = 1, items = 25, all = false }
 * @param {response} res the HTTP response
 * @param {function} callback (responseArray, querySnapshotDocuments)
 */
function sendListResponse(docListQuery, queryOptions, res, callback = null) {
  // initialise parameters
  const page = Math.max(parseInt(queryOptions.page || 1), 1);
  const items = Math.max(parseInt(queryOptions.items || 25), 1);
  // will only get the documents after startIndex
  const startIndex = items * (page - 1);
  const endIndex = items * page;

  // don't limit the response length if the 'all' parameter is set to "true"
  if (queryOptions.all !== "true") {
    docListQuery = docListQuery.limit(endIndex);
  }

  function defaultCallback(responseArray, collectionDocs) {
    return res.status(200).json({
      // add extra info for messages such as "showing items X-Y of Z"
      firstOnPage: startIndex + !!collectionDocs.length, // increment by 1 if there is at least 1 document in the list
      lastOnPage: collectionDocs.length,
      contents: responseArray,
    });
  }

  // initialise response as an empty array
  const response = [];

  // send the query to database
  docListQuery
    .get()
    .then((querySnapshot) => {
      // initialise extra info variables
      // loop through every document
      let index = 0;
      querySnapshot.forEach((doc) => {
        // increments index after evaluating it to see if it should be included in the response
        if (index++ >= startIndex) {
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
      return (callback || defaultCallback)(response, querySnapshot.docs);
    })
    .catch((error) => {
      return res.status(500).json({
        errorDescription: HTTP500 + "Could not retrieve documents.",
        error,
      });
    });
}

/** Updates the document fields and sends a response containing the new data.
 *
 * @param {FirebaseFirestore.DocumentReference} docQuery
 * @param {response} res the HTTP response
 * @param {object} requestParams an object containing key-value pairs of the fields to update
 * @param {Array} attributesToUpdate an array containing the field names that should be updated
 */
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
      const val = requestParams[attrib];
      if (parseInt(val).toString() === val) {
        newData[attrib] = parseInt(val);
      } else {
        newData[attrib] = val;
      }
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

/** Deletes a document from the database and sends the appropriate response.
 * Note: the action will be treated as success even if the document didn't exist before.
 * This is due to how the Firebase Firestore API works.
 *
 * @param {FirebaseFirestore.DocumentReference} docQuery a reference to the document to delete
 * @param {response} res the HTTP response
 */
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

module.exports = {
  admin,
  db,
  HTTP: {
    err400: HTTP400,
    err404: HTTP404,
    err405: HTTP405,
    err500: HTTP500,
  },
  SERVER_REGION,
  getDocRef,
  createSingleDocument,
  sendSingleResponse,
  sendListResponse,
  updateSingleDocument,
  deleteSingleDocument,
  dateToTimestamp,
  formatTimestamps,
};
