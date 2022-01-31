// This code will execute before the server receives the request

// general imports
const admin = require("firebase-admin");
const { OAuth2Client } = require("google-auth-library");

const db = admin.firestore();

const client = new OAuth2Client();

function validateToken(authType) {
  // authType shoud be one of:
  // * any -- anyone with an account can access
  // * edit -- only editors and admins
  // * admin -- only admins

  function validatePerms(data, next) {
    if (!data) {
      // user is not yet in the database; add default entry
      db.collection.doc(userid).set({
        name: payload.email,
        editor: false,
        admin: false,
        event_ids: [],
      });
      if (authType !== "any") {
        return send403();
      }
    } else if (authType === "edit" && !(data.admin || data.editor)) {
      return send403();
    } else if (authType === "admin" && !data.admin) {
      return send403();
    }
    // user is authorised to perform the action; send back user info
    req.email = payload.email;
    req.id = userid;
    // accept the request
    next();
  }

  async function authorise(req, res, next) {
    console.log(`Validating the request for permission level '${authType}'...`);

    function send403(msg = "You are not authorised to do that.", err) {
      const jsonResponse = { errorDescription: "403 Forbidden: " + msg };
      res.status(403);
      if (err) {
        res.json({ ...jsonResponse, error: err.toString() });
      } else {
        res.json(jsonResponse);
      }
    }

    // check if an authorisation token was provided
    const authHeader = req.headers.authorization;
    if (
      (!authHeader || !authHeader.startsWith("Bearer ")) &&
      !(req.cookies && req.cookies.__session)
    ) {
      return send403("No authorisation token provided.");
    }
    let idToken;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Read the token from the auth header
      idToken = authHeader.split(" ")[1];
    } else if (req.cookies) {
      // Read the token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie or authorisation token
      return send403("Unable to read the authorisation token.");
    }
    // verify the provided token
    let ticket;
    try {
      ticket = await client.verifyIdToken({ idToken });
    } catch (error) {
      return send403(
        "Encountered an error while validating the API token.",
        error
      );
    }
    // get user data
    const payload = ticket.getPayload();
    // get user id
    const userid = payload["sub"];
    // allow only school emails
    if (payload.hd !== "lo1.gliwice.pl") {
      return send403(
        "This email address is from outside the LO1 organisation."
      );
    }
    db.collection(user)
      .doc(userid)
      .get()
      .then((doc) => validatePerms(doc.data(), next));
  }

  return authorise;
}

module.exports = validateToken;
