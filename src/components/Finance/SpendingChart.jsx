import React from 'react';

// Map specific category names to colors
const CATEGORY_COLORS = {
  'Groceries': 'emerald',
  'Rent/Mortgage': 'amber',
  'Dining Out': 'emerald',
  'Car Maintenance': 'blue',
  'Entertainment': 'purple',
  'Utilities': 'cyan',
  'Shopping': 'pink',
  'Health': 'red',
  'Travel': 'indigo',
  'Education': 'teal',
  'Savings': 'lime',
  'Other': 'gray'
};

const SpendingChart = ({ data, compact = false, currency = '€' }) => {
  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400 text-sm">No spending data available</p>
      </div>
    );
  }

  // Sort categories by amount spent
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Calculate total for percentage
  const totalValue = sortedData.reduce((sum, item) => sum + item.value, 0);
  
  // Limit to top categories for compact view
  const displayData = compact ? sortedData.slice(0, 6) : sortedData;
  
  return (
    <div className="relative space-y-3">
      {displayData.map((item, index) => {
        // Calculate percentage of total
        const percentage = Math.round((item.value / totalValue) * 100);
        
        // Get category color
        const categoryName = item.name;
        const colorName = item.color || CATEGORY_COLORS[categoryName] || 'blue';
        
        return (
          <div key={item.id || index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full bg-${colorName}-500 mr-2`}></span>
                <span className="text-slate-800 dark:text-white text-xs">{item.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-slate-600 dark:text-slate-400">{percentage}%</span>
                <span className="text-slate-800 dark:text-white font-medium w-16 text-right">{formatCurrency(item.value)}</span>
              </div>
            </div>
            
            <div className="relative">
              {/* Value shown inside colored bar */}
              <div 
                className={`h-4 bg-${colorName}-500 rounded-l`} 
                style={{ width: `${percentage}%` }}
              >
              </div>
              
              {/* Background bar (full width) */}
              <div className="absolute top-0 right-0 left-0 h-8 bg-slate-200 dark:bg-slate-700 rounded -z-10"></div>
            </div>
          </div>
        );
      })}
      
      {compact && sortedData.length > 6 && (
        <div className="mt-3 text-center">
          <button className="text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 flex items-center justify-center w-full">
            View detailed insights <span className="ml-1">→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SpendingChart;