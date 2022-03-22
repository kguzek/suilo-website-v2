const express = require("express");
const { db, sendListResponse, generateLuckyNumbers } = require("../util");

const router = express.Router();

/*      ======== LUCKY NUMBERS FUNCTIONS ========      */

/** Sends the HTTP response containing the lucky numbers data. */
function sendNumbersData(res, data) {
  res.status(200).json({
    date: data.date,
    luckyNumbers: data.luckyNumbers,
    excludedClasses: data.excludedClasses,
  });
}

/** Reads the existing lucky numbers data and either sends it or generates the next */
function readNumbersData(res, forceUpdate = false) {
  const docRef = db.collection("_general").doc("luckyNumbers");

  docRef
    .get()
    .then((doc) => {
      let data = doc.data();
      if (forceUpdate || !data) {
        // Regenerate the lucky numbers data
        data = generateLuckyNumbers(data);
        // Update in database
        docRef.set(data);
      }
      sendNumbersData(res, data);
    })
    .catch((error) => {
      return res.status(500).json({
        errorDescription:
          "500 Internal Server Error: Could not get the lucky numbers data.",
        errorDetails: error.toString(),
      });
    });
}

/*      ======== LUCKY NUMBERS-SPECIFIC CRUD FUNCTIONS ========      */

router
  // GET lucky numbers (v2)
  .get("/v2", (_req, res) => void readNumbersData(res))

  // CREATE new lucky numbers (v2)
  .post("/v2", (_req, res) => void readNumbersData(res, true))

  // GET lucky numbers archive
  .get("/archive", (req, res) => {
    // ?sort=ascending

    // Check if the provided sort order is any of "d", "desc", "descending" etc.
    const sortOrder = req.query.sort?.toLowerCase();
    const sortDescending = sortOrder && "descending".startsWith(sortOrder);

    const collectionRef = db
      .collection("archivedNumbers")
      .orderBy("date", sortDescending ? "desc" : "asc");

    sendListResponse(collectionRef, req.query, res);
  });

module.exports = router;
