const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { FieldValue } = require("@google-cloud/firestore");

// Private service account key
// Used the same one as in the API, not sure whether I should have created a new one
const serviceAccount = require("./permissions.json");

// Authorise Firebase
admin.initializeApp(
  { credential: admin.credential.cert(serviceAccount) },
  "storageTracker"
);

admin.initializeApp();
const db = admin.firestore();

const REGEX_PATTERN = /([^\/]+?)((?<=_)\d{3,4}x\d{3,4})?(\.(?:[^\.\/]+))?$/;

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
exports.trackStorage = functions
  .region("europe-west1")
  .storage.object()
  .onFinalize(async (object) => {
    const match = REGEX_PATTERN.exec(object.name);
    const [fullPath, filename, size, extension] = match;
    if (!fullPath.startsWith("photos/")) {
      return;
    }
    //an EXTEMLY bad way to get the real file name (would break if there is a . or a / in filename) and if the file name resembles the format blablabla_1920x1080 but it is good enought for now(hopefully)
    //   const fileName = filePath
    //     .split("/")
    //     [filePath.split("/").length - 1].split(".")[0];
    //   const size = fileName.split("_")[fileName.split("_").length - 1];
    if (size && extension) {
      // The file name contains the image size and file extension
      // This means it has already been processed
      return;
    }
    // Add the filename to the storage collection
    const collectionRef = db.collection("_general");
    await collectionRef.doc("storage").update({
      photos: FieldValue.arrayUnion(filename),
    });
    // Update the "last updated" database entry
    await collectionRef.doc("collectionInfo").set(
      {
        lastUpdated: { storage: admin.firestore.Timestamp.now() },
      },
      { merge: true }
    );
  });
