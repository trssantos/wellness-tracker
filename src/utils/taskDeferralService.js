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
  
  console.log(`Looking for pending tasks before ${currentDate}`);
  
  // Look back up to 7 days to find previous tasks
  for (let i = 1; i <= 7; i++) {
    const prevDate = new Date(currentDateObj);
    prevDate.setDate(prevDate.getDate() - i);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    const prevDayData = storage[prevDateStr];
    console.log(`Checking date ${prevDateStr}:`, prevDayData ? 'has data' : 'no data');
    
    if (prevDayData) {
      console.log('Examining data for', prevDateStr);
      if (prevDayData.checked) {
        console.log('Has checked items:', Object.keys(prevDayData.checked).length);
      }
      console.log('Has defaultTasks:', !!prevDayData.defaultTasks);
      console.log('Has aiTasks:', !!prevDayData.aiTasks);
      console.log('Has customTasks:', !!prevDayData.customTasks);
      
      const hasPending = hasPendingTasks(prevDayData);
      
      if (hasPending) {
        console.log(`Found pending tasks for date ${prevDateStr}`);
        return prevDateStr;
      }
    }
  }
  
  console.log('No pending tasks found in previous days');
  return null;
};

/**
 * Check if a day has any pending (uncompleted) tasks
 * @param {Object} dayData - The data for a specific day
 * @returns {boolean} True if there are pending tasks
 */
const hasPendingTasks = (dayData) => {
  if (!dayData || !dayData.checked) return false;
  
  // Get all uncompleted tasks
  const uncompletedTasks = Object.entries(dayData.checked)
    .filter(([task, isChecked]) => isChecked === false)
    .map(([task]) => task);
  
  if (uncompletedTasks.length === 0) {
    console.log('No uncompleted tasks found');
    return false;
  }
  
  console.log('Found uncompleted tasks:', uncompletedTasks.length, 'uncompleted tasks');
  
  // Get all tasks from all task lists (default, AI, or custom)
  let allTasks = [];
  
  // Check new format - explicit defaultTasks property
  if (dayData.defaultTasks && Array.isArray(dayData.defaultTasks)) {
    console.log('Found defaultTasks array with', dayData.defaultTasks.length, 'categories');
    allTasks = allTasks.concat(dayData.defaultTasks.flatMap(cat => cat.items || []));
  }
  
  // Check AI tasks
  if (dayData.aiTasks && Array.isArray(dayData.aiTasks)) {
    console.log('Found aiTasks array with', dayData.aiTasks.length, 'categories');
    allTasks = allTasks.concat(dayData.aiTasks.flatMap(cat => cat.items || []));
  }
  
  // Check custom tasks
  if (dayData.customTasks && Array.isArray(dayData.customTasks)) {
    console.log('Found customTasks array with', dayData.customTasks.length, 'categories');
    allTasks = allTasks.concat(dayData.customTasks.flatMap(cat => cat.items || []));
  }
  
  // Handle old format - check against DEFAULT_CATEGORIES directly if no explicit lists exist
  const hasExplicitTaskLists = allTasks.length > 0;
  
  if (!hasExplicitTaskLists) {
    // Import DEFAULT_CATEGORIES
    const DEFAULT_CATEGORIES = require('./defaultTasks').DEFAULT_CATEGORIES;
    const defaultTaskItems = DEFAULT_CATEGORIES.flatMap(cat => cat.items || []);
    
    // Check if this day has default tasks by comparing with DEFAULT_CATEGORIES
    const checkedTasks = Object.keys(dayData.checked || {});
    const defaultTaskCount = checkedTasks.filter(task => defaultTaskItems.includes(task)).length;
    
    console.log('Checking for default tasks (old format):', defaultTaskCount, 'matching tasks');
    
    if (defaultTaskCount > 0) {
      // This appears to be a default task list in the old format
      allTasks = allTasks.concat(defaultTaskItems);
    }
  }
  
  // Now check if any uncompleted tasks exist in our combined task list
  const pendingTasks = uncompletedTasks.filter(task => allTasks.includes(task));
  const hasPendingTasks = pendingTasks.length > 0;
  
  console.log('Found', pendingTasks.length, 'pending tasks out of', uncompletedTasks.length, 'uncompleted tasks');
  console.log('Pending task detection result:', hasPendingTasks);
  
  return hasPendingTasks;
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
  
  // Determine what type of task list to use/merge with
  let taskList;
  let taskType;
  let convertingDefault = false;
  
  if (dayData.customTasks && dayData.customTasks.length > 0) {
    taskList = JSON.parse(JSON.stringify(dayData.customTasks));
    taskType = 'customTasks';
  } else if (dayData.aiTasks && dayData.aiTasks.length > 0) {
    taskList = JSON.parse(JSON.stringify(dayData.aiTasks));
    taskType = 'aiTasks';
  } else if (dayData.defaultTasks && dayData.defaultTasks.length > 0) {
    // New format - explicit defaultTasks property
    taskList = JSON.parse(JSON.stringify(dayData.defaultTasks));
    taskType = 'customTasks'; // Convert to custom
    convertingDefault = true;
    console.log('Converting explicit defaultTasks to customTasks with deferred tasks');
  } else {
    // Check if we have old-style default tasks by comparing checked items with DEFAULT_CATEGORIES
    const DEFAULT_CATEGORIES = require('./defaultTasks').DEFAULT_CATEGORIES;
    const defaultTaskItems = DEFAULT_CATEGORIES.flatMap(cat => cat.items || []);
    const checkedTasks = Object.keys(dayData.checked || {});
    
    // If many checked items match default tasks, this is likely a default task list
    const matchCount = checkedTasks.filter(task => defaultTaskItems.includes(task)).length;
    
    if (matchCount > 5) { // Arbitrary threshold to determine if these are default tasks
      console.log('Detected old-style default tasks with', matchCount, 'matching items');
      taskList = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      taskType = 'customTasks';
      convertingDefault = true;
    } else {
      // Default to creating new custom tasks with basic categories
      taskList = [
        { title: 'Priority', items: [] },
        { title: 'Daily', items: [] }
      ];
      taskType = 'customTasks';
    }
  }
  
  console.log(`Using task list type: ${taskType} with ${taskList.length} categories`);
  
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
      const prefixedTask =  `[${task.deferCount}x] ${task.text}`;
      
      // Avoid duplicates
      if (!taskList[deferredCategoryIndex].items.includes(prefixedTask)) {
        taskList[deferredCategoryIndex].items.push(prefixedTask);
      }
    });
  });
  
  // Initialize or preserve checked status 
  const newChecked = { ...dayData.checked || {} };
  
  // Update checked status for new tasks
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
    const prefixedTask =  `[${task.deferCount}x] ${task.text}`;
    
    // Update deferral history
    dayData.taskDeferHistory[prefixedTask] = {
      count: task.deferCount,
      firstDate: task.firstDate
    };
    
    // Also maintain history for the original task text for backward compatibility
    dayData.taskDeferHistory[task.text] = {
      count: task.deferCount,
      firstDate: task.firstDate
    };
  });
  
  // Update the day data
  dayData[taskType] = taskList;
  dayData.checked = newChecked;
  
  // Remove defaultTasks if we converted to customTasks
  if (convertingDefault && dayData.defaultTasks) {
    delete dayData.defaultTasks;
  }
  
  // Save to storage
  storage[currentDate] = dayData;
  setStorage(storage);
  
  console.log(`Imported ${deferredTasks.length} tasks into ${currentDate}`);
  
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