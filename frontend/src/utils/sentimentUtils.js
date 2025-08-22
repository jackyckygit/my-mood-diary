/**
 * Returns a sentiment emoji based on a sentiment string.
 * @param {string} sentiment - The sentiment string (e.g., 'Happy', 'Sad').
 * @returns {string|null} - The corresponding emoji or null if not found.
 */
export const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'Happy': return '😊';
    case 'Sad': return '😢';
    case 'Angry': return '😠';
    case 'Neutral': return '😐';
    default: return null; // Return null if sentiment is invalid or not present
  }
};