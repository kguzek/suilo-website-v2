const express = require("express");
const {
  db,
  HTTP,
  getDocRef,
  sendListResponse,
  sendSingleResponse,
  createSingleDocument,
  deleteSingleDocument,
  updateSingleDocument,
} = require("../util");

const router = express.Router();

const eventAttributeSanitisers = {
  title: (title) => title || "Nazwa wydarzenia kalendarzowego",
  type: (type) => parseInt(type) || 0,
  startDate: (startDate) => sanitiseDate(startDate),
  endDate: (endDate) => sanitiseDate(endDate),
};

/*      ======== CALENDAR FUNCTIONS ========      */

/** Converts a day of the month string into an integer between 1 and the number of days in the month. */
function sanitiseDate(dateString, maxDate = 31) {
  // ensure that start date is between the first and last day of the month
  return Math.min(Math.max(parseInt(dateString) || 1, 1), maxDate);
}

/** Returns the Polish name for the month of the year with the given one-based index. */
function getMonthName(monthInt, yearInt) {
  yearInt === undefined && (yearInt = new Date().getFullYear());
  const date = new Date(yearInt, monthInt, 0);
  console.log(date);
  return date.toLocaleString("pl-PL", { month: "long" });
}

/** Returns an array containing the appropriate collection reference, year, and month from the request query.
 * If the query is invalid, sends a HTTP 400 response and returns void. */
function getCollectionInfo(req, res) {
  const yearStr = req.params.year;
  const monthStr = req.params.month;
  const yearInt = parseInt(yearStr);
  const monthInt = parseInt(monthStr);

  // check if the user-inputted year is valid
  if (isNaN(yearInt) || yearInt.toString() !== yearStr || yearInt < 2022) {
    res.status(400).json({
      errorDescription: `${HTTP.err400}Invalid year '${yearStr}'. Must be an integer value representing a year from 2022 onwards.`,
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
    const collectionInfo = getCollectionInfo(req, res);
    if (!collectionInfo) {
      return;
    }
    const [collectionRef, yearInt, monthInt] = collectionInfo;

    // determine the number of days in the month
    const maxDate = new Date(yearInt, monthInt, 0).getDate();

    // ensure that the dates are between the first and last day of the month
    const startDate = sanitiseDate(req.query.startDate, maxDate);
    const endDate = sanitiseDate(req.query.endDate, maxDate);

    const event = {
      title: eventAttributeSanitisers.title(req.query.title),
      type: eventAttributeSanitisers.type(req.query.type),
      startDate,
      endDate: Math.max(endDate, startDate),
    };

    createSingleDocument(event, res, { collectionRef });
  })

  // READ all current calendar events
  .get("/", (req, res) => {
    const now = new Date();
    const calendarURL = `${now.getFullYear()}/${now.getMonth() + 1}/`;
    if (req.originalUrl.endsWith("/")) {
      res.redirect(calendarURL);
    } else {
      res.redirect(`calendar/${calendarURL}`);
    }
  })

  // READ all current month calendar events
  .get("/:year/:month", (req, res) => {
    const collectionInfo = getCollectionInfo(req, res);
    if (!collectionInfo) {
      return;
    }
    const [collectionRef, yearInt, monthInt] = collectionInfo;

    /** Sends the JSON response containing the events from the 'events' collection. */
    function sendResponse(events, snapshotDocuments) {
      const monthName = getMonthName(monthInt, yearInt);
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
    sendListResponse(
      collectionRef.orderBy("startDate", "asc"),
      { all: "true" },
      res,
      sendResponse
    );
  })

  // READ specific calendar event
  .get("/:year/:month/:id", (req, res) => {
    const collectionInfo = getCollectionInfo(req, res);
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
    const collectionInfo = getCollectionInfo(req, res);
    if (!collectionInfo) {
      return;
    }

    const docRef = collectionInfo[0].doc(req.params.id);

    getDocRef(req, res, "calendar").then(() => {
      updateSingleDocument(docRef, res, req.query, eventAttributeSanitisers);
    });
  })

  // DELETE specific calendar event
  .delete("/:year/:month/:id", (req, res) => {
    const collectionInfo = getCollectionInfo(req, res);
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
