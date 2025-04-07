import React, { useState } from 'react';
import { Play, X, Sparkles, Clock, Info } from 'lucide-react';
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
  const [showTooltip, setShowTooltip] = useState(null);
  
  // Function to show/hide tooltip for a specific preset
  const toggleTooltip = (presetId) => {
    if (showTooltip === presetId) {
      setShowTooltip(null);
    } else {
      setShowTooltip(presetId);
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
          Set Up Focus Session
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Step 1: Choose a Productivity Technique - Grid Layout */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Choose Technique
          </label>
          <div className="grid grid-cols-2 gap-2">
          {FOCUS_PRESETS.map(preset => (
  <div key={preset.id} className="relative">
    <button
      className={`w-full rounded-lg border text-left transition-all flex flex-col items-center p-2 sm:p-3 ${
        selectedPreset.id === preset.id
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
      onClick={() => onPresetSelect(preset)}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${preset.color} text-white mb-2`}>
        {preset.icon}
      </div>
      <div className="text-center w-full">
        <h4 className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate">
          {preset.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate h-4">
          {/* Dynamic short descriptions based on technique */}
          {preset.id === 'pomodoro' ? '25min + 5min break' :
           preset.id === 'flowtime' ? 'Natural flow tracking' :
           preset.id === '5217' ? '52min + 17min break' :
           preset.id === 'ultradian' ? '90min + 20min break' :
           preset.id === 'adhd_pomodoro' ? '10min focus periods' :
           preset.id === 'buildup' ? 'Gradually increasing focus' :
           preset.id === 'two_minute' ? 'Quick 2min intervals' :
           preset.id === 'hyperfocus' ? 'Track deep focus states' :
           preset.id === 'custom' ? 'Set your own timer' :
           preset.hasCycles ? `${Math.floor(preset.duration/60)}min cycles` : 'Custom timer'}
        </p>
      </div>
      
      <button 
        className="absolute top-1 right-1 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        onClick={(e) => {
          e.stopPropagation();
          toggleTooltip(preset.id);
        }}
      >
        <Info size={14} />
      </button>
    </button>
    
    {/* Enhanced tooltip with technique details */}
    {showTooltip === preset.id && (
      <div className="absolute z-10 mt-1 w-full sm:w-64 bg-white dark:bg-slate-700 shadow-lg rounded-lg p-3 text-xs border border-slate-200 dark:border-slate-600">
        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-1">{preset.name}</h5>
        <p className="text-slate-700 dark:text-slate-300 mb-1">
          {preset.description}
        </p>
        {preset.hasCycles && (
          <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-600">
            <p className="text-slate-600 dark:text-slate-400">
              {preset.id === 'buildup' 
                ? `Starts with ${Math.floor(preset.duration/60)}min focus, increases by 5min each cycle`
                : `${Math.floor(preset.duration/60)}min focus + ${Math.floor(preset.restDuration/60)}min break`}
            </p>
            {preset.longRestDuration && preset.longBreakAfter && (
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Longer ${Math.floor(preset.longRestDuration/60)}min break after every ${preset.longBreakAfter} cycles
              </p>
            )}
          </div>
        )}
      </div>
    )}
  </div>
))}
          </div>
        </div>
        
        {/* Step 2: Configure Your Timer - Simplified */}
        {(selectedPreset.id === 'custom' || timerType !== 'countdown') && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Timer Settings
            </label>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 sm:p-3 transition-colors">
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    timerType === 'countdown'
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => setTimerType('countdown')}
                >
                  Countdown
                </button>
                <button
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    timerType === 'countup'
                      ? 'bg-blue-500 dark:bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => setTimerType('countup')}
                >
                  Stopwatch
                </button>
                <button
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
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
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Duration: {customDuration} min
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">5</span>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={customDuration}
                      onChange={(e) => onCustomDurationChange(parseInt(e.target.value))}
                      className="flex-grow h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">120</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[15, 25, 30, 45, 60, 90].map(duration => (
                      <button
                        key={duration}
                        onClick={() => onCustomDurationChange(duration)}
                        className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                          customDuration === duration
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {timerType === 'until' && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Focus until:
                  </label>
                  <input
                    type="time"
                    value={untilTime}
                    onChange={(e) => onUntilTimeChange(e.target.value)}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200 text-sm"
                  />
                </div>
              )}
              
              {timerType === 'countup' && (
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <div className="flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span>Counts up until manually stopped</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 3: Focus Objective - Simplified */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Focus Objective
          </label>
          <input
            type="text"
            placeholder="What are you focusing on?"
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        {/* Step 4: Select Tasks */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Select Tasks (optional)
          </label>
          <FocusTaskSelector
            selectedTasks={selectedTasks}
            onTasksChange={onTasksChange}
          />
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
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
          Start Session
        </button>
      </div>
    </div>
  );
};

export default FocusForm;