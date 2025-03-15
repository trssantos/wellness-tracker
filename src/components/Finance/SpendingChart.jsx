import React from 'react';
import { BarChart } from 'lucide-react';

const SpendingChart = ({ data, compact = false }) => {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 bg-slate-700/50 rounded-lg">
        <BarChart size={48} className="text-slate-500 mb-2" />
        <p className="text-slate-400 text-sm">No spending data available</p>
      </div>
    );
  }

  // Sort categories by amount spent
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Find max value for scaling
  const maxValue = Math.max(...sortedData.map(item => item.value));
  
  return (
    <div className="h-60 relative">
      <div className="absolute inset-x-0 bottom-0 h-[220px] flex items-end justify-around p-4">
        {sortedData.map((item, index) => {
          // Calculate height based on value (max height is 160px)
          const barHeight = Math.max(20, (item.value / maxValue) * 160);
          
          // Get color for the bar
          const colorClass = `bg-${item.color || 'blue'}-500 dark:bg-${item.color || 'blue'}-600`;
          
          return (
            <div key={item.id || index} className="flex flex-col items-center">
              <div 
                className={`${colorClass} w-12 sm:w-16 rounded-t-lg transition-all duration-500 ease-in-out hover:brightness-110`} 
                style={{ height: `${barHeight}px` }}
                title={`${item.name}: ${item.value.toFixed(2)}`}
              ></div>
              <div className="text-xs text-slate-400 dark:text-slate-400 mt-2 whitespace-nowrap overflow-hidden max-w-[70px] text-center text-ellipsis">
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingChart;