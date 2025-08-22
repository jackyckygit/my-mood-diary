import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Tooltip } from 'react-tooltip';
import { getSentimentIcon } from '../../utils/sentimentUtils';
import 'react-tooltip/dist/react-tooltip.css';
import './DiaryEditor.css';
import { dateToDateString } from '../../utils/dateUtils';

const DiaryEditor = () => {
  const today = dateToDateString(new Date());
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedSentiment, setSavedSentiment] = useState(null); 

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const response = await apiClient.get(`/diaries/${today}`);
        if (response.data) {
          setContent(response.data.content);
          setSavedSentiment(response.data.sentiment); 
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error("Error fetching diary:", error);
        }
        // If 404, do nothing, the state remains empty/null
      }
    };
    fetchDiary();
  }, [today]);

  const handleSave = async () => {
    if (!content.trim()) {
        setStatus('Diary content cannot be empty.');
        setTimeout(() => setStatus(''), 3000);
        return;
    }

    setIsLoading(true);
    setStatus('Saving and analyzing...');
    try {
      // The API response includes the newly analyzed sentiment
      const response = await apiClient.post('/diaries', { date: today, content });
      setSavedSentiment(response.data.sentiment); 
      setStatus('Saved successfully!');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      setStatus('Failed to save.');
      console.error("Error saving diary:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="diary-editor-container">
      <h2>Today's Diary ({today})</h2>
      <textarea
        className="diary-textarea"
        data-tooltip-id="editor-tooltip"
        data-tooltip-content="Write down your thoughts and feelings for today. We'll analyze the mood for you!"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind today?"
        disabled={isLoading}
      />
      <Tooltip id="editor-tooltip" />
      
      <div className="editor-actions">
        <div className="sentiment-display">
          {savedSentiment && (
            <>
              <span>Today's Mood:</span>
              <span 
                className="sentiment-icon" 
                title={`Analyzed Mood: ${savedSentiment}`}
              >
                {getSentimentIcon(savedSentiment)}
              </span>
            </>
          )}
        </div>
        
        <div className="save-section">
          {status && <span className="status-message">{status}</span>}
          <button onClick={handleSave} className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Diary'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryEditor;