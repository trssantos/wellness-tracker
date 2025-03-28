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
      <div className="flex flex-col items-center justify-center h-40 bg-slate-700/50 rounded-lg">
        <BarChart size={36} className="text-slate-500 mb-2" />
        <p className="text-slate-400 text-sm">No spending data available</p>
      </div>
    );
  }

  // Sort categories by amount spent
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Find max value for scaling
  const maxValue = Math.max(...sortedData.map(item => item.value));
  
  // Calculate total for percentage
  const totalValue = sortedData.reduce((sum, item) => sum + item.value, 0);
  
  // Limit to top 6 categories for compact view
  const displayData = compact ? sortedData.slice(0, 6) : sortedData;
  
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        
        <div className="text-xs text-slate-400">
          Total: {formatCurrency(totalValue)}
        </div>
      </div>
      
      <div className="space-y-1.5 px-2 py-1">
        {displayData.map((item, index) => {
          // Calculate width based on value (max width is 100%)
          const barWidth = Math.max(5, (item.value / maxValue) * 100);
          
          // Calculate percentage of total
          const percentage = Math.round((item.value / totalValue) * 100);
          
          // Assign a color from our chart colors array
          const colorIdx = index % CHART_COLORS.length;
          const colorName = item.color || CHART_COLORS[colorIdx];
          
          return (
            <div 
              key={item.id || index} 
              className={`relative py-1 px-1.5 rounded transition-colors ${hoveredBar === index ? 'bg-slate-800/50' : ''}`}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="flex items-center mb-1 justify-between">
                <div className="text-xs text-white font-medium truncate mr-2 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full finance-bg-${colorName}-500 mr-1.5`}></span>
                  <span className="truncate max-w-[120px]">{item.name}</span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
                  <span className={`finance-bg-${colorName}-900/30 px-1.5 py-0.5 rounded-full finance-text-${colorName}-300`}>
                    {percentage}%
                  </span>
                  <span className="font-medium min-w-[50px] text-right">{formatCurrency(item.value)}</span>
                </div>
              </div>
              
              <div className="h-4 bg-slate-700/70 rounded-md overflow-hidden relative">
                <div 
                  className={`h-full finance-bg-${colorName}-500 dark:finance-bg-${colorName}-600 transition-all duration-500`} 
                  style={{ width: `${barWidth}%` }}
                >
                  {/* Show percentage inside the bar if there's enough space */}
                  {barWidth > 40 && (
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-[10px] font-medium text-white">{formatCurrency(item.value)}</span>
                    </div>
                  )}
                  
                  {/* Subtle shimmer effect */}
                  <div className="absolute inset-0 finance-shimmer-effect opacity-50"></div>
                </div>
              </div>
              
              {/* Optional hover details - could be added if needed */}
              {hoveredBar === index && item.group && (
                <div className="mt-0.5 px-1 text-[10px] text-slate-400">
                  Category Group: <span className="text-white">{item.group}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Show "Other" category if data is truncated in compact mode */}
      {compact && sortedData.length > 6 && (
        <div className="mt-1 text-center">
          <button className="text-[10px] text-amber-400 hover:text-amber-300">
            + {sortedData.length - 6} more categories ({formatCurrency(
              sortedData.slice(6).reduce((sum, item) => sum + item.value, 0)
            )})
          </button>
        </div>
      )}
    </div>
  );
};

export default SpendingChart;