import { getStorage, setStorage } from './storage';
import { Clock, Target, Moon, Sun, Clock4, Zap, Brain } from 'lucide-react';


/**
 * Get all focus sessions from storage
 * @returns {Array} Array of focus sessions
 */
export const getFocusSessions = () => {
  const storage = getStorage();
  
  // Check if we have the sessions array
  if (!storage.focusSessions) {
    storage.focusSessions = [];
    setStorage(storage);
  }
  
  return storage.focusSessions;
};

// Comprehensive focus technique definitions
export const FOCUS_TECHNIQUES = [
  { 
    id: 'pomodoro', 
    name: 'Pomodoro Technique', 
    description: 'Focus for 25 minutes, then take a 5-minute break. After 4 rounds, take a longer break.',
    timerType: 'countdown',
    focusDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60,  // 5 minutes in seconds
    longBreakDuration: 15 * 60, // 15 minutes for long break
    hasCycles: true,
    defaultCycles: 4,      // 4 pomodoro cycles by default
    longBreakAfter: 4,     // Long break after 4 cycles
    color: 'red',
    colorGradient: 'from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600',
    icon: 'clock'
  },
  { 
    id: 'flowtime', 
    name: 'Flowtime Method', 
    description: 'Work until your focus naturally wanes, then take a proportionate break (1:5 ratio).',
    timerType: 'countup',
    hasCycles: false,      // No predefined cycles
    color: 'blue',
    colorGradient: 'from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600',
    icon: 'target'
  },
  { 
    id: '5217', 
    name: '52/17 Method', 
    description: 'Work for 52 minutes then rest for 17 minutes for optimal productivity.',
    timerType: 'countdown',
    focusDuration: 52 * 60, // 52 minutes
    breakDuration: 17 * 60, // 17 minutes
    hasCycles: true,
    defaultCycles: 4,      // Default to 4 cycles
    color: 'green',
    colorGradient: 'from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600',
    icon: 'moon'
  },
  { 
    id: 'desktime', 
    name: '90-Minute Focus', 
    description: 'Based on natural ultradian rhythms - focus for 90 minutes, then rest for 20.',
    timerType: 'countdown',
    focusDuration: 90 * 60, // 90 minutes
    breakDuration: 20 * 60, // 20 minutes
    hasCycles: true,
    defaultCycles: 2,      // Default to 2 90-minute cycles
    color: 'amber',
    colorGradient: 'from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600',
    icon: 'sun'
  },
  { 
    id: 'ultradian',
    name: 'Ultradian Rhythm', 
    description: 'Work for 90 minutes, then rest for 20 minutes, based on natural body cycles.',
    timerType: 'countdown',
    focusDuration: 90 * 60,
    breakDuration: 20 * 60,
    hasCycles: true,
    defaultCycles: 4,
    color: 'purple',
    colorGradient: 'from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600',
    icon: 'brain'
  },
  { 
    id: 'custom', 
    name: 'Custom Timer', 
    description: 'Set your own duration and approach.',
    timerType: 'countdown',
    focusDuration: 30 * 60, // 30 minutes default
    hasCycles: false,      // No cycles by default
    color: 'slate',
    colorGradient: 'from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700',
    icon: 'clock'
  }
];


// Helper function to get technique configuration by ID
export const getTechniqueConfig = (techniqueId) => {
  return FOCUS_TECHNIQUES.find(technique => technique.id === techniqueId) || FOCUS_TECHNIQUES[0];
};

// Helper to get icon component from icon name
export const getTechniqueIcon = (iconName, size = 24) => {
  switch (iconName) {
    case 'clock':
      return <Clock size={size} />;
    case 'target':
      return <Target size={size} />;
    case 'moon':
      return <Moon size={size} />;
    case 'sun':
      return <Sun size={size} />;
    case 'brain':
      return <Brain size={size} />;
    case 'zap':
      return <Zap size={size} />;
    case 'clock4':
      return <Clock4 size={size} />;
    default:
      return <Clock size={size} />; 
  }
};


/**
 * Update a timer preset
 * @param {string} presetKey - Key of the preset to update
 * @param {Object} presetData - New preset data
 * @returns {boolean} Success indicator
 */
export const updateTimerPreset = (presetKey, presetData) => {
  // For now, we'll keep this as a placeholder since presets are hardcoded
  // In a future version, you could store custom presets in local storage
  console.log(`Updated preset ${presetKey} with data:`, presetData);
  return true;
};

/**
 * Save a new focus session to storage
 * @param {Object} sessionData - Session data to save
 * @returns {Object} Saved session with ID
 */
export const saveFocusSession = (sessionData) => {
  const storage = getStorage();
  
  // Ensure we have the sessions array
  if (!storage.focusSessions) {
    storage.focusSessions = [];
  }
  
  // Create session object with ID if not provided
  const session = {
    id: sessionData.id || `session-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...sessionData
  };
  
  // Add to session list
  storage.focusSessions.push(session);
  
  // Save to storage
  setStorage(storage);
  
  return session;
};

/**
 * Get focus presets for UI display
 * @returns {Array} Array of focus presets with UI details
 */
export const getFocusPresets = () => {
  return FOCUS_TECHNIQUES.map(technique => ({
    id: technique.id,
    name: technique.name,
    description: technique.description,
    duration: technique.focusDuration || 0,
    color: technique.colorGradient,
    icon: getTechniqueIcon(technique.icon),
    hasCycles: technique.hasCycles,
    cycles: technique.defaultCycles,
    restDuration: technique.breakDuration,
    longRestDuration: technique.longBreakDuration,
    longBreakAfter: technique.longBreakAfter,
    timerType: technique.timerType
  }));
};

/**
 * Delete a focus session from storage
 * @param {string} sessionId - ID of the session to delete
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteFocusSession = (sessionId) => {
  const storage = getStorage();
  
  if (!storage.focusSessions) {
    return false;
  }
  
  const sessionIndex = storage.focusSessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return false;
  }
  
  // Remove the session
  storage.focusSessions.splice(sessionIndex, 1);
  
  // Save back to storage
  setStorage(storage);
  
  return true;
};

/**
 * Get focus stats by time period
 * @param {string} period - Time period (day, week, month, year)
 * @returns {Object} Stats for the time period
 */
export const getFocusStats = (period = 'week') => {
  const sessions = getFocusSessions();
  
  if (sessions.length === 0) {
    return {
      totalDuration: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      tasksCompleted: 0,
      avgRating: 0,
      mostProductiveHour: null,
      mostProductiveDay: null,
      techniques: []
    };
  }
  
  // Determine date range
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'day':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
  }
  
  // Filter sessions within date range
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime || session.timestamp);
    return sessionDate >= startDate && sessionDate <= now;
  });
  
  if (filteredSessions.length === 0) {
    return {
      totalDuration: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      tasksCompleted: 0,
      avgRating: 0,
      mostProductiveHour: null,
      mostProductiveDay: null,
      techniques: []
    };
  }
  
  // Calculate stats
  const totalDuration = filteredSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const totalSessions = filteredSessions.length;
  const avgSessionDuration = totalDuration / totalSessions;
  const tasksCompleted = filteredSessions.reduce((sum, session) => sum + (session.tasks?.length || 0), 0);
  const avgRating = filteredSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions;
  
  // Hours and days counters for finding most productive times
  const hourCounts = Array(24).fill(0);
  const dayCounts = Array(7).fill(0);
  
  // Technique usage counts
  const techniqueCounts = {};
  
  // Process session details
  filteredSessions.forEach(session => {
    const date = new Date(session.startTime || session.timestamp);
    const hour = date.getHours();
    const day = date.getDay();
    
    // Add duration to hour counts
    hourCounts[hour] += session.duration || 0;
    
    // Add duration to day counts
    dayCounts[day] += session.duration || 0;
    
    // Count technique usage
    const technique = session.technique || 'custom';
    if (!techniqueCounts[technique]) {
      techniqueCounts[technique] = {
        name: technique,
        sessions: 0,
        duration: 0
      };
    }
    
    techniqueCounts[technique].sessions += 1;
    techniqueCounts[technique].duration += session.duration || 0;
  });
  
  // Find most productive hour
  let mostProductiveHour = 0;
  for (let i = 1; i < 24; i++) {
    if (hourCounts[i] > hourCounts[mostProductiveHour]) {
      mostProductiveHour = i;
    }
  }
  
  // Find most productive day
  let mostProductiveDay = 0;
  for (let i = 1; i < 7; i++) {
    if (dayCounts[i] > dayCounts[mostProductiveDay]) {
      mostProductiveDay = i;
    }
  }
  
  // Format techniques into array
  const techniques = Object.values(techniqueCounts).sort((a, b) => b.duration - a.duration);
  
  return {
    totalDuration,
    totalSessions,
    avgSessionDuration,
    tasksCompleted,
    avgRating,
    mostProductiveHour,
    mostProductiveDay,
    techniques,
    hourData: hourCounts.map((count, hour) => ({ hour, duration: count })),
    dayData: dayCounts.map((count, day) => ({ 
      day, 
      duration: count,
      name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] 
    }))
  };
};

/**
 * Get focus streak data
 * @returns {Object} Streak information
 */
export const getFocusStreak = () => {
  const sessions = getFocusSessions();
  
  if (sessions.length === 0) {
    return { current: 0, longest: 0 };
  }
  
  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.startTime || a.timestamp);
    const dateB = new Date(b.startTime || b.timestamp);
    return dateA - dateB;
  });
  
  // Group sessions by day
  const sessionsByDay = {};
  
  sortedSessions.forEach(session => {
    const date = new Date(session.startTime || session.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!sessionsByDay[dateStr]) {
      sessionsByDay[dateStr] = [];
    }
    sessionsByDay[dateStr].push(session);
  });
  
  // Get ordered list of days with sessions
  const days = Object.keys(sessionsByDay).sort();
  
  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let streakCount = 0;
  
  // Check the current streak (from today backwards)
  const today = new Date().toISOString().split('T')[0];
  
  // Start from today or the most recent day with sessions
  let currentDay = today;
  if (days.length > 0 && days[days.length - 1] < today) {
    currentDay = days[days.length - 1];
  }
  
  // Convert to Date object for date arithmetic
  let checkDate = new Date(currentDay);
  
  // Loop backwards to find the streak
  while (true) {
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (sessionsByDay[checkDateStr] && sessionsByDay[checkDateStr].length > 0) {
      currentStreak++;
    } else {
      break;
    }
    
    // Go to previous day
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Calculate longest streak by going through the sorted days list
  if (days.length > 0) {
    streakCount = 1;
    
    for (let i = 1; i < days.length; i++) {
      const prevDate = new Date(days[i - 1]);
      const currDate = new Date(days[i]);
      
      // Check if days are consecutive
      prevDate.setDate(prevDate.getDate() + 1);
      
      if (prevDate.toISOString().split('T')[0] === days[i]) {
        // Days are consecutive
        streakCount++;
      } else {
        // Streak is broken
        longestStreak = Math.max(longestStreak, streakCount);
        streakCount = 1;
      }
    }
    
    // Check the last streak
    longestStreak = Math.max(longestStreak, streakCount);
  }
  
  return { current: currentStreak, longest: longestStreak };
};

/**
 * Get tasks with highest focus time
 * @returns {Array} Top tasks by focus time
 */
export const getTopFocusTasks = () => {
  const sessions = getFocusSessions();
  
  if (sessions.length === 0) {
    return [];
  }
  
  // Collect all tasks with time spent
  const taskTimes = {};
  
  sessions.forEach(session => {
    if (session.taskTimeData && session.taskTimeData.length > 0) {
      session.taskTimeData.forEach(taskData => {
        const taskKey = taskData.text;
        
        if (!taskTimes[taskKey]) {
          taskTimes[taskKey] = {
            text: taskData.text,
            timeSpent: 0,
            occurrences: 0,
            completed: 0
          };
        }
        
        taskTimes[taskKey].timeSpent += taskData.timeSpent || 0;
        taskTimes[taskKey].occurrences += 1;
        taskTimes[taskKey].completed += taskData.completed ? 1 : 0;
      });
    } else if (session.tasks && session.tasks.length > 0) {
      // Legacy format without individual task times
      const averageTime = session.duration / session.tasks.length;
      
      session.tasks.forEach(task => {
        const taskKey = typeof task === 'string' ? task : task.text;
        
        if (!taskTimes[taskKey]) {
          taskTimes[taskKey] = {
            text: taskKey,
            timeSpent: 0,
            occurrences: 0,
            completed: 0
          };
        }
        
        taskTimes[taskKey].timeSpent += averageTime;
        taskTimes[taskKey].occurrences += 1;
        taskTimes[taskKey].completed += 1; // Assume completed for legacy format
      });
    }
  });
  
  // Convert to array and calculate completion rate
  const tasksArray = Object.values(taskTimes).map(task => ({
    ...task,
    completionRate: task.occurrences > 0 ? (task.completed / task.occurrences) * 100 : 0
  }));
  
  // Sort by time spent
  return tasksArray.sort((a, b) => b.timeSpent - a.timeSpent);
};

export const getTechniqueName = (techniqueId) => {
  // First, check if the techniqueId matches one of our new configurations
  const technique = FOCUS_TECHNIQUES.find(t => t.id === techniqueId);
  if (technique) {
    return technique.name;
  }
  
  // Fallback for backward compatibility with existing data
  const techniqueMap = {
    'pomodoro': 'Pomodoro Technique',
    'flowtime': 'Flowtime Method',
    '5217': '52/17 Method',
    'desktime': '90-Minute Focus',
    'custom': 'Custom Timer',
    'shortBreak': 'Short Break',
    'longBreak': 'Long Break',
    'stopwatch': 'Stopwatch'
  };
  
  return techniqueMap[techniqueId] || techniqueId;
};

// Also add this helper function to get technique color
export const getTechniqueColor = (techniqueId) => {
  const technique = FOCUS_TECHNIQUES.find(t => t.id === techniqueId);
  return technique?.color || 'gray';
};

// Export all the functions
export default {
  getFocusSessions,
  saveFocusSession,
  deleteFocusSession,
  getFocusStats,
  getFocusStreak,
  getTopFocusTasks,
  updateTimerPreset,
  getTechniqueName,
  getFocusPresets
};