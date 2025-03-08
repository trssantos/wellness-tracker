import React, { useState } from 'react';
import { CheckSquare, Clock, Save, X, Award, MessageSquare, Star, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStorage, setStorage } from '../../utils/storage';

// Enhanced FocusSessionComplete component with productivity rating
const FocusSessionComplete = ({ 
  duration, 
  tasks, 
  onSubmit, 
  onCancel, 
  isFullscreen,
  tasksTimingData = {} // Default to empty object if not provided
}) => {
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [productivityRating, setProductivityRating] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Format duration from seconds to readable time
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  const saveSession = () => {
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
    
    // Submit the session data with ratings
    onSubmit({
      tasks: tasksToComplete,
      notes,
      productivityRating,
      energyLevel
    });
  };
  
  return (
    <div className={`focus-session-complete ${isFullscreen ? 'fullscreen-session-complete' : ''}`}>
      <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 flex items-center gap-3 transition-colors ${isFullscreen ? '!bg-black/30' : ''}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 transition-colors ${
          isFullscreen ? 'bg-white/10' : 'bg-blue-100 dark:bg-blue-800/50'
        }`}>
          <Award size={24} />
        </div>
        <div>
          <h3 className={`text-lg font-medium transition-colors ${
            isFullscreen ? 'text-white' : 'text-slate-800 dark:text-slate-200'
          }`}>
            Focus Session Complete!
          </h3>
          <p className={`text-sm flex items-center gap-1 transition-colors ${
            isFullscreen ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
          }`}>
            <Clock size={14} className="inline" />
            <span>You focused for {formatTime(duration)}</span>
          </p>
        </div>
      </div>
      
      {/* Productivity Rating */}
      <div className="mb-6">
        <h3 className={`text-sm font-medium mb-3 transition-colors ${
          isFullscreen ? 'text-white' : 'text-slate-700 dark:text-slate-300'
        }`}>
          How productive was this session?
        </h3>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${isFullscreen ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'}`}>Low</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <motion.button
                key={rating}
                onClick={() => setProductivityRating(rating)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-colors
                  ${productivityRating >= rating 
                    ? isFullscreen 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-500 dark:bg-amber-600 text-white'
                    : isFullscreen
                      ? 'bg-white/10 text-white/40'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star size={20} fill={productivityRating >= rating ? 'currentColor' : 'none'} />
              </motion.button>
            ))}
          </div>
          <span className={`text-xs ${isFullscreen ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'}`}>High</span>
        </div>
      </div>
      
      {/* Energy Level */}
      <div className="mb-6">
        <h3 className={`text-sm font-medium mb-3 transition-colors ${
          isFullscreen ? 'text-white' : 'text-slate-700 dark:text-slate-300'
        }`}>
          How's your energy level now?
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(level => (
            <motion.button
              key={level}
              onClick={() => setEnergyLevel(level)}
              className={`
                p-2 rounded-lg text-center transition-colors
                ${energyLevel === level 
                  ? isFullscreen 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-2 border-blue-500' 
                  : isFullscreen
                    ? 'bg-white/10 text-white/70'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-lg font-semibold">{level}</div>
              <div className="text-xs">
                {level === 1 ? 'Drained' : 
                 level === 2 ? 'Low' : 
                 level === 3 ? 'Moderate' : 
                 level === 4 ? 'Good' : 'Energized'}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Task completion section */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <h3 className={`text-sm font-medium mb-3 transition-colors ${
            isFullscreen ? 'text-white' : 'text-slate-700 dark:text-slate-300'
          }`}>
            Task Completion
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleTaskCompletion(task.id)}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  ${completedTaskIds.includes(task.id) 
                    ? isFullscreen 
                      ? 'bg-green-900/30 border border-green-800/50' 
                      : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                    : isFullscreen
                      ? 'bg-black/20 border border-white/10 hover:bg-white/10'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }
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
                      ? isFullscreen
                        ? 'text-green-300'
                        : 'text-green-700 dark:text-green-300'
                      : isFullscreen
                        ? 'text-white'
                        : 'text-slate-700 dark:text-slate-200'
                    }
                  `}>
                    {task.text}
                  </p>
                </div>
                
                {/* Display task timing if available */}
                {tasksTimingData && tasksTimingData[task.id] && (
                  <span className={`text-xs ${
                    isFullscreen ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'
                  } ml-2 whitespace-nowrap`}>
                    {formatTime(tasksTimingData[task.id])}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Session notes */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 flex items-center gap-2 transition-colors ${
          isFullscreen ? 'text-white' : 'text-slate-700 dark:text-slate-300'
        }`}>
          <MessageSquare size={16} />
          Session Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you accomplish? How did the session go?"
          className={`w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none transition-colors
            ${isFullscreen
              ? 'bg-black/30 text-white border-white/20 placeholder-white/50'
              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>
      
      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isFullscreen 
            ? 'bg-red-900/30 border-red-800/50 text-white' 
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} />
            <h4 className="font-medium">Cancel this focus session?</h4>
          </div>
          <p className="text-sm mb-4">
            Your progress and time spent will be lost and not recorded in your history.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                isFullscreen 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
              }`}
            >
              Keep Session
            </button>
            <button
              onClick={() => onCancel()}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <motion.button 
          onClick={() => setShowCancelConfirm(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isFullscreen
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <X size={18} />
          <span>Discard Session</span>
        </motion.button>
        
        <motion.button 
          onClick={saveSession}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isFullscreen
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckSquare size={18} />
          <span>Complete & Save</span>
        </motion.button>
      </div>
    </div>
  );
};

export default FocusSessionComplete;