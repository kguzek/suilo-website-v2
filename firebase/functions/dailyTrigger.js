const { dateToArray } = require("./common");
const { sendEventNotification } = require("./sendgrid");
const { db, numbersAreCurrent, generateLuckyNumbers } = require("./util");

/** Updates the lucky numbers in the database. */
async function updateLuckyNumbers() {
  const luckyNumbersDoc = db.collection("_general").doc("luckyNumbers");
  const doc = await luckyNumbersDoc.get();
  const data = doc.data();
  // Check if it's a holiday, weekend etc.
  if (numbersAreCurrent(data)) {
    console.log("Not generating new numbers as they are current.");
    return;
  }
  console.log("Updating the lucky numbers.");
  // Regenerate lucky numbers data
  const newData = generateLuckyNumbers(data);
  // Update the data in the database
  await luckyNumbersDoc.set(newData);
}

/** Gets all events for today and notifies the subscribed users. */
async function notifyAboutEvents() {
  const querySnapshot = await db
    .collection("events")
    .where("date", "==", dateToArray())
    .get();

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (!data) return;
    console.log("Processing event", doc.id, data.title, "...");
		// Don't send the email if there are no recipients
    if (Object.keys(data.notificationsFor ?? {}).length === 0) return;
    sendEventNotification(data.notificationsFor, data, doc.id);
  });
}

async function dailyTrigger(_context) {
  await updateLuckyNumbers();
  await notifyAboutEvents();
}

module.exports = dailyTrigger;
