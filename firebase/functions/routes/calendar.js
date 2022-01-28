const express = require("express");
const url = require("url");
const {
  db,
  HTTP,
  SERVER_REGION,
  getDocRef,
  sendListResponse,
  sendSingleResponse,
  createSingleDocument,
  deleteSingleDocument,
  updateSingleDocument,
} = require("../util");

const router = express.Router();

const UPDATABLE_EVENT_ATTRIBUTES = ["title", "type", "startDate", "endDate"];

/*      ======== CALENDAR FUNCTIONS ========      */

/** Returns the Polish name for the month of the year with the given zero-based index. */
function getMonthName(monthID) {
  const date = new Date(new Date().setMonth(monthID));
  return date.toLocaleString("pl-PL", { month: "long" });
}

/** Returns the collection reference from the request query. */
function getCollectionReference(req, res) {
  const yearStr = req.params.year;
  const monthStr = req.params.month;
  const yearInt = parseInt(yearStr);
  const monthInt = parseInt(monthStr);

  // check if the user-inputted year is valid
  if (isNaN(yearInt) || yearInt.toString() !== yearStr || yearInt < 2022) {
    res.status(400).json({
      errorDescription: `${HTTP.err400}Invalid year '${yearStr}'. Must be an integer value representing a year.`,
    });
    return;
  }
  // check if the user-inputted month ID is valid
  if (
    isNaN(monthInt) ||
    monthInt.toString() !== monthStr ||
    monthInt < 1 ||
    monthInt > 12
  ) {
    res.status(400).json({
      errorDescription: `${HTTP.err400}Invalid month index '${monthStr}'. Must be an integer value from 1 to 12.`,
    });
    return;
  }
  return [
    db.collection("calendar").doc(yearStr).collection(monthStr),
    yearInt,
    monthInt,
  ];
}

/*      ======== CALENDAR EVENT-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE new calendar event
  .post("/:year/:month", (req, res) => {
    // ?title=Nazwa wydarzenia kalendarzowego.&type=0&startDate=1&endDate=1
    const collectionInfo = getCollectionReference(req, res);
    if (!collectionInfo) {
      return;
    }
    const [collectionRef, yearInt, monthInt] = collectionInfo;

    // determine the number of days in the month
    const maxDate = new Date(new Date().getFullYear(), monthInt, 0).getDate();

    // ensure that the start date is between the first and last day of the month
    const startDate = Math.min(
      Math.max(parseInt(req.query.startDate) || 1, 1),
      maxDate
    );
    // ensure that the end date is between the start date and the last day of the month
    const endDate = Math.min(
      Math.max(parseInt(req.query.endDate) || 1, startDate),
      maxDate
    );

    const event = {
      title: req.query.title || "Nazwa wydarzenia kalendarzowego",
      type: parseInt(req.query.type) || 0,
      startDate,
      endDate,
      yearInt,
    };

    createSingleDocument(event, res, { collectionRef });
  })

  // READ all current calendar events
  .get("/", (req, res) => {
    const redirect = `${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
    const fullURL = `/suilo-page/${SERVER_REGION}/app${req.baseUrl}/${redirect}`;
    res.redirect(fullURL);
  })

  // READ all calendar events
  .get("/:year/:month", (req, res) => {
    const collectionInfo = getCollectionReference(req, res);
    if (!collectionInfo) {
      return;
    }
    const [collectionRef, yearInt, monthInt] = collectionInfo;

    /** Sends the JSON response containing the events from the 'events' collection. */
    function sendResponse(events, snapshotDocuments) {
      const monthName = getMonthName(monthInt - 1);
      const data = {
        yearInt,
        monthInt,
        monthName,
        numEvents: snapshotDocuments.length,
        events,
      };
      return res.status(200).json(data);
    }

    // 'all' query parameter ensures the list response contains every document in the collection
    // by default it's limited to 25 items
    // could also manually set the number of items with { items: xxx }
    sendListResponse(collectionRef, { all: "true" }, res, sendResponse);
  })

  // READ specific calendar event
  .get("/:year/:month/:id", (req, res) => {
    const collectionInfo = getCollectionReference(req, res);
    if (!collectionInfo) {
      return;
    }
    const collectionRef = collectionInfo[0];
    const id = req.params.id;

    getDocRef(req, res, "calendar").then((_docRef) => {
      sendSingleResponse(collectionRef.doc(id), res);
    });
  })

  // UPDATE specific calendar event
  .put("/:year/:month/:id", (req, res) => {
    const collectionInfo = getCollectionReference(req, res);
    if (!collectionInfo) {
      return;
    }

    const docRef = collectionInfo[0].doc(req.params.id);

    getDocRef(req, res, "calendar").then(() => {
      updateSingleDocument(docRef, res, req.query, UPDATABLE_EVENT_ATTRIBUTES);
    });
  })

  // DELETE specific calendar event
  .delete("/:year/:month/:id", (req, res) => {
    const collectionInfo = getCollectionReference(req, res);
    if (!collectionInfo) {
      return;
    }
    const id = req.params.id;

    const collectionRef = collectionInfo[0];
    getDocRef(req, res, "calendar").then(() => {
      deleteSingleDocument(collectionRef.doc(id), res);
    });
  });

module.exports = router;
