// DayChecklist/EditTaskItem.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';

const EditTaskItem = ({ task, onTaskChange, onDeleteTask }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mr-1 transition-colors"></div>
      <input
        type="text"
        value={task}
        onChange={(e) => onTaskChange(e.target.value)}
        className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        placeholder="Task description"
      />
      <button
        onClick={onDeleteTask}
        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-md transition-colors"
        title="Delete task"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default EditTaskItem;