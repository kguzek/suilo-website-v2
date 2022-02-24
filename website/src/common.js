// COMMON CODE FOR BOTH WEBSITE FRONT END AND FIREBASE BACK END //

/** Custom method definition for replacing all instances of a substring within a string instance. */
String.prototype.replaceAll = function replaceAll(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

/** Return an array consisting of the date's year, month (one-padded) and day of the month.
 * If no date is provided, defaults to using the current date.
 */
export function dateToArray(date) {
  // don't use default function argument for 'date' as that is evaluated at compile time, not runtime.
  // at least that's how it works in other languages, I haven't tested it in JavaScript ;)
  date ?? (date = new Date());
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
}

/** Return the array's elements as a string separated by the '-' character. */
export function serialiseDateArray(dateArray = []) {
  // This formats the date as yyyy-m-d
  const serialised = dateArray.toString().replaceAll(",", "-");
  // This formats the date as yyyy-mm-dd
  // splitting the string at 'T' and returning the first element of the split only gets you "yyyy-MM-dd"
  return new Date(serialised).toISOString().split("T").shift();
}
