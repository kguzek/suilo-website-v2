const express = require("express");
const randomstring = require("randomstring");
const { db, HTTP, updateSingleDocument } = require("../util");

const router = express.Router();

/*      ======== SHORT URL FUNCTIONS ========      */

/** Thenable function for generating a random shortened URL. */
function generateRandomURL(length = 7) {
  // generate new URLs until it finds one that hasn't been used yet
  const shortURLs = db.collection("links");

  /** Recursive function for generating the random URL. */
  function generate(resolve, reject) {
    // generate alphanumeric string with given length
    const randStr = randomstring.generate(length);
    console.log(`Generated URL '${randStr}'`);
    // regenerate if the link is taken
    shortURLs
      .doc(randStr)
      .get()
      .then((doc) => {
        // check if the document exists in the database
        if (doc.data()) {
          // recursive call to regenerate URL
          generate(resolve, reject);
        }
        resolve(randStr);
      });
  }
  return { then: generate };
}

/** Attempts to create a short URL with the specified arguments and sends the appropriate HTTP response. */
function createShortenedURL(res, destination, customURL) {
  // initialise the links collection reference
  const shortURLs = db.collection("links");

  // ensure destination starts with '/'
  destination.startsWith("/") || (destination = "/" + destination);

  // initialise query to check if there is already a short url for the given destination
  const existingDestinationQuery = shortURLs
    .where("destination", "==", destination)
    .limit(1);

  function createDocument(id) {
    shortURLs.doc(id).set({
      destination,
      views: 0,
    });
    return res.status(200).json({
      msg: `Success! Created shortened URL with destination '${destination}'.`,
      url: id,
    });
  }

  // determine if the URL should be generated, and if so, generate it
  existingDestinationQuery.get().then((querySnapshot) => {
    // if the destination already has a link, return it. If not, generate a new one.

    if (!querySnapshot.empty) {
      // already exists; return the existing short URL
      return res.status(400).json({
        errorDescription:
          HTTP400 + `There is already a URL for destination '${destination}'.`,
        url: "/" + querySnapshot.docs[0].id,
      });
    }

    if (!customURL) {
      // generate random URL if there is none provided
      return generateRandomURL().then(createDocument, (err) => {
        return res.status(500).json({ errorDescription: HTTP500 + err });
      });
    }

    shortURLs
      .doc(customURL)
      .get()
      .then((doc) => {
        if (doc.data()) {
          return res.status(400).json({
            errorDescription: HTTP400 + "That custom URL is taken.",
          });
        }
        return createDocument(customURL);
      });
  });
}

/*      ======== LINK SHORTENER-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE random shortened URL
  .post("/*", (req, res) => {
    // /api/links/?destination=null -> random short URL with given destination
    // /api/links/[custom_url]/?destination=null -> custom short URL with given destination
    const customURL = req.params[0]; // can be an empty string; this means there was none specified
    const destination = req.query.destination;
    if (!destination) {
      return res.status(400).json({
        errorDescription: HTTP.err400 + "No destination URL specified.",
      });
    }
    // sends the response
    createShortenedURL(res, destination, customURL);
  })

  // UPDATE shortened URL
  .put("/:url", (req, res) => {
    // ?destination=null
    let destination = req.query.destination;
    if (!destination) {
      return res.status(400).json({
        errorDescription: HTTP.err400 + "No new destination provided.",
      });
    }
    const url = req.params.url;
    destination.startsWith("/") || (destination = "/" + destination);

    const docRef = db.collection("links").doc(url);
    updateSingleDocument(docRef, res, { destination }, ["destination"]);
  });

module.exports = router;
