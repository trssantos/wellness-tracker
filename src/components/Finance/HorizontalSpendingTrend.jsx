import React, { useState } from 'react';
import { LineChart, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const HorizontalSpendingTrend = ({ 
  data = [], 
  currency = '$',
  timeRange = 'month',
  showAverage = true,
  compact = false 
}) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-slate-700/50 rounded-lg">
        <LineChart size={36} className="text-slate-500 mb-2" />
        <p className="text-slate-400 text-sm">No spending trend data available</p>
      </div>
    );
  }

  // Calculate average spending across all periods
  const averageSpending = data.reduce((sum, period) => sum + period.spending, 0) / data.length;
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(period => period.spending));

  // Get period-specific title
  const getPeriodTitle = () => {
    switch(timeRange) {
      case 'week':
        return 'Daily Spending';
      case 'month':
        return 'Monthly Spending';
      case 'quarter':
        return 'Weekly Spending';
      case 'year':
        return 'Monthly Spending';
      default:
        return 'Spending Trend';
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-medium text-white mb-0 flex items-center gap-2 text-sm">
          <LineChart className="text-amber-400" size={16} />
          {getPeriodTitle()}
        </h5>
        
        <div className="text-xs text-slate-400">
          Avg: {formatCurrency(averageSpending)}
        </div>
      </div>

      <div className="space-y-1.5 px-2 py-1">
        {data.map((period, index) => {
          // Calculate width based on value (max width is 100%)
          const barWidth = Math.max(5, (period.spending / maxValue) * 100);
          
          // Calculate percentage of average
          const percentOfAvg = Math.round((period.spending / averageSpending) * 100);
          
          // Determine bar color based on comparison to average
          let colorName = 'blue';
          if (period.spending > averageSpending * 1.5) {
            colorName = 'red';
          } else if (period.spending > averageSpending * 1.1) {
            colorName = 'amber';
          } else if (period.spending < averageSpending * 0.5) {
            colorName = 'green';
          }
          
          // Determine if the bar represents the current period
          const isCurrent = index === data.length - 1;
          
          return (
            <div 
              key={index} 
              className={`relative py-1 px-1.5 rounded transition-colors ${hoveredBar === index ? 'bg-slate-800/50' : ''} ${isCurrent ? 'bg-slate-800/30' : ''}`}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="flex items-center mb-1 justify-between">
                <div className="text-xs text-white font-medium truncate mr-2 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full finance-bg-${colorName}-500 mr-1.5`}></span>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} className="text-slate-400" />
                    <span>{period.label}</span>
                  </div>
                  {isCurrent && <span className="ml-1 text-[10px] bg-slate-700 px-1 py-0.5 rounded-full text-slate-300">Current</span>}
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
                  <span className={`finance-bg-${colorName}-900/30 px-1.5 py-0.5 rounded-full finance-text-${colorName}-300`}>
                    {percentOfAvg}%
                  </span>
                  <span className="font-medium">{formatCurrency(period.spending)}</span>
                </div>
              </div>
              
              <div className="h-4 bg-slate-700/70 rounded-md overflow-hidden relative">
                <div 
                  className={`h-full finance-bg-${colorName}-500 dark:finance-bg-${colorName}-600 transition-all duration-500 ${isCurrent ? 'finance-shimmer-effect' : ''}`} 
                  style={{ width: `${barWidth}%` }}
                >
                  {/* Show amount inside the bar if there's enough space */}
                  {barWidth > 40 && (
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-[10px] font-medium text-white">{formatCurrency(period.spending)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show more details on hover - condensed version */}
              {hoveredBar === index && period.topCategory && (
                <div className="mt-0.5 px-1 text-[10px] text-slate-400">
                  <span className="text-white">Top: {period.topCategory.name}</span>
                  {period.spending !== 0 && index > 0 && data[index-1].spending !== 0 && (
                    <span className="ml-2">
                      {period.spending > data[index-1].spending ? (
                        <span className="text-red-400">↑</span>
                      ) : (
                        <span className="text-green-400">↓</span>
                      )}
                      <span> {Math.round(Math.abs((period.spending / data[index-1].spending * 100) - 100))}%</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Period explanation in a more compact form */}
      {!compact && (
        <div className="mt-1 pt-1 px-2 text-[10px] text-slate-400 border-t border-slate-700/50">
          Showing spending by {timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : timeRange === 'quarter' ? 'week' : 'month'}
        </div>
      )}
    </div>
  );
};

export default HorizontalSpendingTrend;