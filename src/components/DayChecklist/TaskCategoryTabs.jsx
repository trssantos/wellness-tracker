// DayChecklist/TaskCategoryTabs.jsx
import React from 'react';

const TaskCategoryTabs = ({ categories, activeCategory, setActiveCategory }) => {
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
    </div>
  );
};

export default TaskCategoryTabs;