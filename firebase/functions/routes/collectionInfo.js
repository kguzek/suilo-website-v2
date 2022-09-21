const { db, sendSingleResponse, formatTimestamps } = require("../util");

function getRouter(availableEndpoints) {
  const defaultValues = {};
  const now = new Date();
  for (const endpoint of availableEndpoints) {
    if (endpoint === "collectionInfo") continue;
    // Initialise the last updated date of each collection to the current time and a document count of 0
    defaultValues[endpoint] = { lastUpdated: now, numDocs: 0 };
  }

  return async (_req, res) => {
    const docRef = db.collection("_general").doc("collectionInfo");
    sendSingleResponse(
      docRef,
      res,
      (rawData) => {
        // Merge the default values with the data retrieved from the document
        formatTimestamps(rawData.lastUpdate);
        const dataToSend = { ...defaultValues };
        for (const endpoint in rawData.collectionSizes) {
          if (dataToSend[endpoint]) {
            dataToSend[endpoint].numDocs = rawData.collectionSizes[endpoint];
          }
        }
        for (const endpoint in rawData.lastUpdate) {
          if (dataToSend[endpoint]) {
            dataToSend[endpoint].lastUpdated = rawData.lastUpdate[endpoint];
          }
        }
        return dataToSend;
      },
      false,
      defaultValues
    );
  };
}

module.exports = getRouter;
