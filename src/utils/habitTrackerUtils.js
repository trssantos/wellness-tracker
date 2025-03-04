// habitTrackerUtils.js
import { getStorage, setStorage } from './storage';

/**
 * Initialize habit tracker data if it doesn't exist
 * @returns {Object} The current habit data
 */
export const initHabitTracker = () => {
  const storage = getStorage();
  
  // Initialize habits array if it doesn't exist
  if (!storage.habits) {
    storage.habits = [];
    setStorage(storage);
  }
  
  return storage.habits;
};

/**
 * Get all habits
 * @returns {Array} Array of habit objects
 */
export const getHabits = () => {
  const storage = getStorage();
  return storage.habits || [];
};

/**
 * Create a new habit
 * @param {Object} habitData - The habit data
 * @returns {Object} The created habit
 */
export const createHabit = (habitData) => {
  const storage = getStorage();
  
  // Initialize habits array if it doesn't exist
  if (!storage.habits) {
    storage.habits = [];
  }
  
  // Generate a unique ID for the habit
  const id = `habit-${Date.now()}`;
  
  // Create the new habit object with defaults
  const newHabit = {
    id,
    name: habitData.name,
    description: habitData.description || '',
    frequency: habitData.frequency || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    steps: habitData.steps || [],
    startDate: habitData.startDate || new Date().toISOString().split('T')[0],
    targetDate: habitData.targetDate || '',
    timeOfDay: habitData.timeOfDay || 'anytime',
    milestones: habitData.milestones || [],
    completions: {},
    stats: {
      streakCurrent: 0,
      streakLongest: 0,
      completionRate: 0,
      totalCompletions: 0,
      progress: 0
    },
    streakHistory: [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  // Add the habit to storage
  storage.habits.push(newHabit);
  setStorage(storage);
  
  return newHabit;
};

/**
 * Update an existing habit
 * @param {string} habitId - The ID of the habit to update
 * @param {Object} updates - The updates to apply
 * @returns {Object|null} The updated habit or null if not found
 */
export const updateHabit = (habitId, updates) => {
  const storage = getStorage();
  
  if (!storage.habits) {
    return null;
  }
  
  // Find the habit index
  const habitIndex = storage.habits.findIndex(h => h.id === habitId);
  
  if (habitIndex === -1) {
    return null;
  }
  
  // Create updated habit
  const updatedHabit = {
    ...storage.habits[habitIndex],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  // Update the habit in storage
  storage.habits[habitIndex] = updatedHabit;
  setStorage(storage);
  
  return updatedHabit;
};

/**
 * Delete a habit
 * @param {string} habitId - The ID of the habit to delete
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteHabit = (habitId) => {
  const storage = getStorage();
  
  if (!storage.habits) {
    return false;
  }
  
  // Find the habit index
  const habitIndex = storage.habits.findIndex(h => h.id === habitId);
  
  if (habitIndex === -1) {
    return false;
  }
  
  // Remove the habit from storage
  storage.habits.splice(habitIndex, 1);
  setStorage(storage);
  
  return true;
};

/**
 * Track habit completion for a specific date
 * @param {string} habitId - The ID of the habit
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {boolean} completed - Whether the habit was completed
 * @returns {Object|null} The updated habit or null if not found
 */
export const trackHabitCompletion = (habitId, date, completed) => {
  const storage = getStorage();
  
  if (!storage.habits) {
    return null;
  }
  
  // Find the habit
  const habitIndex = storage.habits.findIndex(h => h.id === habitId);
  
  if (habitIndex === -1) {
    return null;
  }
  
  const habit = storage.habits[habitIndex];
  
  // Update completions
  habit.completions = {
    ...habit.completions,
    [date]: completed
  };
  
  // Recalculate stats
  updateHabitStats(habit);
  
  // Save the updated habit
  storage.habits[habitIndex] = habit;
  setStorage(storage);
  
  return habit;
};

/**
 * Get habits scheduled for a specific day of the week
 * @param {string} dayOfWeek - The day of week (mon, tue, etc.)
 * @returns {Array} Array of habits scheduled for that day
 */
export const getHabitsForDay = (dayOfWeek) => {
  const habits = getHabits();
  return habits.filter(habit => habit.frequency.includes(dayOfWeek.toLowerCase()));
};

/**
 * Get habits for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of habits scheduled for that date
 */
export const getHabitsForDate = (date) => {
  const dateObj = new Date(date);
  // Get day of week as 3-letter lowercase (mon, tue, etc.)
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  return getHabitsForDay(dayOfWeek);
};

/**
 * Update a habit's statistics based on its completion history
 * @param {Object} habit - The habit to update stats for
 * @returns {Object} The updated habit with new stats
 */
export const updateHabitStats = (habit) => {
  const completions = habit.completions || {};
  const completionDates = Object.keys(completions).sort();
  
  // If no completions, return with default stats
  if (completionDates.length === 0) {
    habit.stats = {
      streakCurrent: 0,
      streakLongest: 0,
      completionRate: 0,
      totalCompletions: 0,
      progress: 0
    };
    return habit;
  }
  
  // Calculate total completions
  const totalCompletions = Object.values(completions).filter(Boolean).length;
  
  // Calculate completion rate
  const totalDays = Object.keys(completions).length;
  const completionRate = totalDays > 0 ? totalCompletions / totalDays : 0;
  
  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = completionDates.sort((a, b) => new Date(b) - new Date(a));
  
  // Check if today or yesterday was completed
  const latestDate = sortedDates[0];
  const latestCompleted = completions[latestDate];
  
  if (latestCompleted && (latestDate === today || isYesterday(latestDate, today))) {
    currentStreak = 1;
    
    // Count back from latest date to find streak
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const prevDate = sortedDates[i - 1];
      
      // Check if dates are consecutive and completed
      if (completions[currentDate] && isConsecutiveDay(currentDate, prevDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let currentLongestStreak = 0;
  
  // Sort dates chronologically for streak calculation
  const chronologicalDates = [...sortedDates].sort((a, b) => new Date(a) - new Date(b));
  
  for (let i = 0; i < chronologicalDates.length; i++) {
    const date = chronologicalDates[i];
    const isCompleted = completions[date];
    
    if (isCompleted) {
      // Start or continue streak
      if (i === 0 || !isConsecutiveDay(chronologicalDates[i-1], date)) {
        currentLongestStreak = 1;
      } else if (completions[chronologicalDates[i-1]]) {
        currentLongestStreak++;
      } else {
        currentLongestStreak = 1;
      }
      
      // Update longest streak if current is longer
      if (currentLongestStreak > longestStreak) {
        longestStreak = currentLongestStreak;
      }
    } else {
      // Reset current streak on missed day
      currentLongestStreak = 0;
    }
  }
  
  // Calculate overall progress
  let progress = 0;
  
  // If there's a target date, calculate progress towards that
  if (habit.targetDate) {
    const startDate = new Date(habit.startDate);
    const targetDate = new Date(habit.targetDate);
    const now = new Date();
    
    const totalDuration = targetDate - startDate;
    const elapsedDuration = now - startDate;
    
    if (totalDuration > 0) {
      const timeProgress = Math.min(Math.max(elapsedDuration / totalDuration, 0), 1);
      
      // Weight progress by both time elapsed and completion rate
      progress = Math.round((timeProgress * 0.4 + completionRate * 0.6) * 100);
    }
  } else {
    // If no target date, use completion rate and streak as progress indicators
    const maxExpectedStreak = 30; // Arbitrary goal for max streak
    const streakProgress = Math.min(longestStreak / maxExpectedStreak, 1);
    
    // Weight progress by both completion rate and streak progress
    progress = Math.round((completionRate * 0.7 + streakProgress * 0.3) * 100);
  }
  
  // Update stats
  habit.stats = {
    streakCurrent: currentStreak,
    streakLongest: Math.max(longestStreak, currentStreak),
    completionRate: Math.round(completionRate * 100) / 100,
    totalCompletions,
    progress: Math.min(progress, 100)
  };
  
  // Update streak history if current streak changed
  const lastStreakRecord = habit.streakHistory && habit.streakHistory.length > 0 
    ? habit.streakHistory[habit.streakHistory.length - 1] 
    : null;
  
  if (!lastStreakRecord || lastStreakRecord.streak !== currentStreak) {
    if (!habit.streakHistory) {
      habit.streakHistory = [];
    }
    
    habit.streakHistory.push({
      date: today,
      streak: currentStreak
    });
  }
  
  // Check for milestone achievements
  if (habit.milestones && habit.milestones.length > 0) {
    habit.milestones = habit.milestones.map(milestone => {
      // Check if milestone is newly achieved
      if (!milestone.achieved) {
        // Check for streak-based milestones
        if (milestone.name.toLowerCase().includes('streak') && currentStreak >= milestone.value) {
          milestone.achieved = true;
          milestone.achievedDate = today;
        }
        // Check for total completion milestones
        else if (milestone.name.toLowerCase().includes('total') && totalCompletions >= milestone.value) {
          milestone.achieved = true;
          milestone.achievedDate = today;
        }
        // Check for general progress milestones
        else if (progress >= milestone.value) {
          milestone.achieved = true;
          milestone.achievedDate = today;
        }
      }
      return milestone;
    });
  }
  
  return habit;
};

/**
 * Check if a date is the day before another date
 * @param {string} date1 - The first date (YYYY-MM-DD)
 * @param {string} date2 - The second date (YYYY-MM-DD)
 * @returns {boolean} True if date1 is the day before date2
 */
const isYesterday = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  d1.setDate(d1.getDate() + 1);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Check if two dates are consecutive
 * @param {string} date1 - The first date (YYYY-MM-DD)
 * @param {string} date2 - The second date (YYYY-MM-DD)
 * @returns {boolean} True if the dates are consecutive
 */
const isConsecutiveDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  d1.setDate(d1.getDate() + 1);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Check if a habit is scheduled for today
 * @param {Object} habit - The habit to check
 * @returns {boolean} True if the habit is scheduled for today
 */
export const isHabitScheduledForToday = (habit) => {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  return habit.frequency.includes(dayOfWeek);
};

/**
 * Get habit completion status for a specific date
 * @param {Object} habit - The habit to check
 * @param {string} date - The date to check (YYYY-MM-DD)
 * @returns {number} 1 for completed, 0 for skipped, -1 for missed
 */
export const getHabitStatusForDate = (habit, date) => {
  // If the habit wasn't started yet on this date, return 0 (skipped)
  if (new Date(date) < new Date(habit.startDate)) {
    return 0;
  }
  
  // Get the day of the week for this date
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  
  // If the habit isn't scheduled for this day, return 0 (skipped)
  if (!habit.frequency.includes(dayOfWeek)) {
    return 0;
  }
  
  // Normalize the date to YYYY-MM-DD format for consistency
  const normalizedDate = date.split('T')[0];
  
  // Check if the habit was completed
  if (habit.completions && habit.completions[normalizedDate] === true) {
    return 1; // Completed
  } else if (habit.completions && habit.completions[normalizedDate] === false) {
    return 0; // Explicitly skipped
  } else {
    // If the date is in the past and not recorded, it was missed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
      return -1; // Missed
    } else {
      return 0; // Future date, not yet applicable
    }
  }
};



/**
 * Generate completion history for a habit
 * @param {Object} habit - The habit
 * @param {number} days - Number of days to include
 * @returns {Array} Array of completion statuses (1, 0, or -1)
 */
export const generateCompletionHistory = (habit, days = 28) => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Go back 'days' days from today
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    result.push(getHabitStatusForDate(habit, dateStr));
  }
  
  return result;
};

/**
 * Get habit completion data for a date range
 * @param {Object} habit - The habit
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Array of objects with date and status
 */
export const getHabitCalendarData = (habit, startDate, endDate) => {
  const result = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      status: getHabitStatusForDate(habit, dateStr)
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return result;
};

/**
 * Create a category with tasks from habits for a specific day
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Object} A category object with habit tasks
 */
export const createHabitTaskCategory = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  
  // Get habits scheduled for this day
  const habits = getHabitsForDay(dayOfWeek);
  
  if (habits.length === 0) {
    return null;
  }
  
  // Create task items for each habit
  const items = [];
  
  habits.forEach(habit => {
    // Add each step as a task, labeled with the habit name
    habit.steps.forEach(step => {
      items.push(`[${habit.name}] ${step}`);
    });
    
    // Add a separator between habits if there are multiple
    if (habits.length > 1) {
      items.push('---');
    }
  });
  
  // Remove the last separator if it exists
  if (items[items.length - 1] === '---') {
    items.pop();
  }
  
  return {
    title: "Habits",
    items
  };
};

/**
 * Inject habit tasks into an existing daily task list
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {boolean} True if tasks were injected
 */
export const injectHabitTasks = (date) => {
  const storage = getStorage();
  const dayData = storage[date] || {};
  
  // Check if there's already a task list
  const hasTaskList = 
    (dayData.customTasks && dayData.customTasks.length > 0) || 
    (dayData.aiTasks && dayData.aiTasks.length > 0) ||
    (dayData.defaultTasks && dayData.defaultTasks.length > 0);
  
  // Don't inject if no task list exists
  if (!hasTaskList) {
    return false;
  }
  
  // Create habit category
  const habitCategory = createHabitTaskCategory(date);
  
  if (!habitCategory) {
    return false;
  }
  
  // Initialize or get existing task list
  let taskList;
  let taskType;
  
  if (dayData.customTasks && dayData.customTasks.length > 0) {
    taskList = [...dayData.customTasks];
    taskType = 'customTasks';
  } else if (dayData.aiTasks && dayData.aiTasks.length > 0) {
    taskList = [...dayData.aiTasks];
    taskType = 'aiTasks';
  } else if (dayData.defaultTasks && dayData.defaultTasks.length > 0) {
    taskList = [...dayData.defaultTasks];
    taskType = 'defaultTasks';
  } else {
    return false;
  }
  
  // Remove any existing habit category
  taskList = taskList.filter(cat => cat.title !== "Habits");
  
  // Add the habit category at the top
  taskList.unshift(habitCategory);
  
  // Update storage with the new task list
  storage[date] = {
    ...dayData,
    [taskType]: taskList
  };
  
  // Initialize or update checked status for habit tasks
  if (!storage[date].checked) {
    storage[date].checked = {};
  }
  
  habitCategory.items.forEach(item => {
    if (storage[date].checked[item] === undefined) {
      storage[date].checked[item] = false;
    }
  });
  
  setStorage(storage);
  return true;
};