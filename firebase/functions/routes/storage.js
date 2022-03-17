const express = require("express");
const { db } = require("../util");

const router = express.Router();

/*      ======== STORAGE-SPECIFIC CRUD FUNCTIONS ========      */

router.get("/", (_req, res) => {
  db.collection("_general")
    .doc("storage")
    .get()
    .then((doc) => {
      // Sort the photos alphabetically by name
      const sorted = doc.data()?.photos?.sort() ?? [];
      res.status(200).json({ photos: sorted });
    });
});

module.exports = router;
