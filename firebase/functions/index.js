// General imports
const express = require("express");
const cors = require("cors");

// Firebase imports
const functions = require("firebase-functions");
const { firebaseConfig } = require("firebase-functions");

// General local utility functions
const { 
    admin, 
    db, 
    executeQuery,
    sendGenerateURLResponse,
    resolveShortURL,
    createSingleDocument, 
    sendSingleResponse, 
    sendListResponse, 
    updateSingleDocument, 
    deleteSingleDocument 
} = require("./util"); 

// initialise express
const app = express();

app.use( cors({ origin: true }) );


/*      ======== NEWS-SPECIFIC CRUD FUNCTIONS ========      */

// CREATE news
app.post("/api/news", (req, res) => { // ?author=autor&title=tytuł&text=treść
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
app.get("/api/news", (req, res) => { // ?page=1&items=25?date_format=en-GB
    // return news list

    // initialise parameters
    const page = Math.max(parseInt(req.query.page || 1), 1);
    const items = Math.max(parseInt(req.query.items || 25), 1);
    const dateFormat = req.query.date_format || "en-GB";
    // sendListResponse will only get the documents after startIndex
    const startIndex = items * (page - 1);
    const endIndex = items * page;
    // send query to db
    const docListQuery = db.collection("news").orderBy("date", "desc").limit(endIndex);
    sendListResponse(docListQuery, res, { startIndex, dateFormat });
});

// READ single news
app.get("/api/news/:id", (req, res) => { // ?date_format=en-GB
    // initialise parameters
    const dateFormat = req.query.date_format || "en-GB";
    // initialise the callback to execute on success
    const callback = (docRef) => sendSingleResponse(docRef, res, dateFormat);
    // validate the request; if it is valid, execute the above callback
    executeQuery(req, res, "news", callback);
});

// UPDATE news
app.put("/api/news/:id", (req, res) => { // ?id=_&author=_&title=_&text=_
    // initialise attributes to be updated
    const attributesToUpdate = ["author", "title", "text"];
    // initialise the callback to execute on success
    console.log(typeof req.query)
    const callback = (docRef) => updateSingleDocument(docRef, res, req.query, attributesToUpdate);
    // validate the request; if it is valid, execute the above callback
    executeQuery(req, res, "news", callback);
});

// DELETE news
app.delete("/api/news/:id", (req, res) => { // ?id=_
    // initialise the callback to be executed on success
    const callback = (docRef) => deleteSingleDocument(docRef, res);
    // validate the request; if it is valid, execute the above callback
    executeQuery(req, res, "news", callback);
});


/*      ======== LINK SHORTENER-SPECIFIC CRUD FUNCTIONS ========      */

// CREATE shortened URL
app.post("/api/links/:link", (req, res) => {
    // return saved link if it has already been generated,
    // otherwise return newly-generated URL

    // initialise parameters
    const destination = req.params.link.replace('.', '/');
    // sends the response
    sendGenerateURLResponse(res, destination);
});


// READ all shortened URLs
app.get("/api/links/", (req, res) => { // ?page=1&items=25
    // return URL list

    // initialise parameters
    const page = Math.max(parseInt(req.query.page || 1), 1);
    const items = Math.max(parseInt(req.query.items || 25), 1);
    // sendListResponse will only get the documents after startIndex
    const startIndex = items * (page - 1);
    const endIndex = items * page;
    // send query to db
    const docListQuery = db.collection("links").orderBy("destination", "asc").limit(endIndex);
    // send a response with the entire collection
    sendListResponse(docListQuery, res, { startIndex });
});


// READ single shortened URL
app.get("/api/links/:link", (req, res) => { // link is the dot-separated relative path from 'suilo.pl/'
    // find the destination URL in the database
    resolveShortURL(req.params.link.replace('.', '/'))
    .then((destination) => {
        // check if it was found successfully
        if (destination) {
            // return the destination URL prefixed with '/'
            return res.status(200).json({ target: '/' + destination });
        } else {
            // return an error if there is no such short URL
            return res.status(404).json({ errorDescription: "404 Not Found: The shortened link does not exist." });
        }
    });
});


exports.app = functions.region("europe-west1").https.onRequest(app);
