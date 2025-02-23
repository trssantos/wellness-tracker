import React, { useState, useEffect } from 'react';
import { X, Zap, SmilePlus, AlertCircle } from 'lucide-react';
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

  // Reset state when date changes
  useEffect(() => {
    setMood(null);
    setEnergyLevel(0);
    setDayObjective('');
    setContext('');
    setIsLoading(false);
    setError(null);
  }, [date]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userContext = {
        mood,  // Store the key (e.g., "MEH") rather than the label
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
      
      // Store AI context and tasks in storage
      const storage = getStorage();
      storage[date] = {
        ...storage[date],
        aiContext: userContext,
        aiTasks: formattedTasks.categories
      };
      setStorage(storage);

      // Reset state
      setMood(null);
      setEnergyLevel(0);
      setDayObjective('');
      setContext('');
      setIsLoading(false);

      onTasksGenerated();
    } catch (error) {
      console.error('Failed to generate tasks:', error);
      setError('Failed to generate tasks. Please try again.');
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
          size={24}
          className={`
            ${i < level ? 'fill-current' : 'fill-none'}
            ${level === 1 ? 'text-red-500' : level === 2 ? 'text-yellow-500' : 'text-green-500'}
          `}
        />
      );
    }
    return icons;
  };

  return (
    <dialog 
      id="ai-generator-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'ai-generator-modal' && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Generate Daily Tasks</h3>
            <p className="text-sm text-slate-600">
              {new Date(date).toLocaleDateString('default', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(MOODS).map(([key, { emoji, label, color }]) => (
                <button
                  key={key}
                  onClick={() => setMood(key)}
                  className={`
                    flex flex-col items-center p-2 rounded-lg 
                    ${color} hover:opacity-80 transition-opacity
                    ${mood === key ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className="text-xs text-slate-600">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Energy Level
            </label>
            <div className="flex gap-4">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`
                    flex items-center gap-1 p-3 rounded-lg transition-colors
                    ${energyLevel === level ? 'bg-slate-100' : 'hover:bg-slate-50'}
                  `}
                >
                  {renderEnergyLevel(level)}
                </button>
              ))}
            </div>
          </div>

          {/* Day Objective */}
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-slate-700 mb-2">
              Main goal for today
            </label>
            <input
              id="objective"
              type="text"
              value={dayObjective}
              onChange={(e) => setDayObjective(e.target.value)}
              placeholder="e.g., Start my project presentation"
              className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Context */}
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-slate-700 mb-2">
              Additional context
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Working from home today, have a meeting at 2 PM"
              className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!mood || !energyLevel || !dayObjective || isLoading}
            className={`
              w-full py-3 px-4 rounded-lg font-medium
              ${(!mood || !energyLevel || !dayObjective || isLoading)
                ? 'bg-slate-100 text-slate-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'}
              transition-colors
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

export default AITaskGenerator;