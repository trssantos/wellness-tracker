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
  for (let i = 1; i <= 7; i++) {
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
  
  // Create Deferred Tasks category
  let taskList;
  let taskType;
  
  // Determine what type of task list to create/update
  if (dayData.aiTasks && dayData.aiTasks.length > 0) {
    taskList = dayData.aiTasks;
    taskType = 'aiTasks';
  } else if (dayData.customTasks && dayData.customTasks.length > 0) {
    taskList = dayData.customTasks;
    taskType = 'customTasks';
  } else {
    // Default to creating custom tasks
    taskList = [];
    taskType = 'customTasks';
  }
  
  // Look for existing Deferred Tasks category
  let deferredCategory = taskList.find(cat => cat.title === 'Deferred Tasks');
  
  if (!deferredCategory) {
    // Create new category for deferred tasks
    deferredCategory = { title: 'Deferred Tasks', items: [] };
    taskList.push(deferredCategory);
  }
  
  // Add deferred tasks to the category
  deferredTasks.forEach(task => {
    if (!deferredCategory.items.includes(task.text)) {
      deferredCategory.items.push(task.text);
    }
  });
  
  // Initialize checked status for new tasks
  if (!dayData.checked) {
    dayData.checked = {};
  }
  
  // Set all imported tasks as unchecked
  deferredTasks.forEach(task => {
    dayData.checked[task.text] = false;
  });
  
  // Initialize or update task deferral history
  if (!dayData.taskDeferHistory) {
    dayData.taskDeferHistory = {};
  }
  
  // Update deferral history for each task
  deferredTasks.forEach(task => {
    // If this task already has history, we need to preserve the first deferral date
    if (dayData.taskDeferHistory[task.text]) {
      dayData.taskDeferHistory[task.text].count = task.deferCount;
    } else {
      // Calculate the first date this task was created based on defer count and days
      let firstDate;
      if (task.daysSinceFirstDefer > 0) {
        const firstDateObj = new Date(currentDate);
        firstDateObj.setDate(firstDateObj.getDate() - task.daysSinceFirstDefer);
        firstDate = firstDateObj.toISOString().split('T')[0];
      } else {
        firstDate = currentDate;
      }
      
      // Create new history entry
      dayData.taskDeferHistory[task.text] = {
        count: task.deferCount,
        firstDate: firstDate
      };
    }
  });
  
  // Update the day data
  dayData[taskType] = taskList;
  
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
  for (let i = 0; i <= stats.maxDeferCount; i++) {
    stats.tasksByDeferCount.push({
      deferCount: i,
      taskCount: deferCountMap[i] || 0
    });
  }
  
  // Sort timeline data
  stats.deferCountByDay.sort((a, b) => new Date(a.date) - new Date(b.date));
  stats.deferralHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return stats;
};