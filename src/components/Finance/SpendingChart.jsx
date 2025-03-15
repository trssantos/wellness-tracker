import React, { useState } from 'react';
import { BarChart } from 'lucide-react';

// Define distinct colors array
const CHART_COLORS = [
  'blue',   // Finance category 1
  'green',  // Finance category 2
  'amber',  // Finance category 3
  'purple', // Finance category 4
  'red',    // Finance category 5
  'pink',   // Finance category 6
  'indigo', // Finance category 7
  'teal',   // Finance category 8
  'emerald', // Finance category 9
  'cyan',    // Finance category 10
  'violet',  // Finance category 11
  'fuchsia', // Finance category 12
];

const SpendingChart = ({ data, compact = false, currency = '$' }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

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
          
          // Assign a color from our chart colors array
          const colorIdx = index % CHART_COLORS.length;
          const colorName = CHART_COLORS[colorIdx];
          
          return (
            <div 
              key={item.id || index} 
              className="flex flex-col items-center"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div 
                className={`finance-bg-${colorName}-500 dark:finance-bg-${colorName}-600 w-12 sm:w-16 rounded-t-lg transition-all duration-300 hover:brightness-110`} 
                style={{ height: `${barHeight}px` }}
              >
                <div className="h-full w-full relative overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 finance-shimmer-effect"></div>
                </div>
                
                {/* Hover tooltip */}
                {hoveredBar === index && (
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white p-2 rounded shadow-lg whitespace-nowrap text-sm z-10 transform -translate-x-1/4">
                    <div className="font-medium">{item.name}</div>
                    <div>{formatCurrency(item.value)}</div>
                    <div className="text-xs text-slate-300">
                      {Math.round((item.value / sortedData.reduce((sum, i) => sum + i.value, 0)) * 100)}%
                    </div>
                    <div className="absolute left-1/2 bottom-0 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></div>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-400 mt-2 whitespace-nowrap overflow-hidden max-w-[70px] text-center text-ellipsis">
                {item.name}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-300">
                {formatCurrency(item.value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingChart;