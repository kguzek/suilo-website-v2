const express = require("express");
const { db, HTTP, executeQuery, sendListResponse } = require("../util");

const router = express.Router();

/*      ======== CALENDAR FUNCTIONS ========      */

/** Returns the Polish name for the month with the given zero-based index. */
function getMonthName(monthID) {
  const date = new Date(new Date().setMonth(monthID));
  return date.toLocaleString("pl-PL", { month: "long" });
}

function createCalendar(res, monthID, events = []) {
  if (!monthID) {
    return res.status(400).json({
      errorMessage: `${HTTP400}Invalid month ID '${monthID}'.`,
    });
  }
  const docRef = db.collection("calendar").doc(monthID.toString());
  const eventCollection = docRef.collection("events");

  const monthName = getMonthName(monthID - 1);

  const data = {
    monthID,
    monthName,
    numEvents: events.length,
    events,
  };

  function populateEvents(_createdDocRef) {
    // loop through each event in the array and create a document in the "events" collection
    for (const event of events) {
      eventCollection.doc().set(event);
    }
    res.status(200).json(data);
  }
  docRef.get().then((doc) => {
    if (doc.data()) {
      return res.status(400).json({
        errorDescription: HTTP400 + "A calendar for that month already exists.",
      });
    }
    docRef.set({ monthName }).then(populateEvents);
  });
}

/*      ======== CALENDAR EVENT-SPECIFIC CRUD FUNCTIONS ========      */

// CREATE specific calendar
router
  .post("/:monthID", (req, res) => {
    createCalendar(res, req.params.monthID);
  })

  // READ specific calendar
  .get("/:id", (req, res) => {
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
        errorDescription: `${HTTP.err400}Invalid month ID '${inputID}'. Must be an integer value from 1 to 12.`,
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
  })

  // READ current calendar
  .get("/", (_req, res) => {
    const monthID = new Date().getMonth() + 1;
    res.redirect(monthID.toString());
  });

module.exports = router;
