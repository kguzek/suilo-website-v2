const express = require("express");
const { createTestData } = require("../testData");
const {
  db,
  dateToTimestamp,
  createSingleDocument,
  sendSingleResponse,
  sendListResponse,
  updateSingleDocument,
  deleteSingleDocument,
  executeQuery,
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

// CREATE news
router
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

  // READ all news
  .get("/", (req, res) => {
    // ?page=1&items=25
    // return news list

    // initialise base query
    const docListQuery = db.collection("news").orderBy("date", "desc");
    // process query
    sendListResponse(docListQuery, req.query, res);
  })

  // READ single news
  .get("/:id", (req, res) => {
    executeQuery(req, res, "news").then((docRef) =>
      sendSingleResponse(docRef, res)
    );
  })

  // UPDATE news
  .put("/:id", (req, res) => {
    // ?id=null&author=null&title=null&text=null&photo=null
    executeQuery(req, res, "news").then((docRef) =>
      updateSingleDocument(docRef, res, req.query, UPDATABLE_POST_ATTRIBUTES)
    );
  })

  // DELETE news
  .delete("/:id", (req, res) => {
    // ?id=null
    executeQuery(req, res, "news").then((docRef) =>
      deleteSingleDocument(docRef, res)
    );
  });

module.exports = router;
