// components/DayChecklist/QuickAddCategory.jsx
import React, { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';

const QuickAddCategory = ({ newCategoryName, setNewCategoryName, onAdd, onCancel, existingCategories = [] }) => {
  const [error, setError] = useState('');
  
  const handleInputChange = (e) => {
    setNewCategoryName(e.target.value);
    setError(''); // Clear error when input changes
  };
  
  const handleAdd = () => {
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    
    // Check if category already exists
    if (existingCategories.some(cat => cat.title.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setError('This category already exists');
      return;
    }
    
    onAdd();
  };
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex-1">
          <input
            type="text"
            value={newCategoryName}
            onChange={handleInputChange}
            placeholder="Enter new category name"
            className={`w-full p-2 border ${error ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-600'} rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAdd();
              } else if (e.key === 'Escape') {
                onCancel();
              }
            }}
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
      
      {error && (
        <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-1">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default QuickAddCategory;