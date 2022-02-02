const express = require("express");
const {
  HTTP,
  getDocRef,
  createSingleDocument,
  sendSingleResponse,
  updateSingleDocument,
} = require("../util");

const router = express.Router();

const eventAttributeSanitisers = {
  title: (title) => title || "Tytuł wydarzenia",
  date: (date) => getIntArray(date, "-", "1970-01-01"),
  startTime: (startTime) => getIntArray(startTime, ":", "00:00"),
  endTime: (endTime) => getIntArray(endTime, ":", "23:59"),
  location: (location) => location || null,
  content: (content) => content || "Treść wydarzenia...",
};

/** Splits the string with the given separator and casts each resulting array element into an integer.
 * If any array element is NaN, the appropriate array for the default input argument is returned.
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
    // ?title=Tytuł wydarzenia&date=1970-01-01&startTime=00:00&endTime=23:59location=null&content=Treść wydarzenia...

    // initialise parameters
    const data = { participants: [] };
    for (const attrib in eventAttributeSanitisers) {
      const sanitiser = eventAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib]);
    }
    createSingleDocument(data, res, { collectionName: "events" });
  })

  // READ single event/link/news
  .get(`/:id`, (req, res) => {
    const userInfo = req.userInfo || {};
    const userID = parseInt(userInfo.uid) || false;

    getDocRef(req, res, "events").then((docRef) =>
      sendSingleResponse(docRef, res, (dataToSend) => {
        // check if the user who sent the request is in the participants list
        const participants = dataToSend.participants || [];
        const participating = userID && participants.includes(userID);
        return { ...dataToSend, participating };
      })
    );
  })

  // UPDATE (toggle) event participation status
  .patch("/:id", (req, res) => {
    const user = req.userInfo || {};
    const userID = parseInt(user.uid);
    if (!userID) {
      return res.status(403).json({
        errorDescription: "You must be signed in to perform this action.",
      });
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

  // UPDATE single event
  .put("/:id", (req, res) => {
    getDocRef(req, res, "events").then((docRef) =>
      updateSingleDocument(docRef, res, req.query, eventAttributeSanitisers)
    );
  });

module.exports = router;
