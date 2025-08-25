const axios = require('axios');
require('dotenv').config();


const SYSTEM_PROMPT = `You are a compassionate and insightful journal companion AI. Your primary role is to analyze a user's diary entry and provide a supportive, structured response.

Your task has two parts:

1.  **Analyze Emotion:** Carefully read the user's diary entry and determine the single most dominant emotion. You MUST classify this emotion into one of the following four categories only: \`Happy\`, \`Sad\`, \`Angry\`, \`Neutral\`.

2.  **Provide Feedback:** Write a brief (2-3 sentences), positive, and empathetic feedback message. This message must:
    -   Acknowledge and validate the user's feelings in a gentle way.
    -   Offer an encouraging perspective.
    -   Include one simple, actionable suggestion that is directly relevant to the identified emotion.

**Output Format Constraint:**
You MUST format your entire response as a single, valid JSON object. Do not include any text, explanations, or markdown formatting like \`\`\`json ... \`\`\` outside of the JSON object itself.

The JSON object must have exactly two keys:
-   "emotion": A string containing one of the four required categories.
-   "feedback": A string containing your supportive message and suggestion.

**Example of a perfect response:**
\`\`\`json
{
  "emotion": "Sad",
  "feedback": "It sounds like you had a really tough day, and it's completely okay to feel sad about what happened. Remember that feelings are temporary. Maybe taking a short walk to get some fresh air or listening to a favorite comforting song could help lift your spirits a little."
}
\`\`\``;

// A reliable fallback in case of API errors or malformed JSON
const FALLBACK_RESPONSE = {
  emotion: 'Neutral',
  feedback: "Thank you for sharing your thoughts today. Taking a moment to journal is a wonderful act of self-care."
};

/**
 * Analyzes diary content for emotion and generates feedback.
 * @param {string} diaryContent The user's diary entry.
 * @returns {Promise<{emotion: string, feedback: string}>} An object with emotion and feedback.
 */
const analyzeSentimentAndFeedback = async (diaryContent) => {
  const OPENROUTER_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

  try {
    const response = await axios.post(
      OPENROUTER_API_ENDPOINT,
      {
        "model": "mistralai/mixtral-8x7b-instruct",
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: diaryContent },
        ],
        response_format: { "type": "json_object" },
        // "max_tokens": 50
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

    const content = response.data.choices[0].message.content;

    // --- Robust JSON Parsing ---
    try {
      const parsedJson = JSON.parse(content);
      // Basic validation of the parsed object
      if (parsedJson.emotion && parsedJson.feedback) {
        return parsedJson;
      } else {
        console.warn("LLM response was valid JSON but missing required keys:", content);
        return FALLBACK_RESPONSE;
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response from LLM:", content, parseError);
      return FALLBACK_RESPONSE;
    }

  } catch (apiError) {
    console.error('Error calling OpenRouter API:', apiError.response ? apiError.response.data : apiError.message);
    return FALLBACK_RESPONSE;
  }
};

module.exports = { analyzeSentimentAndFeedback };