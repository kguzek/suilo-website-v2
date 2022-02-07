const express = require("express");
const {
  db,
  HTTP,
  getDocRef,
  getIntArray,
  sendListResponse,
  createSingleDocument,
  updateSingleDocument,
} = require("../util");

const router = express.Router();

const eventAttributeSanitisers = {
  title: (title) => title || "Nazwa wydarzenia kalendarzowego",
  type: (type) => parseInt(type) || 0,
  startDate: (startDate) => getIntArray(startDate, "-", "1970-01-01"),
  endDate: (endDate) => getIntArray(endDate, "-", "1970-01-01"),
};

/*      ======== CALENDAR FUNCTIONS ========      */

/** Returns the Polish name for the month of the year with the given one-based index. */
function getMonthName(monthInt, yearInt) {
  yearInt === undefined && (yearInt = new Date().getFullYear());
  const date = new Date(yearInt, monthInt, 0);
  return date.toLocaleString("pl-PL", { month: "long" });
}

/** Returns the calendar year and month ints from the request query.
 * Validation conditions: `year >= 1970` & `1 <= month <= 12`.
 * Doesn't validate the month if `yearOnly` is set to true.
 * If the query is invalid, sends a HTTP 400 response and returns an array of null (or just `null` if yearOnly). */
function getParams(req, res, yearOnly = false) {
  const yearStr = req.params.year;
  const monthStr = req.params.month;
  const yearInt = parseInt(yearStr);
  const monthInt = parseInt(monthStr);

  // check if the user-inputted year is valid
  if (isNaN(yearInt) || yearInt.toString() !== yearStr || yearInt < 1970) {
    if (yearOnly) {
      return null;
    }
    res.status(400).json({
      errorDescription: `${HTTP.err400}Invalid year '${yearStr}'. Must be an integer value representing a year from 1970 onwards.`,
    });
    return [null, null];
  }
  if (yearOnly) {
    return yearInt;
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
    return [null, null];
  }
  return [yearInt, monthInt];
}

/*      ======== CALENDAR EVENT-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE new calendar event
  .post("/", (req, res) => {
    // ?title=Nazwa wydarzenia kalendarzowego.&type=0&startDate=1&endDate=1

    const startDate = new Date(req.query.startDate || 0);
    const endDate = new Date(req.query.endDate || 0);

    // ensure end date is the same or after the start date and convert the date to a string
    const newEndDate = new Date(Math.max(startDate, endDate)).toJSON();
    req.query.endDate = newEndDate;

    // populate the event object
    const event = {};
    for (const attrib in eventAttributeSanitisers) {
      const sanitiser = eventAttributeSanitisers[attrib];
      event[attrib] = sanitiser(req.query[attrib]);
    }

    createSingleDocument(event, res, { collectionName: "calendar" });
  })

  // READ all current calendar events
  .get("/", (req, res) => {
    const now = new Date();
    const calendarURL = `${now.getFullYear()}/${now.getMonth() + 1}/`;
    if (req.originalUrl.split("?").shift().endsWith("/")) {
      res.redirect(calendarURL);
    } else {
      res.redirect(`calendar/${calendarURL}`);
    }
  })

  // READ all current year calendar events
  .get("/:year/", (req, res, next) => {
    // check if the URL parameter is a valid year
    const yearInt = getParams(req, res, true);
    if (yearInt === null) {
      // use request handler for specific event ID, defined in index.js
      // this sends the response treating the request as /api/calendar/[event ID]/ instead
      return next();
    }
    // requesting /api/calendar/[year]/ might not be necessary but if it is then the code can be implemented here.
    // the code only reaches here if the URL parameter is a valid integer > 1970, otherwise the next middleware
    // function is executed above.
    res.status(501).json({
      errorDescription:
        "501 Not Implemented: Requesting entire year calendars is under development.",
    });
  })

  // READ all current month calendar events
  .get("/:year/:month", (req, res) => {
    const [yearInt, monthInt] = getParams(req, res);
    // don't use boolean check in case of '0' value
    // (although this would mean year===0000... kinda unlikely :p)
    if (yearInt === null || monthInt === null) {
      // query params invalid; HTTP 400 was sent
      return;
    }

    const response = { numEvents: 0, events: [] };

    /** Sends the JSON response containing the filtered events from the 'events' collection. */
    function sendResponse(error, events = [], _rawSnapshotDocuments) {
      // some kind of error occured while processing the collection contents
      if (error) {
        return void res.status(500).json({
          errorDescription: HTTP.err500 + "Could not retrieve calendar data.",
          error,
        });
      }

      const firstDayOfThisMonth = new Date(yearInt, monthInt - 1, 1);
      const firstDayOfNextMonth = new Date(yearInt, monthInt, 1);

      for (const event of events) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        if (startDate >= firstDayOfNextMonth || endDate < firstDayOfThisMonth) {
          // ignore events that don't start this month or have ended before this month
          continue;
        }
        response.numEvents++;
        response.events.push({
          ...event,
          startDate: startDate.getDate(),
          endDate: endDate.getDate(),
          startsInPastMonth: startDate < firstDayOfThisMonth,
          endsInFutureMonth: endDate >= firstDayOfNextMonth,
        });
      }

      const monthName = getMonthName(monthInt, yearInt);
      const data = {
        yearInt,
        monthInt,
        monthName,
        ...response,
      };
      return res.status(200).json(data);
    }

    // 'all' query parameter ensures the list response contains every document in the collection
    // by default it's limited to 25 items
    // could also manually set the number of items with { items: xxx }
    sendListResponse(
      db.collection("calendar").orderBy("startDate", "asc"),
      { all: "true" },
      res,
      sendResponse
    );
  })

  // UPDATE specific calendar event
  .put("/:id", (req, res) => {
    getDocRef(req, res, "calendar").then((docRef) => {
      updateSingleDocument(docRef, res, req.query, eventAttributeSanitisers);
    });
  });

module.exports = router;
