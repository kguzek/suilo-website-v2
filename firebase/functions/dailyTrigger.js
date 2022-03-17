const { db, numbersAreCurrent, generateLuckyNumbers } = require("./util");

/** Updates the lucky numbers in the database. */
function _updateLuckyNumbers() {
	const luckyNumbersDoc = db.collection("_general").doc("luckyNumbers");
	luckyNumbersDoc.get().then((doc) => {
		const data = doc.data();
		// Check if it's a holiday, weekend etc.
		if (numbersAreCurrent(data)) return;
		// Regenerate lucky numbers data
		const newData = generateLuckyNumbers(data);
		// Update the data in the database
		luckyNumbersDoc.set(newData);
	});
}

function dailyTrigger(context) {
	_updateLuckyNumbers();
};

module.exports = dailyTrigger;
