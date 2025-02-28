import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, BarChart, HelpCircle, Zap, Edit2, Save, Plus, Trash2, Sparkles, Bell } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import { MOODS } from './MoodSelector';
import { TaskReminder } from './TaskReminder';

const DEFAULT_CATEGORIES = [
  {
    title: "Morning Essentials",
    items: [
      "Open curtains for natural light",
      "Drink water with lemon",
      "3 deep breaths",
      "Gentle 2-min stretch",
      "Make bed",
      "Basic hygiene without rushing",
      "Simple breakfast"
    ]
  },
  {
    title: "Work Focus",
    items: [
      "Clear desk space",
      "Write top 3 tasks",
      "Check calendar",
      "Fill water bottle",
      "Close unnecessary tabs",
      "Set first timer (25min)",
      "Quick workspace tidy"
    ]
  },
  {
    title: "Creative Time",
    items: [
      "15-min coding practice",
      "Take one photo",
      "Write new project ideas",
      "Document progress",
      "Quick inspiration browse",
      "Review learning notes"
    ]
  },
  {
    title: "Self Care",
    items: [
      "Eat regular meal",
      "Take vitamins",
      "Stand/walk break",
      "Eye rest break",
      "Shoulder stretches",
      "Hydration check",
      "5-min meditation"
    ]
  },
  {
    title: "Evening Routine",
    items: [
      "Clean workspace",
      "Tomorrow's simple plan",
      "Relaxing activity",
      "Dim lights",
      "Device wind-down",
      "Gratitude moment",
      "Set out tomorrow's clothes"
    ]
  }
];

const DayContext = ({ context, onUpdate }) => {
  const { mood, energyLevel, objective, isAIGenerated, context: aiContext } = context;

  const getEnergyColor = (level, currentLevel) => {
    if (level > currentLevel) return 'text-slate-300 dark:text-slate-600';
    if (currentLevel === 1) return 'text-red-500 dark:text-red-400';
    if (currentLevel === 2) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6 transition-colors">
      <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-3 transition-colors">
        {isAIGenerated ? "Generated Task Context" : "Day Context"}
      </h4>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 w-16 transition-colors">Mood:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MOODS).map(([key, { emoji, label, color }]) => {
              const isSelected = mood === key;
              return (
                <button
                  key={key}
                  onClick={() => onUpdate({ ...context, mood: key })}
                  className={`
                    p-2 rounded-lg transition-all
                    ${isSelected ? `${color} shadow-md ring-2 ring-blue-500` : 'hover:bg-slate-100 dark:hover:bg-slate-700'}
                    ${!isSelected && mood ? 'opacity-40' : 'opacity-100'}
                  `}
                  title={label}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 w-16 transition-colors">Energy:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => onUpdate({ ...context, energyLevel: level })}
                className="transition-colors cursor-pointer"
              >
                <Zap
                  size={16}
                  className={`
                    ${level <= energyLevel ? 'fill-current' : 'fill-none'}
                    ${getEnergyColor(level, energyLevel)}
                  `}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 w-16 transition-colors">Focus:</span>
          <span className="flex-1 text-slate-700 dark:text-slate-300 transition-colors">{objective || "Another regular day"}</span>
          {isAIGenerated && aiContext && (
            <div className="group relative">
              <HelpCircle 
                size={16} 
                className="text-blue-500 dark:text-blue-400 cursor-help"
              />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg p-2 hidden group-hover:block z-10">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
                Additional Context: {aiContext}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgressSummary = ({ checked, categories }) => {
  const getCategoryProgress = (categoryItems) => {
    if (!categoryItems || categoryItems.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = categoryItems.filter(item => checked[item]).length;
    const total = categoryItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const allItems = categories.flatMap(cat => cat.items);
  const totalCompleted = allItems.filter(item => checked[item]).length;
  const totalItems = allItems.length;
  const totalPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const getProgressColor = (percentage) => {
    if (percentage <= 25) return 'text-red-500 dark:text-red-400';
    if (percentage <= 50) return 'text-yellow-500 dark:text-yellow-400';
    if (percentage <= 75) return 'text-lime-500 dark:text-lime-400';
    return 'text-green-500 dark:text-green-400';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-4 mb-6 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <BarChart size={20} className="text-blue-500 dark:text-blue-400" />
        <h4 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Progress Summary</h4>
      </div>
      
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 transition-colors">
        <span className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Overall Progress</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${getProgressColor(totalPercentage)}`}>
            {totalPercentage}%
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
            ({totalCompleted}/{totalItems} tasks)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map((category, idx) => {
          const progress = getCategoryProgress(category.items);
          return (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 transition-colors">{category.title}</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getProgressColor(progress.percentage)}`}>
                  {progress.percentage}%
                </span>
                <span className="text-slate-400 dark:text-slate-500 transition-colors">
                  ({progress.completed}/{progress.total})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  
  useEffect(() => {
    setActiveCategory(0);
  }, [categories]);

  useEffect(() => {
    if (!date) return;

    // Force reset to ensure we load fresh data
    setCategories([]);
    setEditedCategories([]);
    setChecked({});
    setTaskListType('default'); // Reset the task list type first
    setTaskReminders({});

    const savedData = getStorage()[date] || {};
    let taskCategories = DEFAULT_CATEGORIES;
    let listType = 'default';

    console.log('Loading data for date:', date, 'Storage data:', savedData);

    // AI Tasks take highest priority (change from previous logic)
    if (savedData?.aiTasks && Array.isArray(savedData.aiTasks)) {
      const validCategories = validateCategories(savedData.aiTasks);
      if (validCategories.length > 0) {
        taskCategories = validCategories;
        setDayContext({
          mood: savedData.mood || savedData.aiContext?.mood || null,
          energyLevel: savedData.energyLevel || savedData.aiContext?.energyLevel || 0,
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
          mood: savedData.mood || null,
          energyLevel: savedData.energyLevel || 0,
          objective: '',
          context: '',
          isAIGenerated: false
        });
        listType = 'custom';
      }
    } else {
      // Default categories
      setDayContext({
        mood: savedData.mood || null,
        energyLevel: savedData.energyLevel || 0,
        objective: '',
        context: '',
        isAIGenerated: false
      });
    }

    console.log('Setting task list type to:', listType);
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
  }, [date, storageVersion]);

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
    
    const hasCheckedItems = Object.values(newChecked).some(Boolean);
    if (hasCheckedItems) {
      const storage = getStorage();
      const currentData = storage[date] || {};
      storage[date] = {
        ...currentData,
        checked: newChecked
      };
      setStorage(storage);
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

  // Category editing functions
  const handleAddCategory = () => {
    setEditedCategories([
      ...editedCategories,
      { title: `Category ${editedCategories.length + 1}`, items: ['New Task'] }
    ]);
  };

  const handleDeleteCategory = (idx) => {
    if (editedCategories.length <= 1) {
      setEditingError("You must have at least one category");
      return;
    }
    setEditedCategories(editedCategories.filter((_, index) => index !== idx));
    setEditingError(null);
  };

  const handleCategoryTitleChange = (idx, newTitle) => {
    const newCategories = [...editedCategories];
    newCategories[idx].title = newTitle;
    setEditedCategories(newCategories);
  };

  // Task editing functions
  const handleAddTask = (categoryIdx) => {
    const newCategories = [...editedCategories];
    newCategories[categoryIdx].items.push('New Task');
    setEditedCategories(newCategories);
  };

  const handleDeleteTask = (categoryIdx, taskIdx) => {
    if (editedCategories[categoryIdx].items.length <= 1) {
      setEditingError("Each category must have at least one task");
      return;
    }
    
    const newCategories = [...editedCategories];
    newCategories[categoryIdx].items = newCategories[categoryIdx].items.filter(
      (_, idx) => idx !== taskIdx
    );
    setEditedCategories(newCategories);
    setEditingError(null);
  };

  const handleTaskChange = (categoryIdx, taskIdx, newText) => {
    const newCategories = [...editedCategories];
    newCategories[categoryIdx].items[taskIdx] = newText;
    setEditedCategories(newCategories);
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
                  onClick={() => {
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
                  }}
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

          <DayContext context={dayContext} onUpdate={handleContextUpdate} />
          
          {!isEditing && <ProgressSummary checked={checked} categories={categories} />}

          {isEditing ? (
            // Editing mode view
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
              {editedCategories.map((category, categoryIdx) => (
                <div key={categoryIdx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
                  <div className="flex items-center justify-between mb-4 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg border-l-4 border-blue-500 transition-colors">
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => handleCategoryTitleChange(categoryIdx, e.target.value)}
                      className="flex-1 p-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md font-medium text-slate-700 dark:text-slate-200 transition-colors"
                      placeholder="Category title"
                    />
                    <button
                      onClick={() => handleDeleteCategory(categoryIdx)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-md ml-2 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 ml-4 pl-2 border-l-2 border-slate-200 dark:border-slate-700 transition-colors">
                    {category.items.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mr-1 transition-colors"></div>
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => handleTaskChange(categoryIdx, taskIdx, e.target.value)}
                          className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          placeholder="Task description"
                        />
                        <button
                          onClick={() => handleDeleteTask(categoryIdx, taskIdx)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-md transition-colors"
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddTask(categoryIdx)}
                      className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mt-2 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 w-full justify-center transition-colors"
              >
                <Plus size={20} />
                <span>Add Category</span>
              </button>

              {editingError && (
                <div className="mt-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg transition-colors">
                  <p>{editingError}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={saveEdits}
                  className="flex-1 py-2 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Normal viewing mode
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(idx)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${activeCategory === idx 
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {categories[activeCategory]?.items.map((item, idx) => {
                  const taskText = typeof item === 'string' ? item : 
                               typeof item === 'object' && item.task ? item.task :
                               String(item);
                  const hasReminder = hasReminderForTask(taskText);
                  
                  return (
                    <div
                      key={`${activeCategory}-${idx}`}
                      className={`flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
                    >
                      <div 
                        className="flex items-center justify-center w-5 h-5 mr-3 cursor-pointer"
                        onClick={() => handleCheck(taskText)}
                      >
                        {checked[taskText] ? (
                          <CheckCircle2 size={20} className="text-green-500 dark:text-green-400" />
                        ) : (
                          <Circle size={20} className="text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <span 
                        className={`flex-1 text-slate-700 dark:text-slate-200 transition-colors ${checked[taskText] ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}
                        onClick={() => handleCheck(taskText)}
                      >
                        {taskText}
                      </span>
                      <button
                        onClick={() => handleSetReminder(taskText)}
                        className={`p-2 rounded-full ${
                          hasReminder 
                            ? 'text-blue-500 dark:text-blue-400' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400'
                        } transition-colors`}
                        title={hasReminder ? "Edit reminder" : "Set reminder"}
                      >
                        <Bell size={16} className={hasReminder ? "fill-current" : ""} />
                      </button>
                    </div>
                  );
                })}
              </div>
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