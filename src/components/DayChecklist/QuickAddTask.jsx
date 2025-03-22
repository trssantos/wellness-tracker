// components/DayChecklist/QuickAddTask.jsx
import React from 'react';
import { Plus, X } from 'lucide-react';
import TaskSuggestions from '../TaskSuggestions';
import { registerTask } from '../../utils/taskRegistry';

const QuickAddTask = ({ quickAddText, setQuickAddText, onAdd, onCancel }) => {
  const handleInputChange = (e) => {
    setQuickAddText(e.target.value);
  };
  
  const handleSelectSuggestion = (suggestedTask) => {
    setQuickAddText(suggestedTask);
  };
  
  const handleAdd = () => {
    if (quickAddText.trim()) {
      registerTask(quickAddText.trim()); // Register the task
      onAdd();
    }
  };
  
  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex-1 relative">
        <input
          type="text"
          value={quickAddText}
          onChange={handleInputChange}
          placeholder="Type new task and press Enter"
          className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.isDefaultPrevented()) {
              handleAdd();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <TaskSuggestions 
          inputText={quickAddText} 
          onSelectTask={handleSelectSuggestion} 
        />
      </div>
      <button
        onClick={handleAdd}
        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={onCancel}
        className="p-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default QuickAddTask;