const db = require('../config/db');
const { analyzeSentimentAndFeedback } = require('../services/sentimentService');

/**
 * @desc    Create a new diary or update an existing one for a specific date.
 * @route   POST /api/diaries
 * @access  Private
 */
const saveDiary = async (req, res) => {
  const { date, content } = req.body;
  const userId = req.user.id;

  if (!date || !content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Date and non-empty content are required.' });
  }

  try {
    // 1. Get both sentiment and feedback from the service
    const analysis = await analyzeSentimentAndFeedback(content);
    if (!analysis) {
        return res.status(503).json({ message: 'Analysis service is unavailable.' });
    }

    // 2. Update the UPSERT query to include the new 'feedback' column
    const query = `
      INSERT INTO diaries (owner_id, diary_date, content, sentiment, feedback)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (owner_id, diary_date)
      DO UPDATE SET 
        content = EXCLUDED.content, 
        sentiment = EXCLUDED.sentiment, 
        feedback = EXCLUDED.feedback,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const values = [userId, date, content, analysis.emotion, analysis.feedback];
    const { rows } = await db.query(query, values);

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Error saving diary:', error);
    res.status(500).json({ message: 'Internal server error while saving diary.' });
  }
};

/**
 * @desc    Get a single diary entry for the logged-in user by date.
 * @route   GET /api/diaries/:date
 * @access  Private
 */
const getDiaryByDate = async (req, res) => {
  const { date } = req.params;
  const userId = req.user.id;

  try {
    const query = `
      SELECT id, diary_date, content, sentiment, feedback 
      FROM diaries 
      WHERE owner_id = $1 AND diary_date = $2;
    `;
    const { rows } = await db.query(query, [userId, date]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No diary found for this date.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching diary by date:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * @desc    Get all diaries for the logged-in user within a date range.
 * @route   GET /api/diaries?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * @access  Private
 */
const getDiariesInRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.user.id;

  // Validate that both query parameters are provided
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Both startDate and endDate query parameters are required.' });
  }

  try {
    const query = `
      SELECT id, diary_date, content, sentiment, feedback 
      FROM diaries 
      WHERE owner_id = $1 AND diary_date BETWEEN $2 AND $3
      ORDER BY diary_date ASC;
    `;
    const { rows } = await db.query(query, [userId, startDate, endDate]);

    // It's perfectly fine to return an empty array if no diaries are found
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching diaries in range:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * @desc    Get diaries for the logged-in user filtered by sentiment category.
 * @route   GET /api/diaries/category/:sentiment
 * @access  Private
 */
const getDiariesByCategory = async (req, res) => {
  const { sentiment } = req.params;
  const userId = req.user.id;

  // Basic validation for the sentiment category
  const validSentiments = ['Happy', 'Sad', 'Angry', 'Neutral'];
  const capitalizedSentiment = sentiment.charAt(0).toUpperCase() + sentiment.slice(1).toLowerCase();

  if (!validSentiments.includes(capitalizedSentiment)) {
      return res.status(400).json({ message: 'Invalid sentiment category.' });
  }

  try {
    const query = `
      SELECT id, diary_date, content, sentiment, feedback 
      FROM diaries 
      WHERE owner_id = $1 AND sentiment = $2
      ORDER BY diary_date DESC;
    `;
    const { rows } = await db.query(query, [userId, capitalizedSentiment]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching diaries by category:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * @desc    Delete a diary entry by its ID.
 * @route   DELETE /api/diaries/:id
 * @access  Private
 */
const deleteDiary = async (req, res) => {
  const { id } = req.params; // The ID of the diary to delete
  const userId = req.user.id; // The ID of the authenticated user

  try {
    // The query ensures that a user can only delete a diary that they own.
    const query = `
      DELETE FROM diaries 
      WHERE id = $1 AND owner_id = $2
      RETURNING id;
    `;
    const { rows } = await db.query(query, [id, userId]);

    // If rows is empty, it means no diary was found with that ID for that user.
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Diary not found or user not authorized to delete it.' });
    }

    // Send a success response. 204 No Content is also common, but 200 is fine.
    res.status(200).json({ message: 'Diary entry deleted successfully.' });

  } catch (error) {
    console.error('Error deleting diary:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Export all controller functions
module.exports = {
  saveDiary,
  deleteDiary,
  getDiaryByDate,
  getDiariesInRange,
  getDiariesByCategory,
};