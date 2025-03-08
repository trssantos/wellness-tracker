import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, X, Clock, Target, ListChecks, Maximize, 
  Minimize, CheckSquare, Calendar, BarChart2, History, 
  Award, SaveAll, Sparkles, Moon, Sun, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import FocusTaskSelector from '../Focus/FocusTaskSelector';
import FocusAnalytics from '../Focus/FocusAnalytics';
import FocusHistory from '../Focus/FocusHistory';
import { getStorage, setStorage } from '../../utils/storage';

// Productivity technique presets
const FOCUS_PRESETS = [
  { 
    id: 'pomodoro', 
    name: 'Pomodoro Technique', 
    description: 'Focus for 25 minutes, then take a 5-minute break. After 4 rounds, take a longer break.',
    duration: 25 * 60,
    color: 'from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600',
    icon: <Clock />
  },
  { 
    id: 'flowtime', 
    name: 'Flowtime', 
    description: 'Work until your focus naturally wanes, then take a proportionate break (1:5 ratio).',
    duration: 0, // stopwatch mode
    color: 'from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600',
    icon: <Target />
  },
  { 
    id: '5217', 
    name: '52/17 Method', 
    description: 'Work for 52 minutes then rest for 17 minutes for optimal productivity.',
    duration: 52 * 60,
    color: 'from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600',
    icon: <Moon />
  },
  { 
    id: 'desktime', 
    name: '90-Minute Focus', 
    description: 'Based on natural ultradian rhythms - focus for 90 minutes, then rest for 20.',
    duration: 90 * 60,
    color: 'from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600',
    icon: <Sun />
  },
  { 
    id: 'custom', 
    name: 'Custom Timer', 
    description: 'Set your own duration and approach.',
    duration: 30 * 60,
    color: 'from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700',
    icon: <Clock />
  }
];

const FocusSection = () => {
  // Main states
  const [activeTab, setActiveTab] = useState('focus'); // focus, analytics, history
  const [setupMode, setSetupMode] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Setup states
  const [selectedPreset, setSelectedPreset] = useState(FOCUS_PRESETS[0]);
  const [objective, setObjective] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [timerType, setTimerType] = useState('countdown'); // countdown, countup, until
  const [untilTime, setUntilTime] = useState('');
  const [customDuration, setCustomDuration] = useState(25);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_PRESETS[0].duration);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(null);
  
  // Completion states
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [focusRating, setFocusRating] = useState(3);
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Session history
  const [sessionHistory, setSessionHistory] = useState([]);
  
  // Refs
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  // Timer progress circle animation
  const progressAnimation = useSpring({
    strokeDashoffset: timerType === 'countdown' 
      ? 283 - (283 * ((selectedPreset.duration - timeRemaining) / selectedPreset.duration))
      : 283 - (283 * Math.min(elapsedTime / (2 * 60 * 60), 1)), // Cap at 2 hours for countup
    config: { tension: 280, friction: 120 }
  });
  
  // Load session history on mount
  useEffect(() => {
    const storage = getStorage();
    if (storage.focusSessions) {
      setSessionHistory(storage.focusSessions);
    }
    
    // Initialize audio
    audioRef.current = new Audio('/sounds/timer-complete.mp3');
    
    return () => {
      // Clean up
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle timer tick
  useEffect(() => {
    if (focusActive && !isPaused) {
      timerRef.current = setInterval(() => {
        if (timerType === 'countdown') {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Timer complete
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        } else if (timerType === 'countup') {
          setElapsedTime(prev => prev + 1);
        } else if (timerType === 'until') {
          // Calculate time remaining until target time
          const now = new Date();
          const target = new Date();
          const [hours, minutes] = untilTime.split(':');
          target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          // If target is in the past, add 24 hours
          if (target < now) {
            target.setDate(target.getDate() + 1);
          }
          
          const diff = Math.max(0, Math.floor((target - now) / 1000));
          setTimeRemaining(diff);
          
          if (diff <= 1) {
            handleTimerComplete();
          }
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [focusActive, isPaused, timerType, untilTime]);
  
  // Handle timer complete
  const handleTimerComplete = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Play audio
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
    }
    
    // Vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Show notification if supported
    if (Notification.permission === 'granted') {
      new Notification('Focus Session Complete', {
        body: 'Your focus session has ended. Great job!',
        icon: '/logo192.png'
      });
    }
    
    setSessionComplete(true);
  };
  
  // Start new focus session
  const startFocusSession = () => {
    // Calculate duration if "until" mode
    if (timerType === 'until' && untilTime) {
      const now = new Date();
      const target = new Date();
      const [hours, minutes] = untilTime.split(':');
      target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If target is in the past, add 24 hours
      if (target < now) {
        target.setDate(target.getDate() + 1);
      }
      
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setTimeRemaining(diff);
    } else if (timerType === 'countdown') {
      // Use preset duration or custom
      if (selectedPreset.id === 'custom') {
        setTimeRemaining(customDuration * 60);
      } else {
        setTimeRemaining(selectedPreset.duration);
      }
    } else {
      // Countup starts at 0
      setElapsedTime(0);
    }
    
    setTimerStartTime(new Date());
    setFocusActive(true);
    setSetupMode(false);
  };
  
  // Pause/resume focus session
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  
  // End focus session
  const endFocusSession = () => {
    setSessionComplete(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Safely exit fullscreen if active
    if (isFullscreen) {
      try {
        exitFullscreen();
      } catch (err) {
        console.error('Error exiting fullscreen:', err);
        // Just update the state even if the API fails
        setIsFullscreen(false);
      }
    }
  };

  // 4. Add fullscreen change event listener to keep our state in sync with browser
useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  
  // Save completed session
  const saveSession = () => {
    // Calculate duration
    const duration = timerType === 'countdown' 
      ? selectedPreset.duration - timeRemaining
      : elapsedTime;
    
    // Get completed tasks
    const completedTasks = selectedTasks.filter(task => 
      completedTaskIds.includes(task.id)
    );
    
    // Create session record
    const sessionData = {
      id: `focus-${Date.now()}`,
      startTime: timerStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      technique: selectedPreset.id,
      duration,
      objective,
      tasks: completedTasks,
      rating: focusRating,
      notes: sessionNotes,
      taskTimeData: selectedTasks.map(task => ({
        id: task.id,
        text: task.text,
        completed: completedTaskIds.includes(task.id),
        timeSpent: duration / selectedTasks.length // Divide time equally among tasks
      }))
    };
    
    // Update tasks in storage
    const storage = getStorage();
    
    // Group tasks by date
    const tasksByDate = {};
    completedTasks.forEach(task => {
      if (!tasksByDate[task.date]) {
        tasksByDate[task.date] = [];
      }
      tasksByDate[task.date].push(task.text);
    });
    
    // Update checked status
    Object.entries(tasksByDate).forEach(([date, tasks]) => {
      if (!storage[date]) {
        storage[date] = {};
      }
      
      if (!storage[date].checked) {
        storage[date].checked = {};
      }
      
      tasks.forEach(task => {
        storage[date].checked[task] = true;
      });
    });
    
    // Save session to history
    if (!storage.focusSessions) {
      storage.focusSessions = [];
    }
    
    storage.focusSessions.push(sessionData);
    setStorage(storage);
    
    // Update local session history
    setSessionHistory([...sessionHistory, sessionData]);
    
    // Reset all states
    resetStates();
  };
  
  // Discard session
  const discardSession = () => {
    resetStates();
  };
  
  // Reset all states
  const resetStates = () => {
    setFocusActive(false);
    setSessionComplete(false);
    setIsPaused(false);
    setTimeRemaining(selectedPreset.duration);
    setElapsedTime(0);
    setCompletedTaskIds([]);
    setFocusRating(3);
    setSessionNotes('');
    setObjective('');
    setSelectedTasks([]);
  };
  
  // Enter fullscreen
  const enterFullscreen = () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
        setIsFullscreen(true);
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Failed to enter fullscreen mode:', err);
    }
  };
  
  // Exit fullscreen
  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement || 
          document.webkitFullscreenElement || 
          document.mozFullScreenElement ||
          document.msFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            setIsFullscreen(false);
          }).catch(err => {
            console.error('Error attempting to exit fullscreen:', err);
            // Force state update even if the API call fails
            setIsFullscreen(false);
          });
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
          setIsFullscreen(false);
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
          setIsFullscreen(false);
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
          setIsFullscreen(false);
        }
      } else {
        // If we're not actually in fullscreen mode, just update the state
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Failed to exit fullscreen mode:', err);
      // Force state update even if there's an error
      setIsFullscreen(false);
    }
  };
  
  
  // Format time from seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };
  
  // Toggle task completion in the review screen
  const toggleTaskCompletion = (taskId) => {
    if (completedTaskIds.includes(taskId)) {
      setCompletedTaskIds(prev => prev.filter(id => id !== taskId));
    } else {
      setCompletedTaskIds(prev => [...prev, taskId]);
    }
  };
  
  // Handle custom duration slider change
  const handleCustomDurationChange = (e) => {
    setCustomDuration(parseInt(e.target.value));
  };
  
  // Update preset selection - adjust duration if needed
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    if (preset.duration === 0) {
      // This is a stopwatch preset
      setTimerType('countup');
    } else {
      setTimerType('countdown');
      setTimeRemaining(preset.duration);
    }
  };
  
  // Handle until time change
  const handleUntilTimeChange = (e) => {
    setUntilTime(e.target.value);
  };
  
  // Calculate current time for default "until" value
  const getCurrentTimeRounded = () => {
    const now = new Date();
    const hours = now.getHours();
    let minutes = now.getMinutes();
    
    // Round up to nearest 15 minutes
    minutes = Math.ceil(minutes / 15) * 15;
    if (minutes === 60) {
      minutes = 0;
      now.setHours(hours + 1);
    }
    
    return `${now.getHours().toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // On first render, initialize "until" time
  useEffect(() => {
    setUntilTime(getCurrentTimeRounded());
  }, []);

  // Render active focus session
  const renderFocusSession = () => {
    return (
      <div className={`focus-session w-full h-full flex flex-col items-center justify-center ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className={`relative w-full ${isFullscreen ? 'h-screen flex flex-col items-center justify-center' : ''}`}>
          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center mb-8">
            {objective && (
              <div className="mb-4 text-center">
                <h3 className={`font-medium ${isFullscreen ? 'text-white text-xl mb-2' : 'text-slate-800 dark:text-slate-200'}`}>
                  {objective}
                </h3>
                <div className={`text-sm ${isFullscreen ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {selectedPreset.name}
                </div>
              </div>
            )}
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={isFullscreen ? 'rgba(255,255,255,0.2)' : 'currentColor'}
                  className={isFullscreen ? '' : 'text-slate-100 dark:text-slate-700'}
                  strokeWidth="6"
                />
                <animated.circle 
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={isFullscreen ? 'white' : 'currentColor'}
                  className={isFullscreen ? '' : 'text-blue-500 dark:text-blue-400'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={progressAnimation.strokeDashoffset}
                />
              </svg>
              
              {/* Time display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div 
                  className={`text-6xl sm:text-7xl font-bold ${isFullscreen ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}
                  key={isPaused ? 'paused' : 'running'}
                  animate={isPaused ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: isPaused ? Infinity : 0, ease: "easeInOut" }}
                >
                  {timerType === 'countdown' || timerType === 'until' 
                    ? formatTime(timeRemaining) 
                    : formatTime(elapsedTime)}
                </motion.div>
                
                {sessionComplete && (
                  <motion.div 
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-full font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    Session Complete!
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {!sessionComplete && (
              <>
                {isPaused ? (
                  <motion.button
                    onClick={togglePause}
                    className="p-4 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play size={24} fill="currentColor" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={togglePause}
                    className="p-4 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Pause size={24} />
                  </motion.button>
                )}
                
                <motion.button
                  onClick={endFocusSession}
                  className="p-4 rounded-full bg-red-500 dark:bg-red-600 text-white shadow-lg shadow-red-500/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </>
            )}
            
            {sessionComplete && (
              <motion.button
                onClick={endFocusSession}
                className="px-6 py-3 bg-green-500 dark:bg-green-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/20 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <CheckSquare size={20} />
                <span>Complete Session</span>
              </motion.button>
            )}
          </div>
          
          {/* Fullscreen Toggle */}
          <div className="absolute top-4 right-4">
            <motion.button
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              className={`p-2 rounded-full ${
                isFullscreen 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              } transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </motion.button>
          </div>
          
          {/* Selected Tasks */}
          {!isFullscreen && selectedTasks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 max-w-lg mx-auto">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <ListChecks size={18} className="text-blue-500 dark:text-blue-400" />
                <span>Tasks ({selectedTasks.length})</span>
              </h3>
              
              <div className="max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-700">
                {selectedTasks.map(task => (
                  <div 
                    key={task.id}
                    className="py-2 flex items-center"
                  >
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{task.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Fullscreen tasks display */}
          {isFullscreen && selectedTasks.length > 0 && (
            <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-xl p-4 max-w-xs">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <ListChecks size={18} />
                <span>Focus Tasks</span>
              </h3>
              <div className="space-y-3">
                {selectedTasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center text-white/90"
                  >
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span className="text-sm">{task.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render session completion screen
  const renderSessionComplete = () => {
    // Calculate session duration
    const duration = timerType === 'countdown' 
      ? selectedPreset.duration - timeRemaining
      : timerType === 'until'
        ? 0 // TODO: Calculate actual duration for "until" mode
        : elapsedTime;
    
    return (
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Focus Session Complete!</h2>
              <p className="text-blue-100">
                You focused for {formatTime(duration)}
              </p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full flex items-center">
              <Award size={16} className="mr-1" />
              <span>Great job!</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Focus rating */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">
              How was your focus?
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Low</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <motion.button
                    key={rating}
                    onClick={() => setFocusRating(rating)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      focusRating >= rating 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    } transition-colors`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star size={24} fill={focusRating >= rating ? 'currentColor' : 'none'} />
                  </motion.button>
                ))}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">High</span>
            </div>
          </div>
          
          {/* Completed tasks section */}
          {selectedTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">
                Did you complete any tasks?
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {selectedTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      completedTaskIds.includes(task.id)
                        ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                        : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className={`
                      w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors
                      ${completedTaskIds.includes(task.id) 
                        ? 'bg-green-500 dark:bg-green-600 text-white' 
                        : 'border border-slate-300 dark:border-slate-500'}
                    `}>
                      {completedTaskIds.includes(task.id) && <CheckSquare size={12} />}
                    </div>
                    <span className={`text-sm ${
                      completedTaskIds.includes(task.id)
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Session notes */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">
              Session Notes (optional)
            </h3>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="What did you accomplish? How was your focus? Any insights?"
              className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-between">
            <motion.button
              onClick={discardSession}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Discard Session
            </motion.button>
            
            <motion.button
              onClick={saveSession}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SaveAll size={20} />
              <span>Save Session</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Render setup modal for new focus session
  const renderSetupModal = () => {
    return (
      <motion.div 
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSetupMode(false)}
      >
        <motion.div 
          className="bg-white dark:bg-slate-800 rounded-2xl w-[90%] max-w-2xl max-h-[90vh] shadow-xl m-auto flex flex-col"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header - Fixed at top */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-2xl sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Set Up Your Focus Session
              </h2>
              <button 
                onClick={() => setSetupMode(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 overscroll-contain">
            {/* Step 1: Select Productivity Technique */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Choose a Productivity Technique
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FOCUS_PRESETS.map(preset => (
                  <motion.button
                    key={preset.id}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPreset.id === preset.id
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                    onClick={() => handlePresetSelect(preset)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-10 h-10 mb-2 rounded-full flex items-center justify-center bg-gradient-to-br ${preset.color} text-white`}>
                      {preset.icon}
                    </div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {preset.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Step 2: Timer Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Configure Your Timer
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      timerType === 'countdown'
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setTimerType('countdown')}
                  >
                    Countdown
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      timerType === 'countup'
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setTimerType('countup')}
                  >
                    Stopwatch
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      timerType === 'until'
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setTimerType('until')}
                  >
                    Until Specific Time
                  </button>
                </div>
                
                {timerType === 'countdown' && selectedPreset.id === 'custom' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Duration: {customDuration} minutes
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">5m</span>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={customDuration}
                        onChange={handleCustomDurationChange}
                        className="flex-grow h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-xs text-slate-500">120m</span>
                    </div>
                    
                    {/* Preset quick buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[15, 25, 30, 45, 60, 90].map(duration => (
                        <button
                          key={duration}
                          onClick={() => setCustomDuration(duration)}
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
                      onChange={handleUntilTimeChange}
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {timerType === 'countup' && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-500" />
                      <span>Stopwatch mode will count up until you manually end your session.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Step 3: Focus Objective and Tasks */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                What are you focusing on today?
              </h3>
              
              <input
                type="text"
                placeholder="What's your main objective for this focus session?"
                value={objective}
                onChange={e => setObjective(e.target.value)}
                className="w-full px-4 py-3 mb-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Select tasks to focus on (optional)
              </h3>
              
              <FocusTaskSelector
                selectedTasks={selectedTasks}
                onTasksChange={setSelectedTasks}
              />
            </div>
          </div>
          
          {/* Footer - Fixed at bottom */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl sticky bottom-0 z-10">
            <div className="flex justify-end">
              <motion.button
                onClick={startFocusSession}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={20} />
                <span>Start Focus Session</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    if (focusActive || sessionComplete) {
      return (
        <AnimatePresence mode="wait">
          {sessionComplete ? (
            <motion.div
              key="session-complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex items-center justify-center"
            >
              {renderSessionComplete()}
            </motion.div>
          ) : (
            <motion.div
              key="active-session"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex items-center justify-center"
            >
              {renderFocusSession()}
            </motion.div>
          )}
        </AnimatePresence>
      );
    }
    
    switch (activeTab) {
      case 'analytics':
        return <FocusAnalytics sessions={sessionHistory} />;
      case 'history':
        return <FocusHistory sessions={sessionHistory} />;
      case 'focus':
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center py-10">
            <motion.button
              onClick={() => setSetupMode(true)}
              className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 mx-auto mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={48} fill="currentColor" />
            </motion.button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Start a Focus Session
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-center">
              Boost your productivity with focused time blocks. Track your progress and build better work habits.
            </p>
          </div>
        );
    }
  };
  
  // Fullscreen session styles
  const fullscreenStyles = isFullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'black',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  } : {};
  
  // Render fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black text-white z-[9999] flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col items-center justify-center p-6">
          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center mb-8">
            {objective && (
              <div className="mb-4 text-center">
                <h3 className="text-white text-xl mb-2 font-medium">
                  {objective}
                </h3>
                <div className="text-white/80 text-sm">
                  {selectedPreset.name}
                </div>
              </div>
            )}
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                />
                <animated.circle 
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={progressAnimation.strokeDashoffset}
                />
              </svg>
              
              {/* Time display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div 
                  className="text-6xl sm:text-7xl font-bold text-white"
                  key={isPaused ? 'paused' : 'running'}
                  animate={isPaused ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: isPaused ? Infinity : 0, ease: "easeInOut" }}
                >
                  {timerType === 'countdown' || timerType === 'until' 
                    ? formatTime(timeRemaining) 
                    : formatTime(elapsedTime)}
                </motion.div>
                
                {sessionComplete && (
                  <motion.div 
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-full font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    Session Complete!
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {!sessionComplete && (
              <>
                {isPaused ? (
                  <motion.button
                    onClick={togglePause}
                    className="p-4 rounded-full bg-blue-500 text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play size={24} fill="currentColor" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={togglePause}
                    className="p-4 rounded-full bg-blue-500 text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Pause size={24} />
                  </motion.button>
                )}
                
                <motion.button
                  onClick={endFocusSession}
                  className="p-4 rounded-full bg-red-500 text-white shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </>
            )}
            
            {sessionComplete && (
              <motion.button
                onClick={endFocusSession}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <CheckSquare size={20} />
                <span>Complete Session</span>
              </motion.button>
            )}
          </div>
          
          {/* Fullscreen Exit Button */}
          <div className="absolute top-4 right-4">
            <motion.button
              onClick={exitFullscreen}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Minimize size={20} />
            </motion.button>
          </div>
          
          {/* Selected Tasks */}
          {selectedTasks.length > 0 && (
            <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-xl p-4 max-w-xs">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <ListChecks size={18} />
                <span>Focus Tasks</span>
              </h3>
              <div className="space-y-3">
                {selectedTasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center text-white/90"
                  >
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span className="text-sm">{task.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* ESC to exit fullscreen notice */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white/70">
            Press <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1 font-mono">Esc</kbd> to exit full screen
          </div>
        </div>
      </div>
    );
  }
  
  // Main component render
  return (
    <div className="focus-section w-full h-full flex flex-col">
      {/* Navigation tabs - hidden during active session or completion */}
      {!focusActive && !sessionComplete && (
        <div className="bg-white dark:bg-slate-800 rounded-t-xl shadow-sm border-x border-t border-slate-200 dark:border-slate-700 transition-colors w-full">
          <div className="flex border-b border-slate-200 dark:border-slate-700 transition-colors">
            <button
              onClick={() => setActiveTab('focus')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'focus'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Focus
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Analytics
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              History
            </button>
          </div>
        </div>
      )}
      
      {/* Content area - make it flex-grow to fill available space */}
      <div className={`flex-grow bg-white dark:bg-slate-800 ${!focusActive && !sessionComplete ? 'rounded-b-xl' : 'rounded-xl'} shadow-sm border-x border-b border-slate-200 dark:border-slate-700 p-6 transition-colors overflow-auto`}>
        {renderTabContent()}
      </div>
      
      {/* Setup modal */}
      <AnimatePresence>
        {setupMode && renderSetupModal()}
      </AnimatePresence>
      
      {/* Global styles for animations */}
      <style jsx global>{`
        .fullscreen {
          background-color: black;
          color: white;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .pulse {
          animation: pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FocusSection;