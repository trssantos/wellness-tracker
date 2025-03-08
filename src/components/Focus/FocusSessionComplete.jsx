import React, { useState } from 'react';
import { CheckSquare, Clock, Save, X, Award, MessageSquare } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';

const FocusSessionComplete = ({ duration, tasks, onSubmit, onCancel }) => {
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [notes, setNotes] = useState('');
  
  // Format duration from seconds to readable time
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else {
      return `${minutes}m ${secs}s`;
    }
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    if (completedTaskIds.includes(taskId)) {
      setCompletedTaskIds(completedTaskIds.filter(id => id !== taskId));
    } else {
      setCompletedTaskIds([...completedTaskIds, taskId]);
    }
  };
  
  // Mark tasks as completed in storage
  const markTasksAsCompleted = () => {
    const storage = getStorage();
    
    // Get list of tasks to mark as completed
    const tasksToComplete = tasks.filter(task => completedTaskIds.includes(task.id));
    
    // Group tasks by date
    const tasksByDate = {};
    tasksToComplete.forEach(task => {
      if (!tasksByDate[task.date]) {
        tasksByDate[task.date] = [];
      }
      tasksByDate[task.date].push(task.text);
    });
    
    // Update storage for each date
    Object.entries(tasksByDate).forEach(([date, taskTexts]) => {
      const dayData = storage[date] || {};
      const checked = dayData.checked || {};
      
      // Mark tasks as completed
      taskTexts.forEach(taskText => {
        checked[taskText] = true;
      });
      
      // Save back to storage
      storage[date] = {
        ...dayData,
        checked
      };
    });
    
    setStorage(storage);
    
    // Submit the session data
    onSubmit({
      tasks: tasksToComplete,
      notes
    });
  };
  
  return (
    <div className="focus-session-complete">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 flex items-center gap-3 transition-colors">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-300 transition-colors">
          <Award size={24} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 transition-colors">
            Focus Session Complete!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 transition-colors">
            <Clock size={14} className="inline" />
            <span>You focused for {formatDuration(duration)}</span>
          </p>
        </div>
      </div>
      
      {/* Task completion section */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors">
            Did you complete any tasks?
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleTaskCompletion(task.id)}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  ${completedTaskIds.includes(task.id) 
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}
                `}
              >
                <div className={`
                  w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors
                  ${completedTaskIds.includes(task.id) 
                    ? 'bg-green-500 dark:bg-green-600 text-white' 
                    : 'border border-slate-300 dark:border-slate-500'}
                `}>
                  {completedTaskIds.includes(task.id) && <CheckSquare size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm transition-colors
                    ${completedTaskIds.includes(task.id) 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-slate-700 dark:text-slate-200'}
                  `}>
                    {task.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Session notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2 transition-colors">
          <MessageSquare size={16} />
          Session Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you accomplish? How did the session go?"
          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
        />
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <X size={18} />
          <span>Cancel</span>
        </button>
        
        <button 
          onClick={markTasksAsCompleted}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save size={18} />
          <span>Save Session</span>
        </button>
      </div>
    </div>
  );
};

export default FocusSessionComplete;