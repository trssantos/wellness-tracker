import React from 'react';
import { LineChart, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';

const HorizontalSpendingTrend = ({ 
  data = [], 
  currency = '$',
  timeRange = 'month',
  showAverage = true,
  compact = false
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-gray-500 bg-gray-100 dark:text-slate-400 dark:bg-slate-700/50 rounded-lg">
        <BarChart2 size={42} className="text-gray-400 dark:text-slate-500 mb-2" />
        <p>No spending data to display</p>
      </div>
    );
  }

  // Calculate average spending
  const average = data.reduce((sum, period) => sum + period.spending, 0) / data.length;
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Helper to get appropriate time label
  const getTimeLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'Daily';
      case 'month':
        return 'Weekly';
      case 'quarter':
        return 'Monthly';
      case 'year':
        return 'Quarterly';
      default:
        return 'Monthly';
    }
  };
  
  // Get bar color based on spending amount
  const getBarColor = (spending) => {
    if (spending > average * 1.5) {
      return 'bg-red-500 dark:bg-red-600'; // Much higher than average
    } else if (spending > average * 1.1) {
      return 'bg-amber-500 dark:bg-amber-600'; // Higher than average
    } else if (spending < average * 0.5) {
      return 'bg-green-500 dark:bg-green-600'; // Much lower than average
    } else {
      return 'bg-blue-500 dark:bg-blue-600'; // Around average
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-base font-medium text-gray-800 dark:text-white flex items-center gap-2">
          <LineChart className="text-amber-600 dark:text-amber-400" size={18} />
          {getTimeLabel()} Spending Trend
        </h5>
        
        {showAverage && (
          <div className="text-xs text-gray-600 dark:text-slate-300">
            Average: <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(average)}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {data.map((period, index) => {
          const barColor = getBarColor(period.spending);
          
          return (
            <div key={index} className="group">
              <div className="flex justify-between text-xs mb-1">
                <div className="text-gray-700 dark:text-slate-300">{period.label}</div>
                <div className="text-gray-800 dark:text-white font-medium">
                  {formatCurrency(period.spending)}
                  {period.spending > average ? (
                    <TrendingUp size={12} className="inline ml-1 text-red-500 dark:text-red-400" />
                  ) : (
                    <TrendingDown size={12} className="inline ml-1 text-green-500 dark:text-green-400" />
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-8 w-full bg-gray-200 dark:bg-slate-700 rounded-md overflow-hidden transition-all">
                <div 
                  className={`h-full ${barColor} group-hover:brightness-110 transition-all`}
                  style={{ width: `${Math.min(100, (period.spending / (average * 2)) * 100)}%` }}
                >
                  {!compact && period.topCategory && (
                    <div className="h-full flex items-center px-2 text-white text-xs truncate">
                      {period.topCategory.name}: {formatCurrency(period.topCategory.amount)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalSpendingTrend;