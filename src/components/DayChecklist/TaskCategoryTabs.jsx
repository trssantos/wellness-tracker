// DayChecklist/TaskCategoryTabs.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const TaskCategoryTabs = ({ categories, activeCategory, setActiveCategory, onAddCategory }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((cat, idx) => (
        <button
          key={idx}
          onClick={() => setActiveCategory(idx)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${activeCategory === idx 
              ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' 
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
        >
          {cat.title}
        </button>
      ))}
      
      {/* Add Category Button */}
      <button
        onClick={onAddCategory}
        className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors flex items-center"
        title="Add new category"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default TaskCategoryTabs;