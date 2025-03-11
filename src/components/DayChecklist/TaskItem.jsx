// DayChecklist/TaskItem.jsx
import React, { useState } from 'react';
import { CheckCircle2, Circle, Bell, AlertTriangle, Trash2 } from 'lucide-react';

const TaskItem = ({ 
  taskText, 
  isChecked, 
  hasReminder, 
  onCheck, 
  onSetReminder, 
  onDeleteTask // This is now optional
}) => {
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    if (onDeleteTask) {
      onDeleteTask();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Handle click on delete icon
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  return (
    <div
      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
    >
      <div 
        className="flex items-center justify-center w-5 h-5 mr-3 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onCheck();
        }}
      >
        {isChecked ? (
          <CheckCircle2 size={20} className="text-green-500 dark:text-green-400" />
        ) : (
          <Circle size={20} className="text-slate-300 dark:text-slate-600" />
        )}
      </div>
      <span 
        className={`flex-1 text-slate-700 dark:text-slate-200 transition-colors ${isChecked ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}
        onClick={onCheck}
      >
        {taskText}
      </span>
      
      {/* Reminder Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSetReminder();
        }}
        className={`p-2 rounded-full ${
          hasReminder 
            ? 'text-blue-500 dark:text-blue-400' 
            : 'text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400'
        } transition-colors`}
        title={hasReminder ? "Edit reminder" : "Set reminder"}
      >
        <Bell size={16} className={hasReminder ? "fill-current" : ""} />
      </button>

      {/* Delete Button - Only show if deletion is enabled */}
      {onDeleteTask && (
        <button
          onClick={handleDeleteClick}
          className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Delete Confirmation Popup - Only show if deletion is enabled */}
      {showDeleteConfirm && onDeleteTask && (
        <div className="absolute z-10 top-0 left-0 right-0 bottom-0 bg-slate-900/20 dark:bg-slate-900/40 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg max-w-xs w-full">
            <div className="flex items-center gap-2 mb-2 text-amber-500 dark:text-amber-400">
              <AlertTriangle size={20} />
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Delete Task?</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded-md hover:bg-red-600 dark:hover:bg-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;