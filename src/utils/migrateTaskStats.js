// src/utils/migrateTaskStats.js

import { getStorage, setStorage } from './storage';

/**
 * Rebuilds the task registry by scanning all historical completions
 * and properly updating the tasks object with correct completion counts
 */
export const rebuildTaskStats = () => {
  console.log('Starting task statistics rebuild...');
  const storage = getStorage();
  
  // If no taskRegistry exists, initialize it
  if (!storage.taskRegistry) {
    storage.taskRegistry = {
      tasks: {},
      version: 1
    };
  }
  
  // Reset all completion counts (keep other metadata)
  Object.keys(storage.taskRegistry.tasks).forEach(taskKey => {
    if (storage.taskRegistry.tasks[taskKey]) {
      storage.taskRegistry.tasks[taskKey].completedCount = 0;
    }
  });
  
  // Stats for reporting
  let daysProcessed = 0;
  let tasksProcessed = 0;
  let completionsFound = 0;
  
  // Process all dates in storage
  Object.keys(storage).forEach(key => {
    // Only process date entries (YYYY-MM-DD format)
    if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const dayData = storage[key];
      daysProcessed++;
      
      // Skip if no checked data exists
      if (!dayData.checked) return;
      
      // Get the task categories for this day
      const taskCategories = dayData.customTasks || dayData.aiTasks || dayData.defaultTasks;
      if (!taskCategories || !Array.isArray(taskCategories)) return;
      
      // Build a map of task text to categories
      const taskToCategory = {};
      taskCategories.forEach(category => {
        if (category && category.items && Array.isArray(category.items)) {
          category.items.forEach(task => {
            if (task && task.trim()) {
              taskToCategory[task] = category.title;
              tasksProcessed++;
            }
          });
        }
      });
      
      // Process all checked items
      Object.entries(dayData.checked).forEach(([taskKey, isChecked]) => {
        // Skip if not completed
        if (!isChecked) return;
        
        let taskText = taskKey;
        let categoryTitle = '';
        
        // Check if this is a category-based ID (contains '|')
        if (taskKey.includes('|')) {
          const [category, task] = taskKey.split('|');
          taskText = task;
          categoryTitle = category;
        } else {
          // For old format, try to find the category from our map
          categoryTitle = taskToCategory[taskKey] || '';
        }
        
        // Skip empty tasks
        if (!taskText || !taskText.trim()) return;
        
        // Update or create the task in the registry
        if (!storage.taskRegistry.tasks[taskText]) {
          // Create new task entry if it doesn't exist
          storage.taskRegistry.tasks[taskText] = {
            count: 1,
            completedCount: 1,
            categories: categoryTitle ? [categoryTitle] : [],
            firstUsed: key,
            lastUsed: key
          };
        } else {
          // Update existing task
          // Increment completed count
          storage.taskRegistry.tasks[taskText].completedCount = 
            (storage.taskRegistry.tasks[taskText].completedCount || 0) + 1;
          
          // Add category if not already present
          if (categoryTitle && 
              !storage.taskRegistry.tasks[taskText].categories.includes(categoryTitle)) {
            storage.taskRegistry.tasks[taskText].categories.push(categoryTitle);
          }
          
          // Update lastUsed if this date is more recent
          if (key > storage.taskRegistry.tasks[taskText].lastUsed) {
            storage.taskRegistry.tasks[taskText].lastUsed = key;
          }
        }
        
        completionsFound++;
      });
    }
  });
  
  // Detect and handle special case - habit tasks
  Object.keys(storage.taskRegistry.tasks).forEach(taskKey => {
    if (taskKey.startsWith('[') && taskKey.includes(']')) {
      const match = taskKey.match(/\[(.*?)\]/);
      if (match && match[1]) {
        storage.taskRegistry.tasks[taskKey].isHabit = true;
        storage.taskRegistry.tasks[taskKey].habitName = match[1];
      }
    }
  });
  
  // Update version to mark as migrated
  storage.taskRegistry.version = 2;
  storage.taskRegistry.lastRebuild = new Date().toISOString();
  
  // Save the updated registry
  setStorage(storage);
  
  console.log(`Task stats rebuild complete!`);
  console.log(`Processed ${daysProcessed} days, ${tasksProcessed} tasks, found ${completionsFound} completions`);
  
  return {
    daysProcessed,
    tasksProcessed,
    completionsFound
  };
};

/**
 * A simple function to execute the migration from the browser console
 * Displays an alert when complete
 */
export const fixTaskStats = () => {
  try {
    const result = rebuildTaskStats();
    console.log('Task statistics have been rebuilt!');
    console.log(`Found ${result.completionsFound} task completions across ${result.daysProcessed} days`);
    if (typeof alert !== 'undefined') {
      alert(`Task statistics rebuilt successfully!\n\nFound ${result.completionsFound} completions across ${result.daysProcessed} days.`);
    }
    return result;
  } catch (error) {
    console.error('Error rebuilding task statistics:', error);
    if (typeof alert !== 'undefined') {
      alert(`Error rebuilding task statistics: ${error.message}`);
    }
    return null;
  }
};

// Make the function available globally for easy console access
if (typeof window !== 'undefined') {
  window.fixTaskStats = fixTaskStats;
}