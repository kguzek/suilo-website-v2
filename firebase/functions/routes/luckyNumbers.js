const express = require("express");
const {
  dateToArray,
  serialiseDateArray,
} = require("../../../website/src/common");
const { db, HTTP, dateToTimestamp } = require("../util");

const router = express.Router();

const MAX_LUCKY_NUMBER = 35;

/*      ======== LUCKY NUMBERS FUNCTIONS ========      */

/** Generates a random integer between the given interval, inclusively. */
function randomIntFromInterval(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/** Returns an array made from the given range. E.g. (2, 5) => [2, 3, 4, 5]. */
function arrayFromRange(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

/** Returns the index of a random item in the given array. */
function randomArraySelection(array) {
  if (!array || !array.length) {
    return null;
  }
  const randomIndex = randomIntFromInterval(0, array.length - 1);
  return randomIndex;
}

/*      ======== LUCKY NUMBERS-SPECIFIC CRUD FUNCTIONS ========      */

router
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
        error,
      });
    }
  })

  // GET lucky numbers (v2)
  .get("/v2", (req, res) => {
    // ?force_update=false
    const weekday = new Date().getDay();
    const today = dateToArray();
    const todayString = serialiseDateArray(today);

    const forceUpdate = req.query.force_update === "true";

    function dataIsCurrent(data) {
      // return false if the update is forced or if there is no lucky numbers data
      if (forceUpdate || !data) {
        return false;
      }
      // return true if the lucky numbers data is for today
      if (data.date === todayString) {
        return true;
      }
      const freeDays = data.freeDays || [];
      // return true if it's weekend or a free day
      return [0, 6].includes(weekday) || freeDays.includes(todayString);
    }
    function sendNumbersData(data) {
      res.status(200).json({
        date: data.date,
        luckyNumbers: data.luckyNumbers,
        excludedClasses: data.excludedClasses,
      });
    }
    function generateNumbersData(data = {}) {
      const luckyNumbers = [];
      // one number pool for each lucky number: 1:15 and 16:MAX
      const splitPoints = data.splitPoints || [15, 16];
      const numberLimits = [
        [1, splitPoints[0]],
        [splitPoints[1], data.maxNumber || MAX_LUCKY_NUMBER],
      ];
      const numberPools = [data.numberPoolA, data.numberPoolB];
      for (let i = 0; i < 2; i++) {
        let numberPool = numberPools[i];
        // reset the number pool if it's empty
        if (!numberPool || numberPool.length === 0) {
          numberPool = arrayFromRange(...numberLimits[i]);
        }
        const randomIndex = randomArraySelection(numberPool);
        // remove selection from number pool
        const selection = numberPool.splice(randomIndex, 1)[0];
        // upate the number pool
        numberPools[i] = numberPool;

        luckyNumbers.push(selection);
      }
      console.log("Generated new lucky numbers data:", luckyNumbers);
      const newData = {
        date: todayString,
        luckyNumbers,
        excludedClasses: data.excludedClasses || [],
        freeDays: data.freeDays || [],
        maxNumber: numberLimits[1][1],
        splitPoints,
        numberPoolA: numberPools[0],
        numberPoolB: numberPools[1],
      };
      db.collection("numbers").doc("data").set(newData);
      sendNumbersData(newData);
    }
    try {
      db.collection("numbers")
        .doc("data")
        .get()
        .then((doc) => {
          const data = doc.data();
          dataIsCurrent(data)
            ? sendNumbersData(data)
            : generateNumbersData(data);
        });
    } catch (error) {
      return res.status(500).json({
        errorDescription:
          "500 Internal Server Error: Could not get the lucky numbers data.",
        error,
      });
    }
  });

module.exports = router;
