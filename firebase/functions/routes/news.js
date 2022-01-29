const express = require("express");
const { createTestData } = require("../testData");
const {
  db,
  dateToTimestamp,
  createSingleDocument,
  sendListResponse,
  updateSingleDocument,
  getDocRef,
} = require("../util");

const router = express.Router();

const UPDATABLE_POST_ATTRIBUTES = [
  "author",
  "title",
  "text",
  "content",
  "photo",
  "imageAuthor",
];

/*      ======== NEWS-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE news
  .post("/", (req, res) => {
    // ?author=autor&title=Tytuł Postu&text=Krótka treść postu...&content=Wydłużona treść postu.&photo=null
    // initialise parameters
    const data = {
      date: dateToTimestamp(new Date()),
      author: req.query.author || "autor",
      title: req.query.title || "Tytuł Postu",
      text: req.query.text || "Krótka treść postu...",
      content: req.query.content || "Wydłużona treść postu.",
      photo: req.query.text || null,
    };
    if (req.query.create_test_data) {
      createTestData(res);
    } else {
      createSingleDocument(data, res, { collectionName: "news" });
    }
  })

  // UPDATE news
  .put("/:id", (req, res) => {
    getDocRef(req, res, "news").then((docRef) =>
      updateSingleDocument(docRef, res, req.query, UPDATABLE_POST_ATTRIBUTES)
    );
  });

module.exports = router;
