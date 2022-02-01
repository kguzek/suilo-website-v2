export const MAX_CACHE_AGE = 2; // hours

export const API_URL = // "http://localhost:5001/suilo-page/europe-west1/app/api"; // Temporary emulator API URL assignment
  "https://europe-west1-suilo-page.cloudfunctions.net/app/api";

// Temporary image URL if an article has none specified
export const DEFAULT_IMAGE = "https://i.stack.imgur.com/6M513.png";

/**
 * (1, 'wyświetle', 'ni', 'ń') -> '1 wyświetlenie'
 *
 * (2, 'wyświetle', 'ni', 'ń') -> '2 wyświetlenia'
 *
 * (21, 'wyświetle', 'ni', 'ń') -> '21 wyświetleń'
 */
export function conjugatePolish(value, base, suffix1, suffix2) {
  if (value === 1) {
    return `1 ${base}${suffix1}e`;
  }
  const lastLetter = value.toString()[value.toString().length - 1];
  const lastDigit = parseInt(lastLetter);
  if (
    [2, 3, 4].includes(lastDigit) &&
    ![12, 13, 14].includes(Math.abs(value))
  ) {
    return `${value} ${base}${suffix1}a`;
  }
  return `${value} ${base}${suffix2}`;
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

/** Removes the given parameter from the search params object. Returns the key's value prior to deletion. */
export function removeSearchParam(
  searchParams,
  setSearchParamsFunc,
  paramToRemove
) {
  const value = searchParams.get(paramToRemove);
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.delete(paramToRemove);
  setSearchParamsFunc(newSearchParams);
  return value;
}

export function fetchCachedData(
  cacheName,
  fetchURL,
  { setData, setLoaded, updateCache, onSuccessCallback, onFailData },
  fetchFromAPI
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
          setData(cache.data);
          return setLoaded(true);
        }
        console.log(
          `The found cache is too old (${dateDifferenceHours} hours).`
        );
      }
    }
    // remove the existing cache
    localStorage.removeItem(cacheName);
  }

  // fetch new data
  fetchFromAPI(fetchURL)
    .then((res) => {
      res.json().then((data) => {
        const newCache = { date: new Date(), data: onSuccessCallback(data) };
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
    })
    .catch((error) => {
      console.log(`Error retrieving: '${fetchURL}'`, error);
      onFailData && setData(onFailData);
      setLoaded(true);
    });
}
