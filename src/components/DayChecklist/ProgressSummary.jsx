// DayChecklist/ProgressSummary.jsx
import React from 'react';
import { BarChart } from 'lucide-react';

const ProgressSummary = ({ checked, categories }) => {
  const getCategoryProgress = (categoryItems) => {
    if (!categoryItems || categoryItems.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = categoryItems.filter(item => checked[item]).length;
    const total = categoryItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const allItems = categories.flatMap(cat => cat.items);
  const totalCompleted = allItems.filter(item => checked[item]).length;
  const totalItems = allItems.length;
  const totalPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const getProgressColor = (percentage) => {
    if (percentage <= 25) return 'text-red-500 dark:text-red-400';
    if (percentage <= 50) return 'text-yellow-500 dark:text-yellow-400';
    if (percentage <= 75) return 'text-lime-500 dark:text-lime-400';
    return 'text-green-500 dark:text-green-400';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-4 mb-6 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <BarChart size={20} className="text-blue-500 dark:text-blue-400" />
        <h4 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Progress Summary</h4>
      </div>
      
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 transition-colors">
        <span className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Overall Progress</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${getProgressColor(totalPercentage)}`}>
            {totalPercentage}%
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
            ({totalCompleted}/{totalItems} tasks)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map((category, idx) => {
          const progress = getCategoryProgress(category.items);
          return (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 transition-colors">{category.title}</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getProgressColor(progress.percentage)}`}>
                  {progress.percentage}%
                </span>
                <span className="text-slate-400 dark:text-slate-500 transition-colors">
                  ({progress.completed}/{progress.total})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSummary;