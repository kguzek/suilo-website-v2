const express = require("express");
const {} = require("../util");

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(418).json({ errorDescription: "This endpoint is work-in-progress."});
});

module.exports = router;
