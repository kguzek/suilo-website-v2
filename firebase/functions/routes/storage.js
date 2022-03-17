const express = require("express");
const { db } = require("../util");

const router = express.Router();

const DEFAULT_DATA = { photos: [] };

/*      ======== STORAGE-SPECIFIC CRUD FUNCTIONS ========      */

router.get("/", (_req, res) => {
  db.collection("_general")
    .doc("storage")
    .get()
    .then((doc) => {
      let sortedarr = doc.data().photos.sort();
      res.status(200).json({photos:sortedarr} ?? DEFAULT_DATA);
    });
});

module.exports = router;
