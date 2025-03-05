import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, X, Brain, Lightbulb, MoreHorizontal, Loader } from 'lucide-react';
import { generateHabitSuggestion } from '../../utils/aiHabitService';

const AiHabitGenerator = ({ onHabitGenerated, onCancel }) => {
  const [habitInput, setHabitInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [selectedTab, setSelectedTab] = useState('basic');
  const [error, setError] = useState(null);
  
  const handleGenerate = async () => {
    if (!habitInput.trim()) {
      setError("Please enter a habit description first");
      return;
    }
    
    setError(null);
    setGenerating(true);
    
    try {
      const result = await generateHabitSuggestion(habitInput);
      setSuggestion(result);
      setSelectedTab('steps');
    } catch (err) {
      setError("Failed to generate habit suggestion: " + (err.message || "Please try again."));
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };
  
  const handleAccept = () => {
    if (suggestion) {
      onHabitGenerated(suggestion);
    }
  };
  
  const handleChangeStep = (index, value) => {
    if (!suggestion) return;
    
    const updatedSteps = [...suggestion.steps];
    updatedSteps[index] = value;
    
    setSuggestion({
      ...suggestion,
      steps: updatedSteps
    });
  };
  
  const handleChangeMilestone = (index, field, value) => {
    if (!suggestion) return;
    
    const updatedMilestones = [...suggestion.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    };
    
    setSuggestion({
      ...suggestion,
      milestones: updatedMilestones
    });
  };
  
  const handleChangeFrequency = (day) => {
    if (!suggestion) return;
    
    const updatedFrequency = [...suggestion.frequency];
    
    if (updatedFrequency.includes(day)) {
      setSuggestion({
        ...suggestion,
        frequency: updatedFrequency.filter(d => d !== day)
      });
    } else {
      setSuggestion({
        ...suggestion,
        frequency: [...updatedFrequency, day]
      });
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md w-full sm:w-[90%] md:w-3/4 lg:w-2/3 mx-auto overflow-hidden p-3 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20} />
          AI Habit Creator
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      {/* Input Section */}
      {!suggestion && (
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            What habit would you like to build?
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={habitInput}
              onChange={(e) => setHabitInput(e.target.value)}
              placeholder="e.g., Daily meditation, Regular exercise"
              className="flex-1 p-2 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 w-full"
              disabled={generating}
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !habitInput.trim()}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 mt-2 sm:mt-0 whitespace-nowrap ${
                generating || !habitInput.trim()
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {generating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain size={18} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 dark:text-red-400 mt-2 text-sm">{error}</p>
          )}
          
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-3 sm:p-4 rounded-lg flex items-start gap-3">
            <Lightbulb className="text-amber-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                Tell the AI what habit you'd like to build, and it will generate a complete habit template with steps, milestones, and a recommended schedule.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                <strong>Try:</strong> "Daily mindfulness meditation" or "Reading books before bed"
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Suggestion Result */}
      {suggestion && (
        <div className="mb-4 sm:mb-6">
          {/* Tabs - Scroll on mobile */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 mb-4">
            <button
              className={`px-3 sm:px-4 py-2 text-sm font-medium flex-shrink-0 ${
                selectedTab === 'basic'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setSelectedTab('basic')}
            >
              Basic Info
            </button>
            <button
              className={`px-3 sm:px-4 py-2 text-sm font-medium flex-shrink-0 ${
                selectedTab === 'steps'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setSelectedTab('steps')}
            >
              Steps
            </button>
            <button
              className={`px-3 sm:px-4 py-2 text-sm font-medium flex-shrink-0 ${
                selectedTab === 'schedule'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setSelectedTab('schedule')}
            >
              Schedule
            </button>
            <button
              className={`px-3 sm:px-4 py-2 text-sm font-medium flex-shrink-0 ${
                selectedTab === 'milestones'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setSelectedTab('milestones')}
            >
              Milestones
            </button>
          </div>
          
          {/* Basic Info Tab */}
          {selectedTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={suggestion.name}
                  onChange={(e) => setSuggestion({...suggestion, name: e.target.value})}
                  className="w-full p-2 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={suggestion.description}
                  onChange={(e) => setSuggestion({...suggestion, description: e.target.value})}
                  className="w-full p-2 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time of Day
                </label>
                <div className="flex flex-wrap gap-2">
                  {['morning', 'afternoon', 'evening', 'anytime'].map(time => (
                    <button
                      key={time}
                      onClick={() => setSuggestion({...suggestion, timeOfDay: time})}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize ${
                        suggestion.timeOfDay === time
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Steps Tab */}
          {selectedTab === 'steps' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Edit the steps for your habit. These steps will appear as tasks in your daily checklist.
              </p>
              
              {suggestion.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleChangeStep(index, e.target.value)}
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Schedule Tab */}
          {selectedTab === 'schedule' && (
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Select which days you want to practice this habit.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                  <button
                    key={day}
                    onClick={() => handleChangeFrequency(day)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                      suggestion.frequency.includes(day)
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <button 
                  onClick={() => setSuggestion({...suggestion, frequency: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']})}
                  className="px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Every Day
                </button>
                <button 
                  onClick={() => setSuggestion({...suggestion, frequency: ['mon', 'tue', 'wed', 'thu', 'fri']})}
                  className="px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Weekdays Only
                </button>
                <button 
                  onClick={() => setSuggestion({...suggestion, frequency: ['sat', 'sun']})}
                  className="px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Weekends Only
                </button>
                <button 
                  onClick={() => setSuggestion({...suggestion, frequency: ['mon', 'wed', 'fri']})}
                  className="px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Every Other Day
                </button>
              </div>
            </div>
          )}
          
          {/* Milestones Tab */}
          {selectedTab === 'milestones' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                These milestones will help you track your progress and celebrate achievements.
              </p>
              
              {suggestion.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="w-8 h-8 flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} />
                  </div>
                  <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => handleChangeMilestone(index, 'name', e.target.value)}
                    className="flex-1 min-w-0 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                  />
                  <input
                    type="number"
                    value={milestone.value}
                    onChange={(e) => handleChangeMilestone(index, 'value', parseInt(e.target.value) || 0)}
                    className="w-16 sm:w-20 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                    min="1"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
            >
              Cancel
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSuggestion(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
              >
                Back
              </button>
              <button 
                onClick={handleAccept}
                className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <CheckCircle size={18} />
                Create Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiHabitGenerator;