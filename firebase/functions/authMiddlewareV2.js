// v2 auth middleware using the Firebase SDK

const { admin, db } = require("./util");

/** Checks if the request contains an authorisation header, and if so, validates the token using Google's API.
 * On success, checks the resulting user's credentials in the permissions database document to ensure the user
 * possesses the permissions necessary to access the API.
 */
async function validateToken(req, res, next, authType) {
  function send403(msg = "You are not authorised to do that.", info = {}) {
    res
      .status(403)
      .json({ errorDescription: "403 Forbidden: " + msg, ...info });
    console.log(
      `Rejected ${req.method} request to endpoint '${req.originalUrl}'.`,
      info
    );
  }

  function validateUserPermissions(userRecord) {
    console.log(`Validating ${userRecord.displayName}...`);
    const userIdentities = userRecord.providerData;
    if (userIdentities.length === 0) {
      return send403("Invalid Google account.");
    }
    const userInfo = userIdentities[0];
    const docRef = db.collection("users").doc(userInfo.uid);

    docRef.get().then((doc) => {
      const data = doc.data();
      let isAdmin = false;
      let isEditor = false;
      if (data) {
        isAdmin = data.admin;
        isEditor = data.editor;
        if (authType === "edit" && !(isAdmin || isEditor)) {
          return send403();
        } else if (authType === "admin" && !isAdmin) {
          return send403();
        }
      } else {
        // user is not yet in the database; add default entry
        docRef.set({
          name: userInfo.email,
          editor: false,
          admin: false,
          event_ids: [],
        });
        if (authType !== "any") {
          return send403();
        }
      }
      // accept the request
      console.log(
        `Validated ${req.method} request to endpoint '${req.originalUrl}'.`
      );
      req.userInfo = {
        ...userInfo,
        isAdmin,
        isEditor,
      };
      next();
    });
  }

  // check if an authorisation token was provided
  const authHeader = req.headers.authorization;
  let idToken;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Read the token from the auth header
    const headerInfo = authHeader.split(" ");
    if (headerInfo.length === 2) {
      idToken = headerInfo[1];
    }
  } else if (req.cookies) {
    // Read the token from cookie.
    idToken = req.cookies.__session;
  }
  // if the token is provided but the user is not logged in, the
  // fetch method interpolates the token as literal "undefined".
  if (!idToken || idToken === "undefined") {
    if (authType === "any") {
      // allow users that are not signed in to make these requests
      console.log(
        `Validating anonymous ${req.method} request to public endpoint '${req.originalUrl}'.`
      );
      return next();
    }
    return send403("No authorisation token provided.");
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      if (
        !decodedToken.email ||
        !decodedToken.email.endsWith("lo1.gliwice.pl")
      ) {
        return send403(
          "That email address is from outside the LO1 organisation."
        );
      }
      const uid = decodedToken.uid;
      // get the user record from the User ID
      admin.auth().getUser(uid).then(validateUserPermissions);
    })
    .catch((error) => {
      return send403("Encountered an error while validating the API token.", {
        errorDetails: error.toString(),
      });
    });
}

async function determineAuthType(req, res, next) {
  // authType shoud be one of:
  // * any -- anyone with an account can access
  // * edit -- only editors and admins
  // * admin -- only admins

  let authType = "admin";
  if (req.method === "GET" || req.method === "PATCH") {
    authType = "any";
  } else if (req.method === "PUT") {
    authType = "edit";
  }

  validateToken(req, res, next, authType);
}

module.exports = determineAuthType;
