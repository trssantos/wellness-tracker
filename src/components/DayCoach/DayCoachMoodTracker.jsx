import React, { useState, useEffect } from 'react';
import { Smile, Frown, Meh, Clock, Sun, Moon, Save, Info } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { MOODS } from '../MoodSelector';
import { formatDateForStorage } from '../../utils/dateUtils';

const DayCoachMoodTracker = ({ onMoodUpdate, onClose }) => {
  const [morningMood, setMorningMood] = useState(null);
  const [eveningMood, setEveningMood] = useState(null);
  const [morningEnergy, setMorningEnergy] = useState(0);
  const [eveningEnergy, setEveningEnergy] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Load current mood data on mount
  useEffect(() => {
    const loadMoodData = () => {
      const storage = getStorage();
      const today = formatDateForStorage(new Date());
      const todayData = storage[today] || {};
      
      // Load stored mood values
      setMorningMood(todayData.morningMood || null);
      setEveningMood(todayData.eveningMood || null);
      setMorningEnergy(todayData.morningEnergy || 0);
      setEveningEnergy(todayData.eveningEnergy || 0);
      
      // Determine if it's morning or evening
      const hour = new Date().getHours();
      setTimeOfDay(hour < 12 ? 'morning' : 'evening');
    };
    
    loadMoodData();
  }, []);
  
  // Handle mood selection
  const handleMoodSelect = (mood) => {
    if (timeOfDay === 'morning') {
      setMorningMood(mood);
    } else {
      setEveningMood(mood);
    }
  };
  
  // Handle energy level change
  const handleEnergyChange = (level) => {
    if (timeOfDay === 'morning') {
      setMorningEnergy(level);
    } else {
      setEveningEnergy(level);
    }
  };
  
  // Handle time of day toggle
  const handleTimeToggle = (time) => {
    setTimeOfDay(time);
  };
  
  // Handle save mood
  const handleSaveMood = async () => {
    setIsSubmitting(true);
    
    try {
      const storage = getStorage();
      const today = formatDateForStorage(new Date());
      const todayData = storage[today] || {};
      
      // Update mood and energy values
      if (timeOfDay === 'morning') {
        storage[today] = {
          ...todayData,
          morningMood,
          morningEnergy,
          mood: morningMood, // Keep backward compatibility
          energyLevel: morningEnergy // Keep backward compatibility
        };
      } else {
        storage[today] = {
          ...todayData,
          eveningMood,
          eveningEnergy
        };
      }
      
      // Save to storage
      setStorage(storage);
      
      // Notify parent component if provided
      if (onMoodUpdate) {
        onMoodUpdate({
          date: today,
          timeOfDay,
          mood: timeOfDay === 'morning' ? morningMood : eveningMood,
          energy: timeOfDay === 'morning' ? morningEnergy : eveningEnergy
        });
      }
      
      // Close if needed
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get current mood selection
  const currentMood = timeOfDay === 'morning' ? morningMood : eveningMood;
  const currentEnergy = timeOfDay === 'morning' ? morningEnergy : eveningEnergy;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 transition-colors">
            How are you feeling?
          </h3>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Info size={16} />
          </button>
        </div>
        
        {showInfo && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
            <p>Tracking your mood helps your Day Coach provide more personalized advice. Regular mood tracking reveals patterns in how your activities affect your wellbeing.</p>
          </div>
        )}
        
        <div className="flex mb-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => handleTimeToggle('morning')}
            className={`flex-1 py-2 flex justify-center items-center gap-1 ${
              timeOfDay === 'morning' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
            } transition-colors`}
          >
            <Sun size={16} />
            <span>Morning</span>
          </button>
          
          <button
            onClick={() => handleTimeToggle('evening')}
            className={`flex-1 py-2 flex justify-center items-center gap-1 ${
              timeOfDay === 'evening' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
            } transition-colors`}
          >
            <Moon size={16} />
            <span>Evening</span>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors">
            Select your mood:
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(MOODS).map(([key, { emoji, label, color }]) => (
              <button
                key={key}
                onClick={() => handleMoodSelect(key)}
                className={`p-3 rounded-lg flex flex-col items-center justify-center transition-colors ${
                  currentMood === key 
                    ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                    : `${color.replace('bg-', 'hover:bg-')} ${color.replace('-100', '-50')} text-slate-700 dark:text-slate-200`
                }`}
              >
                <span className="text-2xl mb-1">{emoji}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between transition-colors">
            <span>Energy level: {currentEnergy}/5</span>
            <span className="text-xs font-normal">
              {currentEnergy === 0 ? 'No energy' :
               currentEnergy === 1 ? 'Very low' :
               currentEnergy === 2 ? 'Low' :
               currentEnergy === 3 ? 'Moderate' :
               currentEnergy === 4 ? 'High' :
               'Very high'}
            </span>
          </label>
          
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={currentEnergy}
            onChange={(e) => handleEnergyChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-colors"
          />
          
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
        
        <button
          onClick={handleSaveMood}
          disabled={!currentMood || isSubmitting}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            !currentMood || isSubmitting
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Save size={16} />
          )}
          <span>Save {timeOfDay === 'morning' ? 'Morning' : 'Evening'} Mood</span>
        </button>
      </div>
    </div>
  );
};

export default DayCoachMoodTracker;