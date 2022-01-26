// General imports
const express = require("express");
const cors = require("cors");

// Firebase imports
const functions = require("firebase-functions");

// General local utility functions
const {
  admin,
  db,
  HTTP,
  executeQuery,
  createShortenedURL,
  createSingleDocument,
  sendSingleResponse,
  sendListResponse,
  updateSingleDocument,
  deleteSingleDocument,
  randomIntFromInterval,
} = require("./util");

// initialise express
const app = express();

app.use(cors({ origin: true }));

const UPDATABLE_POST_ATTRIBUTES = [
  "author",
  "title",
  "text",
  "content",
  "photo",
  "imageAuthor",
];

/*      ======== LUCKY NUMBERS-SPECIFIC CRUD FUNCTIONS ========      */

// GET lucky numbers
app.get("/api/luckyNumbers", (req, res) => {
  try {
    db.collection("numbers")
      .doc("1")
      .get()
      .then((doc) => {
        const data = doc.data();
        // en-GB locale uses dd/mm/YYYY for short date notation
        const today = new Date();
        const currentDateString = today.toLocaleDateString("en-GB");
        if (!data) {
          return res.status(500).json({
            errorDescription:
              "500 Internal Server Error: No lucky numbers data exists. The database document has not been created.",
          });
        }
        // check if all the requirements for new lucky numbers are met
        const dataDate = new Date(data.date._seconds * 1000);
        const dataDateString = dataDate.toLocaleDateString("en-GB");
        let luckyNumbers = data.luckyNumbers;
        if (
          currentDateString !== dataDateString &&
          ![0, 6].includes(today.getDay()) &&
          !data.freeDays.includes(currentDateString)
        ) {
          // new lucky numbers must be generated
          luckyNumbers = [];
          for (let i = 0; i < data.numberQuantity / 2; i++) {
            // generate a random number between 1 and quantity of possible left numbers
            let helperNumber = randomIntFromInterval(
              1,
              data.splitPoint - data.usedBeforeSplit.length
            );
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
            luckyNumbers.push(randomNumber);
            data.usedBeforeSplit.push(randomNumber);
            // reset the array if all numbers have been used
            if (data.usedBeforeSplit.length === data.splitPoint) {
              data.usedBeforeSplit = [];
            }
            // same for the other half
            helperNumber = randomIntFromInterval(
              1,
              data.maxNumber - data.splitPoint - data.usedAfterSplit.length
            );
            randomNumber = data.splitPoint + 1;
            while (helperNumber > 0) {
              if (!data.usedAfterSplit.includes(randomNumber)) {
                helperNumber--;
              }
              if (helperNumber !== 0) {
                randomNumber++;
              }
            }
            luckyNumbers.push(randomNumber);
            data.usedAfterSplit.push(randomNumber);
            if (
              data.usedAfterSplit.length ===
              data.maxNumber - data.splitPoint
            ) {
              data.usedAfterSplit = [];
            }
          }
          db.collection("numbers")
            .doc("1")
            .set(
              {
                luckyNumbers: luckyNumbers,
                date: admin.firestore.Timestamp.fromDate(today),
                usedBeforeSplit: data.usedBeforeSplit,
                usedAfterSplit: data.usedAfterSplit,
              },
              { merge: true }
            );
        }
        // return the new or old data
        return res.status(200).json({
          date: currentDateString,
          luckyNumbers,
          excludedClasses: data.excludedClasses,
        });
      });
  } catch (error) {
    return res.status(500).json({
      errorDescription:
        "500 Internal Server Error: Could not get the lucky numbers data.",
      error,
    });
  }
});

/*      ======== NEWS-SPECIFIC CRUD FUNCTIONS ========      */

// CREATE news
app.post("/api/news", (req, res) => {
  // ?author=autor&title=tytuł&text=treść&photo=null
  // initialise parameters
  const author = req.query.author || "autor";
  const title = req.query.title || "tytuł";
  const text = req.query.text || "treść";
  const photo = req.query.text || "https://i.stack.imgur.com/6M513.png";
  const data = {
    date: admin.firestore.Timestamp.fromDate(new Date()),
    author,
    title,
    text,
    photo,
  };
  createSingleDocument(data, "news", res);
});

// READ all news
app.get("/api/news", (req, res) => {
  // ?page=1&items=25
  // return news list

  // initialise base query
  const docListQuery = db.collection("news").orderBy("date", "desc");
  // process query
  sendListResponse(docListQuery, req, res);
});

// READ single news
app.get("/api/news/:id", (req, res) => {
  // initialise the callback to execute on success
  const callback = (docRef) => sendSingleResponse(docRef, res);
  // validate the request; if it is valid, execute the above callback
  executeQuery(req, res, "news", callback);
});

// UPDATE news
app.put("/api/news/:id", (req, res) => {
  // ?id=null&author=null&title=null&text=null&photo=null
  // initialise the callback to execute on success
  const callback = (docRef) =>
    updateSingleDocument(docRef, res, req.query, UPDATABLE_POST_ATTRIBUTES);
  // validate the request; if it is valid, execute the above callback
  executeQuery(req, res, "news", callback);
});

// DELETE news
app.delete("/api/news/:id", (req, res) => {
  // ?id=null
  // initialise the callback to be executed on success
  const callback = (docRef) => deleteSingleDocument(docRef, res);
  // validate the request; if it is valid, execute the above callback
  executeQuery(req, res, "news", callback);
});

/*      ======== LINK SHORTENER-SPECIFIC CRUD FUNCTIONS ========      */

// CREATE shortened URL
app.post("/api/links/:link", (req, res) => {
  //?custom_url=null
  // return saved link if it has already been generated,
  // otherwise return newly-generated URL

  // link is the relative path from 'suilo.pl/'; '/' -> '%2F' in HTTP request

  // initialise parameters
  const customURL = req.query.custom_url;
  let destination = req.params.link;
  destination.startsWith("/") || (destination = "/" + destination);

  // sends the response
  createShortenedURL(res, destination, customURL);
});

// READ all shortened URLs
app.get("/api/links", (req, res) => {
  // ?page=1&items=25
  // initialise base query
  const docListQuery = db.collection("links").orderBy("destination", "asc");
  // return URL list
  sendListResponse(docListQuery, req, res);
});

// READ single shortened URL
app.get("/api/links/:id", (req, res) => {
  // find the destination URL in the database
  const callback = (docRef) => sendSingleResponse(docRef, res);
  // validate the request; if it is valid, execute the above callback
  executeQuery(req, res, "links", callback);
});

// UPDATE shortened URL
app.put("/api/links/:url", (req, res) => {
  // ?destination=null
  // initialise parameters
  let destination = req.query.destination;
  if (!destination) {
    return res.status(400).json({
      errorDescription: HTTP.Err400 + "No new destination provided.",
    });
  }
  const url = req.params.url;
  destination.startsWith("/") || (destination = "/" + destination);

  const docRef = db.collection("links").doc(url);
  updateSingleDocument(docRef, res, { destination }, ["destination"]);
});

// DELETE single shortened URL
app.delete("/api/links/:id", (req, res) => {
  // find the destination URL in the database
  const callback = (docRef) => deleteSingleDocument(docRef, res);
  // validate the request; if it is valid, execute the above callback
  executeQuery(req, res, "links", callback);
});

for (path of ["luckyNumbers", "news", "news/:x", "links", "links/:x"]) {
  // catch all requests to paths that are listed above but use the incorrect HTTP method
  app.all("/api/" + path, (req, res) => {
    return res.status(405).json({
      errorDescription: `405 Method Not Allowed: Cannot ${req.method} ${req.path}.`,
    });
  });
}
// catch all requests to paths that are not listed above
app.all("*", (req, res) => {
  return res.status(404).json({
    errorDescription: `404 Not Found: The server could not locate the resource at ${req.path}.`,
  });
});

exports.app = functions.region("europe-west1").https.onRequest(app);
