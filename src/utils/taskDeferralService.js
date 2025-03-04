// utils/taskDeferralService.js
import { getStorage, setStorage } from './storage';

/**
 * Find the most recent previous date that has tasks in storage
 * @param {string} currentDate - Current date in YYYY-MM-DD format
 * @returns {string|null} Previous date with tasks or null if none found
 */
export const findPreviousTaskDate = (currentDate) => {
  const storage = getStorage();
  const currentDateObj = new Date(currentDate);
  
  // Look back up to 7 days to find previous tasks
  for (let i = 1; i <= 1; i++) {
    const prevDate = new Date(currentDateObj);
    prevDate.setDate(prevDate.getDate() - i);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    const prevDayData = storage[prevDateStr];
    if (prevDayData && hasPendingTasks(prevDayData)) {
      return prevDateStr;
    }
  }
  
  return null;
};

/**
 * Check if a day has any pending (uncompleted) tasks
 * @param {Object} dayData - The data for a specific day
 * @returns {boolean} True if there are pending tasks
 */
const hasPendingTasks = (dayData) => {
  if (!dayData.checked) return false;
  
  // Check if there are any uncompleted tasks
  const hasUncompleted = Object.values(dayData.checked).some(checked => checked === false);
  
  // Also verify that we have either AI or custom tasks with actual items
  const hasTaskItems = 
    (dayData.aiTasks && dayData.aiTasks.some(cat => cat.items && cat.items.length > 0)) ||
    (dayData.customTasks && dayData.customTasks.some(cat => cat.items && cat.items.length > 0));
  console.log('hasTaskItems',hasTaskItems);
  return hasUncompleted && hasTaskItems;
};

/**
 * Import deferred tasks into the current day
 * @param {string} currentDate - Current date in YYYY-MM-DD format
 * @param {Array} deferredTasks - Array of task objects to import
 * @returns {Object} Updated day data
 */
export const importDeferredTasks = (currentDate, deferredTasks) => {
  if (!deferredTasks || deferredTasks.length === 0) return null;
  
  const storage = getStorage();
  const dayData = storage[currentDate] || {};
  
  // Determine what type of task list to create/update
  let taskList;
  let taskType;
  
  if (dayData.customTasks && dayData.customTasks.length > 0) {
    taskList = [...dayData.customTasks]; // Create a copy to avoid direct mutation
    taskType = 'customTasks';
  } else if (dayData.aiTasks && dayData.aiTasks.length > 0) {
    taskList = [...dayData.aiTasks]; // Create a copy to avoid direct mutation
    taskType = 'aiTasks';
  } else {
    // Default to creating custom tasks with some basic categories
    taskList = [
      { title: 'Priority', items: [] },
      { title: 'Daily', items: [] }
    ];
    taskType = 'customTasks';
  }
  
  // Look for existing Deferred category
  let deferredCategoryIndex = taskList.findIndex(cat => cat.title === 'Deferred');
  
  if (deferredCategoryIndex === -1) {
    // Create new category for deferred tasks
    taskList.push({ title: 'Deferred', items: [] });
    deferredCategoryIndex = taskList.length - 1;
  }
  
  // Group tasks by their original category
  const categorizedTasks = {};
  deferredTasks.forEach(task => {
    const category = task.category || 'Uncategorized';
    if (!categorizedTasks[category]) {
      categorizedTasks[category] = [];
    }
    categorizedTasks[category].push(task);
  });
  
  // Add imported tasks to the deferred category with prefixes
  Object.entries(categorizedTasks).forEach(([category, tasks]) => {
    tasks.forEach(task => {
      // Create prefixed task text that shows original category and defer count if > 1
      const prefixedTask = task.deferCount > 1 
        ? `[${category} - ${task.deferCount}x] ${task.text}` 
        : `[${category}] ${task.text}`;
      
      // Avoid duplicates
      if (!taskList[deferredCategoryIndex].items.includes(prefixedTask)) {
        taskList[deferredCategoryIndex].items.push(prefixedTask);
      }
    });
  });
  
  // Initialize or update checked status for tasks
  if (!dayData.checked) {
    dayData.checked = {};
  }
  
  // Update checked status
  const newChecked = { ...dayData.checked };
  taskList.forEach(category => {
    category.items.forEach(item => {
      if (newChecked[item] === undefined) {
        newChecked[item] = false;
      }
    });
  });
  
  // Initialize or update task deferral history
  if (!dayData.taskDeferHistory) {
    dayData.taskDeferHistory = {};
  }
  
  // Update deferral history for each task
  deferredTasks.forEach(task => {
    // Create prefixed task text to match what we added to the list
    const prefixedTask = task.deferCount > 1 
      ? `[${task.category} - ${task.deferCount}x] ${task.text}` 
      : `[${task.category}] ${task.text}`;
    
    // Update deferral history
    dayData.taskDeferHistory[prefixedTask] = {
      count: task.deferCount + 1, // Increment defer count
      firstDate: task.firstDate
    };
    
    // Also maintain history for the original task text for backward compatibility
    dayData.taskDeferHistory[task.text] = {
      count: task.deferCount + 1,
      firstDate: task.firstDate
    };
  });
  
  // Update the day data
  dayData[taskType] = taskList;
  dayData.checked = newChecked;
  
  // Save to storage
  storage[currentDate] = dayData;
  setStorage(storage);
  
  return dayData;
};

/**
 * Get procrastination statistics for a given time period
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics 
 * @returns {Object} Procrastination statistics
 */
export const getProcrastinationStats = (startDate, endDate) => {
  const storage = getStorage();
  const stats = {
    totalDeferred: 0,
    maxDeferCount: 0,
    averageDeferCount: 0,
    maxDeferDays: 0,
    averageDeferDays: 0,
    tasksByDeferCount: [],
    deferCountByDay: [],
    deferralHistory: []
  };
  
  let totalDeferCount = 0;
  let totalDeferDays = 0;
  let totalTasks = 0;
  
  // Count of tasks by defer count (for histogram)
  const deferCountMap = {};
  
  // Process each day in the date range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayData = storage[dateStr];
    
    if (!dayData || !dayData.taskDeferHistory) continue;
    
    // Count deferrals for this day
    let dayDeferrals = 0;
    
    // Analyze task deferral history
    Object.entries(dayData.taskDeferHistory).forEach(([task, history]) => {
      // Only count tasks that were active on this day (either created or completed)
      const isTaskActiveOnDay = 
        (dayData.checked && task in dayData.checked) || 
        history.firstDate === dateStr;
      
      if (isTaskActiveOnDay) {
        const deferCount = history.count;
        dayDeferrals += deferCount;
        
        // Only process each unique task once across all days
        if (history.firstDate === dateStr) {
          totalDeferCount += deferCount;
          totalTasks++;
          
          // Update max defer count
          if (deferCount > stats.maxDeferCount) {
            stats.maxDeferCount = deferCount;
          }
          
          // Track in histogram data
          deferCountMap[deferCount] = (deferCountMap[deferCount] || 0) + 1;
          
          // Calculate days since first deferral
          const firstDate = new Date(history.firstDate);
          const currentDate = new Date(dateStr);
          const deferDays = Math.ceil((currentDate - firstDate) / (1000 * 60 * 60 * 24));
          
          if (deferDays > 0) {
            totalDeferDays += deferDays;
            
            // Update max defer days
            if (deferDays > stats.maxDeferDays) {
              stats.maxDeferDays = deferDays;
            }
            
            // Add to deferral history for timeline
            stats.deferralHistory.push({
              task,
              date: dateStr,
              count: deferCount,
              days: deferDays
            });
          }
        }
      }
    });
    
    // Add to daily defer count timeline
    if (dayDeferrals > 0) {
      stats.deferCountByDay.push({
        date: dateStr,
        count: dayDeferrals
      });
    }
  }
  
  // Calculate averages
  stats.totalDeferred = totalTasks;
  stats.averageDeferCount = totalTasks > 0 ? (totalDeferCount / totalTasks).toFixed(1) : 0;
  stats.averageDeferDays = totalTasks > 0 ? (totalDeferDays / totalTasks).toFixed(1) : 0;
  
  // Convert histogram data to array
  if (stats.maxDeferCount === 0 && Object.keys(deferCountMap).length === 0) {
    // Add dummy data point if there's no data
    stats.tasksByDeferCount.push({
      deferCount: 0,
      taskCount: 0
    });
  } else {
    for (let i = 0; i <= stats.maxDeferCount; i++) {
      stats.tasksByDeferCount.push({
        deferCount: i,
        taskCount: deferCountMap[i] || 0
      });
    }
  }
  
  // Sort timeline data
  stats.deferCountByDay.sort((a, b) => new Date(a.date) - new Date(b.date));
  stats.deferralHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return stats;
};