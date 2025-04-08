import React, { useState, useEffect, useRef } from 'react';
import { X, Edit2, Save, Sparkles, ArrowRight, Sun, Zap, CheckSquare, Clock } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import DayContext from './DayChecklist/DayContext';
import ProgressSummary from './DayChecklist/ProgressSummary';
import TaskCategoryTabs from './DayChecklist/TaskCategoryTabs';
import TaskList from './DayChecklist/TaskList';
import EditTaskPanel from './DayChecklist/EditTaskPanel';
import { TaskReminder } from './TaskReminder';
import HabitTaskIntegration from './HabitTaskIntegration';
import { getHabitsForDate, trackHabitCompletion, getHabitTaskNames } from '../utils/habitTrackerUtils';
import { handleDataChange } from '../utils/dayCoachUtils';
import { registerTaskCompletion } from '../utils/taskRegistry';
import QuickAddCategory from './DayChecklist/QuickAddCategory';

// Default categories from separate file
import { DEFAULT_CATEGORIES } from '../utils/defaultTasks';

export const DayChecklist = ({ date, storageVersion, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [checked, setChecked] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [dayContext, setDayContext] = useState({
    mood: null,
    energyLevel: 0,
    objective: '',
    isAIGenerated: false
  });
  
  // State for task list editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategories, setEditedCategories] = useState([]);
  const [editingError, setEditingError] = useState(null);
  const [taskListType, setTaskListType] = useState('default'); // 'default', 'ai', or 'custom'
  
  // State for task reminders
  const [reminderTask, setReminderTask] = useState(null);
  const [taskReminders, setTaskReminders] = useState({});
  
  // State for quick add tasks
  const [quickAddCategory, setQuickAddCategory] = useState(null);
  const [quickAddText, setQuickAddText] = useState('');

  const [habitUpdateTrigger, setHabitUpdateTrigger] = useState(0);
  
  // State for collapsible sections
  const [dayContextVisible, setDayContextVisible] = useState(false);
  const [habitsVisible, setHabitsVisible] = useState(false);
  const [tasksVisible, setTasksVisible] = useState(true); // Expanded by default

  // 1. Add new state variables for category creation
const [addingCategory, setAddingCategory] = useState(false);
const [newCategoryName, setNewCategoryName] = useState('');

  // Refs for maintaining scroll position
  const taskListRef = useRef(null);

  // 2. Add a new function in the DayChecklist component to handle opening the import tasks modal
const openImportTasksModal = () => {
  // Store the current date for reference
  const currentDate = date;
  
  // Close the current checklist modal
  onClose();
  
  // Using setTimeout to ensure the modal closes before opening the import modal
  setTimeout(() => {
    // Instead of creating new logic, we'll use the existing checkForPendingTasks function
    // but modified to search through multiple days
    if (typeof window.checkForPendingTasksMultiDay === 'function') {
      window.checkForPendingTasksMultiDay(currentDate, 7); // Check up to 7 previous days
    } else {
      console.error('checkForPendingTasksMultiDay function not available');
    }
  }, 100);
};

  // Only update activeCategory when categories change due to initial load, not during edits
  useEffect(() => {
    if (categories === DEFAULT_CATEGORIES) {
      setActiveCategory(0);
    }
  }, []);

  useEffect(() => {
    if (!date) return;
  
    // Reset all state to ensure we load fresh data
    setCategories([]);
    setEditedCategories([]);
    setChecked({});
    setTaskListType('default');
    setTaskReminders({});
  
    const storage = getStorage();
    const savedData = storage[date] || {};
    
    // Load tasks directly
    loadTasksFromStorage(savedData);
  }, [date, storageVersion]);

  const updateHabitCompletions = (newChecked) => {
    // Get habits for this day
    const habits = getHabitsForDate(date);
    
    if (!habits || habits.length === 0) return;
    
    let anyUpdates = false; // Track if any habits were updated
    
    // For each habit, check if all its tasks are completed
    habits.forEach(habit => {
      // Get all tasks for this habit
      const habitTasks = [];
      habit.steps.forEach(step => {
        habitTasks.push(`[${habit.name}] ${step}`);
      });
      
      // Check if all tasks for this habit are completed
      if (habitTasks.length === 0) return;
      
      // Check if all habit tasks exist in any category and are completed
      let allTasksCompleted = true;
      let anyTaskFound = false;
      
      habitTasks.forEach(habitTask => {
        let taskFound = false;
        let taskCompleted = false;
        
        // Search for this task in all categories
        for (const category of categories) {
          if (category.items.includes(habitTask)) {
            taskFound = true;
            const taskId = `${category.title}|${habitTask}`;
            
            if (newChecked[taskId] === true) {
              taskCompleted = true;
              break; // Found and completed in this category
            }
          }
        }
        
        // Also check old format for backward compatibility
        if (!taskFound && newChecked.hasOwnProperty(habitTask)) {
          taskFound = true;
          if (newChecked[habitTask] === true) {
            taskCompleted = true;
          }
        }
        
        if (taskFound) {
          anyTaskFound = true;
          if (!taskCompleted) {
            allTasksCompleted = false;
          }
        }
      });
      
      // Only proceed if we found any tasks for this habit
      if (anyTaskFound) {
        // Only update if the completion status has changed
        const currentStatus = habit.completions && habit.completions[date] === true;
        
        if (allTasksCompleted !== currentStatus) {
          console.log(`Setting habit "${habit.name}" completion to ${allTasksCompleted}`);
          trackHabitCompletion(habit.id, date, allTasksCompleted);
          anyUpdates = true;
        }
      }
    });
    
    // If any habits were updated, increment the update trigger to force re-render
    if (anyUpdates) {
      setHabitUpdateTrigger(prev => prev + 1);
    }
  };
  
  // Helper function to load tasks from storage
  // Helper function to load tasks from storage with category-aware checks
const loadTasksFromStorage = (savedData) => {
  let taskCategories = [];
  let listType = 'default';

  // AI Tasks take highest priority
  if (savedData?.aiTasks && Array.isArray(savedData.aiTasks)) {
    const validCategories = validateCategories(savedData.aiTasks);
    if (validCategories.length > 0) {
      taskCategories = validCategories;
      setDayContext({
        morningMood: savedData.morningMood || savedData.mood || savedData.aiContext?.mood || null,
        eveningMood: savedData.eveningMood || null,
        morningEnergy: savedData.morningEnergy || savedData.energyLevel || savedData.aiContext?.energyLevel || 0,
        eveningEnergy: savedData.eveningEnergy || 0,
        objective: savedData.aiContext?.objective || '',
        context: savedData.aiContext?.context || '',
        isAIGenerated: true
      });
      listType = 'ai';
    }
  }
  // Then check for Custom Tasks
  else if (savedData?.customTasks && Array.isArray(savedData.customTasks)) {
    const validCategories = validateCategories(savedData.customTasks);
    if (validCategories.length > 0) {
      taskCategories = validCategories;
      setDayContext({
        morningMood: savedData.morningMood || savedData.mood || null,
        eveningMood: savedData.eveningMood || null,
        morningEnergy: savedData.morningEnergy || savedData.energyLevel || 0,
        eveningEnergy: savedData.eveningEnergy || 0,
        objective: '',
        context: '',
        isAIGenerated: false
      });
      listType = 'custom';
    }
  }
  // Check for Default Tasks (now stored in the same way as AI and custom)
  else if (savedData?.defaultTasks && Array.isArray(savedData.defaultTasks)) {
    const validCategories = validateCategories(savedData.defaultTasks);
    if (validCategories.length > 0) {
      taskCategories = validCategories;
      setDayContext({
        morningMood: savedData.morningMood || savedData.mood || null,
        eveningMood: savedData.eveningMood || null,
        morningEnergy: savedData.morningEnergy || savedData.energyLevel || 0,
        eveningEnergy: savedData.eveningEnergy || 0,
        objective: '',
        context: '',
        isAIGenerated: false
      });
      listType = 'default';
    }
  } else {
    // Fallback to the original DEFAULT_CATEGORIES if nothing is stored
    taskCategories = DEFAULT_CATEGORIES;
    setDayContext({
      morningMood: savedData.morningMood || savedData.mood || null,
      eveningMood: savedData.eveningMood || null,
      morningEnergy: savedData.morningEnergy || savedData.energyLevel || 0,
      eveningEnergy: savedData.eveningEnergy || 0,
      objective: '',
      context: '',
      isAIGenerated: false
    });
  }

  setCategories(taskCategories);
  setEditedCategories(JSON.parse(JSON.stringify(taskCategories))); // Deep copy
  setTaskListType(listType);

  const newChecked = {};
  if (savedData?.checked) {
    // First, try to load using the new category-based format
    const oldChecked = savedData.checked;
    
    // Check if we need to migrate to new format
    const needsMigration = !Object.keys(oldChecked).some(key => key.includes('|'));
    
    if (needsMigration) {
      // Need to migrate old format to new category-based format
      taskCategories.forEach(category => {
        category.items.forEach(item => {
          const taskId = `${category.title}|${item}`;
          // Copy the value from the old format if it exists, otherwise default to false
          newChecked[taskId] = oldChecked[item] !== undefined ? oldChecked[item] : false;
        });
      });
    } else {
      // Already using new format, just copy it
      Object.assign(newChecked, oldChecked);
    }
  } else {
    // Initialize all tasks as unchecked in the new format
    taskCategories.forEach(category => {
      category.items.forEach(item => {
        const taskId = `${category.title}|${item}`;
        newChecked[taskId] = false;
      });
    });
  }
  
  setChecked(newChecked);
  
  // Load task reminders
  if (savedData?.taskReminders) {
    setTaskReminders(savedData.taskReminders);
  }

  // Reset active category to 0 whenever data changes
  setActiveCategory(0);
};

const validateCategories = (categoriesData) => {
  return categoriesData
    .filter(category => 
      category && 
      typeof category.title === 'string' && 
      Array.isArray(category.items)
    )
    .map(category => ({
      title: category.title,
      items: category.items
        .filter(item => item !== null && item !== undefined)
        .map(item => item.toString().trim())
        .filter(item => item.length > 0)
    }));
    // Removed the filter for empty items arrays to allow empty categories
};

// 3. Add a new function to handle adding a category
const handleAddCategory = () => {
  if (!newCategoryName.trim()) return;
  
  // Create a copy of the current categories
  const newCategories = JSON.parse(JSON.stringify(categories));
  
  // Add the new category with an empty items array
  newCategories.push({
    title: newCategoryName.trim(),
    items: []
  });
  
  // Update storage
  const storage = getStorage();
  const dayData = storage[date] || {};
  
  if (taskListType === 'custom') {
    storage[date] = {
      ...dayData,
      customTasks: newCategories
    };
  } else if (taskListType === 'ai') {
    storage[date] = {
      ...dayData,
      aiTasks: newCategories
    };
  } else {
    // For default, convert to custom when edited
    storage[date] = {
      ...dayData,
      customTasks: newCategories
    };
    setTaskListType('custom');
  }
  
  setStorage(storage);
  
  // Update local state
  setCategories(newCategories);
  setAddingCategory(false);
  setNewCategoryName('');
  
  // Set active category to the new one
  setActiveCategory(newCategories.length - 1);
};

// Handle editing a task with category-aware IDs
const handleEditTask = (oldTaskText, newTaskText, categoryTitle) => {
  // Safety check - don't allow editing protected tasks
  if (isProtectedTask(oldTaskText, categoryTitle)) return;
  
  if (oldTaskText === newTaskText) return; // No changes
  
  // Create a copy of the current categories
  const newCategories = JSON.parse(JSON.stringify(categories));
  
  // Find the category
  const categoryIndex = newCategories.findIndex(cat => cat.title === categoryTitle);
  if (categoryIndex === -1) return; // Category not found
  
  // Find the task in the category
  const taskIndex = newCategories[categoryIndex].items.indexOf(oldTaskText);
  if (taskIndex === -1) return; // Task not found
  
  // Update the task text
  newCategories[categoryIndex].items[taskIndex] = newTaskText;
  
  // Update checked state by keeping the same checked status but with new key
  const newChecked = { ...checked };
  const oldTaskId = `${categoryTitle}|${oldTaskText}`;
  const newTaskId = `${categoryTitle}|${newTaskText}`;
  
  // Transfer checked state from old to new task
  newChecked[newTaskId] = newChecked[oldTaskId] || false;
  delete newChecked[oldTaskId];
  
  // Update storage
  const storage = getStorage();
  const dayData = storage[date] || {};
  
  if (taskListType === 'custom') {
    storage[date] = {
      ...dayData,
      customTasks: newCategories,
      checked: newChecked
    };
  } else if (taskListType === 'ai') {
    storage[date] = {
      ...dayData,
      aiTasks: newCategories,
      checked: newChecked
    };
  } else {
    // For default, convert to custom when edited
    storage[date] = {
      ...dayData,
      customTasks: newCategories,
      checked: newChecked
    };
    setTaskListType('custom');
  }
  
  // If this task had a reminder, update the reminder key
  if (dayData.taskReminders && dayData.taskReminders[oldTaskText]) {
    // Create a copy of the reminder for the new task name
    storage[date].taskReminders = storage[date].taskReminders || {};
    storage[date].taskReminders[newTaskText] = storage[date].taskReminders[oldTaskText];
    delete storage[date].taskReminders[oldTaskText];
    
    // Update local state for reminders
    const newTaskReminders = { ...taskReminders };
    newTaskReminders[newTaskText] = newTaskReminders[oldTaskText];
    delete newTaskReminders[oldTaskText];
    setTaskReminders(newTaskReminders);
  }
  
  setStorage(storage);
  
  // Update local state
  setCategories(newCategories);
  setChecked(newChecked);
};


  const handleContextUpdate = (newContext) => {
    setDayContext(newContext);
    
    const storage = getStorage();
    const currentData = storage[date] || {};
    
    storage[date] = {
      ...currentData,
      mood: newContext.mood,
      energyLevel: newContext.energyLevel
    };

    // If this is an AI-generated task list, also update the aiContext
    if (currentData.aiTasks) {
      storage[date].aiContext = {
        ...currentData.aiContext,
        mood: newContext.mood,
        energyLevel: newContext.energyLevel
      };
    }
    
    setStorage(storage);
  };

  // Update how we track checked state with a category identifier
const handleCheck = (item, categoryTitle) => {
  // Create a unique identifier that includes both category and task text
  const taskId = `${categoryTitle}|${item}`;
  
  const newChecked = {
    ...checked,
    [taskId]: !checked[taskId]
  };
  setChecked(newChecked);
  
  // If the task was just completed, register the completion
  if (newChecked[taskId] === true) {
    registerTaskCompletion(item);
  }

  const storage = getStorage();
  const currentData = storage[date] || {};
  storage[date] = {
    ...currentData,
    checked: newChecked
  };
  setStorage(storage);

  // Check if all tasks are completed
  const allTasksCompleted = Object.values(newChecked).every(Boolean) && Object.keys(newChecked).length > 0;
  if (allTasksCompleted) {
    handleDataChange(date, 'tasks', { allCompleted: true });
  }
    
  // Update habit completions based on checked tasks
  updateHabitCompletions(newChecked);
};

  // Modified handleQuickAddTask to preserve category selection and scroll position
  // Modified handleQuickAddTask to use category-aware task IDs
const handleQuickAddTask = (categoryIndex) => {
  if (!quickAddText.trim()) {
    return;
  }
  
  // Keep the current active category
  const currentActiveCategory = activeCategory;
  
  // Create a copy of the current categories
  const newCategories = JSON.parse(JSON.stringify(categories));
  
  const categoryTitle = newCategories[categoryIndex].title;

  // Check if this exact task already exists in this category
  const taskExistsInThisCategory = newCategories[categoryIndex].items.includes(quickAddText.trim());
  
  if (taskExistsInThisCategory) {
    // Maybe show a warning or prevent adding
    console.warn("This task already exists in this category");
    return;
  }
    
  // Add the new task to the specified category
  newCategories[categoryIndex].items.push(quickAddText.trim());
  
  // Update checked state using the new category-aware format
  const taskId = `${categoryTitle}|${quickAddText.trim()}`;
  const newChecked = { ...checked };
  newChecked[taskId] = false;
  
  // Update storage
  const storage = getStorage();
  const dayData = storage[date] || {};
  
  if (taskListType === 'custom') {
    storage[date] = {
      ...dayData,
      customTasks: newCategories,
      checked: newChecked
    };
  } else if (taskListType === 'ai') {
    storage[date] = {
      ...dayData,
      aiTasks: newCategories,
      checked: newChecked
    };
  } else {
    // For default, convert to custom when edited
    storage[date] = {
      ...dayData,
      customTasks: newCategories,
      checked: newChecked
    };
    setTaskListType('custom');
  }
  
  setStorage(storage);
  
  // Update local state without changing active category
  setCategories(newCategories);
  setChecked(newChecked);
  setQuickAddText('');
  setQuickAddCategory(null);
  
  // Ensure we maintain the same active category
  if (currentActiveCategory !== activeCategory) {
    setActiveCategory(currentActiveCategory);
  }
};

// Helper function to check if a task is a protected task (habit or deferred)
const isProtectedTask = (taskText, categoryTitle) => {
  // Habit tasks are identified by starting with "[" and containing "]"
  const isHabitTask = taskText.startsWith('[') && taskText.includes(']');
  
  // Deferred tasks are in a category named "Deferred" or other similar names
  const isDeferredCategory = 
    categoryTitle === 'Deferred' || 
    categoryTitle === 'Imported' || 
    categoryTitle === 'From Previous Days' ||
    categoryTitle.toLowerCase().includes('defer') ||
    categoryTitle.toLowerCase().includes('import');
  
  return isHabitTask || isDeferredCategory;
};

 // Task deletion function with category-aware IDs
const handleDeleteTask = (taskText) => {
  // Create a copy of the current categories
  const newCategories = JSON.parse(JSON.stringify(categories));
  
  // Find the category that contains this task
  const categoryIndex = newCategories.findIndex(category => 
    category.items.includes(taskText)
  );
  
  if (categoryIndex === -1) return; // Task not found
  
  // Save current active category
  const currentActiveCategory = activeCategory;
  const categoryTitle = newCategories[categoryIndex].title;
  
  // Remove the task from the category
  newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
    item => item !== taskText
  );
  
  // Update checked state by removing the deleted task
  const newChecked = { ...checked };
  const taskId = `${categoryTitle}|${taskText}`;
  delete newChecked[taskId];
  
  // Update storage
  const storage = getStorage();
  const dayData = storage[date] || {};
  
  if (taskListType === 'custom') {
    storage[date] = {
      ...dayData,
      customTasks: newCategories,
      checked: newChecked
    };
  } else if (taskListType === 'ai') {
    storage[date] = {
      ...dayData,
      aiTasks: newCategories,
      checked: newChecked
    };
  } else {
    // For default, convert to custom when edited
    storage[date] = {
      ...dayData,
      customTasks: newCategories,
      checked: newChecked
    };
    setTaskListType('custom');
  }
  
  // If this task had a reminder, remove it
  if (dayData.taskReminders && dayData.taskReminders[taskText]) {
    delete storage[date].taskReminders[taskText];
    
    // Clean up empty reminders object
    if (Object.keys(storage[date].taskReminders).length === 0) {
      delete storage[date].taskReminders;
    }
  }
  
  setStorage(storage);
  
  // Update local state
  setCategories(newCategories);
  setChecked(newChecked);
  
  // Maintain active category
  if (currentActiveCategory !== activeCategory) {
    setActiveCategory(currentActiveCategory);
  }
};

  // Editing functions
  const toggleEditing = () => {
    if (isEditing) {
      // Save edits
      saveEdits();
    } else {
      // Start editing - make a deep copy of categories
      setEditedCategories(JSON.parse(JSON.stringify(categories)));
      setIsEditing(true);
      setEditingError(null);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingError(null);
  };

  const saveEdits = () => {
    // Validate edits
    for (const category of editedCategories) {
      if (!category.title.trim()) {
        setEditingError("Category titles cannot be empty");
        return;
      }

      for (const task of category.items) {
        if (!task.trim()) {
          setEditingError("Tasks cannot be empty");
          return;
        }
      }
    }

    // Clean categories for storage
    const cleanCategories = editedCategories.map(category => ({
      title: category.title.trim(),
      items: category.items.map(item => item.trim())
    }));

    // Update storage
    const storage = getStorage();
    const currentData = storage[date] || {};

    // Update the appropriate task list based on type
    if (taskListType === 'custom') {
      storage[date] = {
        ...currentData,
        customTasks: cleanCategories
      };
    } else if (taskListType === 'ai') {
      storage[date] = {
        ...currentData,
        aiTasks: cleanCategories
      };
    } else {
      // For default, convert to custom when edited
      storage[date] = {
        ...currentData,
        customTasks: cleanCategories
      };
      setTaskListType('custom');
    }

    // Update checked status map
    const allItems = cleanCategories.flatMap(cat => cat.items);
    const newChecked = { ...checked };
    
    // Remove checked items that no longer exist
    Object.keys(newChecked).forEach(task => {
      if (!allItems.includes(task)) {
        delete newChecked[task];
      }
    });
    
    // Add new items with unchecked status
    allItems.forEach(task => {
      if (newChecked[task] === undefined) {
        newChecked[task] = false;
      }
    });
    
    storage[date].checked = newChecked;
    setStorage(storage);
    setChecked(newChecked);
    
    // Update local state
    setCategories(cleanCategories);
    setIsEditing(false);
    setEditingError(null);
  };

  // Task reminder functions
  const handleSetReminder = (taskText) => {
    setReminderTask(taskText);
    
    // Open the task reminder modal
    setTimeout(() => {
      const modal = document.getElementById('task-reminder-modal');
      if (modal) {
        modal.showModal();
      }
    }, 100);
  };
  
  const handleReminderSet = (reminderData) => {
    // If reminderData is null, the reminder was deleted
    if (!reminderData) {
      const newTaskReminders = { ...taskReminders };
      delete newTaskReminders[reminderTask];
      setTaskReminders(newTaskReminders);
    } else {
      // Update task reminders state
      setTaskReminders({
        ...taskReminders,
        [reminderTask]: reminderData
      });
    }
    
    // Reset the reminder task
    setReminderTask(null);
  };
  
  const hasReminderForTask = (taskText) => {
    return taskReminders[taskText] !== undefined;
  };

  // Open AI task generator modal
  const openAIGenerator = () => {
    const currentDate = date; // Store the current date
    onClose();
    setTimeout(() => {
      // Use the stored date when opening the AI generator
      const aiModal = document.getElementById('ai-generator-modal');
      if (aiModal) {
        // Store the date in a data attribute so AITaskGenerator can access it
        aiModal.dataset.selectedDate = currentDate;
        aiModal.showModal();
      }
    }, 100);
  };

  // Section header component for collapsible sections
  const SectionHeader = ({ title, icon, section, isVisible, onToggle }) => (
    <div 
      onClick={onToggle} 
      className="cursor-pointer mb-4"
    >
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <ArrowRight className={`transition-transform duration-300 ${isVisible ? 'rotate-90' : ''}`} size={20} />
      </h3>
    </div>
  );

  if (!date) return null;

  return (
    <>
      <dialog 
        id="checklist-modal" 
        className="modal-base"
        onClick={(e) => e.target.id === 'checklist-modal' && onClose()}
      >
        <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3 className="modal-title">
                {new Date(date).toLocaleDateString('default', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="modal-subtitle flex items-center gap-2">
                <span>
                  {taskListType === 'ai' 
                    ? 'AI Generated Tasks' 
                    : taskListType === 'custom' 
                      ? 'Custom Tasks' 
                      : 'Default Tasks'}
                </span>
                <button
                  onClick={toggleEditing}
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 rounded-md transition-colors"
                  title={isEditing ? "Save changes" : "Edit tasks"}
                >
                  {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                </button>
                {/* Import Tasks Button */}
  <button
    onClick={openImportTasksModal}
    className="text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 p-1 rounded-md transition-colors group relative"
    title="Import unfinished tasks from previous days"
  >
    <Clock size={14} />
    {/* Tooltip explaining task import */}
    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 translate-y-full w-64 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded p-2 hidden group-hover:block z-10">
      Import unfinished tasks from up to 7 days ago. Habit tasks are excluded since they're designed for specific days.
    </div>
  </button>
                <button
                  onClick={openAIGenerator}
                  className="text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 p-1 rounded-md transition-colors"
                  title="Generate with AI"
                >
                  <Sparkles size={14} />
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="modal-close-button"
            >
              <X size={20} />
            </button>
          </div>

          {/* Day Context - collapsible */}
          <SectionHeader 
            title="Day Context" 
            icon={<Sun className="text-amber-500 dark:text-amber-400" size={20} />}
            section="dayContext"
            isVisible={dayContextVisible}
            onToggle={() => setDayContextVisible(!dayContextVisible)}
          />
          {dayContextVisible && (
            <DayContext 
              context={dayContext} 
              onUpdate={handleContextUpdate} 
            />
          )}

          {/* Habits for Today - collapsible */}
          <SectionHeader 
            title="Habits for Today" 
            icon={<Zap className="text-purple-500 dark:text-purple-400" size={20} />}
            section="habits"
            isVisible={habitsVisible}
            onToggle={() => setHabitsVisible(!habitsVisible)}
          />
          {habitsVisible && (
            <HabitTaskIntegration date={date} checked={checked} />
          )}
          
          {/* Tasks Section - collapsible but expanded by default */}
          <SectionHeader 
            title="Tasks" 
            icon={<CheckSquare className="text-blue-500 dark:text-blue-400" size={20} />}
            section="tasks"
            isVisible={tasksVisible}
            onToggle={() => setTasksVisible(!tasksVisible)}
          />
          
          {tasksVisible && (
            <div ref={taskListRef}>
              {!isEditing && (
                <ProgressSummary 
                  checked={checked} 
                  categories={categories} 
                />
              )}

              {isEditing ? (
                // Editing mode view
                <EditTaskPanel
                  editedCategories={editedCategories}
                  setEditedCategories={setEditedCategories}
                  editingError={editingError}
                  setEditingError={setEditingError}
                  saveEdits={saveEdits}
                  cancelEditing={cancelEditing}
                />
              ) : (
                // Normal viewing mode
                <>
                  <TaskCategoryTabs
  categories={categories}
  activeCategory={activeCategory}
  setActiveCategory={setActiveCategory}
  onAddCategory={() => setAddingCategory(true)}
/>

{addingCategory && (
  <QuickAddCategory
    newCategoryName={newCategoryName}
    setNewCategoryName={setNewCategoryName}
    onAdd={handleAddCategory}
    onCancel={() => {
      setAddingCategory(false);
      setNewCategoryName('');
    }}
    existingCategories={categories}
  />
)}

                  <TaskList
                    categories={categories}
                    activeCategory={activeCategory}
                    checked={checked}
                    handleCheck={handleCheck}
                    hasReminderForTask={hasReminderForTask}
                    handleSetReminder={handleSetReminder}
                    quickAddCategory={quickAddCategory}
                    setQuickAddCategory={setQuickAddCategory}
                    quickAddText={quickAddText}
                    setQuickAddText={setQuickAddText}
                    handleQuickAddTask={handleQuickAddTask}
                    handleDeleteTask={handleDeleteTask}
                    handleEditTask={handleEditTask}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </dialog>
      
      {/* Task Reminder Dialog */}
      {reminderTask && (
        <TaskReminder
          date={date}
          taskText={reminderTask}
          onClose={() => setReminderTask(null)}
          onReminderSet={handleReminderSet}
        />
      )}
    </>
  );
};

export default DayChecklist;