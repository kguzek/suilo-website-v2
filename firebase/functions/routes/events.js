const express = require("express");
const {
  createSingleDocument,
  sendSingleResponse,
  sendListResponse,
  db,
  getDocRef,
  updateSingleDocument,
  deleteSingleDocument,
  HTTP,
} = require("../util");

const router = express.Router();

const UPDATABLE_EVENT_ATTRIBUTES = ["title", "date", "location"];

/** Splits the string with the given separator and casts each resulting array element into an integer.
 * If any array element is NaN, the appropriate array for the default input argument.
 */
function getIntArray(string, separator, defaultInput = "0") {
  let anyNaN = false;

  function parseNum(num) {
    const int = parseInt(num);
    // set anyNaN to true if 'int' is not a number
    anyNaN = anyNaN || isNaN(int);
    return int;
  }

  const tmp = (string || "").split(separator).map((num) => parseNum(num));
  if (anyNaN) {
    return getIntArray(defaultInput, separator);
  }
  return tmp;
}

/*      ======== SCHOOL EVENT-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE new event
  .post("/", (req, res) => {
    // ?title=Tytuł wydarzenia&date=1970-01-01&start_time=00:00&end_time=23:59location=null&content=Treść wydarzenia...

    //initialise parameters
    const title = req.query.title || "Tytuł wydarzenia";
    const date = getIntArray(req.query.date, "-", "1970-01-01");
    const startTime = getIntArray(req.query.start_time, ":", "00:00");
    const endTime = getIntArray(req.query.end_time, ":", "23:59");
    const location = req.query.location || null;
    const content = req.query.content || "Treść wydarzenia...";

    const data = {
      title,
      date,
      startTime,
      endTime,
      location,
      content,
      participants: [],
    };
    createSingleDocument(data, res, { collectionName: "events" });
  })

  // CREATE (toggle) event participation status
  .post("/:id", (req, res) => {
    // ?user_id=null
    const userID = parseInt(req.query.user_id);
    if (isNaN(userID)) {
      return res.status(400).json({ errorDescription: "Invalid user ID." });
    }
    getDocRef(req, res, "events").then((docRef) => {
      docRef.get().then((doc) => {
        const data = doc.data();
        if (!data) {
          return res.status(404).json({
            errorDescription:
              HTTP.err404 + "There is no event with the given ID.",
          });
        }
        let participants = data.participants || [];
        let msg;
				const participating = participants.includes(userID);
        if (participating) {
          participants = participants.filter((id) => id !== userID);
          msg = `Success! User with ID ${userID} is no longer participating in the event.`;
        } else {
          participants.push(userID);
          msg = `Success! User with ID ${userID} is now a participant of the event.`;
        }
        docRef.update({ participants });
        return res
          .status(200)
          .json({ msg, participating: !participating, participants });
      });
    });
  })

  // READ all events
  .get("/", (req, res) => {
    // ?page=1&items=25&all=false
    const docListQuery = db.collection("events").orderBy("date", "asc");
    sendListResponse(docListQuery, req.query, res);
  })

  // READ single event
  .get("/:id", (req, res) => {
    getDocRef(req, res, "events").then((docRef) =>
      sendSingleResponse(docRef, res)
    );
  })

  // UPDATE single event
  .put("/:id", (req, res) => {
    getDocRef(req, res, "events").then((docRef) =>
      updateSingleDocument(docRef, res, req.query, UPDATABLE_EVENT_ATTRIBUTES)
    );
  })

  // DELETE single event
  .delete("/:id", (req, res) => {
    getDocRef(req, res, "events").then((docRef) =>
      deleteSingleDocument(docRef, res)
    );
  });

module.exports = router;
