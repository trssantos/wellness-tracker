// DayChecklist/TaskItem.jsx
import React from 'react';
import { CheckCircle2, Circle, Bell } from 'lucide-react';

const TaskItem = ({ taskText, isChecked, hasReminder, onCheck, onSetReminder }) => {
  return (
    <div
      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      <div 
        className="flex items-center justify-center w-5 h-5 mr-3 cursor-pointer"
        onClick={onCheck}
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
        onClick={onSetReminder}
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
};

export default TaskItem;