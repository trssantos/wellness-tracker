// utils/taskRegistry.js
import { getStorage, setStorage } from './storage';

// Initialize the task registry if it doesn't exist
export const initTaskRegistry = () => {
  const storage = getStorage();
  
  if (!storage.taskRegistry) {
    storage.taskRegistry = {
      tasks: {},  // Will store tasks with metadata
      version: 1  // For future migrations
    };
    setStorage(storage);
  }
  
  return storage.taskRegistry;
};

// Register/update a task when it's used
export const registerTask = (taskText, category = '') => {
  if (!taskText || taskText.trim() === '') return null;
  
  const storage = getStorage();
  
  if (!storage.taskRegistry) {
    initTaskRegistry();
  }
  
  const normalizedText = taskText.trim();
  
  if (!storage.taskRegistry.tasks[normalizedText]) {
    // First time seeing this task
    storage.taskRegistry.tasks[normalizedText] = {
      count: 1,
      categories: category ? [category] : [],
      firstUsed: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
  } else {
    // Update existing task
    storage.taskRegistry.tasks[normalizedText].count++;
    storage.taskRegistry.tasks[normalizedText].lastUsed = new Date().toISOString();
    
    // Add category if it's new
    if (category && !storage.taskRegistry.tasks[normalizedText].categories.includes(category)) {
      storage.taskRegistry.tasks[normalizedText].categories.push(category);
    }
  }
  
  setStorage(storage);
  return storage.taskRegistry.tasks[normalizedText];
};

// Get all registered tasks
export const getAllRegisteredTasks = () => {
  const storage = getStorage();
  
  if (!storage.taskRegistry) {
    initTaskRegistry();
    return [];
  }
  
  return Object.keys(storage.taskRegistry.tasks);
};

// Search for tasks matching a query
export const searchRegisteredTasks = (query) => {
  const allTasks = getAllRegisteredTasks();
  
  if (!query || query.trim() === '') {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  return allTasks
    .filter(task => task.toLowerCase().includes(lowerQuery))
    .sort((a, b) => {
      // Sort by "startsWith" first, then by frequency
      const aStarts = a.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.toLowerCase().startsWith(lowerQuery);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      const storage = getStorage();
      const aCount = storage.taskRegistry.tasks[a]?.count || 0;
      const bCount = storage.taskRegistry.tasks[b]?.count || 0;
      
      return bCount - aCount; // Sort by count descending
    })
    .slice(0, 10); // Limit to top 10 results
};

// Get detailed stats about task usage
export const getTaskStats = () => {
  const storage = getStorage();
  
  if (!storage.taskRegistry) {
    return { totalTasks: 0, totalCompletions: 0, topTasks: [] };
  }
  
  const tasks = storage.taskRegistry.tasks;
  const taskEntries = Object.entries(tasks);
  
  // Most frequently used tasks
  const topTasks = taskEntries
    .map(([name, data]) => ({
      name,
      count: data.count,
      categories: data.categories || []
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  // Total stats
  const totalTasks = taskEntries.length;
  const totalCompletions = taskEntries.reduce((sum, [_, data]) => sum + data.count, 0);
  
  return {
    totalTasks,
    totalCompletions,
    topTasks
  };
};

// Migration function to build task registry from existing data
export const migrateTasksToRegistry = () => {
  console.log('Starting task registry migration...');
  const storage = getStorage();
  
  // Initialize task registry if it doesn't exist
  if (!storage.taskRegistry) {
    storage.taskRegistry = {
      tasks: {},
      version: 1
    };
  }
  
  // Process all dates in storage
  let tasksProcessed = 0;
  let uniqueTasks = 0;
  
  Object.keys(storage).forEach(key => {
    // Only process date entries (YYYY-MM-DD format)
    if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const dayData = storage[key];
      
      // Process various task types (default, AI, or custom)
      const taskCategories = dayData.customTasks || dayData.aiTasks || dayData.defaultTasks;
      
      if (taskCategories && Array.isArray(taskCategories)) {
        // Process each category
        taskCategories.forEach(category => {
          if (category && category.items && Array.isArray(category.items)) {
            // Process each task
            category.items.forEach(task => {
              if (!task || task.trim() === '') return;
              
              tasksProcessed++;
              const isCompleted = dayData.checked && dayData.checked[task] === true;
              
              // Add to registry if not already there
              if (!storage.taskRegistry.tasks[task]) {
                storage.taskRegistry.tasks[task] = {
                  count: isCompleted ? 1 : 0,
                  categories: [category.title],
                  firstUsed: key, // Use the date as first used
                  lastUsed: key,  // Also use as last used
                  completedCount: isCompleted ? 1 : 0
                };
                uniqueTasks++;
              } else {
                // Update existing task entry
                if (isCompleted) {
                  storage.taskRegistry.tasks[task].count++;
                  storage.taskRegistry.tasks[task].completedCount = 
                    (storage.taskRegistry.tasks[task].completedCount || 0) + 1;
                }
                
                // Add unique category
                if (!storage.taskRegistry.tasks[task].categories.includes(category.title)) {
                  storage.taskRegistry.tasks[task].categories.push(category.title);
                }
                
                // Update last used date if this date is more recent
                if (key > storage.taskRegistry.tasks[task].lastUsed) {
                  storage.taskRegistry.tasks[task].lastUsed = key;
                }
              }
            });
          }
        });
      }
    }
  });
  
  // Save the registry
  setStorage(storage);
  
  console.log(`Migration complete: ${uniqueTasks} unique tasks from ${tasksProcessed} total tasks`);
  return {
    migrated: true,
    tasksProcessed,
    uniqueTasks
  };
};

// Register completion of a task
// Register completion of a task - with improved category support
export const registerTaskCompletion = (taskText, categoryTitle = '') => {
  // Handle both formats: simple task text and category-aware format
  let actualTaskText = taskText;
  
  // If the taskText contains a category separator, extract the actual task text
  if (taskText.includes('|')) {
    const parts = taskText.split('|');
    if (parts.length > 1) {
      actualTaskText = parts[1];
      // If no category was provided but we can extract it from the task text
      if (!categoryTitle) {
        categoryTitle = parts[0];
      }
    }
  }
  
  if (!actualTaskText || actualTaskText.trim() === '') return null;
  
  let storage = getStorage();
  
  if (!storage.taskRegistry) {
    initTaskRegistry();
    storage = getStorage(); // Refresh storage reference
  }
  
  const normalizedText = actualTaskText.trim();
  
  if (!storage.taskRegistry.tasks[normalizedText]) {
    // If task doesn't exist yet, register it first
    registerTask(normalizedText, categoryTitle);
    // Important: Get a fresh copy of storage after registering the task
    storage = getStorage();
  }
  
  // Now safely update the completion count
  if (storage.taskRegistry && storage.taskRegistry.tasks && storage.taskRegistry.tasks[normalizedText]) {
    // Add null check and default to 0 if completedCount doesn't exist
    storage.taskRegistry.tasks[normalizedText].completedCount = 
      (storage.taskRegistry.tasks[normalizedText].completedCount || 0) + 1;
    
    // Also increment regular count if it hasn't been done yet
    if (!storage.taskRegistry.tasks[normalizedText].count) {
      storage.taskRegistry.tasks[normalizedText].count = 1;
    }
    
    // Add category if provided and not already in the list
    if (categoryTitle && 
        storage.taskRegistry.tasks[normalizedText].categories && 
        !storage.taskRegistry.tasks[normalizedText].categories.includes(categoryTitle)) {
      storage.taskRegistry.tasks[normalizedText].categories.push(categoryTitle);
    }
    
    // Update last used timestamp
    storage.taskRegistry.tasks[normalizedText].lastUsed = new Date().toISOString();
    
    setStorage(storage);
    return storage.taskRegistry.tasks[normalizedText];
  } else {
    console.error('Failed to update completion count for task:', normalizedText);
    return null;
  }
};