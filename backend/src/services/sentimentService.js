const axios = require('axios');
require('dotenv').config();

const analyzeSentiment = async (diaryContent) => {
  const OPENROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

  try {
    const response = await axios.post(
      OPENROUTER_API_ENDPOINT,
      {
        "model": "mistralai/mixtral-8x7b-instruct",
        "messages": [
          {
            role: 'system',
            content: "You are a sentiment analysis expert. Analyze the user's diary entry and classify its primary sentiment into one of these categories: Happy, Sad, Angry, Neutral. Respond with only one word.",
          },
          {
            role: 'user',
            content: diaryContent,
          }
        ],
        "max_tokens": 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          // Recommended headers for OpenRouter to identify your app
          // 'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000', 
          'X-Title': 'My Mood Diary', 
        },
      }
    );

    let sentiment = response.data.choices[0].message.content.trim();

    // Basic validation to ensure the response is one of the expected categories
    const validSentiments = ['Happy', 'Sad', 'Angry', 'Neutral'];
    if (!validSentiments.includes(sentiment)) {
      sentiment = 'Neutral'; // Default fallback
    }

    return sentiment;
  } catch (error) {

    console.error('Error calling OpenRouter API:', error.response ? error.response.data : error.message);
    // In case of an API error, we can default to 'Neutral'
    return 'Neutral';
  }
};

module.exports = { analyzeSentiment };