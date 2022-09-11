const express = require("express");
const router = express.Router();
const {
  getDocRef,
  sendSingleResponse,
  dateToTimestamp,
  createSingleDocument,
  updateSingleDocument,
} = require("../util");

const voteAttributeSanitisers = {
  startDate: (dateStr) => {
    const date = new Date(dateStr);
    return dateToTimestamp(date == "Invalid Date" ? new Date() : date);
  },
  endDate: (dateStr) => {
    const date = new Date(dateStr);
    return dateToTimestamp(date == "Invalid Date" ? new Date() : date);
  },
  resultsDate: (dateStr) => {
    const date = new Date(dateStr);
    return dateToTimestamp(date == "Invalid Date" ? new Date() : date);
  },
  voteTreshold: (treshold) => treshold || 20,
  classList: (classList) =>
    Array.isArray(classList)
      ? classList
      : [
          "1a",
          "1b",
          "1c",
          "1d",
          "1e",
          "2a",
          "2b",
          "2c",
          "2d",
          "2e",
          "3a",
          "3b",
          "3c",
          "3d",
          "3e",
          "4a",
          "4b",
          "4c",
          "4d",
          "4e",
        ],
};

router.get("/info", (req, res) => {
  req.params.id = "1";
  getDocRef(req, res, "info").then((docRef) => sendSingleResponse(docRef, res));
});
router.post("/info", (req, res) => {
  const data = {};
  for (const attrib in voteAttributeSanitisers) {
    const sanitiser = voteAttributeSanitisers[attrib];
    data[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
  }
  createSingleDocument(data, res, "info", 1);
});
router.put("/info", (req, res) => {
  req.params.id = "1";
  updateSingleDocument(req, res, "info", voteAttributeSanitisers);
});
module.exports = router;
