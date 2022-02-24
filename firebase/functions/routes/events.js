const express = require("express");
const {
  HTTP,
  getDocRef,
  getIntArray,
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
    createSingleDocument(data, res, "events");
  })

  // READ single event/link/news
  .get(`/:id`, (req, res) => {
    const userID = parseInt(req?.userInfo?.uid);

    getDocRef(req, res, "events").then((docRef) =>
      sendSingleResponse(docRef, res, (dataToSend) => {
        // check if the user who sent the request is in the participants list
        const participants = dataToSend.participants ?? [];
        const participating = !isNaN(userID) && participants.includes(userID);
        return { ...dataToSend, participating };
      })
    );
  })

  // UPDATE (toggle) event participation status
  .patch("/:id", (req, res) => {
    const user = req.userInfo ?? {};
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
        let participants = data.participants ?? [];
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
  .put("/:id", (req, res) =>
    updateSingleDocument(req, res, "events", eventAttributeSanitisers)
  );

module.exports = router;
