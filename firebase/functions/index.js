// General imports
const express = require("express");
const cors = require("cors");

// Firebase imports
const functions = require("firebase-functions");

// Local imports
const { db, HTTP, sendListResponse, deleteSingleDocument } = require("./util");
const storageTracker = require("./storageTracker");

// initialise express
const app = express();

// define server region name for Firebase app
const REGION = functions.region("europe-west1");

// define the routes that the API is able to serve
const ROUTES = [
  "news",
  "links",
  "users",
  "events",
  "storage",
  "calendar",
  "luckyNumbers",
  "collectionInfo",
];

app.use(cors());
app.use("/api/", require("./authMiddlewareV2"));

// define sort options for sending list responses
const sortOptions = {
  events: ["date", "asc"],
  links: ["destination", "asc"],
  news: ["date", "desc"],
  users: ["displayName", "asc"],
};

// define routes that have similar structures to avoid repeating the code in the separate route files
for (const endpoint of ["calendar", "events", "links", "news", "users"]) {
  // READ all events/links/news
  if (endpoint !== "calendar") {
    app.get(`/api/${endpoint}/`, (req, res) => {
      // ?page=1&items=25&all=false
      const docListQuery = db
        .collection(endpoint)
        .orderBy(...sortOptions[endpoint]);
      sendListResponse(docListQuery, req.query, res);
    });
  }

  // DELETE single calendar event/event/link/news
  app.delete(`/api/${endpoint}/:id`, (req, res) =>
    deleteSingleDocument(req, res, endpoint)
  );
}

// define dummy route for user permissions authentication
app.all("/api/", (req, res) => {
  if (req.userInfo) {
    return res.status(200).json({
      msg: "User authentication passed!",
      userInfo: req.userInfo,
    });
  }
  return res.status(403).json({
    msg: "User authentication failed: no API token. You may still access public endpoints.",
  });
});

for (const route of ROUTES) {
  // set individual API routes
  let routeMiddleware = require("./routes/" + route);
  if (route === "collectionInfo") {
    // Get the middlware by passing the list of routes
    routeMiddleware = routeMiddleware(ROUTES);
  }
  app.use(`/api/${route}/`, routeMiddleware);
  // catch all requests to paths that are listed above but use the incorrect HTTP method
  for (const pathSuffix of ["/", "/:foo"]) {
    app.all("/api/" + route + pathSuffix, (req, res) => {
      console.log(`Received invalid request method: ${req.method} ${req.path}`);
      return res.status(405).json({
        errorDescription: `${HTTP.err405}Cannot ${req.method} '${req.path}'.`,
      });
    });
  }
}

// catch all requests to paths that are not listed above
app.all("*", (req, res) => {
  console.log(`Received invalid request path: ${req.method} ${req.path}`);
  return res.status(404).json({
    errorDescription: `${HTTP.err404}The server could not locate the resource at '${req.path}'.`,
  });
});

// Initialise API cloud function
exports.app = REGION.https.onRequest(app);
// Initialise storage tracker function
exports.storageTracker = REGION.storage.object().onFinalize(storageTracker);
