// v2 auth middleware using the Firebase SDK

const { admin, db, updateCollection } = require("./util");

/** Checks if the request contains an authorisation header, and if so, validates the token using Google's API.
 * On success, checks the resulting user's credentials in the permissions database document to ensure the user
 * possesses the permissions necessary to access the API.
 */
async function validateToken(req, res, next, requiredPerm) {
  function send403(msg = "You are not authorised to do that.", info, userName) {
    res
      .status(403)
      .json({ errorDescription: "403 Forbidden: " + msg, ...(info ?? {}) });
    console.warn(
      `Rejected ${userName ?? "unknown user"}'s ${
        req.method
      } request to endpoint '${req.path}' (${requiredPerm}).`,
      info ?? ""
    );
  }

  /** If the permission level is set to public, calls the next middleware function (allows the request) and returns true.
   * Otherwise, returns false.
   * Argument `requestType` specifies the request description to be sent to the log. Defaults to "anonymous".
   */
  function allowPublicEndpoints(requestType = "anonymous") {
    if (requiredPerm) {
      return false;
    }
    // allow users that are not signed in to make these requests
    console.info(
      `Validated ${requestType} ${req.method} request to public endpoint '${req.path}'.`
    );
    next();
    return true;
  }

  /** Checks the database record for the given user's credentials and allows the request if they have the appropriate permissions
   * to access the requested resource. If the entry is not present, creates a default one with access only to public endpoints.
   */
  function validateUserPermissions(userRecord) {
    const userIdentities = userRecord.providerData;
    if (userIdentities.length === 0) {
      return send403("Invalid Google account.", userRecord.displayName);
    }
    const userInfo = userIdentities[0];
    const docRefUser = db.collection("users").doc(userInfo.uid);
    docRefUser.get().then((doc) => {
      const userData = doc.data();
      const isAdmin = userData?.isAdmin ?? false;
      const canEdit = userData?.canEdit ?? [];
      const bookIDs = userData?.bookIDs ?? [];
      if (userData) {
        const canEditThisBook =
          requiredPerm === "books" &&
          req.method === "DELETE" &&
          bookIDs.includes(req.path.split("/")[2]);
        if (
          requiredPerm &&
          !(isAdmin || canEdit.includes(requiredPerm) || canEditThisBook)
        ) {
          return send403(
            undefined,
            {
              msg: "Missing permission for this endpoint.",
            },
            userRecord.displayName
          );
        }
      } else {
        // user is not yet in the database; add default entry
        docRefUser.set({
          ...userInfo,
          isAdmin,
          canEdit,
          bookIDs,
        });
        updateCollection("users", 1);
        if (requiredPerm) {
          return send403(
            undefined,
            {
              msg: "User not found in permissions database.",
            },
            userRecord.displayName
          );
        }
      }
      // accept the request
      console.info(
        `Validated ${userRecord.displayName}'s ${req.method} request to endpoint '${req.path}'.`
      );
      req.userInfo = {
        ...userInfo,
        isAdmin,
        canEdit,
        books: bookIDs,
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
    return (
      allowPublicEndpoints() || send403("No authorisation token provided.")
    );
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
      return (
        allowPublicEndpoints("malformed (invalid token)") ||
        send403("Encountered an error while validating the API token.", error)
      );
    });
}

async function determineAuthType(req, res, next) {
  const publicHTTPMethods = ["GET", "HEAD", "PATCH"];

  if (publicHTTPMethods.includes(req.method)) {
    validateToken(req, res, next);
  } else {
    // determine the path the request is attempting to access

    // request path without the leading forward slash ("/")
    const trimmedPath = req.path.substring(1, req.path.length);
    // get the first path element before the next "/"
    const subPath = trimmedPath.split("/").shift();
    validateToken(req, res, next, subPath);
  }
}

module.exports = determineAuthType;
