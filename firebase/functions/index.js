// General imports
const express = require("express");
const cors = require("cors");

// Firebase imports
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { firebaseConfig } = require("firebase-functions");

// Local imports
const { zeroPad } = require("./util"); // General utility functions
const serviceAccount = require("./permissions.json"); // Service account private key so keep it private

// Authorise
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// initialise express
const app = express();
// Database reference
const db = admin.firestore();

app.use( cors({ origin: true }) );

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
        return res.status(400).json({ errorDescription: "400 Bad Request: No document ID specified." });
    }
}

/*      ======== GENERAL CRUD FUNCTIONS ========      */

// general function for creating a single document
function createSingleDocument(data, collectionName, res) {
    // attempts to add the data to the given collection
    db.collection(collectionName).add(data).then((doc) => {
        // success; return the data along with the document id
        return res.status(200).json({ id: doc.id, ...data });
    }).catch((error) => {
        // return an error when the document could not be added, e.g. invalid collection name
        return res.status(500).json({ errorDescription: "500 Server Error: Could not create document.", error });
    });
}

// general function for sending back a single document
function sendSingleResponse(docQuery, res, dateFormat) {
    // send the query to db
    docQuery.get()
    .then((doc) => {    
        // check if the document was found
        temp = doc.data();
        if (temp) {
            // formats all specified date fields as strings if they exist
            for (fieldName of ["date", "modified"]) {
                if (!temp[fieldName])
                {
                    // document does not contain the given field; skip it
                    continue;
                }
                // cast field value as JS date object which has a built-in function to format it as a string
                date = new Date(temp[fieldName]._seconds * 1000);  // Date object constructor takes milliseconds
                // formatting using specified locale, default en-GB uses dd/mm/YYYY
                temp[fieldName] = date.toLocaleString(dateFormat || "en-GB");
            }
            // send document id with rest of the data
            return res.status(200).json({ id: doc.id, ...temp });
        }  else {
            // return an error if the document was not found
            return res.status(404).json({ errorDescription: "404 Not Found: The requested document was not located." });
        }
    });
}

// general function for sending back a list of documents
function sendListResponse(docListQuery, res, { specialCase = "", startIndex = 0, dateFormat = "en-GB" }) {
    // initialise response as an empty array
    const response = [];
    // send the query to db
    docListQuery.get()
    .then((querySnapshot) => {
        // loop through every document
        let index = 0;
        querySnapshot.forEach((doc) => {
            // increments index after evaluating it to see if it should be included in the response
            if (index++ >= startIndex) {
                // read the document
                const temp = doc.data();
                if (temp) {
                    // formats all specified date fields as strings if they exist
                    for (fieldName of ["date", "modified"]) {
                        if (!temp[fieldName])
                        {
                            // document does not contain the given field; it
                            continue;
                        }
                        // cast field value as JS date object which has a built-in function to format it as a string
                        date = new Date(temp[fieldName]._seconds * 1000);  // Date object constructor takes milliseconds
                        // formatting using specified locale, default en-GB uses dd/mm/YYYY
                        temp[fieldName] = date.toLocaleString(dateFormat || "en-GB");
                    }
                    response.push({ id: doc.id, ...temp });
                } else {
                    // return an error if any document was not found
                    // index has already been incremented so it is 1-based
                    return res.status(404).json({ errorDescription: `404 Not Found: Document ${index} was not located.` });
                }
            }
        });
        return res.status(200).json(response);    
    }).catch((error) => {
        return res.status(500).json({ errorDescription: "500 Server Error: Could not retrieve documents.", error });
    });
}

// general function for updating a single document
function updateSingleDocument(docQuery, res, requestParams, attributesToUpdate = []) {
    // initialise new data
    const newData = {
        // add parameter indicating when the news was last edited
        modified: admin.firestore.Timestamp.fromDate(new Date())
    };
    // initialise boolean to indicate if any parameters were updated
    let dataUpdated = false;
    // loop through each attribute that should be set
    for (let attrib of attributesToUpdate) {
        // check if object attribute is provided in the request query
        if (requestParams[attrib]) {
            // it is; assign parameter to object attributes
            newData[attrib] = requestParams[attrib];
            // mark data as updated
            dataUpdated = true;
        }
    }
    if (!dataUpdated) {
        // return an error if the query does not contain any new assignments
        return res.status(400).json({ errorDescription: "400 Bad Request: There were no updated fields provided." });
    } else {
        console.log(newData);
    }
    // send the query to db
    docQuery.update(newData)
    .then(() => {
        // return updated document on success
        sendSingleResponse(docQuery, res, requestParams.date_format);
    }).catch((error) => {
        // return an error when the document was not found/could not be updated
        return res.status(400).json({ errorDescription: "400 Bad Request: Could not update document. It most likely does not exist.", error });
    });
}

// general function for deleting a single document
function deleteSingleDocument(docQuery, res) {
    docQuery.delete()
    .then(() => {
        // success deleting document
        // this may occur even if the document didn't exist to begin with
        return res.status(200).json({ msg: `Success! Document with ID '${docQuery.id}' has been deleted.` });
    }).catch((error) => {
        return res.status(500).json({ errorDescription: "500 Server Error: The specified document could not be deleted.", error });
    });
}


/*      ======== NEWS-SPECIFIC CRUD FUNCTIONS ========      */

// CREATE news
app.post('/api/news', (req, res) => { // ?author=autor&title=tytuł&text=treść
    // initialise parameters
    const author = req.query.author || "autor";
    const title = req.query.title || "tytuł";
    const text = req.query.text || "treść";
    const data = {
        date: admin.firestore.Timestamp.fromDate(new Date()),
        author,
        title,
        text,
    }
    createSingleDocument(data, "news", res);
});

// READ all news
app.get('/api/news', (req, res) => { // ?page=1&items=25?date_format=en-GB
    // return news list

    // initialise parameters
    const page = Math.max(parseInt(req.query.page || 1), 1);
    const items = Math.max(parseInt(req.query.items || 25), 1);
    const dateFormat = req.query.date_format; // this value is checked later; it can be undefined
    // sendListResponse will only get the documents after startIndex
    const startIndex = items * (page - 1);
    const endIndex = items * page;
    // send query to db
    const docListQuery = db.collection("news").orderBy("date", "desc").limit(endIndex);
    sendListResponse(docListQuery, res, { startIndex, dateFormat });
});

// READ single news
app.get('/api/news/:id', (req, res) => { // ?date_format=en-GB
    // initialise parameters
    const dateFormat = req.query.date_format  // this value is checked later; can be undefined
    // initialise the callback to execute on success
    const callback = (docRef) => sendSingleResponse(docRef, res, dateFormat);
    // validate the request; if it is valid, execute the above callback
    executeQuery(req, res, "news", callback);
});

// UPDATE news
app.put('/api/news/:id', (req, res) => { // ?id=_&author=_&title=_&text=_
    // initialise attributes to be updated
    const attributesToUpdate = ["author", "title", "text"];
    // initialise the callback to execute on success
    console.log(typeof req.query)
    const callback = (docRef) => updateSingleDocument(docRef, res, req.query, attributesToUpdate);
    // validate the request; if it is valid, execute the above callback
    executeQuery(req, res, "news", callback);
});

// DELETE news
app.delete('/api/news/:id', (req, res) => { // ?id=_
    // initialise the callback to be executed on success
    const callback = (docRef) => deleteSingleDocument(docRef, res);
    // validate the request; if it is valid, execute the above callback
    executeQuery(req, res, "news", callback);
});


exports.app = functions.region('europe-west1').https.onRequest(app);
