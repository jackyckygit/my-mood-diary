
/**
 * Converts a Date object to a string in the format 'YYYY-MM-DD'.
 *
 * @param {Date} value - The Date object to convert.
 * @returns {string} The formatted date string.
 */
export const dateToDateString = (value) => {
    return value.getFullYear() + '-' +
      String(value.getMonth() + 1).padStart(2, '0') + '-' +
      String(value.getDate()).padStart(2, '0');
}