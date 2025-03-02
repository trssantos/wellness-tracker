import React, { useState, useEffect } from 'react';
import { Sun, Moon, AlertCircle, X, Zap } from 'lucide-react';
import { MOODS } from './MoodSelector';
import { getStorage, setStorage } from '../utils/storage';

const MoodTimeTracker = ({ date, onClose }) => {
  const [currentTime, setCurrentTime] = useState('morning'); // Default to morning
  const [morningMood, setMorningMood] = useState(null);
  const [eveningMood, setEveningMood] = useState(null);
  const [morningEnergy, setMorningEnergy] = useState(0);
  const [eveningEnergy, setEveningEnergy] = useState(0);
  const [saveError, setSaveError] = useState(null);

  // Reset state when modal opens with a new date
  useEffect(() => {
    if (date) {
      // Reset all state
      setMorningMood(null);
      setEveningMood(null);
      setMorningEnergy(0);
      setEveningEnergy(0);
      setSaveError(null);
      
      // Load existing data for this date
      const storage = getStorage();
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const dayData = storage[dateStr] || {};
      
      // Load existing data
      if (dayData.morningMood) setMorningMood(dayData.morningMood);
      if (dayData.eveningMood) setEveningMood(dayData.eveningMood);
      if (dayData.morningEnergy) setMorningEnergy(dayData.morningEnergy);
      if (dayData.eveningEnergy) setEveningEnergy(dayData.eveningEnergy);
      
      // If we have evening data but no morning data, migrate existing data as morning data
      if (!dayData.morningMood && !dayData.eveningMood && dayData.mood) {
        setMorningMood(dayData.mood);
      }
      if (!dayData.morningEnergy && !dayData.eveningEnergy && dayData.energyLevel) {
        setMorningEnergy(dayData.energyLevel);
      }
      
      // Set the active tab based on time of day and existing data
      const now = new Date();
      const hours = now.getHours();
      
      // If we already have morning data but no evening data and it's afternoon/evening, default to evening
      if (dayData.morningMood && !dayData.eveningMood && hours >= 12) {
        setCurrentTime('evening');
      } else {
        setCurrentTime('morning'); // Default to morning
      }
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

  const handleMoodSelect = (timeOfDay, mood) => {
    if (timeOfDay === 'morning') {
      setMorningMood(mood);
    } else {
      setEveningMood(mood);
    }
  };

  const handleEnergySelect = (timeOfDay, level) => {
    if (timeOfDay === 'morning') {
      setMorningEnergy(level);
    } else {
      setEveningEnergy(level);
    }
  };

  const getEnergyColor = (level, currentLevel) => {
    if (level > currentLevel) return 'text-slate-300 dark:text-slate-600';
    if (currentLevel === 1) return 'text-red-500 dark:text-red-400';
    if (currentLevel === 2) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  const saveData = () => {
    if (!date) {
      setSaveError("No date selected. Please try again.");
      return;
    }
    
    try {
      const storage = getStorage();
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const dayData = storage[dateStr] || {};
      
      // Save the data for the selected time of day
      if (currentTime === 'morning') {
        // Only update if values have changed
        if (morningMood !== dayData.morningMood || morningEnergy !== dayData.morningEnergy) {
          storage[dateStr] = {
            ...dayData,
            morningMood,
            morningEnergy,
            // Keep existing mood/energyLevel for backward compatibility
            mood: morningMood,
            energyLevel: morningEnergy
          };
        }
      } else {
        // Only update if values have changed
        if (eveningMood !== dayData.eveningMood || eveningEnergy !== dayData.eveningEnergy) {
          storage[dateStr] = {
            ...dayData,
            eveningMood,
            eveningEnergy
          };
        }
      }
      
      setStorage(storage);
      setSaveError(null);
      onClose();
    } catch (error) {
      console.error('Error saving mood/energy data:', error);
      setSaveError(`Failed to save: ${error.message}`);
    }
  };

  return (
    <dialog 
      id="mood-time-tracker-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'mood-time-tracker-modal' && onClose()}
    >
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header mb-6">
          <div>
            <h3 className="modal-title">Track Mood & Energy</h3>
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

        {/* Time Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg mb-6 p-1 transition-colors">
          <button
            className={`flex-1 py-2 rounded-md flex justify-center items-center gap-2 transition-colors ${
              currentTime === 'morning' 
                ? 'bg-white dark:bg-slate-800 text-amber-500 dark:text-amber-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600'
            }`}
            onClick={() => setCurrentTime('morning')}
          >
            <Sun size={18} />
            <span>Morning</span>
          </button>
          <button
            className={`flex-1 py-2 rounded-md flex justify-center items-center gap-2 transition-colors ${
              currentTime === 'evening' 
                ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600'
            }`}
            onClick={() => setCurrentTime('evening')}
          >
            <Moon size={18} />
            <span>Evening</span>
          </button>
        </div>

        <div>
          {/* Mood Selection */}
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
            How are you feeling {currentTime === 'morning' ? 'this morning' : 'this evening'}?
          </label>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Object.entries(MOODS).map(([key, { emoji, label, color }]) => {
              const isSelected = currentTime === 'morning' 
                ? morningMood === key 
                : eveningMood === key;
              
              return (
                <button
                  key={key}
                  onClick={() => handleMoodSelect(currentTime, key)}
                  className={`
                    flex flex-col items-center p-2 rounded-lg transition-all
                    ${color} hover:opacity-80
                    ${isSelected ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 transition-colors">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Energy Level Selection */}
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
            Energy Level
          </label>
          <div className="flex items-center gap-6 mb-6 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg transition-colors">
            <div className="text-slate-600 dark:text-slate-400 transition-colors">
              {currentTime === 'morning' ? 'Morning' : 'Evening'}:
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => {
                const currentLevel = currentTime === 'morning' ? morningEnergy : eveningEnergy;
                return (
                  <button
                    key={level}
                    onClick={() => handleEnergySelect(currentTime, level)}
                    className={`p-1 rounded-full transition-colors ${
                      level <= currentLevel
                        ? 'bg-slate-100 dark:bg-slate-700 ring-1 ring-slate-300 dark:ring-slate-600'
                        : ''
                    }`}
                  >
                    <Zap
                      size={22}
                      className={`
                        ${level <= currentLevel ? 'fill-current' : 'fill-none'}
                        ${getEnergyColor(level, currentLevel)}
                      `}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg transition-colors mb-6">
              <AlertCircle size={20} />
              <p>{saveError}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveData}
            disabled={currentTime === 'morning' 
              ? (!morningMood || !morningEnergy) 
              : (!eveningMood || !eveningEnergy)}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-colors
              ${(currentTime === 'morning' 
                  ? (!morningMood || !morningEnergy) 
                  : (!eveningMood || !eveningEnergy))
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                : currentTime === 'morning'
                  ? 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
                  : 'bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-700'}
            `}
          >
            Save {currentTime === 'morning' ? 'Morning' : 'Evening'} Status
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default MoodTimeTracker;