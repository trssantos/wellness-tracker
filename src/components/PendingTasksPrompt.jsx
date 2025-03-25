import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Check, X, ArrowRight, TrendingUp, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { getStorage } from '../utils/storage';

const PendingTasksPrompt = ({ date, previousDate, onImport, onSkip, onClose }) => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, oldestDays: 0, averageDays: 0 });
  const [taskSources, setTaskSources] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({}); // Track expanded state
  const [searchQuery, setSearchQuery] = useState(''); // For search/filter
  
  useEffect(() => {
    if (date) {
      loadPendingTasksFromMultipleDays();
    }
  }, [date, previousDate]);

  const loadPendingTasksFromMultipleDays = () => {
    setLoading(true);
    const storage = getStorage();
    
    // Look back up to 7 days
    const currentDate = new Date(date);
    const allUncompletedTasks = [];
    const processedTaskTexts = new Set(); // Track unique task texts
    const sourceDates = new Set(); // Track days we found tasks from
    
    let oldestTaskDays = 0;
    let totalDeferDays = 0;
    
    // Helper function to check if a task is from a habit
    const isHabitTask = (taskText) => {
      return taskText.startsWith('[') && taskText.includes(']');
    };
    
    // IMPROVEMENT: First collect all tasks from current date to exclude later
    const currentDayData = storage[date] || {};
    const currentDayTasks = new Set();
    
    // Get all tasks from the current day's tasklists
    const currentTaskCategories = currentDayData.customTasks || currentDayData.aiTasks || currentDayData.defaultTasks;
    if (currentTaskCategories && Array.isArray(currentTaskCategories)) {
      currentTaskCategories.forEach(category => {
        if (category && category.items && Array.isArray(category.items)) {
          category.items.forEach(task => {
            currentDayTasks.add(task);
          });
        }
      });
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
        const checkDateStr = currentCheck.toISOString().split('T')[0];
        const dayData = storage[checkDateStr];
        
        // If this day has data and the task was completed, return true
        if (dayData && dayData.checked) {
          // Check both new category-based format and old format
          const wasCompleted = Object.entries(dayData.checked).some(([key, isChecked]) => {
            // For category-based format, extract just the task text
            const taskTextPart = key.includes('|') ? key.split('|')[1] : key;
            return isChecked === true && taskTextPart === taskText;
          });
          
          if (wasCompleted) {
            console.log(`Task "${taskText}" was completed on ${checkDateStr}`);
            return true;
          }
        }
        
        // Move to next day
        currentCheck.setDate(currentCheck.getDate() + 1);
      }
      
      return false;
    };
    
    // Check each of the past 7 days
    for (let i = 1; i <= 7; i++) {
      const pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - i);
      const pastDateStr = pastDate.toISOString().split('T')[0];
      
      const dayData = storage[pastDateStr];
      if (!dayData || !dayData.checked) continue;
      
      // Format date for display
      const formattedPastDate = pastDate.toLocaleDateString('default', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      
      // Calculate days difference
      const daysDifference = i;
      
      // Collect tasks from custom, AI, or default tasks
      const taskCategories = dayData.customTasks || dayData.aiTasks || dayData.defaultTasks;
      if (!taskCategories || !Array.isArray(taskCategories)) continue;
      
      let foundTasksInThisDay = false;
      
      taskCategories.forEach(category => {
        category.items.forEach(task => {
          // Skip if:
          // 1. Task is completed
          // 2. Task is a habit task 
          // 3. We've already processed this exact task text (duplicate)
          // 4. Task is already in the current day's tasks
          // 5. Task was completed in a later date
          
          // Use both old and new category-based checked format
          const taskId = `${category.title}|${task}`;
          const isTaskChecked = dayData.checked[taskId] === true || dayData.checked[task] === true;
          
          if (!isTaskChecked && 
              !isHabitTask(task) && 
              !processedTaskTexts.has(task) &&
              !currentDayTasks.has(task) &&
              !wasCompletedInDateRange(task, pastDateStr, date)) {
            
            processedTaskTexts.add(task); // Mark as processed
            
            // Check if the task has a deferral history
            const deferHistory = dayData.taskDeferHistory?.[task] || { count: 0, firstDate: pastDateStr };
            const deferCount = deferHistory.count;
            
            // Calculate days since first deferral
            const firstDeferDate = new Date(deferHistory.firstDate);
            const daysSinceFirstDefer = Math.ceil((currentDate - firstDeferDate) / (1000 * 60 * 60 * 24));
            
            allUncompletedTasks.push({
              text: task,
              category: category.title,
              deferCount: deferCount,
              daysSinceFirstDefer: daysSinceFirstDefer > 0 ? daysSinceFirstDefer : 0,
              firstDate: deferHistory.firstDate,
              daysAgo: daysDifference,
              sourceDate: formattedPastDate,
              sourceDateStr: pastDateStr
            });
            
            // Track stats
            if (daysSinceFirstDefer > oldestTaskDays) {
              oldestTaskDays = daysSinceFirstDefer;
            }
            totalDeferDays += daysSinceFirstDefer;
            foundTasksInThisDay = true;
          }
        });
      });
      
      if (foundTasksInThisDay) {
        sourceDates.add(formattedPastDate);
      }
    }
    
    // Sort by most recent first, then by category
    allUncompletedTasks.sort((a, b) => {
      // First sort by days ago (ascending)
      if (a.daysAgo !== b.daysAgo) {
        return a.daysAgo - b.daysAgo;
      }
      // Then sort by category
      return a.category.localeCompare(b.category);
    });
    
    // Initialize all tasks as selected
    const initialSelected = {};
    allUncompletedTasks.forEach(task => {
      initialSelected[task.text] = true;
    });
    
    // Initialize all categories as expanded
    const initialExpanded = {};
    allUncompletedTasks.forEach(task => {
      initialExpanded[task.category] = true;
    });
    
    setPendingTasks(allUncompletedTasks);
    setSelectedTasks(initialSelected);
    setExpandedCategories(initialExpanded);
    setTaskSources(Array.from(sourceDates));
    
    // Calculate stats
    const avgDays = allUncompletedTasks.length > 0 ? (totalDeferDays / allUncompletedTasks.length).toFixed(1) : 0;
    setStats({
      count: allUncompletedTasks.length,
      oldestDays: oldestTaskDays,
      averageDays: avgDays,
      sourceDaysCount: sourceDates.size
    });
    
    setLoading(false);
  };

  const handleToggleTask = (taskText) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskText]: !prev[taskText]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = {};
    getFilteredTasks().forEach(task => {
      allSelected[task.text] = true;
    });
    setSelectedTasks(prevSelected => ({
      ...prevSelected,
      ...allSelected
    }));
  };

  const handleSelectNone = () => {
    const noneSelected = {};
    getFilteredTasks().forEach(task => {
      noneSelected[task.text] = false;
    });
    setSelectedTasks(prevSelected => ({
      ...prevSelected,
      ...noneSelected
    }));
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleImport = () => {
    // Filter only selected tasks
    const tasksToImport = pendingTasks
      .filter(task => selectedTasks[task.text])
      .map(task => ({
        text: task.text,
        category: task.category,
        deferCount: task.deferCount + 1, // Increment defer count
        daysSinceFirstDefer: task.daysSinceFirstDefer,
        firstDate: task.firstDate
      }));
    
    onImport(tasksToImport);
  };

  // Filter tasks based on search query
  const getFilteredTasks = () => {
    if (!searchQuery.trim()) {
      return pendingTasks;
    }
    
    const query = searchQuery.toLowerCase();
    return pendingTasks.filter(task => 
      task.text.toLowerCase().includes(query) || 
      task.category.toLowerCase().includes(query)
    );
  };

  // Get filtered tasks grouped by category
  const getFilteredTasksByCategory = () => {
    const filteredTasks = getFilteredTasks();
    const categorized = {};
    
    filteredTasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(task);
    });
    
    return categorized;
  };

  // Highlight matching text in search results
  const highlightMatchingText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? 
            <span key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</span> : 
            part
        )}
      </>
    );
  };

  const categorizedTasks = getFilteredTasksByCategory();
  const filteredTasksCount = getFilteredTasks().length;
  const selectedCount = Object.values(selectedTasks).filter(Boolean).length;
  const selectedFilteredCount = getFilteredTasks().filter(task => selectedTasks[task.text]).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (pendingTasks.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">No pending tasks!</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You've completed all tasks from the past 7 days. Great job!
        </p>
        <button
          onClick={onSkip}
          className="btn-primary"
        >
          Continue to Your Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-1">
              You have {pendingTasks.length} pending tasks from the past {stats.sourceDaysCount} day{stats.sourceDaysCount !== 1 ? 's' : ''}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Would you like to add these incomplete tasks to your current list?
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar size={12} />
              <span>Tasks from: {taskSources.join(', ')}</span>
            </div>
          </div>
        </div>
        
        {/* Task Procrastination Stats */}
        {stats.count > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-500 dark:text-blue-400" />
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Procrastination Stats</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-slate-800 rounded-md p-2">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.count}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Pending Tasks</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-md p-2">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.oldestDays}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Days (oldest)</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-md p-2">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.averageDays}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Avg. Days</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Habit Tasks Exclusion Notice */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-700 dark:text-indigo-300">
              <strong>Note:</strong> Habit-related tasks (starting with "[Habit Name]") are not included, as they are designed for specific days based on your habit schedule.
            </div>
          </div>
        </div>
        
        {/* Search box */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
            </button>
          )}
        </div>
        
        {/* Selection Controls */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {searchQuery ? (
              <>Selected: <span className="font-medium">{selectedFilteredCount}</span> of {filteredTasksCount} (filtered)</>
            ) : (
              <>Selected: <span className="font-medium">{selectedCount}</span> of {pendingTasks.length}</>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            >
              Select All {searchQuery && "(Filtered)"}
            </button>
            <button
              onClick={handleSelectNone}
              className="text-xs px-2 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              Select None {searchQuery && "(Filtered)"}
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="max-h-60 overflow-y-auto mb-6 pr-1">
        {Object.entries(categorizedTasks).length === 0 && (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
            No tasks match your search
          </div>
        )}
        
        {Object.entries(categorizedTasks).map(([category, tasks]) => (
          <div key={category} className="mb-4">
            {/* Category header with toggle */}
            <div 
              className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mb-2"
              onClick={() => toggleCategory(category)}
            >
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                {expandedCategories[category] ? 
                  <ChevronDown size={16} className="mr-1" /> : 
                  <ChevronRight size={16} className="mr-1" />}
                {searchQuery ? 
                  highlightMatchingText(category, searchQuery) : 
                  category} ({tasks.length})
              </h4>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {tasks.filter(t => selectedTasks[t.text]).length} selected
              </div>
            </div>
            
            {/* Tasks in this category */}
            {expandedCategories[category] && (
              <div className="space-y-2 ml-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700 transition-all">
                {tasks.map((task) => (
                  <div 
                    key={`${task.text}-${task.sourceDateStr}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer
                      ${selectedTasks[task.text] 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}
                    `}
                    onClick={() => handleToggleTask(task.text)}
                  >
                    <div className="flex-shrink-0">
                      <div 
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${selectedTasks[task.text] 
                            ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600' 
                            : 'border-slate-300 dark:border-slate-600'}
                        `}
                      >
                        {selectedTasks[task.text] && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-700 dark:text-slate-200">
                        {searchQuery ? 
                          highlightMatchingText(task.text, searchQuery) : 
                          task.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* From date indicator */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                          <Calendar size={12} className="mr-1" />
                          {task.sourceDate || 'Unknown'} 
                          ({task.daysAgo === 1 ? 'Yesterday' : `${task.daysAgo} days ago`})
                        </span>
                        {task.deferCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                            <Clock size={12} className="mr-1" />
                            Deferred {task.deferCount} time{task.deferCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {task.daysSinceFirstDefer > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                            <AlertCircle size={12} className="mr-1" />
                            {task.daysSinceFirstDefer} day{task.daysSinceFirstDefer !== 1 ? 's' : ''} old
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button 
          onClick={onSkip}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Don't Add
        </button>
        <button
          onClick={handleImport}
          disabled={selectedCount === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            selectedCount === 0
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
              : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          Add Selected
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PendingTasksPrompt;