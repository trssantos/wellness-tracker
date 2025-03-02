// DayChecklist/DeletableTaskItem.jsx
import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, Bell, AlertTriangle, Trash2 } from 'lucide-react';

const DeletableTaskItem = ({ 
  taskText, 
  isChecked, 
  hasReminder, 
  onCheck, 
  onSetReminder, 
  onDeleteTask
}) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePosition, setDeletePosition] = useState({ x: 0, y: 0 });
  const pressTimeoutRef = useRef(null);
  const taskItemRef = useRef(null);

  // Cancel the long press timeout when unmounting
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);

  // Handle long press on mobile
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent default to allow long press
    pressTimeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      setShowDeleteConfirm(true);
      // Center the delete confirmation
      if (taskItemRef.current) {
        const rect = taskItemRef.current.getBoundingClientRect();
        setDeletePosition({ 
          x: rect.width / 2, 
          y: rect.height / 2 
        });
      }
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    setIsLongPressing(false);
  };

  // Handle right-click on desktop
  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowDeleteConfirm(true);
    setDeletePosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteTask(taskText);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div
      ref={taskItemRef}
      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={handleContextMenu}
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

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
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

export default DeletableTaskItem;