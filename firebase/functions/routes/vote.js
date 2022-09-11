const express = require("express");
const router = express.Router();
const {
  getDocRef,
  sendSingleResponse,
  dateToTimestamp,
  createSingleDocument,
  updateSingleDocument,
  createGeneralInfoPacket,
  createElectionInfo,
  updateElectionInfo,
  editClassList,
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
const candidateAttributeSanitisers = {
  name: (name) => name || "Imię",
  surname: (surname) => surname || "Nazwisko",
  className: (className) => className || "klasa",
};

router.get("/info", (req, res) => {
  createGeneralInfoPacket(req, res);
});
router.post("/setup/election", (req, res) => {
  const data = {};
  for (const attrib in voteAttributeSanitisers) {
    const sanitiser = voteAttributeSanitisers[attrib];
    data[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
  }
  createElectionInfo(data, res);
});
router.put("/setup/election", (req, res) => {
  const data = {};
  for (const attrib in voteAttributeSanitisers) {
    const sanitiser = voteAttributeSanitisers[attrib];
    if (req.query[attrib] || req.body[attrib]) {
      data[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
    }
  }
  updateElectionInfo(data, res);
});

router.post("/setup/candidate", (req, res) => {
  const data = { reachedTreshold: true, official: true };
  for (const attrib in candidateAttributeSanitisers) {
    const sanitiser = candidateAttributeSanitisers[attrib];
    data[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
  }
  createSingleDocument(data, res, "candidate");
});

router.put("/setup/election/classes", (req, res) => {
  const classList = req.query["classList"] || req.body["classList"];
  if (Array.isArray(classList)) {
    editClassList(classList, res, true);
  }
});
router.delete("/setup/election/classes", (req, res) => {
  const classList = req.query["classList"] || req.body["classList"];
  if (Array.isArray(classList)) {
    editClassList(classList, res, false);
  }
});
module.exports = router;
