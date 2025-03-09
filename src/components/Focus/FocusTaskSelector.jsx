import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, X, List, Calendar, Star, Tag } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';

const FocusTaskSelector = ({ selectedTasks, onTasksChange }) => {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskCategory, setTaskCategory] = useState('Focus Tasks');
  
  // Load available tasks on component mount
  useEffect(() => {
    const tasks = getAvailableTasks();
    setAvailableTasks(tasks);
  }, []);
  
  // Get available tasks from storage
  const getAvailableTasks = () => {
    const storage = getStorage();
    const today = new Date().toISOString().split('T')[0];
    const tasks = [];
    
    // Loop through storage to find task entries
    Object.entries(storage).forEach(([dateKey, dateData]) => {
      // Skip if not a date entry or date is in the past
      if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/) || dateKey < today) {
        return;
      }
      
      // Skip if no checked property (no tasks)
      if (!dateData.checked) {
        return;
      }
      
      // Get all tasks that are not completed
      Object.entries(dateData.checked).forEach(([taskText, isCompleted]) => {
        if (!isCompleted) {
          tasks.push({
            id: `${dateKey}-${tasks.length}`,
            text: taskText,
            date: dateKey,
            isToday: dateKey === today
          });
        }
      });
    });
    
    // Sort tasks - today's tasks first, then by date
    return tasks.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.date.localeCompare(b.date);
    });
  };
  
  // Filter tasks based on search query
  const filteredTasks = availableTasks.filter(task => 
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Check if a task is selected
  const isTaskSelected = (taskId) => {
    return selectedTasks.some(task => task.id === taskId);
  };
  
  // Toggle a task selection
  const toggleTaskSelection = (task) => {
    if (isTaskSelected(task.id)) {
      // Remove task
      onTasksChange(selectedTasks.filter(t => t.id !== task.id));
    } else {
      // Add task
      onTasksChange([...selectedTasks, task]);
    }
  };
  
  // Create a new task
  const handleCreateTask = () => {
    if (!newTaskText.trim()) return;
    
    // Create task in Today's list
    const storage = getStorage();
    const today = new Date().toISOString().split('T')[0];
    const dayData = storage[today] || {};
    
    // Create or update the custom tasks
    let customTasks = dayData.customTasks || [];
    
    // See if we have a "Focus Tasks" category
    let focusCategory = customTasks.find(cat => cat.title === taskCategory);
    
    if (!focusCategory) {
      // Create the category if it doesn't exist
      focusCategory = { title: taskCategory, items: [] };
      customTasks.push(focusCategory);
    }
    
    // Add task to the Focus Tasks category
    focusCategory.items.push(newTaskText);
    
    // Update the checked status
    const checked = dayData.checked || {};
    checked[newTaskText] = false;
    
    // Save to storage
    storage[today] = {
      ...dayData,
      customTasks,
      checked
    };
    setStorage(storage);
    
    // Create the task object
    const newTask = {
      id: `${today}-new-${Date.now()}`,
      text: newTaskText,
      date: today,
      isToday: true
    };
    
    // Add to available tasks
    setAvailableTasks([newTask, ...availableTasks]);
    
    // Select the new task
    onTasksChange([...selectedTasks, newTask]);
    
    // Reset the form
    setNewTaskText('');
    setIsAddingTask(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateString === today) {
      return 'Today';
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    if (dateString === tomorrowString) {
      return 'Tomorrow';
    }
    
    // Otherwise, format as MMM D
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Handle select all tasks
  const handleSelectAllTasks = () => {
    if (filteredTasks.length === selectedTasks.length) {
      // If all are selected, deselect all
      onTasksChange([]);
    } else {
      // Otherwise, select all
      onTasksChange(filteredTasks);
    }
  };
  
  return (
    <div className="task-selector w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors">
          <List size={12} className="text-blue-500 dark:text-blue-400" />
          <span>Select Tasks to Focus On</span>
        </h3>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleSelectAllTasks}
            className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
          >
            {filteredTasks.length === selectedTasks.length ? 'Deselect All' : 'Select All'}
          </button>
          
          <button
            onClick={() => setIsAddingTask(true)}
            className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
          >
            <Plus size={10} className="inline mr-0.5" /> 
            <span>New</span>
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-7 pr-7 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Search className="absolute left-2 top-1.5 text-slate-400 dark:text-slate-500 h-4 w-4 transition-colors" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {/* New task form */}
      {isAddingTask && (
        <div className="mb-2 p-2 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 transition-colors">
          <div className="flex justify-between items-center mb-1.5">
            <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
              Add Task
            </h4>
            <button
              onClick={() => setIsAddingTask(false)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What do you need to focus on?"
            className="w-full px-2 py-1.5 mb-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Tag size={12} className="text-slate-500 dark:text-slate-400" />
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="text-[10px] py-0.5 px-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Focus Tasks">Focus Tasks</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Important">Important</option>
              </select>
            </div>
            
            <button
              onClick={handleCreateTask}
              disabled={!newTaskText.trim()}
              className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                !newTaskText.trim()
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                  : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              Add
            </button>
          </div>
        </div>
      )}
      
      {/* Task list - FIXED FOR MOBILE */}
      <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
        {filteredTasks.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 transition-colors">
            {searchQuery ? 'No matching tasks found.' : 'No tasks available. Add a task to get started.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700 transition-colors">
            {filteredTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleTaskSelection(task)}
                className={`
                  flex items-start p-2 cursor-pointer transition-colors
                  ${isTaskSelected(task.id) 
                    ? 'bg-blue-50 dark:bg-blue-900/30' 
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                `}
              >
                <div className={`
                  w-4 h-4 rounded flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 transition-colors
                  ${isTaskSelected(task.id) 
                    ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                    : 'border border-slate-300 dark:border-slate-500'}
                `}>
                  {isTaskSelected(task.id) && <CheckSquare size={10} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-200 break-words line-clamp-2 transition-colors">
                    {task.text}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`flex items-center gap-0.5 text-[10px] ${
                      task.isToday 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <Calendar size={8} />
                      {formatDate(task.date)}
                    </span>
                    
                    {task.isToday && (
                      <span className="text-[10px] px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full transition-colors">
                        Today
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected tasks summary */}
      {selectedTasks.length > 0 && (
        <div className="mt-2 bg-slate-50 dark:bg-slate-700 rounded-lg p-1.5 text-xs text-center transition-colors">
          <span className="text-slate-700 dark:text-slate-300 transition-colors">
            <Star size={10} className="inline text-amber-500 dark:text-amber-400 mr-0.5" />
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>
  );
};

export default FocusTaskSelector;