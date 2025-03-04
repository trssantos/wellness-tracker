// DayChecklist.jsx - Cleaned without pending tasks functionality
import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Sparkles } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import DayContext from './DayChecklist/DayContext';
import ProgressSummary from './DayChecklist/ProgressSummary';
import TaskCategoryTabs from './DayChecklist/TaskCategoryTabs';
import TaskList from './DayChecklist/TaskList';
import EditTaskPanel from './DayChecklist/EditTaskPanel';
import { TaskReminder } from './TaskReminder';

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

  useEffect(() => {
    setActiveCategory(0);
  }, [categories]);

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
  
  // Helper function to load tasks from storage
  const loadTasksFromStorage = (savedData) => {
    let taskCategories = DEFAULT_CATEGORIES;
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
    } else {
      // Default categories
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
  
    if (savedData?.checked) {
      setChecked(savedData.checked);
    } else {
      const initialChecked = {};
      taskCategories.forEach(category => {
        category.items.forEach(item => {
          initialChecked[item] = false;
        });
      });
      setChecked(initialChecked);
    }
    
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
      }))
      .filter(category => category.items.length > 0);
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

  const handleCheck = (item) => {
    const newChecked = {
      ...checked,
      [item]: !checked[item]
    };
    setChecked(newChecked);
    
    const storage = getStorage();
    const currentData = storage[date] || {};
    storage[date] = {
      ...currentData,
      checked: newChecked
    };
    setStorage(storage);
  };

  // Handle quick adding tasks
  const handleQuickAddTask = (categoryIndex) => {
    if (!quickAddText.trim()) {
      return;
    }
    
    // Create a copy of the current categories
    const newCategories = JSON.parse(JSON.stringify(categories));
    
    // Add the new task to the specified category
    newCategories[categoryIndex].items.push(quickAddText.trim());
    
    // Update checked state
    const newChecked = { ...checked };
    newChecked[quickAddText.trim()] = false;
    
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
    
    // Update local state
    setCategories(newCategories);
    setChecked(newChecked);
    setQuickAddText('');
    setQuickAddCategory(null);
  };

  // Task deletion function
  const handleDeleteTask = (taskText) => {
    // Create a copy of the current categories
    const newCategories = JSON.parse(JSON.stringify(categories));
    
    // Find the category that contains this task
    const categoryIndex = newCategories.findIndex(category => 
      category.items.includes(taskText)
    );
    
    if (categoryIndex === -1) return; // Task not found
    
    // Remove the task from the category
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
      item => item !== taskText
    );
    
    // Update checked state by removing the deleted task
    const newChecked = { ...checked };
    delete newChecked[taskText];
    
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

      if (category.items.length === 0) {
        setEditingError("Each category must have at least one task");
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

          <DayContext 
            context={dayContext} 
            onUpdate={handleContextUpdate} 
          />
          
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
              />

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
              />
            </>
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