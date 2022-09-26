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
  deleteSingleDocument,
  vote,
  voteForCustomCandidate,
  getResults,
} = require("../util");

const DEFAULT_CLASS_LIST = [
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
];

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
  voteTreshold: (treshold) => parseInt(treshold) || 20,
  classList: (classList) =>
    Array.isArray(classList) ? classList : DEFAULT_CLASS_LIST,
};

const candidateAttributeSanitisers = {
  fullName: (fullName) => fullName || "Imię i Nazwisko",
  className: (className) => className || "Other",
};

const voterAttributeSanitisers = {
  gender: (gender) => gender || "notSpecified",
  className: (className) => className || "Other",
};

router
  .post("/:id", (req, res) => {
    const voterInfo = {};
    for (const attrib in voterAttributeSanitisers) {
      const sanitiser = voterAttributeSanitisers[attrib];
      voterInfo[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
    }
    vote(req, res, voterInfo);
  })

  .post("/", (req, res) => {
    const candidate = { reachedTreshold: false, official: false, currVotes: 0 };
    const unsanitised = req.query.candidate || req.body.candidate;
    for (const attrib in candidateAttributeSanitisers) {
      const sanitiser = candidateAttributeSanitisers[attrib];
      candidate[attrib] = sanitiser(unsanitised[attrib]);
    }
    const VoterInfo = {};
    for (const attrib in voterAttributeSanitisers) {
      const sanitiser = voterAttributeSanitisers[attrib];
      VoterInfo[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
    }
    voteForCustomCandidate(req, res, candidate, VoterInfo);
  })

  .get("/info", (req, res) => {
    createGeneralInfoPacket(req, res);
  })

  .get("/results", (req, res) => {
    getResults(res);
  })

  .post("/setup/election", (req, res) => {
    const data = {};
    for (const attrib in voteAttributeSanitisers) {
      const sanitiser = voteAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
    }
    createElectionInfo(data, res);
  })

  .put("/setup/election", (req, res) => {
    const data = {};
    for (const attrib in voteAttributeSanitisers) {
      const sanitiser = voteAttributeSanitisers[attrib];
      const unsanitised = req.query[attrib] || req.body[attrib];
      if (unsanitised) {
        data[attrib] = sanitiser(unsanitised);
      }
    }
    updateElectionInfo(data, res);
  })

  .post("/setup/candidate", (req, res) => {
    const data = { reachedTreshold: false, official: true, currVotes: 0 };
    for (const attrib in candidateAttributeSanitisers) {
      const sanitiser = candidateAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib] || req.body[attrib]);
    }
    createSingleDocument(data, res, "candidate");
  })

  .delete("/setup/candidate/:id", (req, res) =>
    deleteSingleDocument(req, res, "candidate")
  )

  .put("/setup/election/classes", (req, res) => {
    const classList = req.query.classList || req.body.classList;
    if (Array.isArray(classList)) {
      editClassList(classList, res, true);
    }
  })

  .delete("/setup/election/classes", (req, res) => {
    const classList = req.query.classList || req.body.classList;
    if (Array.isArray(classList)) {
      editClassList(classList, res, false);
    }
  });

module.exports = router;
