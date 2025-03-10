import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, X, AlertTriangle, Clock, Target, ListChecks, Maximize, 
  Minimize, CheckSquare, Calendar, BarChart2, History, 
  Award, SaveAll, Sparkles, Moon, Sun, Star, Flag, Lightbulb, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import ReactDOM from 'react-dom';
import FocusTaskSelector from '../Focus/FocusTaskSelector';
import FocusAnalytics from '../Focus/FocusAnalytics';
import FocusHistory from '../Focus/FocusHistory';
import FocusSessionComplete from '../Focus/FocusSessionComplete';
import FocusNatureBackground from '../Focus/FocusNatureBackground';
import { getStorage, setStorage } from '../../utils/storage';
import { loadFocusSessionState, saveFocusSessionState, clearFocusSessionState} from '../../utils/FocusSessionState';
import FocusForm from '../Focus/FocusForm';
import AnimatedPlayButton from '../Focus/AnimatedPlayButton';

// Import the CSS file for nature animations
import '../Focus/focusNature.css';

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

const FocusSection = ({ onFullscreenChange }) => {
  // Main state variables
  const [activeTab, setActiveTab] = useState('focus'); // focus, analytics, history
  const [focusActive, setFocusActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // View state variables (similar to HabitSection pattern)
  const [isSetupMode, setIsSetupMode] = useState(false);
  
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
  
  // Interruption tracking
  const [interruptionsCount, setInterruptionsCount] = useState(0);
  const [totalPauseDuration, setTotalPauseDuration] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState(null);
  
  // Auto-save ref
  const autoSaveIntervalRef = useRef(null);
  
  // Completion states
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [focusRating, setFocusRating] = useState(3);
  const [sessionNotes, setSessionNotes] = useState('');

  // Modal states
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false);
  const [selectedTaskToComplete, setSelectedTaskToComplete] = useState(null);
  const [tasksTimingData, setTasksTimingData] = useState({});
  
  // Session history
  const [sessionHistory, setSessionHistory] = useState([]);
  
  // Refs
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Create a ref to check if this is the first render
  const isFirstRender = useRef(true);
  
  // Timer progress circle animation
  const progressAnimation = useSpring({
    strokeDashoffset: timerType === 'countdown' 
      ? 283 - (283 * ((selectedPreset.duration - timeRemaining) / selectedPreset.duration))
      : 283 - (283 * Math.min(elapsedTime / (2 * 60 * 60), 1)), // Cap at 2 hours for countup
    config: { tension: 280, friction: 120 }
  });

  // Use this to expose the current focus state to the parent component
  useEffect(() => {
    // Only update window.currentFocusState if we have an active session
    if (focusActive) {
      window.currentFocusState = {
        focusActive,
        sessionComplete,
        isPaused,
        timeRemaining,
        elapsedTime,
        timerType,
        selectedPreset,
        objective,
        selectedTasks,
        completedTaskIds,
        tasksTimingData,
        timerStartTime: timerStartTime?.toISOString(),
        untilTime,
        interruptionsCount,
        totalPauseDuration,
        lastPauseTime: lastPauseTime?.toISOString()
      };
      
      console.log('Updated window.currentFocusState with active session data');
    }
  }, [
    focusActive, sessionComplete, isPaused, timeRemaining, elapsedTime, 
    timerType, selectedPreset, objective, selectedTasks, completedTaskIds, 
    tasksTimingData, timerStartTime, untilTime, interruptionsCount, totalPauseDuration, lastPauseTime
  ]);
  
  // Load saved session on first render
  useEffect(() => {
    if (isFirstRender.current) {
      console.log('First render, checking for saved session state');
      const savedState = loadFocusSessionState();
      
      if (savedState && savedState.focusActive) {
        console.log('Found saved session state, restoring...');
        
        // Restore all session state
        setFocusActive(savedState.focusActive);
        setSessionComplete(savedState.sessionComplete);
        setIsPaused(savedState.isPaused);
        setTimeRemaining(savedState.timeRemaining);
        setElapsedTime(savedState.elapsedTime);
        setTimerType(savedState.timerType);
        setSelectedPreset(savedState.selectedPreset);
        setObjective(savedState.objective);
        setSelectedTasks(savedState.selectedTasks || []);
        setCompletedTaskIds(savedState.completedTaskIds || []);
        setTasksTimingData(savedState.tasksTimingData || {});
        setInterruptionsCount(savedState.interruptionsCount || 0);
        setTotalPauseDuration(savedState.totalPauseDuration || 0);
        
        if (savedState.lastPauseTime) {
          setLastPauseTime(new Date(savedState.lastPauseTime));
        }
        
        if (savedState.timerStartTime) {
          setTimerStartTime(new Date(savedState.timerStartTime));
        }
        
        if (savedState.untilTime) {
          setUntilTime(savedState.untilTime);
        }
        
        // Show pause modal if the session was active
        if (savedState.focusActive && !savedState.sessionComplete) {
          setTimeout(() => {
            setShowPauseModal(true);
          }, 300);
        }
        
        console.log('Session state restored successfully');
      } else {
        console.log('No saved session state found or session was not active');
      }
      
      isFirstRender.current = false;
    }
  }, []);
  
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
      
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  // Auto-save interval setup
  useEffect(() => {
    // Clear any existing interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    
    // Only set up auto-save when session is active and not paused
    if (focusActive && !isPaused && !sessionComplete) {
      console.log('Setting up auto-save interval');
      autoSaveIntervalRef.current = setInterval(() => {
        saveCurrentSessionState();
      }, 10000); // Save every 10 seconds
    }
    
    // Clean up on unmount or when dependencies change
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [focusActive, isPaused, sessionComplete]);

  // Create a function to save the current session state
  const saveCurrentSessionState = () => {
    if (focusActive && !sessionComplete) {
      console.log('Auto-saving focus session state...');
      const sessionState = {
        focusActive,
        sessionComplete,
        isPaused,
        timeRemaining,
        elapsedTime,
        timerType,
        selectedPreset,
        objective,
        selectedTasks,
        completedTaskIds,
        tasksTimingData,
        timerStartTime: timerStartTime?.toISOString(),
        untilTime,
        interruptionsCount,
        totalPauseDuration,
        lastPauseTime: lastPauseTime?.toISOString(),
        lastSaveTime: new Date().toISOString()
      };
      
      saveFocusSessionState(sessionState);
    }
  };

  // Handle navigation/section change detection
  useEffect(() => {
    const handleSectionChange = (e) => {
      // This detects clicks on the sidebar nav elements
      if (e.target.closest('button') && e.target.closest('button').closest('nav')) {
        handleNavigationAway();
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleNavigationAway();
        saveCurrentSessionState();
      }
    };
    
    // Add event listeners
    document.addEventListener('click', handleSectionChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('click', handleSectionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [focusActive, sessionComplete, isPaused]);
  
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

  // Fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      if (onFullscreenChange) onFullscreenChange(isCurrentlyFullscreen);
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
  }, [onFullscreenChange]);
  
  // On first render, initialize "until" time
  useEffect(() => {
    setUntilTime(getCurrentTimeRounded());
  }, []);

  // Function to handle navigation away
  const handleNavigationAway = () => {
    if (focusActive && !sessionComplete && !isPaused) {
      // Pause the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Update state
      setIsPaused(true);
      setLastPauseTime(new Date());
      setInterruptionsCount(prev => prev + 1);
      
      // Show modal
      setShowPauseModal(true);
      
      // Save state to localStorage
      const sessionState = {
        focusActive,
        sessionComplete,
        isPaused: true, // Force paused state when saving
        timeRemaining,
        elapsedTime,
        timerType,
        selectedPreset,
        objective,
        selectedTasks,
        completedTaskIds,
        tasksTimingData,
        timerStartTime: timerStartTime?.toISOString(),
        untilTime,
        interruptionsCount,
        totalPauseDuration,
        lastPauseTime: new Date().toISOString()
      };
      
      saveFocusSessionState(sessionState);
      console.log('Session state saved due to navigation away');
    }
  };

  // Start the timer
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
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
  };

  // Resume a paused session
  const resumeSession = () => {
    // When resuming from a pause modal, calculate pause duration and add to total
    if (lastPauseTime) {
      const pauseDuration = Math.floor((new Date() - lastPauseTime) / 1000);
      setTotalPauseDuration(prev => prev + pauseDuration);
    }
    
    setIsPaused(false);
    setShowPauseModal(false);
    startTimer();
  };

  // Function to mark a task as completed mid-session
  const markTaskAsCompleted = (taskId) => {
    const timeSpent = timerType === 'countdown' 
      ? selectedPreset.duration - timeRemaining 
      : elapsedTime;
      
    // Save the timing data
    setTasksTimingData(prev => ({
      ...prev,
      [taskId]: timeSpent
    }));
    
    // Update completed tasks
    setCompletedTaskIds(prev => [...prev, taskId]);
    
    // Close the modal
    setShowTaskCompleteModal(false);
    setSelectedTaskToComplete(null);
  };
  
  // Function to handle task click during active session
  const handleTaskClick = (taskId) => {
    if (focusActive && !sessionComplete) {
      setSelectedTaskToComplete(taskId);
      setShowTaskCompleteModal(true);
    }
  };
  
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
    
    // First, exit fullscreen if active
    // This ensures the user isn't stuck in fullscreen
    if (isFullscreen) {
      try {
        exitFullscreen();
      } catch (err) {
        console.error('Error exiting fullscreen on timer completion:', err);
        // Force update the state even if the API call fails
        setIsFullscreen(false);
        if (onFullscreenChange) onFullscreenChange(false);
      }
    }
    
    // Then set session complete
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
    
    // Reset interruption tracking
    setInterruptionsCount(0);
    setTotalPauseDuration(0);
    setLastPauseTime(null);
    
    setTimerStartTime(new Date());
    setFocusActive(true);
    
    // Exit setup mode
    setIsSetupMode(false);
    
    console.log("Starting focus session...");
  };
  
  // Pause/resume focus session with interruption tracking
  const togglePause = () => {
    if (!isPaused) {
      // When pausing, record the time and increment interruption count
      setLastPauseTime(new Date());
      setInterruptionsCount(prev => prev + 1);
      setIsPaused(true);
      
      // Save the state immediately when pausing
      saveCurrentSessionState();
    } else {
      // When resuming, calculate pause duration and add to total
      if (lastPauseTime) {
        const pauseDuration = Math.floor((new Date() - lastPauseTime) / 1000);
        setTotalPauseDuration(prev => prev + pauseDuration);
      }
      setIsPaused(false);
      startTimer();
    }
  };
  
  // End focus session early
  const finishFocusSession = () => {
    // Close the confirmation modal
    setShowFinishConfirmModal(false);
    
    // End the session
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

  // Function to calculate focus score
  const calculateFocusScore = (sessionDuration, interruptions, pauseDuration) => {
    if (sessionDuration <= 0) return 0;
    
    // Calculate the actual focus time (total session time minus pause time)
    const actualFocusTime = Math.max(0, sessionDuration - pauseDuration);
    
    // Calculate focus percentage (time actually focused vs total session time)
    const focusPercentage = (actualFocusTime / sessionDuration) * 100;
    
    // Penalize for frequent interruptions
    // Base score is the focus percentage
    let score = focusPercentage;
    
    // Subtract points for interruptions (more weight for longer sessions)
    const sessionDurationMinutes = sessionDuration / 60;
    const interruptionPenalty = interruptions * (5 + Math.min(5, sessionDurationMinutes / 15));
    
    // Final score with a minimum of 0
    return Math.max(0, Math.min(100, Math.round(score - interruptionPenalty)));
  };
  
  // Handle session submission with interruption data
  const handleSessionSubmit = (completedData) => {
    // Create session record
    const sessionData = {
      id: `focus-${Date.now()}`,
      startTime: timerStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      technique: selectedPreset.id,
      duration: timerType === 'countdown' ? selectedPreset.duration - timeRemaining : elapsedTime,
      objective,
      allTasks: selectedTasks, // Store ALL tasks
      tasks: selectedTasks.filter(task => 
        completedData.tasks && completedData.tasks.some(t => t.id === task.id)
      ), // Completed tasks
      notes: completedData.notes,
      // Add new metrics:
      interruptionsCount,
      totalPauseDuration,
      focusScore: calculateFocusScore(
        timerType === 'countdown' ? selectedPreset.duration - timeRemaining : elapsedTime,
        interruptionsCount,
        totalPauseDuration
      ),
      productivityRating: completedData.productivityRating,
      energyLevel: completedData.energyLevel,
      taskTimeData: selectedTasks.map(task => ({
        id: task.id,
        text: task.text,
        completed: completedData.tasks && completedData.tasks.some(t => t.id === task.id),
        timeSpent: tasksTimingData[task.id] || 0
      }))
    };
    
    // Update storage
    const storage = getStorage();
    
    // Save session to history
    if (!storage.focusSessions) {
      storage.focusSessions = [];
    }
    
    storage.focusSessions.push(sessionData);
    setStorage(storage);
    
    // Update local session history
    setSessionHistory([...sessionHistory, sessionData]);
    
    // Clear saved session state
    clearFocusSessionState();
    console.log('Session completed, cleared saved state');
    
    // Reset all states
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
    setTasksTimingData({});
    setInterruptionsCount(0);
    setTotalPauseDuration(0);
    setLastPauseTime(null);
    
    // Clear auto-save interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    
    // Clear saved session state
    clearFocusSessionState();
    
    // Also clear the window reference
    if (window.currentFocusState) {
      window.currentFocusState = null;
    }
  };
  
  // Enter fullscreen
  const enterFullscreen = () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
          setIsFullscreen(true);
          if (onFullscreenChange) onFullscreenChange(true);
        }).catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
        setIsFullscreen(true);
        if (onFullscreenChange) onFullscreenChange(true);
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
        setIsFullscreen(true);
        if (onFullscreenChange) onFullscreenChange(true);
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
        setIsFullscreen(true);
        if (onFullscreenChange) onFullscreenChange(true);
      }
    } catch (err) {
      console.error('Failed to enter fullscreen mode:', err);
    }
  };
  
  // Exit fullscreen
  const exitFullscreen = () => {
    return new Promise((resolve, reject) => {
      try {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
          // Use the appropriate exit method based on browser support
          const exitMethod = document.exitFullscreen || 
                           document.webkitExitFullscreen || 
                           document.mozCancelFullScreen || 
                           document.msExitFullscreen;
          
          if (exitMethod) {
            exitMethod.call(document)
              .then(() => {
                setIsFullscreen(false);
                if (onFullscreenChange) onFullscreenChange(false);
                resolve();
              })
              .catch(err => {
                console.error('Error attempting to exit fullscreen:', err);
                // Update state anyway to ensure UI consistency
                setIsFullscreen(false);
                if (onFullscreenChange) onFullscreenChange(false);
                reject(err);
              });
          } else {
            // No exit method available, just update state
            setIsFullscreen(false);
            if (onFullscreenChange) onFullscreenChange(false);
            resolve();
          }
        } else {
          // Not in fullscreen mode, just update state
          setIsFullscreen(false);
          if (onFullscreenChange) onFullscreenChange(false);
          resolve();
        }
      } catch (err) {
        // Handle any unexpected errors
        console.error('Failed to exit fullscreen mode:', err);
        setIsFullscreen(false);
        if (onFullscreenChange) onFullscreenChange(false);
        reject(err);
      }
    });
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
  
  // Go back to main focus list (similar to HabitSection's handleBackToList)
  const handleBackToList = () => {
    setIsSetupMode(false);
  };
  
  // Set up focus session (similar to HabitSection's handleCreateHabit)
  const handleSetupFocus = () => {
    setIsSetupMode(true);
  };

  // Render focus session setup form (similar to HabitForm)
  const renderFocusSetupForm = () => {
    return (
      <FocusForm 
        onCancel={handleBackToList}
        onSave={startFocusSession}
        selectedPreset={selectedPreset}
        onPresetSelect={handlePresetSelect}
        timerType={timerType}
        setTimerType={setTimerType}
        customDuration={customDuration}
        onCustomDurationChange={setCustomDuration}
        untilTime={untilTime}
        onUntilTimeChange={handleUntilTimeChange}
        objective={objective}
        onObjectiveChange={(value) => setObjective(value)}
        selectedTasks={selectedTasks}
        onTasksChange={setSelectedTasks}
        FOCUS_PRESETS={FOCUS_PRESETS}
      />
    );
  };
  
  // Render the active focus session
  const renderFocusSession = () => {
    return (
      <div className="focus-session w-full h-full flex flex-col items-center justify-center">
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center mb-8">
            {objective && (
              <div className="mb-4 text-center">
                <h3 className="font-medium text-xl text-slate-800 dark:text-slate-200 transition-colors">
                  {objective}
                </h3>
                <div className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                  {selectedPreset.name}
                </div>
              </div>
            )}
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Background circle with gradient */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Subtle background gradient */}
                <defs>
                  <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(219, 234, 254, 0.4)" className="dark:stop-color-blue-900/20" />
                    <stop offset="100%" stopColor="rgba(239, 246, 255, 0.2)" className="dark:stop-color-blue-800/10" />
                  </linearGradient>
                  
                  {/* Progress gradient */}
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" className="dark:stop-color-blue-500" />
                    <stop offset="100%" stopColor="#60a5fa" className="dark:stop-color-blue-400" />
                  </linearGradient>
                </defs>
                
                {/* Background circle with subtle fill */}
                <circle 
                  cx="50"
                  cy="50"
                  r="46"
                  fill="url(#bg-gradient)"
                  stroke="rgba(226, 232, 240, 0.8)"
                  className="dark:stroke-slate-700/80"
                  strokeWidth="1"
                />
                
                {/* Timer track */}
                <circle 
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(226, 232, 240, 0.8)"
                  className="dark:stroke-slate-700/80"
                  strokeWidth="4"
                />
                
                {/* Timer progress */}
                <animated.circle 
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={progressAnimation.strokeDashoffset}
                />
                
                {/* Add subtle tick marks */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30) * (Math.PI / 180);
                  const x1 = 50 + 42 * Math.cos(angle);
                  const y1 = 50 + 42 * Math.sin(angle);
                  const x2 = 50 + 45 * Math.cos(angle);
                  const y2 = 50 + 45 * Math.sin(angle);
                  
                  return (
                    <line 
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(203, 213, 225, 0.8)"
                      className="dark:stroke-slate-600/80"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              
              {/* Time display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div 
                  className="text-5xl sm:text-6xl font-bold text-slate-800 dark:text-slate-100 transition-colors"
                  key={isPaused ? 'paused' : 'running'}
                  animate={isPaused ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: isPaused ? Infinity : 0, ease: "easeInOut" }}
                >
                  {timerType === 'countdown' || timerType === 'until' 
                    ? formatTime(timeRemaining) 
                    : formatTime(elapsedTime)}
                </motion.div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 transition-colors">
                  <Clock size={14} />
                  <span>{isPaused ? 'Paused' : 'In Progress'}</span>
                </div>

                {interruptionsCount > 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                    {interruptionsCount} {interruptionsCount === 1 ? 'interruption' : 'interruptions'} ({formatTime(totalPauseDuration)} paused)
                  </div>
                )}
                
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
          
          {/* Timer Controls with enhanced styling */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {!sessionComplete && (
              <>
                {/* Cancel Button */}
                <motion.button
                  onClick={() => setShowCancelConfirmModal(true)}
                  className="p-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Cancel session"
                >
                  <X size={24} />
                </motion.button>

                {/* Play/Pause Button */}
                {isPaused ? (
                  <motion.button
                    onClick={togglePause}
                    className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Resume focus session"
                  >
                    <Play size={24} fill="currentColor" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={togglePause}
                    className="p-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Pause focus session"
                  >
                    <Pause size={24} />
                  </motion.button>
                )}

                {/* Finish Button */}
                <motion.button
                  onClick={() => setShowFinishConfirmModal(true)}
                  className="p-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Finish session early"
                >
                  <Flag size={24} />
                </motion.button>
              </>
            )}
            
            {sessionComplete && (
              <motion.button
                onClick={endFocusSession}
                className="px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center gap-2 transition-all"
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
              onClick={enterFullscreen}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Maximize size={20} />
            </motion.button>
          </div>
          
          {/* Selected Tasks with checkboxes */}
          {!sessionComplete && selectedTasks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 max-w-lg mx-auto transition-colors">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 transition-colors">
                <ListChecks size={18} className="text-blue-500 dark:text-blue-400" />
                <span>Focus Tasks ({selectedTasks.length})</span>
              </h3>
              
              <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                {selectedTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className={`
                      flex items-center p-3 rounded-lg cursor-pointer transition-colors
                      ${completedTaskIds.includes(task.id) 
                        ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50' 
                        : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors
                      ${completedTaskIds.includes(task.id) 
                        ? 'bg-green-500 dark:bg-green-600 text-white' 
                        : 'border border-slate-300 dark:border-slate-500'}
                    `}>
                      {completedTaskIds.includes(task.id) && <CheckSquare size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-sm transition-colors
                        ${completedTaskIds.includes(task.id) 
                          ? 'text-green-700 dark:text-green-300 line-through opacity-70' 
                          : 'text-slate-700 dark:text-slate-300'}
                      `}>
                        {task.text}
                      </p>
                    </div>
                    {completedTaskIds.includes(task.id) && tasksTimingData[task.id] && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        {formatTime(tasksTimingData[task.id])}
                      </span>
                    )}
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
    return (
      <div className="h-full w-full flex items-center justify-center">
        <FocusSessionComplete
          duration={timerType === 'countdown' ? selectedPreset.duration - timeRemaining : elapsedTime}
          tasks={selectedTasks}
          onSubmit={handleSessionSubmit}
          onCancel={() => setSessionComplete(false)}
          isFullscreen={isFullscreen}
          tasksTimingData={tasksTimingData}
          completedTaskIds={completedTaskIds}
          interruptionsCount={interruptionsCount}
          totalPauseDuration={totalPauseDuration}
        />
      </div>
    );
  };

  // Modals render function
  const renderModals = () => {
    return (
      <>
        {/* Pause Modal */}
        {showPauseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Pause size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Focus Session Paused
                </h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your focus session has been automatically paused because you navigated away. Would you like to resume or cancel the session?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowPauseModal(false);
                    setShowCancelConfirmModal(true);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors order-1 sm:order-none"
                >
                  Cancel Session
                </button>
                
                <button
                  onClick={resumeSession}
                  className="px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={20} />
                  Resume Focus
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Cancel Confirmation Modal */}
        {showCancelConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Cancel Focus Session?
                </h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to cancel this focus session? All progress will be lost and the session won't be saved to your history.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors order-1 sm:order-none"
                >
                  Keep Session
                </button>
                
                <button
                  onClick={() => {
                    resetStates();
                    setShowCancelConfirmModal(false);
                    setShowPauseModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Finish Early Confirmation Modal */}
        {showFinishConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <Flag size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Finish Focus Session Early?
                </h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to end your focus session early? Your progress will be saved and you can review your completed tasks.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowFinishConfirmModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors order-1 sm:order-none"
                >
                  Continue Session
                </button>
                
                <button
                  onClick={finishFocusSession}
                  className="px-4 py-2 rounded-lg bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Flag size={20} />
                  Yes, Finish Now
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Task Completion Modal */}
        {showTaskCompleteModal && selectedTaskToComplete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                  <CheckSquare size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Complete Task?
                </h3>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg mb-6">
                <p className="text-slate-700 dark:text-slate-300">
                  {selectedTasks.find(task => task.id === selectedTaskToComplete)?.text}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Mark this task as completed? The time spent will be recorded for your analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowTaskCompleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors order-1 sm:order-none"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => markTaskAsCompleted(selectedTaskToComplete)}
                  className="px-4 py-2 rounded-lg bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckSquare size={20} />
                  Complete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Render fullscreen mode
  if (isFullscreen) {
    return ReactDOM.createPortal(
      <>
        <div className="focus-fullscreen-container">
          <FocusNatureBackground />
          
          <div className="focus-fullscreen-content">
            {/* Current session content */}
            {sessionComplete ? (
              <div className="h-full w-full flex items-center justify-center relative">
                {/* Add emergency escape button that's always visible */}
                <button
                  onClick={exitFullscreen}
                  className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  aria-label="Exit fullscreen"
                >
                  <Minimize size={20} />
                </button>
                
                <FocusSessionComplete
                  duration={timerType === 'countdown' ? selectedPreset.duration - timeRemaining : elapsedTime}
                  tasks={selectedTasks}
                  onSubmit={handleSessionSubmit}
                  onCancel={() => {
                    setSessionComplete(false);
                    // Also ensure we're not in fullscreen
                    if (isFullscreen) {
                      exitFullscreen();
                    }
                  }}
                  isFullscreen={true}
                  tasksTimingData={tasksTimingData}
                  completedTaskIds={completedTaskIds}
                  interruptionsCount={interruptionsCount}
                  totalPauseDuration={totalPauseDuration}
                />
              </div>
            ) : (
              // Rest of your fullscreen content
              <>
                {/* Timer Display */}
                <div className="flex flex-col items-center justify-center mb-8 timer-display">
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
                      
                      <div className="text-sm text-white/80 mt-2 flex items-center gap-1">
                        <Clock size={14} />
                        <span>{isPaused ? 'Paused' : 'In Progress'}</span>
                      </div>
                      
                      {interruptionsCount > 0 && (
                        <div className="text-xs text-white/60 mt-1">
                          {interruptionsCount} {interruptionsCount === 1 ? 'interruption' : 'interruptions'} ({formatTime(totalPauseDuration)} paused)
                        </div>
                      )}
                      
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
                      {/* Cancel Button */}
                      <motion.button
                        onClick={() => setShowCancelConfirmModal(true)}
                        className="p-4 rounded-full bg-red-600 text-white shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={24} />
                      </motion.button>

                      {/* Play/Pause Button */}
                      {isPaused ? (
                        <motion.button
                          onClick={togglePause}
                          className="p-4 rounded-full bg-blue-600 text-white shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play size={24} fill="currentColor" />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={togglePause}
                          className="p-4 rounded-full bg-blue-600 text-white shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Pause size={24} />
                        </motion.button>
                      )}

                      {/* Finish Button */}
                      <motion.button
                        onClick={() => setShowFinishConfirmModal(true)}
                        className="p-4 rounded-full bg-amber-600 text-white shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Flag size={24} />
                      </motion.button>
                    </>
                  )}
                  
                  {sessionComplete && (
                    <motion.button
                      onClick={endFocusSession}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium shadow-lg flex items-center gap-2"
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
                    id="emergency-fullscreen-exit"
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
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-xl p-4 max-w-xs task-display">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <ListChecks size={18} />
                      <span>Focus Tasks</span>
                    </h3>
                    <div className="space-y-3">
                      {selectedTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => handleTaskClick(task.id)}
                          className={`flex items-center text-white/90 p-2 rounded hover:bg-white/10 cursor-pointer`}
                        >
                          <div className={`
                            w-5 h-5 rounded flex items-center justify-center mr-3
                            ${completedTaskIds.includes(task.id) 
                              ? 'bg-green-500 text-white' 
                              : 'border border-white/50'}
                          `}>
                            {completedTaskIds.includes(task.id) && <CheckSquare size={12} />}
                          </div>
                          <span className={`text-sm ${completedTaskIds.includes(task.id) ? 'line-through opacity-70' : ''}`}>
                            {task.text}
                          </span>
                          {completedTaskIds.includes(task.id) && tasksTimingData[task.id] && (
                            <span className="text-xs text-white/60 ml-auto">
                              {formatTime(tasksTimingData[task.id])}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* ESC to exit fullscreen notice */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white/70">
                  Press <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1 font-mono">Esc</kbd> to exit full screen
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modals rendered in fullscreen mode */}
        {showTaskCompleteModal && selectedTaskToComplete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl p-6 max-w-md w-full shadow-xl animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                  <CheckSquare size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Complete Task?
                </h3>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg mb-6">
                <p className="text-slate-700 dark:text-slate-300">
                  {selectedTasks.find(task => task.id === selectedTaskToComplete)?.text}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Mark this task as completed? The time spent will be recorded for your analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowTaskCompleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 transition-colors order-1 sm:order-none"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => markTaskAsCompleted(selectedTaskToComplete)}
                  className="px-4 py-2 rounded-lg bg-green-500/90 dark:bg-green-600/90 text-white hover:bg-green-600/90 dark:hover:bg-green-700/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckSquare size={20} />
                  Complete Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Fullscreen Modals */}
        {showCancelConfirmModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl p-6 max-w-md w-full shadow-xl animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Cancel Focus Session?
                </h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to cancel this focus session? All progress will be lost and the session won't be saved to your history.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 transition-colors order-1 sm:order-none"
                >
                  Keep Session
                </button>
                
                <button
                  onClick={() => {
                    resetStates();
                    setShowCancelConfirmModal(false);
                    setShowPauseModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/90 dark:bg-red-600/90 text-white hover:bg-red-600/90 dark:hover:bg-red-700/90 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showFinishConfirmModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl p-6 max-w-md w-full shadow-xl animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <Flag size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Finish Focus Session Early?
                </h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to end your focus session early? Your progress will be saved and you can review your completed tasks.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowFinishConfirmModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 transition-colors order-1 sm:order-none"
                >
                  Continue Session
                </button>
                
                <button
                  onClick={finishFocusSession}
                  className="px-4 py-2 rounded-lg bg-amber-500/90 dark:bg-amber-600/90 text-white hover:bg-amber-600/90 dark:hover:bg-amber-700/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Flag size={20} />
                  Yes, Finish Now
                </button>
              </div>
            </div>
          </div>
        )}
      </>,
      document.body
    );
  }

  // Main component render (non-fullscreen)
  return (
    <div className="focus-section w-full h-full flex flex-col">
      {/* Header with navigation buttons - only shown when not in active focus session */}
      {!focusActive && !sessionComplete && !isSetupMode && (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
    <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
      My Focus
    </h1>
    
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <button
        onClick={() => setActiveTab('analytics')}
        className="text-sm sm:text-base bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
      >
        <BarChart2 size={16} />
        <span className="hidden sm:inline">Analytics</span>
      </button>
      
      <button
        onClick={() => setActiveTab('history')}
        className="text-sm sm:text-base bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
      >
        <History size={16} />
        <span className="hidden sm:inline">History</span>
      </button>
      
      {activeTab !== 'focus' && (
        <button
          onClick={() => setActiveTab('focus')}
          className="text-sm sm:text-base bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
        >
          <Clock size={16} />
          <span className="hidden sm:inline">Focus</span>
        </button>
      )}
      
      {activeTab === 'focus' && (
        <button
          onClick={handleSetupFocus}
          className="text-sm sm:text-base bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
        >
          <Play size={16} />
          <span className="hidden sm:inline">Start Session</span>
        </button>
      )}
    </div>
  </div>
)}
      
      {/* Main content area */}
      <div className="flex-grow bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors overflow-auto">
        {/* Conditional rendering pattern similar to HabitSection */}
        {isSetupMode ? (
          renderFocusSetupForm()
        ) : focusActive || sessionComplete ? (
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
        ) : (
          <>
            {activeTab === 'analytics' ? (
              <FocusAnalytics sessions={sessionHistory} />
            ) : activeTab === 'history' ? (
              <FocusHistory sessions={sessionHistory} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center py-10">
    <AnimatedPlayButton onClick={handleSetupFocus} />
  </div>
            )}
          </>
        )}
      </div>
      
      {/* Modals - not displayed in fullscreen mode */}
      {!isFullscreen && renderModals()}
    </div>
  );
};

export default FocusSection;