// General imports
const express = require("express");
const cors = require("cors");

// Firebase imports
const functions = require("firebase-functions");

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
    deleteSingleDocument,
    randomIntFromInterval 
} = require("./util"); 

// initialise express
const app = express();

app.use( cors({ origin: true }) );


/*      ======== LUCKY NUMBERS-SPECIFIC CRUD FUNCTIONS ========      */

// GET lucky numbers
app.get('/api/luckyNumbers', (req, res) => {
    try {
        db.collection("numbers").doc("1").get().then((doc) => {
            const data = doc.data();
            const today = new Date();
            const dataDate = new Date(data.date._seconds * 1000);
            // en-GB locale uses dd/mm/YYYY for short date notation
            const currentDateString = today.toLocaleDateString("en-GB");
            const dataDateString = dataDate.toLocaleDateString("en-GB");
          
            // check if all the requirements for new lucky numbers are met
            if ( (currentDateString !== dataDateString) && ![0, 6].includes(today.getDay()) && !data.freeDays.includes(currentDateString) ) {
                // new lucky numbers must be generated
                const newNumbers = [];
                for (let i = 0; i < data.numberQuantity / 2; i++) {
                    // generate a random number between 1 and quantity of possible left numbers
                    let helperNumber = randomIntFromInterval(1, data.splitPoint - data.usedBeforeSplit.length);
                    let randomNumber = 1;
                    // loop through the numbers as long as you've passed enough numbers that weren't used (helper number)
                    while (helperNumber > 0) {
                        if (!data.usedBeforeSplit.includes(randomNumber)) {
                            helperNumber--;
                        }
                        if (helperNumber !== 0) {
                            randomNumber++;
                        }
                    }
                    // add result
                    newNumbers.push(randomNumber); 
                    data.usedBeforeSplit.push(randomNumber);
                    // reset the array if all numbers have been used
                    if (data.usedBeforeSplit.length === data.splitPoint)
                    {
                        data.usedBeforeSplit = [];
                    }
                    // same for the other half
                    let helperNumber = randomIntFromInterval(1, data.maxNumber - data.splitPoint - data.usedAfterSplit.length);
                    let randomNumber = data.splitPoint + 1;
                    while (helperNumber > 0) {
                        if (!data.usedAfterSplit.includes(randomNumber)) {
                            helperNumber--;
                        }
                        if (helperNumber !== 0) {
                            randomNumber++;
                        }
                    }
                    newNumbers.push(randomNumber); 
                    data.usedAfterSplit.push(randomNumber);
                    if (data.usedAfterSplit.length === data.maxNumber - data.splitPoint)
                    {
                        data.usedAfterSplit = [];
                    }
                }
                db.collection("numbers").doc("1").set({
                    luckyNumbers: newNumbers,
                    date: admin.firestore.Timestamp.fromDate(today),
                    usedBeforeSplit: data.usedBeforeSplit,
                    usedAfterSplit: data.usedAfterSplit
                }, { merge: true });
            }
            // return the new or old data
            return res.status(200).json({
                date: currentDateString,
                luckyNumbers: newNumbers || data.luckyNumbers,
                excludedClasses: data.excludedClasses
            });  
        })
    } catch (error) {
        return res.status(500).json({ errorDescription: "500 Server Error: Could not get the lucky numbers data.", error });
    }
});


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

    // initialise base query
    const docListQuery = db.collection("news").orderBy("date", "desc");
    // process query
    sendListResponse(docListQuery, req, res);
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
    // initialise base query
    const docListQuery = db.collection("links").orderBy("destination", "asc");
    // return URL list
    sendListResponse(docListQuery, req, res);
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
