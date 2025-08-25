import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './DiaryCategory.css'; // We'll create this CSS file next

// Helper function to format the date nicely
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const DiaryCategory = () => {
    // Get the 'sentiment' from the URL, e.g., "Happy", "Sad"
    const { sentiment } = useParams();

    const [diaries, setDiaries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // This effect runs whenever the `sentiment` param in the URL changes
    useEffect(() => {
        // Only fetch data if a sentiment is actually present in the URL
        if (sentiment) {
            const fetchDiaries = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const response = await apiClient.get(`/diaries/category/${sentiment}`);
                    setDiaries(response.data);
                } catch (err) {
                    console.error("Error fetching categorized diaries:", err);
                    setError('Could not fetch diaries for this category. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchDiaries();
        } else {
            // If no sentiment is selected, clear any previous diary list
            setDiaries([]);
        }
    }, [sentiment]); // The dependency array ensures this effect re-runs on URL change

    // Capitalize the first letter for display purposes
    const displaySentiment = sentiment ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1) : '';

    return (
        <div className="diary-category-container">
            <h2>Diary Categories</h2>
            <p>View your diary entries grouped by their automatically detected mood.</p>

            <div className="category-nav-links">
                <NavLink to="/categories/Happy" className={({ isActive }) => isActive ? 'active-link' : ''}>😊 Happy</NavLink>
                <NavLink to="/categories/Sad" className={({ isActive }) => isActive ? 'active-link' : ''}>😢 Sad</NavLink>
                <NavLink to="/categories/Angry" className={({ isActive }) => isActive ? 'active-link' : ''}>😠 Angry</NavLink>
                <NavLink to="/categories/Neutral" className={({ isActive }) => isActive ? 'active-link' : ''}>😐 Neutral</NavLink>
            </div>

            <div className="diary-list-section">
                {isLoading && <p className="loading-message">Loading entries...</p>}
                {error && <p className="error-message">{error}</p>}

                {!sentiment && !isLoading && (
                    <p className="prompt-message">Please select a category above to view your entries.</p>
                )}

                {sentiment && !isLoading && !error && (
                    <>
                        <h3>Entries for: {displaySentiment}</h3>
                        {diaries.length > 0 ? (
                            <div className="diary-list">
                                {diaries.map(diary => (
                                    <div key={diary.id} className="diary-card">
                                        <div className="diary-card-header">
                                            <h4>{formatDate(diary.diary_date)}</h4>
                                        </div>
                                        <p className="diary-card-content">{diary.content}</p>
                                        {(diary.feedback &&
                                            <p className="diary-card-feedback"><span><b>Feedback: </b></span>{diary.feedback}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="prompt-message">You have no diary entries in the "{displaySentiment}" category yet.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DiaryCategory;