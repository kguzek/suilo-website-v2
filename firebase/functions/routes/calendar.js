const express = require("express");
const { serialiseDateArray } = require("../common");
const {
  db,
  HTTP,
  getDocRef,
  getIntArray,
  sendListResponse,
  sendSingleResponse,
  createSingleDocument,
  updateSingleDocument,
} = require("../util");

const router = express.Router();

const eventAttributeSanitisers = {
  title: (title) => title || "Nazwa wydarzenia kalendarzowego",
  type: (type) => parseInt(type) || 0,
  startDate: (startDate) => getIntArray(startDate, "-", "1970-01-01"),
  endDate: (endDate) => getIntArray(endDate, "-", "1970-01-01"),
  isPrimary: (isPrimary) => (isPrimary || "true").toLowerCase() !== "false",
  colourTop: hexStringToDecimal,
  colourBottom: hexStringToDecimal,
};

const defaultCalendarEventTypes = [
  "święta/wydarzenia szkolne",
  "święta/wydarzenia ogólnopolskie",
  "dzień wolny od zajęć dydaktycznych",
  "ferie zimowe",
  "przerwa wakacyjna",
  "nauka zdalna/hybrydowa",
  "matury i inne egzaminy",
];

/*      ======== CALENDAR FUNCTIONS ========      */

/** Converts a string containing a hexadecimal number either in plain digits or prepended with `#` or `0x` into a decimal number.*/
function hexStringToDecimal(hexString = "#000000") {
  // trim the leading hashtag
  const iOffset = hexString.startsWith("#");
  // starts substring at either index 0 or 1 and includes the next 6 characters
  hexString = hexString.substring(iOffset, 6 + iOffset);
  // convert the hexadecimal number string from base-16 into base-10
  // parseInt automatically converts strings beginning with 0x... into HEX.
  return parseInt(hexString, 16);
}

/** Converts base-10 into base-16 as a string with a leading `#`. */
function decimalToHexString(decimal, hexLength = 6) {
  const hex = decimal.toString(16).toUpperCase();
  return "#" + hex.padStart(hexLength, "0");
}

/** Returns the Polish name for the month of the year with the given one-based index. */
function getMonthName(monthInt) {
  const currentYear = new Date().getFullYear();
  // setting the date as 0 will initialise the date object at the last day of the month before
  // JS Date uses 0-based month indices so this will actually get the month we want
  const date = new Date(currentYear, monthInt, 0);
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

/** Converts the raw database data into the JSON output by the API.
 * - Converts the isPrimary boolean property into a `renderType` string that is either "PRIMARY" or "SECONDARY"
 * - If the render type is PRIMARY, creates a `colour` object property containing the `topCorner` and `bottomCorner` HEX values
 * - If the render type is SECONDARY, creates a `colour` string field with the HEX value of the raw data's `topCorner` property
 * - Formats the start and end dates as string with format YYYY-MM-DD
 * - Formats the event type (subtype) as the full event type string instead of an integer code
 */
function processEventData(data) {
  if (data.isPrimary) {
    data.renderType = "PRIMARY";
    // include the top and bottom corner colours in the 'colour' property
    data.colour = {
      topCorner: decimalToHexString(data.colourTop),
      bottomCorner: decimalToHexString(data.colourBottom),
    };
  } else {
    data.renderType = "SECONDARY";
    // include only the top colour (default) in the 'colour' property
    data.colour = decimalToHexString(data.colourTop);
  }
  // convert the start and end date arrays into date strings in a single `date` object
  data.date = {
    start: serialiseDateArray(data.startDate),
    end: serialiseDateArray(data.endDate),
  };
  // comment out the below line if the type conversion is to be made on the client side
  // data.eventType = calendarEventTypes[data.type];
  // remove unused parameters from the new data object
  const {
    isPrimary,
    colourTop,
    colourBottom,
    // type,
    // startDate,
    // endDate,
    ...newData
  } = data;
  return newData;
}

/** Queries the database for all the calendar events and sends a response containing those that fall within the defined time range.  */
function sendEventsList(res, year, month, lowerLimit, upperLimit) {
  let response;
  let eventSubtypes;

  /** Function to call when one of the two document fetches finishes. */
  function queryCallback(isResponse = false, data = []) {
    // Check if the document fetch contains the response that is to be sent to the user
    if (isResponse) {
      response = data;
    } else {
      eventSubtypes = data;
    }
    // Check if both document fetches have completed
    if (response && eventSubtypes) {
      // User response and event subtypes are both defined; send the response
      response.eventSubtypes = eventSubtypes;
      res.status(200).json(response);
    }
  }

  /** Sets the calendar event subtypes to the default values. */
  function setDefaultSubtypes() {
    // Set the default subtypes
    infoDocRef.set({ eventSubtypes: defaultCalendarEventTypes });
    queryCallback(false, defaultCalendarEventTypes);
  }

  // Get the calendar event subtypes
  const infoDocRef = db.collection("_general").doc("calendarInfo");
  infoDocRef
    .get()
    .then((doc) => {
      const data = doc.data();
      if (data?.eventSubtypes) {
        return void queryCallback(false, data.eventSubtypes);
      }
      setDefaultSubtypes();
    })
    .catch((error) => {
      console.log(error);
      setDefaultSubtypes();
    });

  function generateResponse(error, events = [], _rawSnapshotDocuments) {
    // some kind of error occured while processing the collection contents
    if (error) {
      return void res.status(500).json({
        errorDescription: HTTP.err500 + "Could not retrieve calendar data.",
        errorDetails: error.toString(),
      });
    }
    const response = { numEvents: 0, events: [] };

    // filter the events that are within the time range we specified
    for (const rawEvent of events) {
      // format all the data for the API
      const event = processEventData(rawEvent);
      // intialise the date string as Date objects which have a time of 00:00:00
      const startDate = new Date(event.date.start);
      const endDate = new Date(event.date.end);
      // ignore events that don't fall within the time range
      if (startDate > upperLimit || endDate < lowerLimit) {
        continue;
      }
      if (month) {
        // only include the day numbers if the month is provided
        event.date = { start: startDate.getDate(), end: endDate.getDate() };
      }
      // initialise final event properties
      if (!event.isPrimary) {
        event.date.startsInPastMonth = startDate < lowerLimit;
        event.date.endsInFutureMonth = endDate > upperLimit;
      }
      // add the event details to the response
      response.numEvents++;
      response.events.push(event);
    }

    const data = { year, ...response };
    if (month) {
      data.month = month;
      data.monthName = getMonthName(month);
    }
    queryCallback(true, data);
  }

  // 'all' query parameter ensures the list response contains every document in the collection
  // by default it's limited to 25 items
  // could also manually set the number of items with { items: xxx }
  sendListResponse(
    db.collection("calendar").orderBy("startDate", "asc"),
    { all: "true" },
    res,
    generateResponse
  );
}

/*      ======== CALENDAR EVENT-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE new calendar event
  .post("/", (req, res) => {
    // ?title=Nazwa wydarzenia kalendarzowego.&type=0&startDate=1&endDate=1&isPrimary=true&colourTop=#000000&colourBottom=#000000

    const startDate = new Date(req.query.startDate ?? 0);
    const endDate = new Date(req.query.endDate ?? 0);

    // ensure end date is the same or after the start date and convert the date to a string
    const newEndDate = new Date(Math.max(startDate, endDate)).toJSON();
    req.query.endDate = newEndDate;

    // populate the event object
    const event = {};
    for (const attrib in eventAttributeSanitisers) {
      const sanitiser = eventAttributeSanitisers[attrib];
      event[attrib] = sanitiser(req.query[attrib]);
    }

    createSingleDocument(event, res, "calendar");
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
    // the code only reaches here if the URL parameter is a valid integer > 1970, otherwise the next middleware
    // function is executed above.

    const firstDayOfYear = new Date(yearInt, 0, 1);
    const lastDayOfYear = new Date(yearInt + 1, 0, 0);
    sendEventsList(res, yearInt, null, firstDayOfYear, lastDayOfYear);
  })

  // READ all current month calendar events
  .get("/:year/:month", (req, res) => {
    const [yearInt, monthInt] = getParams(req, res);
    // don't use boolean check in case of '0' value
    // (although this would mean year === 0000... kinda unlikely :p)
    if (yearInt === null || monthInt === null) {
      // query params invalid; HTTP 400 was sent
      return;
    }

    const firstDayOfMonth = new Date(yearInt, monthInt - 1, 1);
    const lastDayOfMonth = new Date(yearInt, monthInt, 0);
    sendEventsList(res, yearInt, monthInt, firstDayOfMonth, lastDayOfMonth);
  })

  // READ single calendar event
  .get(`/:id`, (req, res) => {
    getDocRef(req, res, "calendar").then((docRef) =>
      sendSingleResponse(docRef, res, processEventData)
    );
  })

  // UPDATE specific calendar event
  .put("/:id", (req, res) =>
    updateSingleDocument(req, res, "calendar", eventAttributeSanitisers)
  );

module.exports = router;
