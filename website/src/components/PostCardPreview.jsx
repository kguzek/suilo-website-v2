import React from "react";
import PostCardPrimary from "../components/PostCardPrimary";
import PostCardSecondary from "../components/PostCardSecondary";
import PostCardMain from "../components/PostCardMain";
import { API_URL, DEFAULT_IMAGE } from "../misc";

// Set number of items on page to 3 primary, 4 secondary and 8 main.
// Can introduce useState variable for user customisability or leave it hard-coded.
const ITEMS_PER_PAGE = 3 + 4 + 8;

const MAX_CACHE_AGE = 2; // hours
const NO_NEWS_MESSAGE = "Brak aktualności.";

/** Compare two objects that contain a 'date' attribute. */
function sortArticles(article1, article2) {
  return new Date(article2.date) - new Date(article1.date);
}

/** Fetch the data for the news article previews. */
export function fetchNewsData(
  setMain,
  setPrimary,
  setSecondary,
  setLoaded = () => {},
  pageNumber = 1,
  updateCache = false
) {
  /** Populate the data containers with the API request response's JSON data. */
  function processJsonData(data) {
    if (!data || !data.contents) {
      console.log("Could not retrieve data");
      return setLoaded(true);
    }
    const _data = {
      main: [],
      primary: [],
      secondary: [],
    };
    for (let article of data.contents.sort(sortArticles)) {
      article.photo = article.photo || DEFAULT_IMAGE;
      if (_data.primary.length < 3) {
        _data.primary.push(article);
        continue;
      }
      if (_data.secondary.length < 4) {
        _data.secondary.push(article);
        continue;
      }
      _data.main.push(article);
    }
    const newCache = {
      date: new Date(),
      dataMain: _data.main,
      dataPrimary: _data.primary,
      dataSecondary: _data.secondary,
    };
    localStorage.setItem(`page_${pageNumber}`, JSON.stringify(newCache));
    console.log("Created cache for news data.", newCache);
    setMain(_data.main);
    setPrimary(_data.primary);
    setSecondary(_data.secondary);
    setLoaded(true);
  }
  // check if there is a valid news data cache
  const cache = JSON.parse(localStorage.getItem(`page_${pageNumber}`));
  if (cache) {
    if (!updateCache) {
      // check if the cache is younger than 24 hours old
      const cacheDate = Date.parse(cache.date);
      const dateDifferenceSeconds = (new Date() - cacheDate) / 1000;
      if (dateDifferenceSeconds / 3600 < MAX_CACHE_AGE) {
        console.log("Found existing cache for news data.", cache);
        setMain(cache.dataMain);
        setPrimary(cache.dataPrimary);
        setSecondary(cache.dataSecondary);
        return setLoaded(true);
      }
    }
    // remove the existing cache
    localStorage.removeItem(`page_${pageNumber}`);
  }

  // Set URL parameters
  const url = `${API_URL}/news/?page=${pageNumber}&items=${ITEMS_PER_PAGE}`;
  fetch(url).then((res) => {
    res.json().then(processJsonData);
  });
}

export function PostCardPreview({
  type,
  data = [],
  linkPrefix = "",
  classOverride,
}) {
  if (data === undefined) {
    return null;
  }
  const elem =
    type === "primary"
      ? PostCardPrimary
      : type === "secondary"
      ? PostCardSecondary
      : PostCardMain;
  if (data.length === 0) {
    if (classOverride && classOverride.startsWith("home")) {
      return (
        <div style={{ width: "100%" }}>
          <p>{NO_NEWS_MESSAGE}</p>
        </div>
      );
    }
    if (type === "primary") {
      return NO_NEWS_MESSAGE;
    }
    return null;
  }
  const className = classOverride || `grid-${type}`;
  return (
    <div className={className}>
      {data.map((el, idx) => {
        el.link = linkPrefix + el.id;
        return React.createElement(elem, { key: el.id + idx, data: el });
      })}
    </div>
  );
}

export default PostCardPreview;
