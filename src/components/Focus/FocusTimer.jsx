import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Maximize, Minimize, Zap, Check, Clock, Settings, Bell, SkipForward, X } from 'lucide-react';
import FocusTaskSelector from './FocusTaskSelector';
import FocusSessionComplete from './FocusSessionComplete';
import { getTimerPresets } from '../../utils/focusUtils';

const FocusTimer = ({ onSessionComplete, lastSession, isFullscreen, toggleFullscreen }) => {
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerMode, setTimerMode] = useState('countdown'); // 'countdown' or 'countup'
  const [totalDuration, setTotalDuration] = useState(25 * 60); // Default: 25 minutes
  const [presetName, setPresetName] = useState('pomodoro');
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  
  // Selected tasks for the session
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  // Timer interval ref
  const timerRef = useRef(null);
  
  // Animation frame for smoother visual timer
  const requestRef = useRef(null);
  const previousTimeRef = useRef(0);
  
  // Audio elements
  const startSound = useRef(null);
  const endSound = useRef(null);
  
  // Timer presets (loaded from storage)
  const [presets, setPresets] = useState([]);
  
  useEffect(() => {
    // Load timer presets
    const loadedPresets = getTimerPresets();
    setPresets(loadedPresets);
  }, []);
  
  // Set up audio elements
  useEffect(() => {
    startSound.current = new Audio('/sounds/timer-start.mp3');
    endSound.current = new Audio('/sounds/timer-end.mp3');
    
    // Clean up audio elements on unmount
    return () => {
      startSound.current = null;
      endSound.current = null;
    };
  }, []);
  
  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (timerMode === 'countdown') {
            // For countdown timer
            if (prevSeconds <= 1) {
              clearInterval(timerRef.current);
              handleTimerComplete();
              return 0;
            }
            return prevSeconds - 1;
          } else {
            // For countup timer
            return prevSeconds + 1;
          }
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timerMode]);
  
  // Handle timer completion
  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play the end sound
    if (endSound.current) {
      endSound.current.play().catch(e => console.log('Error playing sound:', e));
    }
    
    // Show session completion screen
    setShowSessionComplete(true);
  };
  
  // Handle session submission
  const handleSessionSubmit = (completedData) => {
    // Create session data
    const sessionData = {
      duration: timerMode === 'countdown' ? totalDuration - seconds : seconds,
      totalDuration: timerMode === 'countdown' ? totalDuration : 0,
      tasks: completedData.tasks,
      startTime: new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      preset: presetName,
      notes: completedData.notes
    };
    
    // Call the onSessionComplete callback
    onSessionComplete(sessionData);
    
    // Reset the timer
    resetTimer();
    setShowSessionComplete(false);
  };
  
  // Manually end the session
  const handleManualEnd = () => {
    if (seconds > 60) { // Only count sessions longer than 1 minute
      setIsRunning(false);
      setShowSessionComplete(true);
    } else {
      resetTimer();
    }
  };
  
  // Start or pause the timer
  const toggleTimer = () => {
    if (!isRunning) {
      // If starting the timer, play the start sound
      if (startSound.current) {
        startSound.current.play().catch(e => console.log('Error playing sound:', e));
      }
    }
    setIsRunning(!isRunning);
  };
  
  // Reset the timer
  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'countdown') {
      setSeconds(totalDuration);
    } else {
      setSeconds(0);
    }
  };
  
  // Apply a timer preset
  const applyPreset = (presetKey) => {
    if (isRunning) {
      // Don't change presets while running
      return;
    }
    
    const preset = presets.find(p => p.key === presetKey);
    if (preset) {
      setPresetName(preset.key);
      setTimerMode(preset.mode || 'countdown');
      setTotalDuration(preset.duration);
      if (preset.mode === 'countdown') {
        setSeconds(preset.duration);
      } else {
        setSeconds(0);
      }
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage for countdown mode
  const getProgressPercentage = () => {
    if (timerMode === 'countdown') {
      return ((totalDuration - seconds) / totalDuration) * 100;
    } else {
      // For countup, cap at 100% after 50 minutes as a visual guide
      const maxDuration = 50 * 60; // 50 minutes
      return Math.min((seconds / maxDuration) * 100, 100);
    }
  };
  
  // Early return for session complete screen
  if (showSessionComplete) {
    return <FocusSessionComplete 
      duration={timerMode === 'countdown' ? totalDuration - seconds : seconds}
      tasks={selectedTasks}
      onSubmit={handleSessionSubmit}
      onCancel={() => setShowSessionComplete(false)}
    />;
  }
  
  return (
    <div className={`focus-timer ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="flex flex-col items-center justify-center">
        {/* Timer Display */}
        <div className="relative mb-8 w-64 h-64 sm:w-80 sm:h-80">
          {/* Progress Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="currentColor" 
              className="text-slate-100 dark:text-slate-700"
              strokeWidth="6"
            />
            {/* Progress Circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="currentColor" 
              className="text-blue-500 dark:text-blue-400"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * getProgressPercentage() / 100)}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-in-out'
              }}
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl sm:text-6xl font-bold text-slate-800 dark:text-slate-100 transition-colors">
              {formatTime(seconds)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 transition-colors">
              <Clock size={14} />
              <span>{presetName.charAt(0).toUpperCase() + presetName.slice(1)}</span>
            </div>
            
            {/* Show selected task(s) */}
            {selectedTasks.length > 0 && (
              <div className="mt-4 max-w-full overflow-hidden">
                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center gap-1 transition-colors overflow-hidden">
                  <Check size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-blue-700 dark:text-blue-300 truncate">
                    {selectedTasks.length === 1 
                      ? selectedTasks[0].text 
                      : `${selectedTasks.length} tasks selected`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Timer Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={resetTimer}
            disabled={isRunning}
            className={`p-3 rounded-full transition-colors ${
              isRunning 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <RotateCw size={20} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="p-4 rounded-full bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          
          {isRunning && (
            <button 
              onClick={handleManualEnd}
              className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
              title="End session"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Timer Presets - Only show in non-running state and non-fullscreen mode */}
        {!isRunning && !isFullscreen && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-8 w-full max-w-lg">
            <button 
              onClick={() => applyPreset('pomodoro')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                presetName === 'pomodoro' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Pomodoro
            </button>
            
            <button 
              onClick={() => applyPreset('shortBreak')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                presetName === 'shortBreak' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Short Break
            </button>
            
            <button 
              onClick={() => applyPreset('longBreak')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                presetName === 'longBreak' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Long Break
            </button>
            
            <button 
              onClick={() => applyPreset('custom')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                presetName === 'custom' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              } hidden sm:block`}
            >
              Custom
            </button>
            
            <button 
              onClick={() => applyPreset('stopwatch')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                presetName === 'stopwatch' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              } hidden sm:block`}
            >
              Stopwatch
            </button>
          </div>
        )}
        
        {/* Task Selection - Only show in non-running state and non-fullscreen mode */}
        {!isRunning && !isFullscreen && (
          <div className="mt-8 w-full max-w-lg">
            <FocusTaskSelector 
              selectedTasks={selectedTasks}
              onTasksChange={setSelectedTasks}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;