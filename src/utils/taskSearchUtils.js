// utils/taskSearchUtils.js
import { getStorage } from './storage';

/**
 * Search for tasks across all dates in storage
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {boolean} options.caseSensitive - Whether the search should be case sensitive
 * @param {boolean} options.includeCompleted - Whether to include completed tasks
 * @param {number} options.limit - Maximum number of results to return (0 for unlimited)
 * @param {Date|string} options.startDate - Start date for date range filter (optional)
 * @param {Date|string} options.endDate - End date for date range filter (optional)
 * @returns {Array} Array of task results with date, task text, category, and completion status
 */
export const searchTasks = (query, options = {}) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const { 
    caseSensitive = false, 
    includeCompleted = true,
    limit = 0,
    startDate = null,
    endDate = null
  } = options;

  const storage = getStorage();
  const results = [];
  
  // Format search query
  const formattedQuery = caseSensitive ? query.trim() : query.trim().toLowerCase();
  
  // Get all date entries (those with YYYY-MM-DD format)
  let dateEntries = Object.keys(storage).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
  
  // Apply date range filter if specified
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0); // 0 = earliest possible date
    const end = endDate ? new Date(endDate) : new Date(); // Default to current date
    
    dateEntries = dateEntries.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= start && date <= end;
    });
  }
  
  // Sort dates by most recent first
  dateEntries.sort((a, b) => new Date(b) - new Date(a));
  
  // Search through all dates
  dateEntries.forEach(dateStr => {
    const dayData = storage[dateStr];
    
    // Skip if we've hit the limit
    if (limit && results.length >= limit) return;
    
    // Check if day has tasks
    const taskCategories = [
      { type: 'customTasks', data: dayData.customTasks },
      { type: 'aiTasks', data: dayData.aiTasks },
      { type: 'defaultTasks', data: dayData.defaultTasks }
    ];
    
    // Search through each type of tasks
    taskCategories.forEach(({ type, data }) => {
      if (!data || !Array.isArray(data)) return;
      
      // Search through each category
      data.forEach(category => {
        if (!category || !category.items || !Array.isArray(category.items)) return;
        
        // Search through each task
        category.items.forEach(task => {
          // Skip if we've hit the limit
          if (limit && results.length >= limit) return;
          
          // Format task text for comparison
          const formattedTask = caseSensitive ? task : task.toLowerCase();
          
          // Check if task matches search query
          if (formattedTask.includes(formattedQuery)) {
            // Create task ID to check completion status
            const taskId = `${category.title}|${task}`;
            const isCompleted = dayData.checked && (dayData.checked[taskId] === true || dayData.checked[task] === true);
            
            // Skip completed tasks if not including them
            if (!includeCompleted && isCompleted) return;
            
            // Add to results
            results.push({
              date: dateStr,
              task,
              category: category.title,
              taskType: type,
              isCompleted
            });
          }
        });
      });
    });
  });
  
  return results;
};

/**
 * Get a summary of recent task occurrences
 * @param {string} taskText - The exact task text to search for
 * @param {number} limit - Maximum number of occurrences to return
 * @returns {Array} Array of task occurrences with date and completion status
 */
export const getTaskHistory = (taskText, limit = 10) => {
  if (!taskText) return [];
  
  // Use the searchTasks function to find exact matches
  const results = searchTasks(taskText, {
    caseSensitive: true, // Exact match
    limit
  });
  
  // Filter to only exact matches
  return results.filter(result => result.task === taskText);
};