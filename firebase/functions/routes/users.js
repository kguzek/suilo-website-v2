const express = require("express");
const {
  admin,
  HTTP,
  createSingleDocument,
  getDocRef,
  sendSingleResponse,
  actuallyUpdateSingleDocument,
} = require("../util");
const router = express.Router();

const DEFAULT_DATA = { isAdmin: false, canEdit: [] };

router
  // CREATE new user entry
  .post("/", (req, res) => {
    const email = req.body.email;

    admin
      .auth()
      .getUserByEmail(email)
      .then((userRecord) => {
        const userIdentities = userRecord.providerData;
        if (userIdentities.length === 0) {
          return void res
            .status(400)
            .json({ errorDescription: "Invalid Google account." });
        }
        const userInfo = userIdentities[0];
        // check if the user entry already exists
        getDocRef({ params: { id: userInfo.uid } }, res, "users").then(
          (docRef) =>
            docRef.get().then((doc) => {
              const data = doc.data();
              if (!data) {
                // user entry does not exist
                const data = { ...DEFAULT_DATA, ...req.body, ...userInfo };
                return void createSingleDocument(data, res, "users", userInfo.uid);
              }
              // user entry exists
              res.status(400).json({
                errorDescription: `${HTTP.err400}User '${email}' is already in the database.`,
                ...data,
              });
            }, false)
        );
      })
      .catch((error) => {
        console.log(error);
        return void res.status(400).json({
          errorDescription: `${HTTP.err400}No user with email '${email}'.`,
          errorDetails: error.toString(),
        });
      });
  })

  // READ single user entry
  .get("/:id", (req, res) =>
    getDocRef(req, res, "users").then((docRef) =>
      sendSingleResponse(docRef, res, undefined, false)
    )
  )

  // UPDATE single user entry
  .put("/:id", (req, res) =>
    actuallyUpdateSingleDocument(req, res, "users", req.body)
  );

module.exports = router;
