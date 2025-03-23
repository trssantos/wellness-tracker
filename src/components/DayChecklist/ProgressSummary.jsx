// DayChecklist/ProgressSummary.jsx
import React from 'react';
import { BarChart } from 'lucide-react';

const ProgressSummary = ({ checked, categories }) => {
  // Calculate completion statistics with the new category-based format
  const calculateStats = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    // Process all categories and items
    categories.forEach(category => {
      category.items.forEach(item => {
        // Create the composite key
        const taskId = `${category.title}|${item}`;
        totalTasks++;
        if (checked[taskId] === true) {
          completedTasks++;
        }
      });
    });
    
    const completionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    return {
      totalTasks,
      completedTasks,
      completionPercentage
    };
  };
  
  const { totalTasks, completedTasks, completionPercentage } = calculateStats();
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
          Progress
        </span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
          {completedTasks}/{totalTasks} tasks ({completionPercentage}%)
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
        <div 
          className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-colors"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressSummary;