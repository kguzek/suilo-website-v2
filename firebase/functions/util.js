const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const admin = require("firebase-admin");
require("dotenv").config();

const { dateToArray, serialiseDateArray } = require("./common");

// Authorise Firebase
/* 
//Production
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
    clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    // replace `\` and `n` character pairs w/ single `\n` character
    privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/gm, "\n"),
  }),
});
*/
//Local Emulator
admin.initializeApp({
  databaseURL: "http://localhost:8080",
});

// Assign database reference
const fs = admin.firestore;
const db = fs();
db.settings({ ignoreUndefinedProperties: true });

// Initialise HTTP error constants
const HTTP400 = "400 Bad Request: ";
const HTTP404 = "404 Not Found: ";
const HTTP405 = "405 Method Not Allowed: ";
const HTTP500 = "500 Internal Server Error: ";

const MAX_LUCKY_NUMBER = 35;

/*      ======== GENERAL UTIL FUNCTIONS ========      */

/** Converts each Firebase timestamp in the object into a JavaScript Date object. */
function formatTimestamps(dataObject = {}) {
  Object.keys(dataObject).forEach((key) => {
    try {
      // Check if the object contains Firebase timestamp fields
      if (dataObject[key]._seconds === undefined) {
        return;
      }
    } catch {
      // The field is not a Firebase timestamp
      return;
    }
    const nanoseconds = dataObject[key]._nanoseconds ?? 0;
    const additionalSeconds = nanoseconds / Math.pow(10, 9);
    const seconds = dataObject[key]._seconds + additionalSeconds;
    const date = new Date(seconds * 1000); // Date object constructor takes milliseconds
    dataObject[key] = date.toJSON();
  });
}

/** Converts a JavaScript Date object into a Firestore timestamp. */
function dateToTimestamp(date) {
  return Timestamp.fromDate(date);
}

/** Checks if the request params or query contains a document ID.
 * If so, calls the success callback with a reference to the document with the specified ID.
 * Otherwise calls the failure callback if specified, or sends a HTTP 400 response.  */
function getDocRef(req, res, collectionName) {
  // get id from url parameters or arguments, e.g. /api/news/foo or /api/news/?id=foo
  const id = req.params.id ?? req.query.id;

  function defaultReject() {
    // default to sending a HTTP 400 response
    res.status(400).json({ errorDescription: HTTP400 + "No document ID specified." });
  }

  function _getRef(resolve = (docRef) => docRef, reject = defaultReject) {
    // check if the id was provided in the query parameters
    if (id) {
      // initialise query
      const docRef = db.collection(collectionName).doc(id);
      // validation success; execute the given callback function
      resolve(docRef);
    } else {
      // id not provided, call the failure callback
      reject();
    }
  }
  return { then: _getRef };
}

/** Splits the string with the given separator and casts each resulting array element into an integer.
 * If any array element is NaN, the appropriate array for the default input argument is returned, or null.
 */
function getIntArray(string, separator, defaultInput) {
  let anyNaN = false;

  function parseNum(num) {
    const int = parseInt(num);
    // set anyNaN to true if 'int' is not a number
    anyNaN = anyNaN || isNaN(int);
    return int;
  }

  const tmp = (string ?? "").split(separator).map((num) => parseNum(num));
  if (anyNaN) {
    return defaultInput ? getIntArray(defaultInput, separator) : null;
  }
  return tmp;
}

/** Formats the school year as a string. E.g. `2022` -> `"2022/2023"` */
const getSchoolYearString = (schoolYear) => `${schoolYear}/${schoolYear + 1}`;

/** Generates 2 random lucky numbers from the available number pools. Returns the data. */
function generateLuckyNumbers(previousData) {
  const luckyNumbers = [];
  // one number pool for each lucky number: 1:15 and 16:MAX
  const splitPoints = previousData?.splitPoints ?? [15, 16];
  const numberLimits = [
    [1, splitPoints[0]],
    [splitPoints[1], previousData?.maxNumber ?? MAX_LUCKY_NUMBER],
  ];
  const numberPools = [previousData?.numberPoolA, previousData?.numberPoolB];
  for (let i = 0; i < 2; i++) {
    let numberPool = numberPools[i];
    // reset the number pool if it's empty
    if (!numberPool?.length) {
      numberPool = arrayFromRange(...numberLimits[i]);
    }
    const randomIndex = randomArraySelection(numberPool);
    // remove selection from number pool
    const selection = numberPool.splice(randomIndex, 1)[0];
    // upate the number pool
    numberPools[i] = numberPool;

    luckyNumbers.push(selection);
  }
  console.info("Generated new lucky numbers data:", luckyNumbers);
  const todayString = serialiseDateArray(dateToArray());
  // Increment the number of documents in the lucky numbers archive
  // Add the new data to the lucky numbers archive
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  db.collection("archivedNumbers")
    .doc()
    .set({
      date: todayString,
      luckyNumbers,
      // e.g. 2022-03-16 -> month < 8 (September) -> "2021/2022"
      // e.g. 2024-09-30 -> month >= 8 (September) -> "2024/2025"
      schoolYear: getSchoolYearString(year - (month < 8)),
    });
  updateCollection("luckyNumbers", 1);

  return {
    date: todayString,
    luckyNumbers,
    excludedClasses: previousData?.excludedClasses ?? [],
    freeDays: previousData?.freeDays ?? [],
    maxNumber: numberLimits[1][1],
    splitPoints,
    numberPoolA: numberPools[0],
    numberPoolB: numberPools[1],
  };
}

/** Returns an array made from the given range. E.g. (2, 5) => [2, 3, 4, 5]. */
function arrayFromRange(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

/** This function is called whenever an update is made to any collection (POST/PUT/DELETE). It updates
 * the information stored in the collectionInfo document to accurately show when the last update was made.
 * Updates the collectionSize attribute incrementing it by the provided value (default 0).
 */
function updateCollection(collectionName, collectionSizeChange) {
  // Set the last updated time for the collection to the current date
  const newData = { lastUpdate: { [collectionName]: Timestamp.now() } };
  if (collectionSizeChange) {
    newData.collectionSizes = {
      [collectionName]: FieldValue.increment(collectionSizeChange),
    };
  }
  db.collection("_general").doc("collectionInfo").set(newData, { merge: true });
}

/** Generates a random integer between the given interval, inclusively. */
function randomIntFromInterval(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/** Returns the index of a random item in the given array. */
function randomArraySelection(array) {
  if (!array?.length) {
    return null;
  }
  const randomIndex = randomIntFromInterval(0, array.length - 1);
  return randomIndex;
}

/*      ======== GENERAL CRUD FUNCTIONS ========      */

/** Creates a single document with the specified data in the specified collection and sends the appropriate response. */
function createSingleDocument(data, res, collectionName, docID, sendRes) {
  const collectionRef = db.collection(collectionName);
  // attempts to add the data to the given collection
  const promise = docID ? collectionRef.doc(docID.toString()).set(data, { merge: true }) : collectionRef.add(data);
  promise
    .then((doc) => {
      updateCollection(collectionName, 1);
      // success; return the data along with the document id
      formatTimestamps(data);
      const toSend = { id: doc.id, ...data };
      if (sendRes) {
        sendRes(toSend);
      } else {
        res.status(200).json(toSend);
      }
    })
    .catch((error) => {
      // return an error when the document could not be added, e.g. invalid collection name
      console.error(error);
      return res.status(500).json({
        errorDescription: HTTP500 + "The specified document could not be created.",
        errorDetails: error.toString(),
      });
    });
}

/** Sends a response containing the data of the specified document query. */
function sendSingleResponse(docRef, res, sendData = (data) => data, incrementViewCount = true, defaultData) {
  function _sendResponse(data) {
    res.status(200).json(sendData(data));
  }

  // send the query to database
  docRef.get().then((doc) => {
    // check if the document was found
    const data = doc.data();
    if (!data) {
      if (defaultData) {
        // Use the provided default data when the document doesn't exist
        docRef.set(defaultData);
        return void _sendResponse(defaultData);
      }
      // return an error if the document was not found
      return res.status(404).json({
        errorDescription: HTTP404 + "The requested document was not located.",
      });
    }
    // formats all existing date fields as timestamp strings
    formatTimestamps(data);
    if (!incrementViewCount) {
      return void _sendResponse({ id: doc.id, ...data });
    }
    // increment the views coun or start at 1 if it doesn't exist
    const views = (data.views ?? 0) + 1;
    // update view count in database
    docRef.update({ views });
    // send document id with rest of the data
    _sendResponse({ id: doc.id, ...data, views });
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
  // ensure the values are >= 1
  const page = Math.max(parseInt(queryOptions.page ?? 1), 1);
  const items = Math.max(parseInt(queryOptions.items ?? 25), 1);

  // don't limit the response length if the 'all' parameter is set to "true"
  let startIndex = 0;
  if (queryOptions.all !== "true") {
    // will only get the documents after startIndex
    startIndex = items * (page - 1);
    docListQuery = docListQuery.offset(startIndex).limit(items);
  }

  function defaultCallback(error, responseArray, collectionDocs) {
    if (error) {
      console.error(error);
      return res.status(500).json({
        errorDescription: HTTP500 + "Could not retrieve the documents.",
        errorDetails: error.toString(),
      });
    }
    return res.status(200).json({
      // add extra info for messages such as "showing items X-Y of Z"
      firstOnPage: startIndex + !!collectionDocs.length, // increment by 1 if there is at least 1 document in the list
      lastOnPage: startIndex + collectionDocs.length,
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
      querySnapshot.forEach((doc) => {
        // increments index after evaluating it to see if it should be included in the response
        // read the document
        const data = doc.data();
        if (data) {
          // formats all specified date fields as strings if they exist
          formatTimestamps(data);
          response.push({ id: doc.id, ...data });
        }
      });
      return (callback ?? defaultCallback)(null, response, querySnapshot.docs);
    })
    .catch(callback ?? defaultCallback);
}

/** Updates the document fields and sends a response containing the new data.
 *
 * @param {Request} req the HTTP request
 * @param {Response} res the HTTP response
 * @param {string} collectionName the name of the collection that the document is in
 * @param {object} attributeSanitisers an object containing key-value pairs of attribute names and sanitation functions that validate the input
 */
function updateSingleDocument(req, res, collectionName, attributeSanitisers) {
  // initialise new data
  const newData = {
    // add parameter indicating when the news was last edited
    modified: Timestamp.now(),
  };
  // initialise boolean to indicate if any parameters were updated
  let dataUpdated = false;
  // loop through each attribute that should be set
  for (const attrib in attributeSanitisers) {
    if (!req.query[attrib]) {
      // the attribute is not present in the request query
      continue;
    }
    // sanitise the request query value
    const sanitiser = attributeSanitisers[attrib];
    const sanitisedValue = sanitiser(req.query[attrib]);

    // assign the sanitised value to the updated data object
    newData[attrib] = sanitisedValue;

    // mark the data as having been updated
    dataUpdated = true;
  }
  if (!dataUpdated) {
    // return an error if the query does not contain any new assignments
    return res.status(400).json({
      errorDescription: HTTP400 + "There were no updated fields provided.",
    });
  }
  actuallyUpdateSingleDocument(req, res, collectionName, newData);
}

/** Updates the document in the database and sends its new contents. */
function actuallyUpdateSingleDocument(req, res, collectionName, data) {
  // get the document reference
  getDocRef(req, res, collectionName)
    .then((docRef) => {
      // send the query to database
      docRef.update(data);
      updateCollection(collectionName);
      // send query to db
      sendSingleResponse(docRef, res, undefined, false);
    })
    .catch((error) => {
      return res.status(400).json({
        errorDescription: HTTP400 + "Could not update the specified document. It most likely does not exist.",
        errorDetails: error.toString(),
      });
    });
}

/** Deletes a document from the database and sends the appropriate response.
 * Note: the action will be treated as success even if the document didn't exist before.
 * This is due to how the Firebase Firestore API works.
 *
 * @param {Request} req the HTTP request
 * @param {Response} res the HTTP response
 * @param {string} collectionName the name of the collection that the document is in
 */
function deleteSingleDocument(req, res, collectionName) {
  getDocRef(req, res, collectionName).then((docRef) => {
    docRef
      .delete()
      .then(() => {
        // success deleting document
        // this may occur even if the document did not exist to begin with
        updateCollection(collectionName, -1);
        return res.status(200).json({
          msg: `Success! Document with ID '${docRef.id}' has been deleted.`,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          errorDescription:
            HTTP500 + "Could not delete the specified document. This does not mean that it doesn't exist.",
          errorDetails: error.toString(),
        });
      });
  });
}
//Voting functions
function createGeneralInfoPacket(req, res) {
  const electionInfoProm = db.collection("info").doc("1").get();
  const candidatesProm = db.collection("candidate").get();
  Promise.all([electionInfoProm, candidatesProm]).then(([infoDoc, candidatesSnapshot]) => {
    let settings = infoDoc.data();
    let response = infoDoc.data();

    if (!response) {
      res.status(500).json({ errorDescription: "There are no active elections" });
      return;
    }
    formatTimestamps(response);
    let candidates = [];
    if (candidatesSnapshot) {
      candidatesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          delete data.currVotes;
          candidates.push({ id: doc.id, ...data });
        }
      });
    }
    response.candidates = candidates;
    const currentTime = new Date();
    formatTimestamps(settings);
    const resultsDate = new Date(settings.resultsDate);
    const endDate = new Date(settings.endDate);
    if (currentTime > endDate && currentTime > resultsDate) {
      db.collection("results")
        .doc(settings.resultsId)
        .get()
        .then((resultsRef) => {
          const results = resultsRef.data();
          if (results.simple === "") {
            generateResults();
          } else {
            response.results = JSON.parse(results.simple);
            res.status(200).json(response);
          }
        });
    } else {
      res.status(200).json(response);
    }
  });
}

function createElectionInfo(data, res) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      if (docRef.data()) {
        res.status(500).json({
          errorDescription: "Election info is already created update it with PUT or delete it to create a new one",
        });
      } else {
        db.collection("results")
          .add({ simple: "", detailed: "" })
          .then((doc) => {
            data.resultsId = doc.id;
            data.totalVotes = 0;
            createSingleDocument(data, res, "info", 1);
          });
      }
    });
}
function updateElectionInfo(data, res) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      if (docRef) {
        const CurrData = docRef.data();
        const currentTime = new Date();
        formatTimestamps(CurrData);
        const startDate = new Date(CurrData.startDate);
        const endDate = new Date(CurrData.endDate);
        if (currentTime > startDate && currentTime < endDate) {
          res.status(500).json({
            errorDescription: "You are not allowed to edit settings during election",
          });
        } else {
          db.collection("info")
            .doc("1")
            .update(data)
            .then(() => {
              res.status(200).json({ message: "Election info edited" });
            });
        }
      } else {
        res.status(500).json({
          errorDescription: "There isn't a election info to update",
        });
      }
    });
}
function editClassList(classList, res, add) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      if (docRef) {
        const CurrData = docRef.data();
        const currentTime = new Date();
        formatTimestamps(CurrData);
        const startDate = new Date(CurrData.startDate);
        const endDate = new Date(CurrData.endDate);
        if (currentTime > startDate && currentTime < endDate) {
          res.status(500).json({
            errorDescription: "You are not allowed to edit settings during election",
          });
        } else {
          db.collection("info")
            .doc("1")
            .update({
              classList: add ? FieldValue.arrayUnion(...classList) : FieldValue.arrayRemove(...classList),
            })
            .then(() => {
              res.status(200).json({ message: "Class list updated" });
            });
        }
      } else {
        res.status(500).json({
          errorDescription: "There isn't a election info to update",
        });
      }
    });
}
function submitVoteForExistingCandidate(req, res, settings, voterInfo) {
  db.collection("candidate")
    .doc(req.params.id)
    .get()
    .then((docRef) => {
      const currentCandidate = docRef.data();
      if (currentCandidate) {
        const votePromise = db.collection("votes").add({
          date: Timestamp.now(),
          candidate: req.params.id,
          gender: voterInfo.gender,
          className: voterInfo.className,
        });
        const candidatePromise = db
          .collection("candidate")
          .doc(req.params.id)
          .update({
            currVotes: FieldValue.increment(1),
            reachedTreshold: currentCandidate.currVotes + 1 >= settings.voteTreshold,
          });
        const usedAccountsPromise = db.collection("usedAccounts").doc(req.userInfo.uid).set({ used: true });
        const infoPromise = db
          .collection("info")
          .doc("1")
          .update({
            totalVotes: FieldValue.increment(1),
          });

        Promise.all([votePromise, candidatePromise, usedAccountsPromise, infoPromise])
          .then(([voteRef, candidateRef, usedAccountsRef, infoRef]) => {
            res.status(200).json({
              message: "Vote Submited",
            });
          })
          .catch((error) => {
            return res.status(500).json({
              errorDescription: HTTP500 + "Something went wrong and your vote couldn't have benn submited properly",
              errorDetails: error.toString(),
            });
          });
      } else {
        res.status(500).json({
          errorDescription: "Candidate That you are trying to vote for doesn't exist",
        });
      }
    });
}
function checkIfAbleTovote(req, res, next) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      const settings = docRef.data();
      if (settings) {
        const currentTime = new Date();
        formatTimestamps(settings);
        const startDate = new Date(settings.startDate);
        const endDate = new Date(settings.endDate);
        if (currentTime > startDate && currentTime < endDate) {
          db.collection("usedAccounts")
            .doc(req.userInfo.uid)
            .get()
            .then((userRef) => {
              if (userRef.data()) {
                res.status(500).json({
                  errorDescription: "You can only vote once",
                });
              } else {
                next(settings);
              }
            });
        } else {
          res.status(500).json({
            errorDescription: "The election isnn't active",
          });
        }
      } else {
        res.status(500).json({
          errorDescription: "There is no election",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        errorDescription: HTTP500 + "Something went wrong and your vote couldn't have benn submited properly",
        errorDetails: error.toString(),
      });
    });
}
function vote(req, res, voterInfo) {
  checkIfAbleTovote(req, res, (settings) => submitVoteForExistingCandidate(req, res, settings, voterInfo));
}
function voteForCustomCandidate(req, res, candidate, voterInfo) {
  checkIfAbleTovote(req, res, (settings) => {
    db.collection("candidate")
      .add(candidate)
      .then((doc) => {
        req.params.id = doc.id;
        submitVoteForExistingCandidate(req, res, settings, voterInfo);
      })
      .catch((error) => {
        return res.status(500).json({
          errorDescription: HTTP500 + "Something went wrong and your vote couldn't have benn submited properly",
          errorDetails: error.toString(),
        });
      });
  });
}
function getResults(res) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      const settings = docRef.data();
      if (settings) {
        const currentTime = new Date();
        formatTimestamps(settings);
        const resultsDate = new Date(settings.resultsDate);
        const endDate = new Date(settings.endDate);
        if (currentTime > endDate && currentTime > resultsDate) {
          db.collection("results")
            .doc(settings.resultsId)
            .get()
            .then((resultsRef) => {
              const results = resultsRef.data();
              if (results.simple === "" || results.detailed === "") {
                generateResults();
                res.status(500).json({
                  errorDescription: "Results are not yet generated",
                });
              } else {
                res.status(200).json(JSON.parse(results.detailed));
              }
            });
        } else {
          res.status(500).json({
            errorDescription: "You are not able to view  the results yet",
          });
        }
      } else {
        res.status(500).json({
          errorDescription: "There is no election",
        });
      }
    });
}
function generateResults() {
  const candidatePromise = db.collection("candidate").get();
  const votesPromise = db.collection("votes").get();
  const infoPromise = db.collection("info").doc("1").get();
  Promise.all([candidatePromise, votesPromise, infoPromise]).then(([candidatesSnapshot, voteSnapshot, infoDoc]) => {
    const byCandidates = {};
    const settings = infoDoc.data();
    const byClass = {};
    const byGender = { male: 0, female: 0, other: 0 };
    const byHour = new Array(Math.ceil((settings.endDate.seconds - settings.startDate.seconds) / 3600)).fill(0);
    const simpleResult = [];
    const sortedCandidates = [];

    settings.classList.forEach((className) => {
      byClass[className] = 0;
    });
    console.log("wtf");
    candidatesSnapshot.forEach((doc) => {
      console.log("rolf");
      const { name, surname, className } = doc.data();
      byCandidates[doc.id] = {
        name,
        surname,
        className,
        male: 0,
        female: 0,
        other: 0,
        totalVotes: 0,
        byClass,
      };
    });
    voteSnapshot.forEach((doc) => {
      console.log("lol");
      const { candidate, className, gender, date } = doc.data();
      const statsForCandidate = byCandidates[candidate];
      if (date.seconds > settings.startDate.seconds && date.seconds < settings.endDate.seconds) {
        console.log("liga legend");
        statsForCandidate.totalVotes++;
        statsForCandidate[gender]++;
        statsForCandidate.byClass[className]++;
        byClass[className]++;
        byGender[gender]++;
        byHour[Math.floor((date.seconds - settings.startDate.seconds) / 3600)]++;
      }
    });

    for (const [key, value] of Object.entries(byCandidates)) {
      sortedCandidates.push({ ...value, id: key });
      simpleResult.push({
        name: value.name,
        surname: value.surname,
        className: value.className,
        id: key,
        totalVotes: value.totalVotes,
      });
    }

    simpleResult.sort((a, b) => b.totalVotes - a.totalVotes);
    sortedCandidates.sort((a, b) => b.totalVotes - a.totalVotes);

    const detailedResult = {
      byCandidates: sortedCandidates,
      byHour: byHour,
      byGender: byGender,
      byClass: byClass,
    };

    db.collection("results")
      .doc(settings.resultsId)
      .update({ simple: JSON.stringify(simpleResult), detailed: JSON.stringify(detailedResult) });
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
  formatTimestamps,
  dateToTimestamp,
  getDocRef,
  getIntArray,
  randomArraySelection,
  generateLuckyNumbers,
  updateCollection,
  actuallyUpdateSingleDocument,
  createSingleDocument,
  sendSingleResponse,
  sendListResponse,
  updateSingleDocument,
  deleteSingleDocument,
  createGeneralInfoPacket,
  createElectionInfo,
  updateElectionInfo,
  editClassList,
  vote,
  voteForCustomCandidate,
  getResults,
};
