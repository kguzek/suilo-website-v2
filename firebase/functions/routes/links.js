const express = require("express");
const randomstring = require("randomstring");
const { db, HTTP, updateSingleDocument } = require("../util");

const router = express.Router();

const linkAttributeSanitisers = {
  destination: (dest) =>
    dest ? (dest.startsWith("/") ? dest : "/" + dest) : null,
  shortLink: (link) =>
    link && link.startsWith("/") ? link.substring(1, link.length) : link,
};

/*      ======== SHORT URL FUNCTIONS ========      */

/** Recursive function for generating a random shortened URL. */
function generateRandomURL(callback, length = 7) {
  // generate new URLs until it finds one that hasn't been used yet

  // generate alphanumeric string with given length
  const randStr = randomstring.generate(length);
  console.log(`Generated URL '${randStr}'`);
  // regenerate if the link is taken
  resolveShortLink(randStr, (data) => {
    // check if the document exists in the database
    if (data) {
      // recursive call to regenerate URL
      generateRandomURL(callback, length);
    } else {
      callback(randStr);
    }
  });
}

/** Queries the database for a document with the shortLink field set to `url`.
 *  Calls the callback with the subsequent document data or `undefined`.
 */
function resolveShortLink(url, callback) {
  /** Calls the callback with an object containing the document data and ID. */
  function sendDoc(doc) {
    const data = doc?.data();
    if (data) {
      callback({ id: doc?.id, ...data });
    } else {
      callback();
    }
  }

  db.collection("links")
    .where("shortLink", "==", url)
    .limit(1)
    .get()
    .then((querySnapshot) => sendDoc(querySnapshot.docs?.shift()));
}

/** Attempts to create a short URL with the specified arguments and sends the appropriate HTTP response. */
function createShortLink(res, destination, customURL) {
  // initialise the links collection reference
  const shortURLs = db.collection("links");

  function createDocument(url) {
    shortURLs.doc().set({
      shortLink: url,
      destination,
      views: 0,
    });
    return res.status(200).json({
      msg: `Success! Created shortened URL with destination '${destination}'.`,
      url,
    });
  }

  // determine if the URL should be generated, and if so, generate it
  shortURLs
    .where("destination", "==", destination)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      // if the destination already has a link, return it. If not, generate a new one.

      if (!querySnapshot.empty) {
        // a document with the specified destination already exists; return its short URL
        const data = querySnapshot.docs.shift()?.data();
        return res.status(400).json({
          errorDescription:
            HTTP.err400 +
            `There is already a URL for destination '${destination}'.`,
          shortLink: "/" + data?.shortLink,
        });
      }

      if (!customURL) {
        // generate a random URL if there is none provided
        return void generateRandomURL(createDocument);
      }

      // check if the custom short URL is taken; if not, create the document
      resolveShortLink(customURL, (data) => {
        if (!data) return void createDocument(customURL);
        return res.status(400).json({
          errorDescription: HTTP.err400 + "That custom URL is taken.",
          ...data,
        });
      });
    });
}

/*      ======== LINK SHORTENER-SPECIFIC CRUD FUNCTIONS ========      */

router
  // CREATE random shortened URL
  .post("/", (req, res) => {
    // ?destination=null&shortLink=null
    const data = {};
    for (const attrib in linkAttributeSanitisers) {
      const sanitiser = linkAttributeSanitisers[attrib];
      data[attrib] = sanitiser(req.query[attrib]);
    }

    if (!data.destination) {
      return res.status(400).json({
        errorDescription: HTTP.err400 + "No destination URL specified.",
      });
    }
    // sends the response
    createShortLink(res, data.destination, data.shortLink);
  })

  // GET shortened URL
  .get("/:link", (req, res) =>
    resolveShortLink(req.params.link, (data) => {
      if (data) {
        return void res.status(200).json(data);
      }
      return void res
        .status(400)
        .json({ errorDescription: HTTP.err400 + "No such short link." });
    })
  )

  // UPDATE shortened URL
  .put("/:id", (req, res) =>
    updateSingleDocument(req, res, "links", linkAttributeSanitisers)
  );

module.exports = router;
