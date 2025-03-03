import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Check, X, ArrowRight, TrendingUp } from 'lucide-react';
import { getStorage } from '../utils/storage';

const PendingTasksPrompt = ({ date, previousDate, onImport, onSkip, onClose }) => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, oldestDays: 0, averageDays: 0 });

  useEffect(() => {
    if (date && previousDate) {
      loadPendingTasks();
    }
  }, [date, previousDate]);

  const loadPendingTasks = () => {
    setLoading(true);
    const storage = getStorage();
    const prevDayData = storage[previousDate] || {};
    
    // Find uncompleted tasks from previous day
    const uncompletedTasks = [];
    let oldestTaskDays = 0;
    let totalDeferDays = 0;
    
    if (prevDayData.checked) {
      // Collect tasks from custom or AI tasks
      const taskCategories = prevDayData.customTasks || prevDayData.aiTasks || [];
      
      taskCategories.forEach(category => {
        category.items.forEach(task => {
          // Only include if task exists in checked and is false (incomplete)
          if (prevDayData.checked[task] === false) {
            // Check if the task has a deferral history
            const deferHistory = prevDayData.taskDeferHistory?.[task] || { count: 0, firstDate: previousDate };
            const deferCount = deferHistory.count;
            
            // Calculate days since first deferral
            const firstDeferDate = new Date(deferHistory.firstDate);
            const currentDate = new Date(date);
            const daysSinceFirstDefer = Math.ceil((currentDate - firstDeferDate) / (1000 * 60 * 60 * 24));
            
            uncompletedTasks.push({
              text: task,
              category: category.title,
              deferCount: deferCount,
              daysSinceFirstDefer: daysSinceFirstDefer > 0 ? daysSinceFirstDefer : 0,
              firstDate: deferHistory.firstDate
            });
            
            // Track oldest task for stats
            if (daysSinceFirstDefer > oldestTaskDays) {
              oldestTaskDays = daysSinceFirstDefer;
            }
            
            // Add to total days for average calculation
            totalDeferDays += daysSinceFirstDefer;
          }
        });
      });
    }
    
    // Initialize all tasks as selected
    const initialSelected = {};
    uncompletedTasks.forEach(task => {
      initialSelected[task.text] = true;
    });
    
    setPendingTasks(uncompletedTasks);
    setSelectedTasks(initialSelected);
    
    // Calculate stats
    const avgDays = uncompletedTasks.length > 0 ? (totalDeferDays / uncompletedTasks.length).toFixed(1) : 0;
    setStats({
      count: uncompletedTasks.length,
      oldestDays: oldestTaskDays,
      averageDays: avgDays
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
    pendingTasks.forEach(task => {
      allSelected[task.text] = true;
    });
    setSelectedTasks(allSelected);
  };

  const handleSelectNone = () => {
    const noneSelected = {};
    pendingTasks.forEach(task => {
      noneSelected[task.text] = false;
    });
    setSelectedTasks(noneSelected);
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

  // Get tasks grouped by category
  const getTasksByCategory = () => {
    const categorized = {};
    
    pendingTasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(task);
    });
    
    return categorized;
  };

  const categorizedTasks = getTasksByCategory();
  const selectedCount = Object.values(selectedTasks).filter(Boolean).length;

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
          You completed all tasks from yesterday. Great job!
        </p>
        <button
          onClick={onSkip}
          className="btn-primary"
        >
          Continue
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
              You have {pendingTasks.length} pending tasks from yesterday
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Would you like to carry these tasks forward to today's list?
            </p>
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
        
        {/* Selection Controls */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Selected: <span className="font-medium">{selectedCount}</span> of {pendingTasks.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            >
              Select All
            </button>
            <button
              onClick={handleSelectNone}
              className="text-xs px-2 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              Select None
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="max-h-60 overflow-y-auto mb-6 pr-1">
        {Object.entries(categorizedTasks).map(([category, tasks]) => (
          <div key={category} className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
              {category}
            </h4>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.text}
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
                    <div className="text-slate-700 dark:text-slate-200 truncate">{task.text}</div>
                    <div className="flex items-center gap-2 mt-1">
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
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button 
          onClick={onSkip}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Skip
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
          Import Selected
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PendingTasksPrompt;