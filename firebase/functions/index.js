// initialize firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./permissions.json"); // Servive account private key so keep it private
// Authorise
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// Use Express and Cors
const express = require("express");
const cors = require("cors");
const { firebaseConfig } = require("firebase-functions");
const app = express();
// Database Reference;
const db = admin.firestore();

app.use( cors({ origin: true }) );

// general function for sending back single document
function sendSingleResponse(query, res) {
    // send the query to db
    query.get()
    .then((doc) => {    
        // check if the document was found
        if (typeof doc.data() != "undefined") {
            // send document id with rest of the data
            temp = doc.data();
            temp.id = doc.id; 
            return res.status(200).send(temp);
        }  
        else {
            // return an error if the document was not found
            return res.status(500).send({errorDescription: "Nie znaleziono dokumentu"});
        }
       
    })
}

// function for zero-padding integers eg. months and dates
// default length of 2: eg. input num = 5 returns "05"
function zeroPad(num, length = 2) {
    const s = "0".repeat(length) + num;
    return s.substring(s.length - length);
}

// general function for sending back a list of documents
function sendListResponse(query, res, { specialCase = "", startIndex = 0 }) {
    // initialise response as an empty array
    let response = [];
    // send the query to db
    query.get()
    .then((querySnapshot) => {
        // loop through every document
        let index = 0;
        querySnapshot.forEach((doc) => {
            if (index++ >= startIndex) {
                temp = doc.data();
                if (temp) {
                    // read the document
                    temp.id = doc.id;  
                    // chceck if there is a field named date
                    if(temp.created) {
                        // change timestamp for a date string;
                        date = new Date(temp.created._seconds * 1000);  
                        temp.created = `${zeroPad(date.getDate())}/${zeroPad(date.getMonth() + 1)}/${date.getFullYear()}`;     
                    } 
                    response.push(temp);
                } else {
                    // return an error if there were no documents found
                    return res.status(500).send({errorDescription: "The requested documents were not found"});
                }
            }
        });
        return res.status(200).send(response);    
    }).catch((error) => {
        console.log("Error getting documents: " + error);
    });
}

// get news list
app.get('/api/news', (req, res) => { // ?page=1&items=25
    // initialize parameters
    let page = Math.max(parseInt(req.query.page || 1), 1);
    let items = Math.max(parseInt(req.query.items || 25), 1);
    // sendListResponse will only get the documents after startIndex
    const startIndex = items * (page - 1);
    const endIndex = items * page;
    // send query
    let query = db.collection("news").orderBy('created', 'desc').limit(endIndex);
    sendListResponse(query, res, { startIndex });
});

// add news
app.get('/api/news/add', (req, res) => { // ?author=autor&title=tytuł&text=treść
    // initialise parameters
    const author = req.query.author || "autor";
    const title = req.query.title || "tytuł";
    const text = req.query.text || "treść";
    const data = {
        created: admin.firestore.Timestamp.fromDate(new Date()),
        author,
        title,
        text,
    }
    db.collection("news").add(data).then((doc) => {
        res.status(200).send({id: doc.id, ...data});
    }).catch((error) => {
        console.log("Error adding document: " + error);
    });
});


exports.app = functions.region('europe-west1').https.onRequest(app);