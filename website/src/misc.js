import { getDownloadURL, ref } from "firebase/storage";
import { fetchWithToken, storage } from "./firebase";

export const MAX_CACHE_AGE = 24; // hours

// Temporary image URL if an article has none specified
export const DEFAULT_IMAGE = "https://i.imgur.com/Rwygn8m.jpg";

/**
 * (1, 'wyświetle', 'nie', 'nia', 'ń') -> '1 wyświetlenie'
 *
 * (2, 'wyświetle', 'nie', 'nia', 'ń') -> '2 wyświetlenia'
 *
 * (21, 'wyświetle', 'nie', 'nia', 'ń') -> '21 wyświetleń'
 */
export function conjugatePolish(
  value = 0,
  base,
  suffixSingular,
  suffixPluralA,
  suffixPluralB
) {
  if (value === 1) {
    return `1 ${base}${suffixSingular}`;
  }
  const lastLetter = value.toString()[value.toString().length - 1];
  const lastDigit = parseInt(lastLetter);
  if (
    [2, 3, 4].includes(lastDigit) &&
    ![12, 13, 14].includes(Math.abs(value))
  ) {
    return `${value} ${base}${suffixPluralA}`;
  }
  return `${value} ${base}${suffixPluralB}`;
}

/** Format a timestamp string with format: `01 sty 2022`. */
export function formatDate(
  date,
  includeTime = false,
  options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
) {
  if (includeTime) {
    options = {
      ...options,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
  }
  const dateObj = date ? new Date(date) : new Date();
  return dateObj.toLocaleDateString("pl-PL", options);
}

/** Format a time array as a human-readable string. */
export function formatTime([hour, minute]) {
  let date = new Date().setHours(hour);
  date = new Date(date).setMinutes(minute);
  const formattedDate = formatDate(date, false, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return formattedDate.split(", ")[1];
}

/** Removes the given parameter from the search params object. Returns the key's value prior to deletion.
 *  If the search parameter did not exist in the search query, does nothing and returns `undefined`.
*/
export function removeSearchParam(
  searchParams,
  setSearchParams,
  paramToRemove
) {
  const value = searchParams.get(paramToRemove);
  if (!value) {
    // skip removing the search param if it's not present in the first place
    return undefined;
  }
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.delete(paramToRemove);
  setSearchParams(newSearchParams);
  return value;
}

/** Attempts to retrieved data from the local storage if it exists, otherwise fetches it from the API. */
export function fetchCachedData(
  cacheName,
  fetchURL,
  {
    setData,
    setLoaded,
    updateCache,
    cacheArgument,
    onSuccessCallback,
    onFailData,
  }
) {
  // check if there is a valid data cache
  const cache = JSON.parse(localStorage.getItem(cacheName));
  if (cache) {
    if (!updateCache) {
      // check if the cache contains no error
      if (cache.data && !cache.data.errorDescription) {
        console.log(`Found existing cache for '${cacheName}'.`, cache);
        // check if the cache is younger than 2 hours old
        const cacheDate = Date.parse(cache.date);
        const dateDifferenceSeconds = (new Date() - cacheDate) / 1000;
        const dateDifferenceHours = dateDifferenceSeconds / 3600;
        if (dateDifferenceHours < MAX_CACHE_AGE) {
          // compare arguments for cache, such as maxItems for news fetches.
          // this ensures that if the current request is for e.g. 8 news articles and we find
          // a cache containing only 4, that we do not use the old cache and instead make a new request.
          if (
            (cache.arg === undefined && cacheArgument === undefined) ||
            cache.arg >= cacheArgument
          ) {
            setData(cache.data);
            return setLoaded(true);
          }
          console.log(
            `The found cache had a different argument (${cache.arg} vs ${cacheArgument}).`
          );
        } else {
          console.log(
            `The found cache is too old (${dateDifferenceHours} hours).`
          );
        }
      }
    }
    // remove the existing cache
    localStorage.removeItem(cacheName);
  }

  // fetch new data
  fetchWithToken(fetchURL).then(
    (res) => {
      res.json().then((data) => {
        const newCache = {
          date: new Date(),
          arg: cacheArgument,
          data: onSuccessCallback(data),
        };
        if (newCache.data) {
          localStorage.setItem(cacheName, JSON.stringify(newCache));
          console.log(`Created cache '${cacheName}'.`, newCache);
          setData(newCache.data);
        } else {
          // onSuccessCallback didn't return data; this usually means the data could not be processed
          // (API returned a non-200 response code or the data was otherwise malformed)
          console.log(
            `Request to '${fetchURL}' returned an invalid response:`,
            res.status,
            res.statusText,
            data
          );
        }
        setLoaded(true);
      });
    },
    (error) => {
      console.log(`Error retrieving: '/api${fetchURL}'`, error);
      onFailData && setData(onFailData);
      setLoaded(true);
    }
  );
}

/** Valid sizes:
 *  - 1920x1080
 *  - 800x600
 *  - 600x400
 *  - 400x300
 *  - 200x2000
 *  - 100x100 */
export function getURLfromFileName(name, size, callback) {
  if (name.startsWith("http://") || name.startsWith("https://")) {
    callback(name);
  } else {
    const imageRef = ref(storage, `/photos/${name}_${size}.jpeg`);
    getDownloadURL(imageRef).then(callback);
  }
}
