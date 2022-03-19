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
  type: (type) => Number(!!parseInt(type)),
  date: (date) => getIntArray(date, "-", "1970-01-01"),
  startTime: (startTime) => getIntArray(startTime, ":", "00:00"),
  endTime: (endTime) => getIntArray(endTime, ":", "23:59"),
  location: (location) => location || null,
  photo: (photo) => photo || null,
  link: (link) => link || null,
  content: (content) => content || "Treść wydarzenia...",
};

/*      ======== SCHOOL EVENT-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE new event
  .post("/", (req, res) => {
    // ?title=Tytuł wydarzenia&type=0&date=1970-01-01&startTime=00:00&endTime=23:59location=null&photo=null&link=null&content=Treść wydarzenia...

    const notificationsFor = {};
    // Check if the request payload contains the user information
    if (req.userInfo?.email && req.userInfo?.displayName) {
      // Add the event author to the list of users to be notified by default
      notificationsFor[req.userInfo.email] = req.userInfo.displayName;
    }
    const data = { participants: [], notificationsFor };
    for (const attrib in eventAttributeSanitisers) {
      const sanitiser = eventAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib]);
    }
    createSingleDocument(data, res, "events");
  })

  // This method adds "participating" and "notified" attributes to the response
  // Currently this verification is made on the client side in order to enable optimistic updates
  // READ single event
  // .get(`/:id`, (req, res) => {
  //   const userID = req.userInfo?.uid;
  //   const userEmail = req.userInfo?.email;

  //   getDocRef(req, res, "events").then((docRef) =>
  //     sendSingleResponse(docRef, res, (dataToSend) => {
  //       // check if the user who sent the request is in the participants list
  //       const participants = dataToSend.participants ?? [];
  //       const participating = participants.includes(userID);
  //       // check if the usre who sent the request has notifications enabled
  //       const notified = userEmail in dataToSend.notificationsFor ?? {};
  //       return { ...dataToSend, participating, notified };
  //     })
  //   );
  // })

  // READ single event
  .get("/:id", (req, res) =>
    getDocRef(req, res, "events").then((docRef) =>
      sendSingleResponse(docRef, res)
    )
  )

  // UPDATE (toggle) event participation/notification status
  .patch("/:id", (req, res) => {
    // ?toggle=notification|participance
    const userID = req.userInfo?.uid;
    const userEmail = req.userInfo?.email;
    const userDisplayName = req.userInfo?.displayName;
    if (!userID || !userEmail || !userDisplayName) {
      return res.status(403).json({
        errorDescription: "You must be signed in to perform this action.",
      });
    }

    const response = {};

    /** Toggles the user's notification for the given event. */
    function toggleNotification(data) {
      const notificationsFor = data.notificationsFor ?? {};
      const notified = userEmail in notificationsFor;
      if (notified) {
        delete notificationsFor[userEmail];
        response.msg = `Success! ${userEmail} will no longer be notified of this event.`;
      } else {
        notificationsFor[userEmail] = userDisplayName;
        response.msg = `Success! ${userEmail} will now be notified of this event.`;
      }
      response.notified = !notified;
      // Add the list of email addresses to the HTTP response array
      response.notificationsFor = Object.keys(notificationsFor);
      return { notificationsFor };
    }

    /** Toggles the user's participation status for the given event. */
    function toggleParticipance(data) {
      let participants = data.participants ?? [];
      const participating = participants.includes(userID);
      if (participating) {
        participants = participants.filter((id) => id !== userID);
        response.msg = `Success! User with ID ${userID} is no longer participating in the event.`;
      } else {
        participants.push(userID);
        response.msg = `Success! User with ID ${userID} is now a participant of the event.`;
      }
      response.participating = !participating;
      response.participants = participants;
      return { participants };
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
        switch (req.query.toggle) {
          case "notification":
            docRef.update(toggleNotification(data));
            break;
          case "participance":
            docRef.update(toggleParticipance(data));
            break;
          default:
            res.status(400).json({
              errorDescription: `${HTTP.err400}Invalid 'toggle' parameter provided. Must be one of 'notification' or 'participance'.`,
            });
            return;
        }
        res.status(200).json(response);
      });
    });
  })

  // UPDATE single event
  .put("/:id", (req, res) =>
    updateSingleDocument(req, res, "events", eventAttributeSanitisers)
  );

module.exports = router;
