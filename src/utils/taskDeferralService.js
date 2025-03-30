// utils/taskDeferralService.js
import { getStorage, setStorage } from './storage';
import { formatDateForStorage } from './dateUtils';

/**
 * Find the most recent previous date that has tasks in storage
 * @param {string} currentDate - Current date in YYYY-MM-DD format
 * @returns {string|null} Previous date with tasks or null if none found
 */
export const findPreviousTaskDate = (currentDate) => {
  const storage = getStorage();
  const currentDateObj = new Date(currentDate);
  
  console.log(`Looking for pending tasks before ${currentDate}`);
  
  // If we already have data for this date, collect its tasks to exclude
  const currentDayTasks = new Set();
  const currentDayData = storage[currentDate];
  if (currentDayData) {
    const taskCategories = currentDayData.customTasks || currentDayData.aiTasks || currentDayData.defaultTasks;
    if (taskCategories && Array.isArray(taskCategories)) {
      taskCategories.forEach(category => {
        if (category && category.items && Array.isArray(category.items)) {
          category.items.forEach(task => {
            currentDayTasks.add(task);
          });
        }
      });
    }
  }
  
  console.log(`Current day has ${currentDayTasks.size} tasks that will be excluded from pending tasks`);
  
  // Helper function to check if a task was completed in a date range
  const wasCompletedInDateRange = (taskText, startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Loop through each day in the range
    const currentCheck = new Date(startDate);
    currentCheck.setDate(currentCheck.getDate() + 1); // Start from the day after
    
    while (currentCheck <= endDate) {
      const checkDateStr = formatDateForStorage(currentCheck);
      const dayData = storage[checkDateStr];
      
      // If this day has data and the task was completed, return true
      if (dayData && dayData.checked) {
        // Check both new category-based format and old format
        const wasCompleted = Object.entries(dayData.checked).some(([key, isChecked]) => {
          // For category-based format, extract just the task text
          const taskTextPart = key.includes('|') ? key.split('|')[1] : key;
          return isChecked === true && taskTextPart === taskText;
        });
        
        if (wasCompleted) return true;
      }
      
      // Move to next day
      currentCheck.setDate(currentCheck.getDate() + 1);
    }
    
    return false;
  };
  
  // Helper function to check if a task is from a habit
  const isHabitTask = (taskText) => {
    return taskText.startsWith('[') && taskText.includes(']');
  };
  
  // Look back up to 7 days to find previous tasks
  for (let i = 1; i <= 7; i++) {
    const prevDate = new Date(currentDateObj);
    prevDate.setDate(prevDate.getDate() - i);
    const prevDateStr = formatDateForStorage(prevDate);
    
    const prevDayData = storage[prevDateStr];
    console.log(`Checking date ${prevDateStr}:`, prevDayData ? 'has data' : 'no data');
    
    if (prevDayData) {
      console.log('Examining data for', prevDateStr);
      
      // Get all task items from various possible task lists
      const taskCategories = prevDayData.customTasks || prevDayData.aiTasks || prevDayData.defaultTasks;
      if (!taskCategories || !Array.isArray(taskCategories)) continue;
      
      // Check for uncompleted tasks that aren't already in current day and weren't completed later
      for (const category of taskCategories) {
        for (const task of category.items) {
          // Use both old and new category-based checked format
          const taskId = `${category.title}|${task}`;
          const isTaskChecked = prevDayData.checked[taskId] === true || prevDayData.checked[task] === true;
          
          // Skip if task is completed, is a habit task, already in current day, or completed later
          if (!isTaskChecked && 
              !isHabitTask(task) && 
              !currentDayTasks.has(task) &&
              !wasCompletedInDateRange(task, prevDateStr, currentDate)) {
            
            console.log(`Found pending task "${task}" from date ${prevDateStr}`);
            return prevDateStr;
          }
        }
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
    // Default to creating new custom tasks with basic categories
    taskList = [
      { title: 'Priority', items: [] },
      { title: 'Daily', items: [] }
    ];
    taskType = 'customTasks';
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
      taskList[deferredCategoryIndex].items.push(task.text);
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
    // Update deferral history
    dayData.taskDeferHistory[task.text] = {
      count: task.deferCount,
      firstDate: task.firstDate
    };
  });
  
  // Create a clean copy of the day data to ensure we preserve all properties
  const updatedDayData = { ...dayData };
  
  // Update the day data
  updatedDayData[taskType] = taskList;
  updatedDayData.checked = newChecked;
  
  // Remove defaultTasks if we converted to customTasks
  if (convertingDefault && updatedDayData.defaultTasks) {
    delete updatedDayData.defaultTasks;
  }
  
  // IMPORTANT FIX: Ensure templateTasks tracking is preserved
  // This is what was causing template tasks to disappear
  if (dayData.templateTasks && !updatedDayData.templateTasks) {
    updatedDayData.templateTasks = dayData.templateTasks;
    console.log('Preserved template tasks tracking during deferred task import');
  }
  
  // Save to storage
  storage[currentDate] = updatedDayData;
  setStorage(storage);
  
  console.log(`Imported ${deferredTasks.length} tasks into ${currentDate}`);
  
  return updatedDayData;
}

// First, update this function to handle the object format of taskDeferHistory
export const getProcrastinationStats = (startDate, endDate) => {
  try {
    const storage = getStorage();
    const deferralHistory = [];
    const deferCountByDay = [];
    let totalDeferred = 0;
    let maxDeferCount = 0;
    let maxDeferDays = 0;
    let allDeferCounts = [];
    
    // Debug log to check date range
    console.log("Procrastination Stats Date Range:", startDate, endDate);
    
    // Process each day's data in the range
    const days = getDaysInRange(startDate, endDate);
    console.log(`Found ${days.length} days in range`);
    
    days.forEach(dateStr => {
      const dayData = storage[dateStr];
      
      // Check the format of taskDeferHistory (object with task keys vs array of tasks)
      if (dayData && dayData.taskDeferHistory) {
        console.log(`Found taskDeferHistory for ${dateStr}`);
        
        // Handle object format (your current format)
        if (!Array.isArray(dayData.taskDeferHistory)) {
          const taskEntries = Object.entries(dayData.taskDeferHistory);
          console.log(`Found ${taskEntries.length} tasks in taskDeferHistory object`);
          
          // Count tasks for this day
          const count = taskEntries.length;
          totalDeferred += count;
          
          // Add to daily counts
          deferCountByDay.push({
            date: dateStr,
            count: count,
            day: new Date(dateStr).getDate()
          });
          
          // Process each deferred task
          taskEntries.forEach(([task, details]) => {
            // Calculate age in days (from firstDate to current date)
            const taskAge = calculateDaysBetween(details.firstDate, dateStr);
            
            // Add to deferral history
            deferralHistory.push({
              task,
              count: details.count,
              days: taskAge,
              date: dateStr,
              originalDate: details.firstDate
            });
            
            // Update max values
            maxDeferCount = Math.max(maxDeferCount, details.count);
            maxDeferDays = Math.max(maxDeferDays, taskAge);
            
            // Track all defer counts for distribution
            allDeferCounts.push(details.count);
          });
        } 
        // Handle array format (not your format, but keep for compatibility)
        else {
          const count = dayData.taskDeferHistory.length;
          totalDeferred += count;
          
          deferCountByDay.push({
            date: dateStr,
            count: count,
            day: new Date(dateStr).getDate()
          });
          
          dayData.taskDeferHistory.forEach(entry => {
            const { task, originalDate, count } = entry;
            const taskAge = calculateDaysBetween(originalDate, dateStr);
            
            deferralHistory.push({
              task,
              count: count || 1,
              days: taskAge,
              date: dateStr,
              originalDate
            });
            
            maxDeferCount = Math.max(maxDeferCount, count || 1);
            maxDeferDays = Math.max(maxDeferDays, taskAge);
            allDeferCounts.push(count || 1);
          });
        }
      }
    });
    
    // Sort deferral history and remove duplicates, keeping most recent
    const uniqueTasks = new Map();
    
    deferralHistory.forEach(entry => {
      const key = entry.task;
      if (!uniqueTasks.has(key) || entry.date > uniqueTasks.get(key).date) {
        uniqueTasks.set(key, entry);
      }
    });
    
    // Convert back to array
    const uniqueDeferralHistory = Array.from(uniqueTasks.values());
    
    // Log final count
    console.log(`Total after processing: ${totalDeferred} deferred tasks, ${uniqueDeferralHistory.length} unique tasks`);
    
    // Calculate distribution of tasks by defer count
    const tasksByDeferCount = [];
    const deferCounts = {};
    
    allDeferCounts.forEach(count => {
      deferCounts[count] = (deferCounts[count] || 0) + 1;
    });
    
    // Convert to array for charting
    Object.entries(deferCounts).forEach(([deferCount, taskCount]) => {
      tasksByDeferCount.push({
        deferCount: parseInt(deferCount),
        taskCount
      });
    });
    
    // Sort by deferCount
    tasksByDeferCount.sort((a, b) => a.deferCount - b.deferCount);
    
    // Calculate average defer count
    const averageDeferCount = allDeferCounts.length > 0
      ? Math.round((allDeferCounts.reduce((sum, count) => sum + count, 0) / allDeferCounts.length) * 10) / 10
      : 0;
    
    return {
      totalDeferred,
      maxDeferCount,
      maxDeferDays,
      averageDeferCount,
      deferCountByDay,
      deferralHistory: uniqueDeferralHistory, // Use the deduplicated list
      tasksByDeferCount
    };
  } catch (error) {
    console.error("Error getting procrastination stats:", error);
    return {
      totalDeferred: 0,
      maxDeferCount: 0,
      maxDeferDays: 0,
      averageDeferCount: 0,
      deferCountByDay: [],
      deferralHistory: [],
      tasksByDeferCount: []
    };
  }
};

// Helper function to get all days in date range (inclusive)
const getDaysInRange = (startDate, endDate) => {
  const dateArray = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set time to midnight to ensure we're comparing dates only
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  // Create a copy of start date for the loop
  const currentDate = new Date(start);
  
  // Loop through each day from start to end
  while (currentDate <= end) {
    // Add date in YYYY-MM-DD format
    dateArray.push(formatDateForStorage(currentDate));
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateArray;
};

// Helper function to calculate days between two date strings
const calculateDaysBetween = (startDateStr, endDateStr) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};