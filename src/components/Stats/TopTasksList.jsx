// components/Stats/TopTasksList.jsx
import React, { useState, useEffect } from 'react';
import { getTaskStats } from '../../utils/taskRegistry';
import { CheckCircle, Award, TrendingUp, Tag, BarChart2 } from 'lucide-react';

const TopTasksList = () => {
  const [stats, setStats] = useState({ topTasks: [], totalTasks: 0, totalCompletions: 0 });
  const [viewLimit, setViewLimit] = useState(10);
  
  useEffect(() => {
    const taskStats = getTaskStats();
    setStats(taskStats);
  }, []);
  
  const handleShowMore = () => {
    setViewLimit(prev => prev + 10);
  };
  
  const getTaskRank = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };
  
  if (stats.topTasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <BarChart2 size={40} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">
            No task data available yet. Start creating tasks to track stats.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 transition-colors">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Award className="text-blue-500 dark:text-blue-400" size={20} />
        Most Completed Tasks
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <span className="font-medium">{stats.totalTasks}</span> unique tasks
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg text-sm text-green-700 dark:text-green-300">
          <span className="font-medium">{stats.totalCompletions}</span> total completions
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {stats.topTasks.slice(0, viewLimit).map((task, index) => {
          // Determine badge color based on completion count
          let badgeClass = "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400";
          if (task.count >= 25) {
            badgeClass = "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
          } else if (task.count >= 15) {
            badgeClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
          } else if (task.count >= 5) {
            badgeClass = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
          }
          
          return (
            <div 
              key={task.name}
              className={`flex items-start p-3 rounded-lg ${
                index < 3 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                  : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex-shrink-0 font-bold text-center mr-3 w-6">
                {getTaskRank(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                  {task.name}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${badgeClass}`}>
                    <CheckCircle size={12} className="mr-1" />
                    Completed {task.count} time{task.count !== 1 ? 's' : ''}
                  </span>
                  
                  {/* Show categories if available */}
                  {task.categories && task.categories.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      <Tag size={12} className="mr-1" />
                      {task.categories.length > 3 
                        ? `${task.categories.slice(0, 2).join(', ')} +${task.categories.length - 2}` 
                        : task.categories.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Visual indicator for top tasks */}
              {index < 3 && (
                <div className="ml-2">
                  <TrendingUp size={16} className={
                    index === 0 ? "text-amber-500" : 
                    index === 1 ? "text-blue-500" : "text-green-500"
                  } />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {stats.topTasks.length > viewLimit && (
        <div className="text-center mt-4">
          <button 
            onClick={handleShowMore}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default TopTasksList;