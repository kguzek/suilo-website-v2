const functions = require("firebase-functions");

const admin = require('firebase-admin');

// Private service account key 
//Used the same one as in the api, not sure wether I should have createrd a new one
const serviceAccount = require("./permissions.json");

// Authorise Firebase
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) },"storageTracker");

const { FieldValue } = require("@google-cloud/firestore");
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
exports.trackStorage = functions.region('europe-west1').storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    if(filePath.startsWith("photos/")){
        //an EXTEMLY bad way to get the real file name (would break if there is a . or a / in filename) and if the file name resembles the format blablabla_1920x1080 but it is good enought for now(hopefully)
        const fileName = filePath.split('/')[filePath.split('/').length-1].split('.')[0];
        const size = fileName.split('_')[fileName.split('_').length-1];
        if(size.split('x').length !==2){
            const addFileName = await admin.firestore().collection('_general').doc('storage').update({
                photos: FieldValue.arrayUnion(fileName)
            });
        }
    }
   
  });