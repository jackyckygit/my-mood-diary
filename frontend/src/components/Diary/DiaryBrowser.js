import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import apiClient from '../../api/apiClient';
import { getSentimentIcon } from '../../utils/sentimentUtils';
import 'react-calendar/dist/Calendar.css';
import './DiaryBrowser.css';
import { dateToDateString } from '../../utils/dateUtils';

const DiaryBrowser = () => {
  const [activeDate, setActiveDate] = useState(new Date());
  const [diaries, setDiaries] = useState({}); // { 'YYYY-MM-DD': diary }
  const [selectedDiary, setSelectedDiary] = useState(null);

  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FOR YEAR MODAL ---
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearlyDiaries, setYearlyDiaries] = useState([]);
  const [isYearLoading, setIsYearLoading] = useState(false);

  // Fetch diaries when the active month/year changes in the calendar
  useEffect(() => {
    const startOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
    const endOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0);

    const fetchDiaries = async () => {
      try {
        const response = await apiClient.get(
          `/diaries?startDate=${dateToDateString(startOfMonth)}&endDate=${dateToDateString(endOfMonth)}`
        );
        const diariesMap = response.data.reduce((acc, diary) => {
          acc[dateToDateString(new Date(diary.diary_date))] = diary;
          return acc;
        }, {});
        setDiaries(diariesMap);
      } catch (error) {
        console.error("Error fetching diaries:", error);
      }
    };
    fetchDiaries();
  }, [activeDate]);

  const handleDateClick = (value) => {
    const dateString = dateToDateString(value);
    const diaryForDay = diaries[dateString];

    if (diaryForDay) {
      setSelectedDiary(diaryForDay);
      setEditText(diaryForDay.content);
    } else {
      // If no diary exists, prepare a new one for creation
      setSelectedDiary({ diary_date: dateString, content: '', sentiment: null });
      setEditText('');
    }
    setStatusMessage(''); // Clear any previous status message
  };

  const handleSave = async () => {
    if (!selectedDiary || !editText.trim()) {
      setStatusMessage('Cannot save an empty diary.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Saving and analyzing...');

    try {
      const dateToSave = dateToDateString(new Date(selectedDiary.diary_date));
      const response = await apiClient.post('/diaries', {
        date: dateToSave,
        content: editText
      });

      const savedDiary = response.data;

      // This avoids needing to re-fetch all diaries for the month.
      const newDiariesMap = { ...diaries, [dateToSave]: savedDiary };
      setDiaries(newDiariesMap);
      setSelectedDiary(savedDiary); // Update the selected diary with new sentiment

      setStatusMessage('Saved successfully!');
    } catch (error) {
      console.error("Error saving diary:", error);
      setStatusMessage('Failed to save diary.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(''), 3000); // Clear message after 3 seconds
    }
  };

  const handleDelete = async () => {
    if (!selectedDiary || !selectedDiary.id) {
      return; // Should not happen if button is only shown for existing diaries
    }

    // a confirmation dialog
    const isConfirmed = window.confirm(
      'Are you sure you want to permanently delete this diary entry?'
    );

    if (!isConfirmed) {
      return; // User cancelled the action
    }

    setIsDeleting(true);
    setStatusMessage('Deleting...');

    try {
      await apiClient.delete(`/diaries/${selectedDiary.id}`);

      const dateString = dateToDateString(new Date(selectedDiary.diary_date));
      const newDiariesMap = { ...diaries };
      delete newDiariesMap[dateString]; // Remove from the map

      setDiaries(newDiariesMap); // This removes the icon from the calendar
      setSelectedDiary(null); // This clears the editor panel
      setEditText('');

      // No need for a status message here as the panel will disappear

    } catch (error) {
      console.error("Error deleting diary:", error);
      setStatusMessage('Failed to delete diary.');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDiariesForCurrentMonth = () => {
    return Object.values(diaries)
      .filter(diary => {
        const diaryDate = new Date(diary.diary_date);
        return diaryDate.getMonth() === activeDate.getMonth() &&
          diaryDate.getFullYear() === activeDate.getFullYear();
      })
      .sort((a, b) => new Date(a.diary_date) - new Date(b.diary_date)); // Sort chronologically
  };

  const monthlyDiaries = getDiariesForCurrentMonth();
  const currentMonthName = activeDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentYear = activeDate.getFullYear();

  // --- HANDLER FOR YEAR MODAL ---
  const handleOpenYearModal = async () => {
    setIsYearLoading(true);
    setYearlyDiaries([]); // Clear previous results

    const year = activeDate.getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    try {
      const response = await apiClient.get(`/diaries?startDate=${startDate}&endDate=${endDate}`);
      // Sort the yearly data chronologically
      const sortedData = response.data.sort((a, b) => new Date(a.diary_date) - new Date(b.diary_date));
      setYearlyDiaries(sortedData);
      setIsYearModalOpen(true); // Open modal only after data is fetched
    } catch (error) {
      console.error("Error fetching yearly diaries:", error);
      // You could set an error state here to show in the modal
    } finally {
      setIsYearLoading(false);
    }
  };

  return (
    <div className="diary-browser-container">
      <h2>Browse Your Diary History</h2>
      <p>Select a date on the calendar to view, edit, or create a new entry.</p>
      <div className="browser-layout">
        <div className="calendar-container">
          <Calendar
            onActiveStartDateChange={({ activeStartDate }) => setActiveDate(activeStartDate)}
            onClickDay={handleDateClick}
            value={selectedDiary ? new Date(selectedDiary?.diary_date) : null}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dateString = dateToDateString(date);
                const diary = diaries[dateString];
                return diary ? <p className="sentiment-icon-tile">{getSentimentIcon(diary.sentiment)}</p> : null;
              }
            }}
          />
          <div className="view-all-container">
            {/* --- MONTH BUTTON (conditionally rendered) --- */}
            {monthlyDiaries.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(true)}
              >
                View Month
              </button>
            )}
            {/* --- YEAR BUTTON --- */}
            <button
              className="btn btn-secondary"
              onClick={handleOpenYearModal}
              disabled={isYearLoading}
            >
              {isYearLoading ? 'Loading...' : `View Year ${currentYear}`}
            </button>
          </div>
        </div>

        {/* --- UPDATED DISPLAY/EDIT PANEL --- */}
        <div className="diary-editor-panel">
          {!selectedDiary ? (
            <div className="prompt-message">
              <h3>Select a date to begin</h3>
            </div>
          ) : (
            <>
              <h3>
                Diary for {new Date(selectedDiary.diary_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <textarea
                className="diary-textarea-browser"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Write your diary entry for this day..."
                disabled={isSaving}
              />
              <div className="editor-panel">
                {selectedDiary.feedback && (
                  <>
                    <span><b>Feedback: </b></span>
                    {selectedDiary.feedback}
                  </>
                )}

              </div>
              <div className="editor-panel-actions">
                <div className="sentiment-display-browser">
                  {selectedDiary.sentiment && (
                    <>
                      <span><b>Mood:</b></span>
                      <span className="sentiment-icon" title={`Analyzed Mood: ${selectedDiary.sentiment}`}>
                        {getSentimentIcon(selectedDiary.sentiment)}
                      </span>
                    </>
                  )}
                </div>
                <div className="save-section-browser">
                  {statusMessage && <span className="status-message-browser">{statusMessage}</span>}
                  {selectedDiary.id && (
                    <button
                      onClick={handleDelete}
                      className="btn btn-danger"
                      disabled={isSaving || isDeleting}
                    >
                      Delete
                    </button>
                  )}
                  <button onClick={handleSave} className="btn btn-primary" disabled={isSaving || isDeleting}>
                    {isSaving ? 'Saving...' : (selectedDiary.id ? 'Update Diary' : 'Save Diary')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Entries for {currentMonthName}</h3>
              <button
                className="modal-close-button"
                onClick={() => setIsModalOpen(false)}
              >
                &times; {/* This is the 'X' symbol */}
              </button>
            </div>
            <div className="modal-body">
              {monthlyDiaries.length > 0 ? (
                monthlyDiaries.map(diary => (
                  <div key={diary.id} className="modal-diary-item">
                    <h4>
                      {new Date(diary.diary_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      <span className="modal-sentiment-icon" title={diary.sentiment}>
                        {getSentimentIcon(diary.sentiment)}
                      </span>
                    </h4>
                    <p>{diary.content}</p>
                    {(diary.feedback &&
                      <p><span><b>Feedback: </b></span>{diary.feedback}</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No entries found for this month.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- YEARLY MODAL --- */}
      {isYearModalOpen && (
        <div className="modal-overlay" onClick={() => setIsYearModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Entries for {currentYear}</h3>
              <button
                className="modal-close-button"
                onClick={() => setIsYearModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {isYearLoading ? (
                <p>Loading entries for {currentYear}...</p>
              ) : yearlyDiaries.length > 0 ? (
                yearlyDiaries.map(diary => (
                  <div key={diary.id} className="modal-diary-item">
                    <h4>
                      {new Date(diary.diary_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      <span className="modal-sentiment-icon" title={diary.sentiment}>
                        {getSentimentIcon(diary.sentiment)}
                      </span>
                    </h4>
                    <p>{diary.content}</p>
                    {(diary.feedback &&
                      <p><span><b>Feedback: </b></span>{diary.feedback}</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No entries found for {currentYear}.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryBrowser;