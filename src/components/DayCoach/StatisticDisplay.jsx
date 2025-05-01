import React from 'react';

const StatisticDisplay = ({ stats }) => {
  if (!stats || stats.length === 0) return null;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 my-3 w-full border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex flex-wrap gap-3 justify-center">
        {stats.map((stat, index) => {
          // Determine color based on value and label
          let textColor = `text-${stat.color}-600 dark:text-${stat.color}-400`;
          let bgColor = `bg-${stat.color}-100 dark:bg-${stat.color}-900/30`;
          
          if (stat.value.startsWith('+')) {
            textColor = 'text-green-600 dark:text-green-400';
            bgColor = 'bg-green-100 dark:bg-green-900/30';
          } else if (stat.value.startsWith('-') && !stat.label.includes('stress')) {
            textColor = 'text-red-600 dark:text-red-400';
            bgColor = 'bg-red-100 dark:bg-red-900/30';
          }
          
          return (
            <div 
              key={index} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} border border-slate-200 dark:border-slate-700`}
            >
              <span 
                className={`w-2.5 h-2.5 rounded-full bg-${stat.color}-500 dark:bg-${stat.color}-400`}
              ></span>
              <span className={`text-sm font-semibold ${textColor}`}>
                {stat.value}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatisticDisplay;