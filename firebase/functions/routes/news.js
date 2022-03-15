const express = require("express");
const { createTestData } = require("../testData");
const {
  dateToTimestamp,
  createSingleDocument,
  updateSingleDocument,
  getDocRef,
  sendSingleResponse,
} = require("../util");

const router = express.Router();

const postAttributeSanitisers = {
  date: (dateStr) => {
    const date = new Date(dateStr);
    return dateToTimestamp(date == "Invalid Date" ? new Date() : date);
  },
  author: (author) => author || "autor",
  title: (title) => title || "Tytuł Postu",
  rawContent: (content) => content || "Treść postu",
  formattedContent: (content) => content || "<div><p>Treść postu</p></div><br>",
  photo: (photo) => photo || null,
  photoAuthor: (photoAuthor) => photoAuthor || null,
  alt: (altPhotoText) => altPhotoText || null,
  ytID: (ID) => (ID?.length === 11 ? ID : null),
  link: (link) => link || null,
};

/*      ======== NEWS-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE news
  .post("/", (req, res) => {
    // ?date=null&author=autor&title=Tytuł Postu&text=Krótka treść postu...&content=Wydłużona treść postu.&photo=null&photoAuthor=null&alt=null&ytID=null

    if (req.query.create_test_data) {
      return createTestData(res);
    }

    // initialise parameters
    const data = {};
    for (const attrib in postAttributeSanitisers) {
      const sanitiser = postAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib]);
    }

    createSingleDocument(data, res, "news");
  })

  // READ single news
  .get("/:id", (req, res) =>
    getDocRef(req, res, "news").then((docRef) =>
      sendSingleResponse(docRef, res)
    )
  )

  // UPDATE news
  .put("/:id", (req, res) =>
    updateSingleDocument(req, res, "news", postAttributeSanitisers)
  );

module.exports = router;
