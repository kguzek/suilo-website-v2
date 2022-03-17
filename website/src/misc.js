import {
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { fetchWithToken, storage } from "./firebase";

export const MAX_CACHE_AGE = 24; // hours

// Temporary image URL if an article has none specified
export const DEFAULT_IMAGE = "https://i.imgur.com/Rwygn8m.jpg";

export const WEBSITE_DOMAIN = "suilo.pl";

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


/* Copy content to clipboard */
export const copyToClipboard = (text, sendFeedBack = () => null) => {
  text = text.trim()
  navigator.clipboard.writeText(text)
  sendFeedBack(true);
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

/** Sets the provided search parameter in the URL query. */
export function setSearchParam(
  searchParams,
  setSearchParams,
  paramToModify,
  newValue
) {
  const newSearchParams = new URLSearchParams(searchParams);
  if (newSearchParams.get(paramToModify)) {
    newSearchParams.set(paramToModify, newValue);
  } else {
    newSearchParams.append(paramToModify, newValue);
  }
  setSearchParams(newSearchParams);
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
  { setData, setLoaded, updateCache, cacheArgument }
) {
  // check if there is a valid data cache
  let cache;
  try {
    cache = JSON.parse(localStorage.getItem(cacheName));
  } catch (parseError) {
    // Data is not serialised JSON
  }
  verifyCache: {
    if (!cache || updateCache) break verifyCache;
    // check if the cache contains no error
    if (!cache.data || cache.data.errorDescription) {
      break verifyCache;
    }
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
      console.log(`The found cache is too old (${dateDifferenceHours} hours).`);
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
          data: data && !data.errorDescription ? data : null,
        };
        if (newCache.data) {
          localStorage.setItem(cacheName, JSON.stringify(newCache));
          console.log(`Created cache '${cacheName}'.`, newCache);
          setData(newCache.data);
        } else {
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
      setLoaded(true);
    }
  );
}

/** Valid sizes:
 *  - 1920x1080
 *  - 800x600
 *  - 600x400
 *  - 400x300
 *  - 200x200
 *  - 100x100 */
export function getDataFromFilename(
  name,
  size = "1920x1080",
  urlCallback = () => { },
  metadataCallback = () => { }
) {
  // Use default image if the image name is not provided
  if (!name) {
    return void urlCallback(DEFAULT_IMAGE);
  }
  // Check if the photo is already an external URL
  if (isURL(name)) {
    // Don't look for the photo since the URL is known
    return void urlCallback(name);
  }
  // Check if there is a cache for the photo name
  const URLCacheName = "photo_url_" + name;
  const metadataCacheName = "photo_metadata_" + name;
  const cachedURL = localStorage.getItem(URLCacheName);
  const cachedMetadata = localStorage.getItem(metadataCacheName);

  // Create a reference to the stored object
  const imageRef = ref(storage, `/photos/${name}_${size}.jpeg`);

  if (cachedURL) {
    // Cached URL found; use it
    urlCallback(cachedURL);
  } else {
    getDownloadURL(imageRef).then((url) => {
      urlCallback(url);
      // Cache the photo URL for future use
      localStorage.setItem(URLCacheName, url);
    });
  }
  if (cachedMetadata) {
    // Cached metadata found; use it
    metadataCallback(cachedMetadata);
  } else {
    getMetadata(imageRef).then((metadata) => {
      metadataCallback(metadata);
      // Cache the photo metadata for future use
      localStorage.setItem(metadataCacheName, JSON.stringify(metadata));
    });
  }
}

/** Gets the error description from the HTTP response and calls the callback function with it. */
export function setErrorMessage(res, setErrorFunc) {
  res.json().then((data) => {
    setErrorFunc(data.errorDescription ?? "brak");
  });
}

export function handlePhotoUpdate(file, setImageURL, author, altText) {
  if (!file) return;
  // Regular expression to trim the filename extension
  // Matches all characters including and after the last found "." character in the string,
  // and replaces them with "" (empty string)
  const photoName = file.name.replace(/\.[^\/.]+$/, "");

  const metadata = { customMetadata: { author, altText } };

  const storageRef = ref(storage, `/photos/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const prog = snapshot.bytesTransferred / snapshot.totalBytes;
      setImageURL(`Postęp: ${Math.round(prog * 100)}%`);
    },
    (error) => console.log(error),
    () => {
      // getDownloadURL(uploadTask.snapshot.ref).then(() => {
      //   console.log(url);
      //   const basefileName = getFileNameFromFirebaseUrl(url);
      //   console.log(basefileName);
      //   const fullHDfileName = basefileName.split(".")[0] + "_1920x1080.jpeg";
      //   console.log(fullHDfileName);
      //   setImagePath(fullHDfileName);
      // });
      setImageURL(photoName);
    }
  );
}

/** Returns true if the string starts with either the HTTP or HTTPS protocol identifier. */
export function isURL(string) {
  return string.startsWith("http://") || string.startsWith("https://");
}
