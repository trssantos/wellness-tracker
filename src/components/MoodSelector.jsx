import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import { formatDateForStorage } from '../utils/dateUtils';

// Updated MOODS object with dark mode compatible colors
export const MOODS = {
  GREAT: { emoji: '😊', label: 'Great', color: 'bg-green-100 dark:bg-green-900/40' },
  GOOD: { emoji: '🙂', label: 'Good', color: 'bg-lime-100 dark:bg-lime-900/40' },
  OKAY: { emoji: '😐', label: 'Okay', color: 'bg-yellow-100 dark:bg-yellow-900/40' },
  MEH: { emoji: '😕', label: 'Meh', color: 'bg-orange-100 dark:bg-orange-900/40' },
  BAD: { emoji: '😔', label: 'Bad', color: 'bg-red-100 dark:bg-red-900/40' },
  OVERWHELMED: { emoji: '🤯', label: 'Over\u00adwhelmed', color: 'bg-red-100 dark:bg-red-900/40' }
};

export const MoodSelector = ({ date, onClose }) => {
  const [currentMood, setCurrentMood] = useState(null);

  useEffect(() => {
    if (date) {
      const storage = getStorage();
      const dateStr = typeof date === 'string' ? date : formatDateForStorage(date);
      setCurrentMood(storage[dateStr]?.mood || null);
    }
  }, [date]);

  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMoodSelect = (mood) => {
    if (!date) return;
    
    const storage = getStorage();
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    // Only store if a mood is actually selected
    if (mood) {
      const existingData = storage[dateStr] || {};
      storage[dateStr] = {
        ...existingData,
        mood: mood
      };
      setStorage(storage);
    }
    
    onClose();
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'mood-modal') {
      onClose();
    }
  };

  return (
    <dialog 
      id="mood-modal" 
      className="modal-base"
      onClick={handleClickOutside}
    >
      <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Track Mood</h3>
            <p className="modal-subtitle">
              {getFormattedDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.entries(MOODS).map(([key, { emoji, label, color }]) => {
            const isSelected = currentMood === key;
            return (
              <button
                key={key}
                onClick={() => handleMoodSelect(key)}
                className={`
                  flex flex-col items-center p-2 rounded-lg 
                  ${color} hover:opacity-80 transition-all
                  ${isSelected ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}
                  ${currentMood && !isSelected ? 'opacity-40' : ''}
                `}
              >
                <span className="text-2xl mb-1">{emoji}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-normal text-center leading-tight min-h-[2rem] transition-colors">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
};