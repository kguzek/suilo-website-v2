// General imports
const express = require("express");
const cors = require("cors");

// Firebase imports
const functions = require("firebase-functions");

// General local utility functions
const {
  db,
  HTTP,
  executeQuery,
  createShortenedURL,
  createCalendar,
  createSingleDocument,
  sendSingleResponse,
  sendListResponse,
  updateSingleDocument,
  deleteSingleDocument,
  randomIntFromInterval,
  dateToTimestamp,
  arrayFromRange,
  randomArraySelection,
} = require("./util");
const { createTestData } = require("./testData");

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
const MAX_LUCKY_NUMBER = 35;

const definedRoutes = [
  "luckyNumbers",
  "luckyNumbers/v2",
  "news",
  "news/*",
  "links",
  "links/*",
  "calendar",
  "calendar/*",
];

/*      ======== LUCKY NUMBERS-SPECIFIC CRUD FUNCTIONS ========      */

// GET lucky numbers (v1)
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
                date: dateToTimestamp(today),
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

// GET lucky numbers (v2)
app.get("/api/luckyNumbers/v2", (req, res) => {
  // ?force_update=false
  const today = [
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  ];
  const todayString = today.toString().replaceAll(",", "-");

  const forceUpdate = req.query.force_update === "true";

  function dataIsCurrent(data) {
    // return false if the update is forced or if there is no lucky numbers data
    if (forceUpdate || !data) {
      return false;
    }
    // return true if the lucky numbers data is for today
    if (data.date === todayString) {
      return true;
    }
    const freeDays = data.freeDays || [];
    // return true if it's weekend or a free day
    return [0, 6].includes(today[2]) || freeDays.includes(todayString);
  }
  function sendNumbersData(data) {
    res.status(200).json({
      date: data.date,
      luckyNumbers: data.luckyNumbers,
      excludedClasses: data.excludedClasses,
    });
  }
  function generateNumbersData(data = {}) {
    const luckyNumbers = [];
    // one number pool for each lucky number: 1:15 and 16:MAX
    const splitPoints = data.splitPoints || [15, 16];
    const numberLimits = [
      [1, splitPoints[0]],
      [splitPoints[1], data.maxNumber || MAX_LUCKY_NUMBER],
    ];
    const numberPools = [data.numberPoolA, data.numberPoolB];
    for (let i = 0; i < 2; i++) {
      let numberPool = numberPools[i];
      // reset the number pool if it's empty
      if (!numberPool || numberPool.length === 0) {
        numberPool = arrayFromRange(...numberLimits[i]);
      }
      const randomIndex = randomArraySelection(numberPool);
      // remove selection from number pool
      const selection = numberPool.splice(randomIndex, 1)[0];
      // upate the number pool
      numberPools[i] = numberPool;

      luckyNumbers.push(selection);
    }
    console.log("Generated new lucky numbers data:", luckyNumbers);
    const newData = {
      date: todayString,
      luckyNumbers,
      excludedClasses: data.excludedClasses || [],
      freeDays: data.freeDays || [],
      maxNumber: numberLimits[1][1],
      splitPoints,
      numberPoolA: numberPools[0],
      numberPoolB: numberPools[1],
    };
    db.collection("numbers").doc("data").set(newData);
    sendNumbersData(newData);
  }
  try {
    db.collection("numbers")
      .doc("data")
      .get()
      .then((doc) => {
        const data = doc.data();
        dataIsCurrent(data) ? sendNumbersData(data) : generateNumbersData(data);
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
  // ?author=autor&title=Tytuł Postu&text=Krótka treść postu...&content=Wydłużona treść postu.&photo=null
  // initialise parameters
  const data = {
    date: dateToTimestamp(new Date()),
    author: req.query.author || "autor",
    title: req.query.title || "Tytuł Postu",
    text: req.query.text || "Krótka treść postu...",
    content: req.query.content || "Wydłużona treść postu.",
    photo: req.query.text || null,
  };
  if (req.query.create_test_data) {
    createTestData(res);
  } else {
    createSingleDocument(data, "news", res);
  }
});

// READ all news
app.get("/api/news", (req, res) => {
  // ?page=1&items=25
  // return news list

  // initialise base query
  const docListQuery = db.collection("news").orderBy("date", "desc");
  // process query
  sendListResponse(docListQuery, req.query, res);
});

// READ single news
app.get("/api/news/:id", (req, res) => {
  executeQuery(req, res, "news").then((docRef) =>
    sendSingleResponse(docRef, res)
  );
});

// UPDATE news
app.put("/api/news/:id", (req, res) => {
  // ?id=null&author=null&title=null&text=null&photo=null
  executeQuery(req, res, "news").then((docRef) =>
    updateSingleDocument(docRef, res, req.query, UPDATABLE_POST_ATTRIBUTES)
  );
});

// DELETE news
app.delete("/api/news/:id", (req, res) => {
  // ?id=null
  executeQuery(req, res, "news").then((docRef) =>
    deleteSingleDocument(docRef, res)
  );
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
  const docListQuery = db.collection("links").orderBy("destination", "asc");
  // return URL list
  sendListResponse(docListQuery, req.query, res);
});

// READ single shortened URL
app.get("/api/links/:id", (req, res) => {
  executeQuery(req, res, "links").then((docRef) =>
    sendSingleResponse(docRef, res)
  );
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
  executeQuery(req, res, "links").then((docRef) =>
    deleteSingleDocument(docRef, res)
  );
});

/*      ======== CALENDAR EVENT-SPECIFIC CRUD FUNCTIONS ========      */

// CREATE specific calendar
app.post("/api/calendar/:monthID", (req, res) => {
  createCalendar(res, req.params.monthID);
});

// READ specific calendar
app.get("/api/calendar/:id", (req, res) => {
  const inputID = req.params.id;
  const monthID = parseInt(inputID);

  // check if the user-inputted month ID is valid
  if (
    isNaN(monthID) ||
    monthID.toString() !== inputID ||
    monthID < 1 ||
    monthID > 12
  ) {
    return res.status(400).json({
      errorDescription: `${HTTP.Err400}Invalid month ID '${inputID}'. Must be an integer value from 1 to 12.`,
    });
  }

  // handle the document reference and send the response
  function processData(docRef) {
    docRef.get().then((doc) => {
      /** Send the JSON response containing the events from the 'events' collection. */
      function sendResponse(responseArr, snapshotDocuments) {
        return res.status(200).json({
          monthID,
          ...data,
          numEvents: snapshotDocuments.length,
          events: responseArr,
        });
      }

      const data = doc.data();
      // create the calendar if it does not exist
      if (!data) {
        return createCalendar(res, monthID);
      }
      const docListQuery = docRef.collection("events");

      // 'all' query parameter ensures the list response contains every document in the collection
      // by default it's limited to 25 items
      // could also manually set the number of items with { items: xxx }
      const queryOptions = { all: "true" };
      sendListResponse(docListQuery, queryOptions, res, sendResponse);
    });
  }
  executeQuery(req, res, "calendar").then(processData);
});

// READ current calendar
app.get("/api/calendar", (_req, res) => {
  const monthID = new Date().getMonth() + 1;
  res.redirect(monthID.toString());
});

for (path of definedRoutes) {
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
    errorDescription: `404 Not Found: The server could not locate the resource at '${req.path}'.`,
  });
});

exports.app = functions.region("europe-west1").https.onRequest(app);
