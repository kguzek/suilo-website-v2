/**
 * (1, 'wyświetle', 'ni', 'ń') -> '1 wyświetlenie'
 *
 * (21, 'wyświetle', 'ni', 'ń') -> '21 wyświetleń'
 */
export function conjugatePolish(value, base, suffix1, suffix2) {
  if (value == 1) {
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

/**Format a timestamp string with format: `01 sty 2022`. */
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

// Temporary API URL assignment
export const API_URL = "http://localhost:5001/suilo-page/europe-west1/app/api";

// Temporary image URL if an article has none specified
export const DEFAULT_IMAGE = "https://i.stack.imgur.com/6M513.png";
