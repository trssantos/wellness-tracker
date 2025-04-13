import React, { useState, useEffect } from 'react';
import { getStorage } from '../../utils/storage';
import { CheckSquare, Activity, BookOpen, BarChart2, Award } from 'lucide-react';
import { formatDateForStorage } from '../../utils/dateUtils';

const TopTasksList = ({ currentMonth = new Date() }) => {
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    totalCompletions: 0,
    topTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    loadTaskStats(currentMonth);
  }, [currentMonth]);

  const loadTaskStats = (month) => {
    setLoading(true);
    const storage = getStorage();
    
    // Get start and end dates for the selected month
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Create date strings for each day in the month
    const datesInMonth = [];
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      datesInMonth.push(formatDateForStorage(day));
    }
    
    // Store completed tasks and their counts for this month
    const completedTasksMap = {};
    const taskCategories = {};
    let totalCompletions = 0;
    
    // Process each day in the selected month
    datesInMonth.forEach(dateStr => {
      const dayData = storage[dateStr];
      if (!dayData || !dayData.checked) return;
      
      // Get the task categories for this day
      const categories = dayData.customTasks || dayData.aiTasks || dayData.defaultTasks;
      if (!categories || !Array.isArray(categories)) return;
      
      // Map categories to tasks for this day
      const categoryMap = {};
      categories.forEach(category => {
        if (category && category.items && Array.isArray(category.items)) {
          category.items.forEach(task => {
            if (task && task.trim()) {
              categoryMap[task] = category.title;
              
              // Store task category associations for later
              if (!taskCategories[task]) {
                taskCategories[task] = new Set();
              }
              taskCategories[task].add(category.title);
            }
          });
        }
      });
      
      // Process each checked task for this day
      Object.entries(dayData.checked).forEach(([taskKey, isChecked]) => {
        if (!isChecked) return; // Skip unchecked tasks
        
        let taskText = taskKey;
        
        // Handle category-based task IDs (format: "category|task")
        if (taskKey.includes('|')) {
          const [category, task] = taskKey.split('|');
          taskText = task;
          
          // Add the category to our set
          if (!taskCategories[taskText]) {
            taskCategories[taskText] = new Set();
          }
          taskCategories[taskText].add(category);
        } 
        // For old format, use the category from our map if available
        else if (categoryMap[taskKey]) {
          if (!taskCategories[taskText]) {
            taskCategories[taskText] = new Set();
          }
          taskCategories[taskText].add(categoryMap[taskKey]);
        }
        
        // Count the completion
        if (!completedTasksMap[taskText]) {
          completedTasksMap[taskText] = 0;
        }
        completedTasksMap[taskText]++;
        totalCompletions++;
      });
    });
    
    // Convert to array and sort by completion count
    const topTasks = Object.entries(completedTasksMap)
      .map(([name, count]) => ({
        name,
        count,
        categories: taskCategories[name] ? Array.from(taskCategories[name]) : []
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Limit to top 20
    
    setTaskStats({
      totalTasks: Object.keys(completedTasksMap).length,
      totalCompletions,
      topTasks
    });
    setLoading(false);
  };

  const getCategoryBadge = (category) => {
    // Return colorful badges for different category types
    switch(category.toLowerCase()) {
      case 'morning essentials':
        return <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full">Morning</span>;
      case 'work focus':
        return <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full">Work</span>;
      case 'self care':
        return <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full">Self-Care</span>;
      case 'evening routine':
        return <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full">Evening</span>;
      case 'creative time':
        return <span className="text-xs px-2 py-0.5 bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 rounded-full">Creative</span>;
      default:
        return <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-full">{category}</span>;
    }
  };

  // Get medal styling for top 3
  const getMedalStyle = (index) => {
    if (index === 0) return { bg: 'bg-yellow-100 dark:bg-yellow-900/40', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-700 dark:text-yellow-300', icon: <Award size={14} className="text-yellow-500" /> };
    if (index === 1) return { bg: 'bg-slate-100 dark:bg-slate-700/60', border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300', icon: <Award size={14} className="text-slate-400" /> };
    if (index === 2) return { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: <Award size={14} className="text-amber-600" /> };
    return { bg: 'bg-slate-50 dark:bg-slate-700/50', border: 'border-slate-200 dark:border-slate-700', text: '', icon: null };
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
          <CheckSquare className="text-blue-500 dark:text-blue-400" size={20} />
          Most Completed Tasks
        </h3>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors flex items-center gap-2 mb-2">
          <CheckSquare className="text-blue-500 dark:text-blue-400" size={20} />
          Most Completed Tasks
        </h3>
        
        {/* Stats below title for better mobile layout */}
        <div className="flex flex-wrap gap-2 mt-1">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs">
            <Activity className="text-blue-500 dark:text-blue-400" size={12} />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {taskStats.totalCompletions} completions
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs">
            <BookOpen className="text-green-500 dark:text-green-400" size={12} />
            <span className="font-medium text-green-700 dark:text-green-300">
              {taskStats.totalTasks} unique tasks
            </span>
          </div>
        </div>
      </div>

      {taskStats.topTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <BarChart2 size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 mb-2">No completed tasks found for this month.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Complete tasks this month to see them here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {taskStats.topTasks.slice(0, displayLimit).map((task, index) => {
              const medalStyle = getMedalStyle(index);
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center p-3 rounded-lg ${medalStyle.bg} border ${medalStyle.border}`}
                >
                  {/* Use different styling for top 3 */}
                  {index < 3 ? (
                    <div className={`w-8 h-8 rounded-full bg-white dark:bg-slate-800 border ${medalStyle.border} 
                                    flex items-center justify-center font-bold mr-3 ${medalStyle.text}`}>
                      {medalStyle.icon}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 
                                    flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-slate-200 font-medium mb-1 truncate">
                      {task.name}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {task.categories && task.categories.slice(0, 3).map((category, catIndex) => (
                        <React.Fragment key={catIndex}>
                          {getCategoryBadge(category)}
                        </React.Fragment>
                      ))}
                      {task.categories && task.categories.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                          +{task.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Move completions count to right side */}
                  <div className="text-right ml-2">
                    <div className={`${index < 3 ? medalStyle.text : 'text-blue-600 dark:text-blue-400'} font-bold`}>
                      {task.count}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      completions
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {taskStats.topTasks.length > displayLimit ? (
            <button 
              className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setDisplayLimit(prev => prev + 10)}
            >
              Show More
            </button>
          ) : taskStats.topTasks.length > 10 ? (
            <button 
              className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setDisplayLimit(10)}
            >
              Show Less
            </button>
          ) : null}
        </>
      )}
    </div>
  );
};

export default TopTasksList;