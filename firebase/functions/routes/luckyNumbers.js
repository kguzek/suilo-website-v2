const express = require("express");
const {
  db,
  sendListResponse,
  numbersAreCurrent,
  generateLuckyNumbers,
} = require("../util");

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

  try {
    docRef.get().then((doc) => {
      let data = doc.data();
      if (forceUpdate || !numbersAreCurrent(data)) {
        // Regenerate the lucky numbers data
        data = generateLuckyNumbers(data);
        // Update in database
        docRef.set(data);
      }
      sendNumbersData(res, data);
    });
  } catch (error) {
    return res.status(500).json({
      errorDescription:
        "500 Internal Server Error: Could not get the lucky numbers data.",
      errorDetails: error.toString(),
    });
  }
}

/*      ======== LUCKY NUMBERS-SPECIFIC CRUD FUNCTIONS ========      */

router
  /*
  // GET lucky numbers (v1)
  .get("/", (req, res) => {
    try {
      db.collection("numbers")
        .doc("1")
        .get()
        .then((doc) => {
          const data = doc.data();
          // en-GB locale uses dd/mm/YYYY for short date notation
          const today = new Date();
          const currentDateString = today.toLocaleDateString("en-GB");
          if (!data) {
            return res.status(500).json({
              errorDescription:
                HTTP.err500 +
                "No lucky numbers data exists. The database document has not been created.",
            });
          }
          // check if all the requirements for new lucky numbers are met
          const dataDate = new Date(data.date._seconds * 1000);
          const dataDateString = dataDate.toLocaleDateString("en-GB");
          let luckyNumbers = data.luckyNumbers;
          if (
            currentDateString !== dataDateString &&
            ![0, 6].includes(today.getDay()) &&
            !data.freeDays.includes(currentDateString)
          ) {
            // new lucky numbers must be generated
            luckyNumbers = [];
            for (let i = 0; i < data.numberQuantity / 2; i++) {
              // generate a random number between 1 and quantity of possible left numbers
              let helperNumber = randomIntFromInterval(
                1,
                data.splitPoint - data.usedBeforeSplit.length
              );
              let randomNumber = 1;
              // loop through the numbers as long as you've passed enough numbers that weren't used (helper number)
              while (helperNumber > 0) {
                if (!data.usedBeforeSplit.includes(randomNumber)) {
                  helperNumber--;
                }
                if (helperNumber !== 0) {
                  randomNumber++;
                }
              }
              // add result
              luckyNumbers.push(randomNumber);
              data.usedBeforeSplit.push(randomNumber);
              // reset the array if all numbers have been used
              if (data.usedBeforeSplit.length === data.splitPoint) {
                data.usedBeforeSplit = [];
              }
              // same for the other half
              helperNumber = randomIntFromInterval(
                1,
                data.maxNumber - data.splitPoint - data.usedAfterSplit.length
              );
              randomNumber = data.splitPoint + 1;
              while (helperNumber > 0) {
                if (!data.usedAfterSplit.includes(randomNumber)) {
                  helperNumber--;
                }
                if (helperNumber !== 0) {
                  randomNumber++;
                }
              }
              luckyNumbers.push(randomNumber);
              data.usedAfterSplit.push(randomNumber);
              if (
                data.usedAfterSplit.length ===
                data.maxNumber - data.splitPoint
              ) {
                data.usedAfterSplit = [];
              }
            }
            db.collection("numbers")
              .doc("1")
              .set(
                {
                  luckyNumbers: luckyNumbers,
                  date: dateToTimestamp(today),
                  usedBeforeSplit: data.usedBeforeSplit,
                  usedAfterSplit: data.usedAfterSplit,
                },
                { merge: true }
              );
          }
          // return the new or old data
          return res.status(200).json({
            date: currentDateString,
            luckyNumbers,
            excludedClasses: data.excludedClasses,
          });
        });
    } catch (error) {
      return res.status(500).json({
        errorDescription:
          "500 Internal Server Error: Could not get the lucky numbers data.",
        errorDetails: error.toString(),
      });
    }
  })
  //*/

  // GET lucky numbers (v2)
  .get("/v2", (_req, res) => readNumbersData(res))

  // CREATE new lucky numbers (v2)
  .post("/v2", (_req, res) => readNumbersData(res, true))

  // GET lucky numbers archive
  .get("/archive", (req, res) => {
    // ?sort=ascending

    const sortDescending = req.query.sort?.toLowerCase() === "descending";

    const collectionRef = db
      .collection("archivedNumbers")
      .orderBy("date", sortDescending ? "desc" : "asc");

    sendListResponse(collectionRef, req.query, res);
  });

module.exports = router;
