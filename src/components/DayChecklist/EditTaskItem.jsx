// components/DayChecklist/EditTaskItem.jsx
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import TaskSuggestions from '../TaskSuggestions';
import { registerTask } from '../../utils/taskRegistry';

const EditTaskItem = ({ task, onTaskChange, onDeleteTask }) => {
  const [inputValue, setInputValue] = useState(task);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleSelectSuggestion = (suggestedTask) => {
    setInputValue(suggestedTask);
    onTaskChange(suggestedTask); // Update the parent component
    registerTask(suggestedTask); // Register the reuse of this task
  };
  
  const handleBlur = () => {
    if (inputValue !== task) {
      onTaskChange(inputValue);
      if (inputValue.trim()) {
        registerTask(inputValue); // Register task when input is confirmed
      }
    }
  };
  
  return (
    <div className="flex items-center gap-2 relative">
      <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mr-1 flex-shrink-0 transition-colors"></div>
      <div className="flex-1 relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm transition-colors"
          placeholder="Task description"
        />
        <TaskSuggestions 
          inputText={inputValue} 
          onSelectTask={handleSelectSuggestion}
          excludeTasks={[task]} // Exclude the current task to avoid showing it as a suggestion
        />
      </div>
      <button
        onClick={onDeleteTask}
        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-md transition-colors flex-shrink-0"
        title="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default EditTaskItem;