/*      ======== GENERAL UTIL FUNCTIONS ========      */

// general function for zero-padding integers e.g. months and dates
function zeroPad(num, stringLength = 2) {
    // default length of 2: e.g. input num = 5 returns "05"

    // initialise template string consisting of x "0"s and append input string to it
    const s = "0".repeat(stringLength) + num;
    // return the x last characters of the newly-created string
    // "s.length - stringLength" is the length of the input number as a string
    // get the max value between the specified string length and the length of the input number as a string
    // this ensures that the number is not cut off; e.g. input num = 32 and stringLength = 1 should not output "2", instead "32"
    // "s.length - Math.max..." starts the substring at a specific index so that the final result has the correct length
    return s.substring(s.length - Math.max(stringLength, s.length - stringLength));
}


module.exports = { zeroPad };
