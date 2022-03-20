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
  setLoaded = () => {},
  updateCache = false,
  pageNumber = 1,
  maxItems = ITEMS_PER_PAGE,
  allItems = false, // If true, the maxItems and pageNumber options are ignored.
}) {
  // ensure the pageNumber argument is a valid integer; prevent parameter injection
  pageNumber = encodeURIComponent(parseInt(pageNumber));

  const args = {
    setData: setNewsData,
    setLoaded,
    updateCache,
    params: { all: true },
  };
  let cacheName = "news_all";
  if (!allItems) {
    cacheName = `news_page_${pageNumber}`;
    args.params = { page: pageNumber, items: maxItems };
    args.cacheArgument = maxItems;
  }
  fetchCachedData(cacheName, "/news/", args);
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
    console.warn("News data is undefined. Not rendering preview.");
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
  startIndex ?? (startIndex = defaultItems[type].startIndex);
  numItems ?? (numItems = defaultItems[type].numItems);

  // const className = classOverride ?? `${type}-grid`;

  // Create a carbon copy of the contents array so that the original is not mutated
  const contents = [...(data?.contents ?? [])].splice(startIndex, numItems);

  if (contents.length === 0) {
    if (classOverride?.startsWith("home")) {
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
      {contents.map((el, idx) => {
        el.internalLink = linkPrefix + el.id;
        return React.createElement(elem, { key: el.id + idx, data: el });
      })}
    </>
  );
}

export default PostCardPreview;
