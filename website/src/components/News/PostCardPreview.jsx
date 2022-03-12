import React from "react";
import PostCardPrimary from "./PostCardPrimary";
import PostCardSecondary from "./PostCardSecondary";
import PostCardMain from "./PostCardMain";
import { fetchCachedData, DEFAULT_IMAGE } from "../../misc";

// Set number of items on page to 3 primary, 4 secondary and 8 main.
// Can introduce useState variable for user customisability or leave it hard-coded.
export const PRIMARY_ITEMS_DEFAULT = 3;
export const SECONDARY_ITEMS_DEFAULT = 4;
export const MAIN_ITEMS_DEFAULT = 8;
const ITEMS_PER_PAGE =
  PRIMARY_ITEMS_DEFAULT + SECONDARY_ITEMS_DEFAULT + MAIN_ITEMS_DEFAULT;

const NO_NEWS_MESSAGE = "Brak aktualności.";

/** Fetch the data for the news article previews. */
export function fetchNewsData({
  setNewsData,
  setLoaded = () => { },
  updateCache = false,
  pageNumber = 1,
  maxItems = ITEMS_PER_PAGE,
  allItems = false,  // If true, the maxItems and pageNumber options are ignored.
}) {
  /** Verifies that the API response is valid and returns the processed data. */
  function processJsonData(data) {
    if (data && data.contents) {
      // map each article so that if it doesn't contain a 'photo' attribute it uses the default image
      return data.contents.map((article) => {
        return { ...article, photo: article.photo || DEFAULT_IMAGE };
      });
    }
  }

  // ensure the pageNumber argument is a valid integer; prevent parameter injection
  pageNumber = encodeURIComponent(parseInt(pageNumber));

  const args = {
    setData: setNewsData,
    setLoaded,
    updateCache,
    onSuccessCallback: processJsonData,
  };
  if (allItems) {
    var url = "/news/?all=true";
    var cacheName = "news_all";
  } else {
    var url = `/news/?page=${pageNumber}&items=${maxItems}`;
    var cacheName = `news_page_${pageNumber}`;
    args.cacheArgument = maxItems;
  }
  fetchCachedData(cacheName, url, args);
}

export function PostCardPreview({
  type,
  data,
  linkPrefix = "",
  classOverride,
  startIndex,
  numItems,
}) {
  if (data === undefined) {
    console.log("News data is undefined. Not rendering preview.");
    return null;
  }
  const defaultItems = {
    primary: {
      element: PostCardPrimary,
      startIndex: 0,
      numItems: PRIMARY_ITEMS_DEFAULT,
    },
    secondary: {
      element: PostCardSecondary,
      startIndex: PRIMARY_ITEMS_DEFAULT,
      numItems: SECONDARY_ITEMS_DEFAULT,
    },
    main: {
      element: PostCardMain,
      startIndex: PRIMARY_ITEMS_DEFAULT + SECONDARY_ITEMS_DEFAULT,
      numItems: MAIN_ITEMS_DEFAULT,
    },
  };
  const elem = defaultItems[type].element;
  startIndex === undefined && (startIndex = defaultItems[type].startIndex);
  numItems === undefined && (numItems = defaultItems[type].numItems);

  const className = classOverride ?? `${type}-grid`;
  const _data = [...data].splice(startIndex, numItems);
  if (_data.length === 0) {
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
  return (
    <>
      {_data.map((el, idx) => {
        el.link = linkPrefix + el.id;
        return React.createElement(elem, { key: el.id + idx, data: el });
      })}
    </>
  );
}

export default PostCardPreview;
