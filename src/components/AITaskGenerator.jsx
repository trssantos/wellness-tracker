import React, { useState, useEffect } from 'react';
import { X, Zap, AlertCircle } from 'lucide-react';
import { MOODS } from './MoodSelector';
import { generateTasks } from '../utils/gemini-service';
import { getStorage, setStorage } from '../utils/storage';

export const AITaskGenerator = ({ date, onClose, onTasksGenerated }) => {
  const [mood, setMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [dayObjective, setDayObjective] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(date);

  // Effect to handle date passed via props or data attribute
  useEffect(() => {
    // First, check if date is provided as a prop
    if (date) {
      setCurrentDate(date);
      
      // Try to load existing context from storage for this date
      const loadExistingContext = () => {
        try {
          const storage = getStorage();
          const dayData = storage[date] || {};
          
          // If this date has ai context, pre-populate the form
          if (dayData.aiContext) {
            setMood(dayData.aiContext.mood || null);
            setEnergyLevel(dayData.aiContext.energyLevel || 0);
            setDayObjective(dayData.aiContext.objective || '');
            setContext(dayData.aiContext.context || '');
          }
        } catch (error) {
          console.error('Error loading existing context:', error);
        }
      };
      
      loadExistingContext();
      return;
    }

    // If not, check if date was passed via dataset
    const modal = document.getElementById('ai-generator-modal');
    if (modal && modal.dataset.selectedDate) {
      const selectedDate = modal.dataset.selectedDate;
      setCurrentDate(selectedDate);
      
      // Try to load existing context for the passed date
      try {
        const storage = getStorage();
        const dayData = storage[selectedDate] || {};
        
        // If this date has ai context, pre-populate the form
        if (dayData.aiContext) {
          setMood(dayData.aiContext.mood || null);
          setEnergyLevel(dayData.aiContext.energyLevel || 0);
          setDayObjective(dayData.aiContext.objective || '');
          setContext(dayData.aiContext.context || '');
        } else if (dayData.mood || dayData.energyLevel) {
          // If we have mood/energy without ai context, use those
          setMood(dayData.mood || null);
          setEnergyLevel(dayData.energyLevel || 0);
        }
      } catch (error) {
        console.error('Error loading existing context:', error);
      }
      
      // Clear the dataset after using it
      modal.dataset.selectedDate = '';
    }
  }, [date]);

  // Reset state when date changes
  useEffect(() => {
    if (currentDate) {
      setMood(null);
      setEnergyLevel(0);
      setDayObjective('');
      setContext('');
      setIsLoading(false);
      setError(null);
    }
  }, [currentDate]);

  const handleGenerate = async () => {
    if (!currentDate) {
      setError('No date selected. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const userContext = {
        mood,
        energyLevel,
        objective: dayObjective,
        context
      };
      
      const tasks = await generateTasks(userContext);
      
      // Format tasks to ensure they're strings
      const formattedTasks = {
        ...tasks,
        categories: tasks.categories.map(category => ({
          title: category.title,
          items: category.items.map(item => item.toString())
        }))
      };
      
      // Get current storage
      const storage = getStorage();
      const existingData = storage[currentDate] || {};
      
      // Create new checked state based on the new categories
      const newChecked = {};
      formattedTasks.categories.forEach(cat => {
        cat.items.forEach(item => {
          // Preserve checked state if the item exists, otherwise set to false
          newChecked[item] = existingData.checked && existingData.checked[item] 
            ? existingData.checked[item] 
            : false;
        });
      });
      
      // Store the new data
      storage[currentDate] = {
        ...existingData,  // Preserve existing data (mood, etc.)
        aiContext: userContext,
        aiTasks: formattedTasks.categories,
        // If a custom list existed, rename it to keep it but not use it
        customTasks: existingData.customTasks ? existingData.customTasks : undefined,
        // Override checked with our new map
        checked: newChecked
      };
      
      setStorage(storage);
      console.log('Saved new AI tasks for date:', currentDate);

      // Reset state
      setMood(null);
      setEnergyLevel(0);
      setDayObjective('');
      setContext('');
      setIsLoading(false);

      onTasksGenerated(currentDate);
    } catch (error) {
      console.error('Failed to generate tasks:', error);
      
      // Check for 503 Service Unavailable (model overloaded)
      if (error.message && (
          error.message.includes('503') || 
          error.message.includes('overloaded') || 
          error.message.includes('unavailable') || 
          error.message.includes('capacity')
        )) {
        setError('The AI service is currently overloaded. Please wait a moment and try again later.');
      } else {
        setError('Failed to generate tasks. Please try again.');
      }
      
      setIsLoading(false);
    }
  };

  const renderEnergyLevel = (level) => {
    const icons = [];
    const maxLevel = 3;
    for (let i = 0; i < maxLevel; i++) {
      icons.push(
        <Zap
          key={i}
          size={20}
          className={`
            ${i < level ? 'fill-current' : 'fill-none'}
            ${level === 1 ? 'text-red-500 dark:text-red-400' : level === 2 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'}
          `}
        />
      );
    }
    return icons;
  };

  const getFormattedDate = () => {
    if (!currentDate) return '';
    
    try {
      const dateObj = new Date(currentDate);
      return dateObj.toLocaleDateString('default', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Select a date';
    }
  };

  return (
    <dialog 
      id="ai-generator-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'ai-generator-modal' && onClose()}
    >
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Generate Daily Tasks</h3>
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

        <div className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(MOODS).map(([key, { emoji, label, color }]) => (
                <button
                  key={key}
                  onClick={() => setMood(key)}
                  className={`
                    flex flex-col items-center p-2 rounded-lg 
                    ${color} hover:opacity-80 transition-all
                    ${mood === key ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Energy Level
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-xs">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`
                    flex items-center justify-center p-2 rounded-lg transition-colors
                    ${energyLevel === level ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                  `}
                >
                  {renderEnergyLevel(level)}
                </button>
              ))}
            </div>
          </div>

          {/* Day Objective */}
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Main goal for today
            </label>
            <input
              id="objective"
              type="text"
              value={dayObjective}
              onChange={(e) => setDayObjective(e.target.value)}
              placeholder="e.g., Start my project presentation"
              className="input-field"
            />
          </div>

          {/* Context */}
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Additional context
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Working from home today, have a meeting at 2 PM"
              className="textarea-field h-24"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg transition-colors">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!mood || !energyLevel || !dayObjective || isLoading}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-colors
              ${(!mood || !energyLevel || !dayObjective || isLoading)
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating tasks...</span>
              </div>
            ) : (
              'Generate Personalized Tasks'
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
};