import React from 'react';
import { Play, X, Sparkles, Clock } from 'lucide-react';
import FocusTaskSelector from './FocusTaskSelector';

const FocusForm = ({ 
  onCancel, 
  onSave, 
  selectedPreset, 
  onPresetSelect, 
  timerType, 
  setTimerType, 
  customDuration, 
  onCustomDurationChange, 
  untilTime, 
  onUntilTimeChange, 
  objective, 
  onObjectiveChange, 
  selectedTasks,
  onTasksChange,
  FOCUS_PRESETS
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
          Set Up Your Focus Session
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Step 1: Choose a Productivity Technique */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Choose a Productivity Technique
          </label>
          <div className="grid grid-cols-1 gap-3">
            {FOCUS_PRESETS.map(preset => (
              <button
                key={preset.id}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedPreset.id === preset.id
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
                onClick={() => onPresetSelect(preset)}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br ${preset.color} text-white`}>
                    {preset.icon}
                  </div>
                  <div className="ml-3 flex-grow min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white transition-colors text-sm sm:text-base truncate">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors line-clamp-2 break-words">
                      {preset.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Step 2: Configure Your Timer */}
        {(selectedPreset.id === 'custom' || timerType !== 'countdown') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Configure Your Timer
            </label>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4 transition-colors">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    timerType === 'countdown'
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => setTimerType('countdown')}
                >
                  Countdown
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    timerType === 'countup'
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => setTimerType('countup')}
                >
                  Stopwatch
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    timerType === 'until'
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => setTimerType('until')}
                >
                  Until Time
                </button>
              </div>
              
              {timerType === 'countdown' && selectedPreset.id === 'custom' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration: {customDuration} minutes
                  </label>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400">5m</span>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={customDuration}
                      onChange={(e) => onCustomDurationChange(parseInt(e.target.value))}
                      className="flex-grow h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">120m</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[15, 25, 30, 45, 60, 90].map(duration => (
                      <button
                        key={duration}
                        onClick={() => onCustomDurationChange(duration)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          customDuration === duration
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {duration}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {timerType === 'until' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Focus until what time?
                  </label>
                  <input
                    type="time"
                    value={untilTime}
                    onChange={(e) => onUntilTimeChange(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}
              
              {timerType === 'countup' && (
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="flex items-center gap-2 text-xs sm:text-sm">
                    <Sparkles size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span>Stopwatch mode will count up until you manually end your session.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 3: Focus Objective */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            What are you focusing on today?
          </label>
          <input
            type="text"
            placeholder="What's your main objective for this focus session?"
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        {/* Step 4: Select Tasks */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Select tasks to focus on (optional)
          </label>
          <FocusTaskSelector
            selectedTasks={selectedTasks}
            onTasksChange={onTasksChange}
          />
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6 pt-3 border-t border-slate-200 dark:border-slate-700">
        <button 
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 text-sm text-center"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={onSave}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
        >
          <Play size={16} />
          Start Focus Session
        </button>
      </div>
    </div>
  );
};

export default FocusForm;