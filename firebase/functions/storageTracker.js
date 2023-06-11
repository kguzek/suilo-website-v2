const { FieldValue } = require("@google-cloud/firestore");
const { db, updateCollection } = require("./util");

const REGEX_PATTERN = /([^/]+?)((?<=_)\d{3,4}x\d{3,4})?(\.(?:[^./]+))?$/;

async function trackStorage(object) {
  const match = REGEX_PATTERN.exec(object.name);
  // const [fullPath, filename, size, extension] = match;
  const [fullPath, filename] = match;
  if (!fullPath.startsWith("photos/")) {
    return;
  }
  // Check if the file metadata indicates that this image was resized
  if (object.metadata?.resizedImage === "true") {
    return;
  }
  // The uploaded file is the raw file before resize procesing
  console.info("Uploaded file with metadata:", object.metadata);
  // Add the filename to the storage collection
  const collectionRef = db.collection("_general");
  await collectionRef.doc("storage").update({
    photos: FieldValue.arrayUnion(filename),
  });
  // Update the "last updated" database entry
  updateCollection("storage", 1);
}

module.exports = trackStorage;
