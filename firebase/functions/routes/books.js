const express = require("express");
const {
  getDocRef,
  createSingleDocument,
  sendSingleResponse,
  db,
  updateSingleDocument,
  admin,
} = require("../util");

const router = express.Router();

const bookAttributeSanitisers = {
  title: (title) => title || "Tytuł",
  user: (user) => user || null,
  name: (name) => name || null,
  studentClass: (studentClass) => studentClass || null,
  email: (email) => email || null,
  quality: (quality) => quality || null,
  publisher: (publisher) => publisher || null,
  subject: (subject) => subject || null,
  year: (year) => year || null,
  photo: (photo) => photo || null,
  level: (level) => level || null,
  price: (price) => price || null,
};

router
  // CREATE new book
  .post("/", (req, res) => {
    const userID = req.userInfo?.uid;
    const userEmail = req.userInfo?.email;
    const userDisplayName = req.userInfo?.displayName;

    if (!userID || !userEmail || !userDisplayName) {
      return res.status(403).json({
        errorDescription: "You must be signed in to perform this action.",
      });
    }

    req.query.user = userID;
    req.query.email = userEmail;
    req.query.name = userDisplayName;

    const data = {};
    for (const attrib in bookAttributeSanitisers) {
      const sanitiser = bookAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib]);
    }
    createSingleDocument(data, res, "books", undefined, (bookResponse) => {
      db.collection("users")
        .doc(userID)
        .update({
          bookIDs: admin.firestore.FieldValue.arrayUnion(bookResponse.id),
        });
      res.json(bookResponse);
    });
  })

  // READ single book
  .get("/:id", (req, res) =>
    getDocRef(req, res, "books").then((docRef) =>
      sendSingleResponse(docRef, res)
    )
  );

module.exports = router;
