const { db, sendSingleResponse, formatTimestamps } = require("../util");

function getRouter(availableEndpoints) {
  const defaultValues = {};
  for (const endpoint of availableEndpoints) {
    if (endpoint === "collectionInfo") continue;
    // Initialise the last updated date of each collection to Unix epoch (01/01/1970) and a document count of 0
    defaultValues[endpoint] = { lastUpdated: new Date(0), numDocs: 0 };
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
          dataToSend[endpoint].numDocs = rawData.collectionSizes[endpoint];
        }
        for (const endpoint in rawData.lastUpdate) {
          dataToSend[endpoint].lastUpdated = rawData.lastUpdate[endpoint];
        }
        return dataToSend;
      },
      false,
      defaultValues
    );
  };
}

module.exports = getRouter;
