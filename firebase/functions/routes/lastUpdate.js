const { db, sendSingleResponse } = require("../util");

function getRouter(availableEndpoints) {
  const defaultValues = {};
  for (const endpoint of availableEndpoints) {
    // Initialise the last updated date of each colelction to Unix epoch (01/01/1970)
    defaultValues[endpoint] = new Date(0);
  }

  return async (_req, res) => {
    const docRef = db.collection("_general").doc("lastUpdate");
    sendSingleResponse(docRef, res, (dataToSend) => {
      // Merge the default values with the data retrieved from the document
      return { ...defaultValues, ...dataToSend };
    });
  };
}

module.exports = getRouter;
