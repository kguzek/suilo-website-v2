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
const bookAttributeSanitisers = {
    title: (title) => title || "Tytuł",
    user: (user) => user || null,
    name: (name) => name || null,
    studentClass: (studentClass) => studentClass || null,
    email: (email) => email || null, 
    quality: (quality) => quality|| "dobra",
    publisher: (publisher) => publisher || null,
    year: (year) => year || null,
    photo: (photo) => photo || null,
    level: (level) => level || null,
    content: (content) => content || "Opis Książki...",
  };
  router
  // CREATE new book
  .post("/", (req, res) => {
    req.query.user = req.userInfo.uid;
    req.query.name = req.userInfo.displayName;
    req.query.email = req.userInfo.email;
    const data = {};
    for (const attrib in bookAttributeSanitisers) {
      const sanitiser = bookAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib]);
    }
    createSingleDocument(data, res, "books");
  })
  // READ single event
  .get("/:id", (req, res) =>
    getDocRef(req, res, "books").then((docRef) =>
      sendSingleResponse(docRef, res)
    )
  )
module.exports = router;


