const { FieldValue, Timestamp } = require("firebase-admin/firestore");
const { db, formatTimestamps, HTTP } = require("./util");

// Voting functions
function createGeneralInfoPacket(req, res) {
  const electionInfoProm = db.collection("info").doc("1").get();
  const candidatesProm = db.collection("candidate").get();
  Promise.all([electionInfoProm, candidatesProm]).then(
    ([infoDoc, candidatesSnapshot]) => {
      let settings = infoDoc.data();
      let response = infoDoc.data();

      if (!response) {
        res.status(500).json({
          errorDescription: HTTP.err500 + "There are no active elections",
        });
        return;
      }
      formatTimestamps(response);

      delete response.resultsId;
      let candidates = [];
      if (candidatesSnapshot) {
        candidatesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            delete data.currVotes;
            candidates.push({ id: doc.id, ...data });
          }
        });
      }
      response.candidates = candidates;
      const currentTime = new Date();
      formatTimestamps(settings);
      const resultsDate = new Date(settings.resultsDate);
      const endDate = new Date(settings.endDate);
      if (currentTime > endDate && currentTime > resultsDate) {
        db.collection("results")
          .doc(settings.resultsId)
          .get()
          .then((resultsRef) => {
            const results = resultsRef.data();
            if (results.simple === "") {
              generateResults();
            } else {
              response.results = JSON.parse(results.simple);
              res.status(200).json(response);
            }
          });
      } else {
        res.status(200).json(response);
      }
    }
  );
}

function createElectionInfo(data, res) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      if (docRef.data()) {
        res.status(500).json({
          errorDescription:
            HTTP.err500 +
            "Election info is already created update it with PUT or delete it to create a new one",
        });
      } else {
        db.collection("results")
          .add({ simple: "", detailed: "" })
          .then((doc) => {
            data.resultsId = doc.id;
            data.totalVotes = 0;
            createSingleDocument(data, res, "info", 1);
          });
      }
    });
}

function updateElectionInfo(data, res) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      if (docRef) {
        const currData = docRef.data();
        const currentTime = new Date();
        formatTimestamps(currData);
        const startDate = new Date(currData.startDate);
        const endDate = new Date(currData.endDate);
        if (currentTime > startDate && currentTime < endDate) {
          res.status(403).json({
            errorDescription:
              HTTP.err403 +
              "You are not allowed to edit settings during election",
          });
        } else {
          db.collection("info")
            .doc("1")
            .update(data)
            .then(() => {
              res.status(200).json({ message: "Election info edited" });
            });
        }
      } else {
        res.status(400).json({
          errorDescription: HTTP.err400 + "There is no election info to update",
        });
      }
    });
}

function editClassList(classList, res, add) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      if (docRef) {
        const currData = docRef.data();
        const currentTime = new Date();
        formatTimestamps(currData);
        const startDate = new Date(currData.startDate);
        const endDate = new Date(currData.endDate);
        if (currentTime > startDate && currentTime < endDate) {
          res.status(403).json({
            errorDescription:
              HTTP.err403 +
              "You are not allowed to edit settings during election",
          });
        } else {
          db.collection("info")
            .doc("1")
            .update({
              classList: add
                ? FieldValue.arrayUnion(...classList)
                : FieldValue.arrayRemove(...classList),
            })
            .then(() => {
              res.status(200).json({ message: "Class list updated" });
            });
        }
      } else {
        res.status(500).json({
          errorDescription: "There isn't a election info to update",
        });
      }
    });
}

function submitVoteForExistingCandidate(req, res, settings, voterInfo) {
  db.collection("candidate")
    .doc(req.params.id)
    .get()
    .then((docRef) => {
      const currentCandidate = docRef.data();
      if (currentCandidate) {
        const votePromise = db.collection("votes").add({
          date: Timestamp.now(),
          candidate: req.params.id,
          gender: voterInfo.gender,
          className: voterInfo.className,
        });
        const candidatePromise = db
          .collection("candidate")
          .doc(req.params.id)
          .update({
            currVotes: FieldValue.increment(1),
            reachedTreshold:
              currentCandidate.currVotes + 1 >= settings.voteTreshold,
          });
        const usedAccountsPromise = db
          .collection("usedAccounts")
          .doc(req.userInfo.uid)
          .set({ used: true });
        const infoPromise = db
          .collection("info")
          .doc("1")
          .update({
            totalVotes: FieldValue.increment(1),
          });

        Promise.all([
          votePromise,
          candidatePromise,
          usedAccountsPromise,
          infoPromise,
        ])
          .then(([voteRef, candidateRef, usedAccountsRef, infoRef]) => {
            res.status(200).json({
              message: "Pomyślnie oddano głos",
            });
          })
          .catch((error) => {
            return res.status(500).json({
              errorDescription:
                HTTP.err500 +
                "Something went wrong and your vote couldn't be submited properly",
              errorDetails: error.toString(),
            });
          });
      } else {
        res.status(404).json({
          errorDescription:
            HTTP.err404 +
            "The candidate that you are trying to vote for doesn't exist",
        });
      }
    });
}

function checkIfAbleToVote(req, res, next) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      const settings = docRef.data();
      if (settings) {
        const currentTime = new Date();
        formatTimestamps(settings);
        const startDate = new Date(settings.startDate);
        const endDate = new Date(settings.endDate);
        if (currentTime > startDate && currentTime < endDate) {
          db.collection("usedAccounts")
            .doc(req.userInfo.uid)
            .get()
            .then((userRef) => {
              if (userRef.data()) {
                res.status(400).json({
                  errorDescription: HTTP.err400 + "You may only vote once",
                });
              } else {
                next(settings);
              }
            });
        } else {
          res.status(400).json({
            errorDescription: HTTP.err400 + "The election isn't active",
          });
        }
      } else {
        res.status(400).json({
          errorDescription: HTTP.err400 + "There is no election",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        errorDescription:
          HTTP.err500 +
          "Something went wrong and your vote couldn't be submited properly",
        errorDetails: error.toString(),
      });
    });
}

function vote(req, res, voterInfo) {
  checkIfAbleToVote(req, res, (settings) =>
    submitVoteForExistingCandidate(req, res, settings, voterInfo)
  );
}

function voteForCustomCandidate(req, res, candidate, voterInfo) {
  checkIfAbleToVote(req, res, (settings) => {
    db.collection("candidate")
      .add(candidate)
      .then((doc) => {
        req.params.id = doc.id;
        submitVoteForExistingCandidate(req, res, settings, voterInfo);
      })
      .catch((error) => {
        return res.status(500).json({
          errorDescription:
            HTTP.err500 +
            "Something went wrong and your vote couldn't be submited properly",
          errorDetails: error.toString(),
        });
      });
  });
}

function getResults(res) {
  db.collection("info")
    .doc("1")
    .get()
    .then((docRef) => {
      const settings = docRef.data();
      if (settings) {
        const currentTime = new Date();
        formatTimestamps(settings);
        const resultsDate = new Date(settings.resultsDate);
        const endDate = new Date(settings.endDate);
        if (currentTime > endDate && currentTime > resultsDate) {
          db.collection("results")
            .doc(settings.resultsId)
            .get()
            .then((resultsRef) => {
              const results = resultsRef.data();
              if (results.simple === "" || results.detailed === "") {
                generateResults();
                res.status(500).json({
                  errorDescription:
                    HTTP.err500 + "Results are not yet generated",
                });
              } else {
                res.status(200).json(JSON.parse(results.detailed));
              }
            });
        } else {
          res.status(400).json({
            errorDescription:
              HTTP.err400 + "You are not able to view the results yet",
          });
        }
      } else {
        res.status(404).json({
          errorDescription: HTTP.err404 + "There is no election",
        });
      }
    });
}

function generateResults() {
  const candidatePromise = db.collection("candidate").get();
  const votesPromise = db.collection("votes").get();
  const infoPromise = db.collection("info").doc("1").get();
  Promise.all([candidatePromise, votesPromise, infoPromise]).then(
    ([candidatesSnapshot, voteSnapshot, infoDoc]) => {
      const byCandidates = {};
      const settings = infoDoc.data();
      const byClass = {};
      const byGender = { male: 0, female: 0, other: 0, notSpecified: 0 };
      const byHour = new Array(
        Math.ceil(
          (settings.endDate.seconds - settings.startDate.seconds) / 3600
        )
      ).fill(0);
      const simpleResult = [];
      const sortedCandidates = [];

      settings.classList.forEach((className) => {
        byClass[className] = 0;
      });
      candidatesSnapshot.forEach((doc) => {
        const { fullName, className } = doc.data();
        byCandidates[doc.id] = {
          fullName,
          className,
          male: 0,
          female: 0,
          other: 0,
          totalVotes: 0,
          byClass,
        };
      });
      voteSnapshot.forEach((doc) => {
        const { candidate, className, gender, date } = doc.data();
        const statsForCandidate = byCandidates[candidate];
        if (
          date.seconds > settings.startDate.seconds &&
          date.seconds < settings.endDate.seconds
        ) {
          statsForCandidate.totalVotes++;
          statsForCandidate[gender]++;
          statsForCandidate.byClass[className]++;
          byClass[className]++;
          byGender[gender]++;
          byHour[
            Math.floor((date.seconds - settings.startDate.seconds) / 3600)
          ]++;
        }
      });

      for (const [key, value] of Object.entries(byCandidates)) {
        sortedCandidates.push({ ...value, id: key });
        simpleResult.push({
          fullName: value.fullName,
          className: value.className,
          id: key,
          totalVotes: value.totalVotes,
        });
      }

      simpleResult.sort((a, b) => b.totalVotes - a.totalVotes);
      sortedCandidates.sort((a, b) => b.totalVotes - a.totalVotes);

      const detailedResult = {
        byCandidates: sortedCandidates,
        byHour: byHour,
        byGender: byGender,
        byClass: byClass,
      };

      db.collection("results")
        .doc(settings.resultsId)
        .update({
          simple: JSON.stringify(simpleResult),
          detailed: JSON.stringify(detailedResult),
        });
    }
  );
}

module.exports = {
  createGeneralInfoPacket,
  createElectionInfo,
  updateElectionInfo,
  editClassList,
  vote,
  voteForCustomCandidate,
  getResults,
};
