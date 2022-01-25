import React from "react";
import PostCardPrimary from "../components/PostCardPrimary";
import PostCardSecondary from "../components/PostCardSecondary";
import PostCardMain from "../components/PostCardMain";

// Change API URL in production
const API_URL = "http://localhost:5001/suilo-page/europe-west1/app/api/news/";
// Temporary image URL if an article has none specified
const DEFAULT_IMAGE = "https://i.stack.imgur.com/6M513.png";

// Set number of items on page to 3 primary, 4 secondary and 8 main.
// Can introduce useState variable for user customisability or leave it hard-coded.
const ITEMS_PER_PAGE = 3 + 4 + 8;

const MAX_CACHE_AGE = 2; // hours

/** Compare two objects that contain a 'date' attribute. */
function sortArticles(article1, article2) {
  return new Date(article2.date) - new Date(article1.date);
}

/** Fetch the data for the news article previews. */
export function fetchData(
  pageNumber,
  setMain,
  setPrimary,
  setSecondary,
  setLoaded
) {
  /** Populate the data containers with the API request response's JSON data. */
  function processJsonData(data) {
    if (!data) {
      console.log("Could not retrieve data");
      return setLoaded(true);
    }
    const _data = {
      main: [],
      primary: [],
      secondary: [],
    };
    for (let article of data.contents.sort(sortArticles)) {
      if (!article.photo) {
        article.photo = DEFAULT_IMAGE;
      }
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
    setPrimary(_data.secondary);
    setLoaded(true);
  }

  // check if there is a valid news data cache
  const cache = JSON.parse(localStorage.getItem(`page_${pageNumber}`));
  if (cache) {
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
    // the cache is too old
    localStorage.removeItem(`page_${pageNumber}`);
  }

  // Set URL parameters
  const url = `${API_URL}?page=${pageNumber}&items=${ITEMS_PER_PAGE}`;
  fetch(url).then((res) => {
    res.json().then(processJsonData);
  });
}

export function PostCardPreview({ type, data }) {
  if (data === undefined) {
    return null;
  }
  const elem =
    type === "primary"
      ? PostCardPrimary
      : type === "secondary"
      ? PostCardSecondary
      : PostCardMain;
  return data.map((el, idx) =>
    React.createElement(elem, { key: el.id + idx, data: el })
  );
}

export default PostCardPreview;
