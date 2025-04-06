import React from 'react';
import { LineChart, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';

const HorizontalSpendingTrend = ({ 
  data = [], 
  transactions = [],
  timeRange = 'month',
  currency = '$',
  showAverage = true,
  compact = false
}) => {
  // Helper function to find the top spending category for a set of transactions
  const findTopCategory = (transactions) => {
    const categories = {};
    
    transactions.forEach(tx => {
      if (!tx.category) return;
      
      if (!categories[tx.category]) {
        categories[tx.category] = 0;
      }
      
      categories[tx.category] += Math.abs(tx.amount);
    });
    
    let topCategoryId = null;
    let topAmount = 0;
    
    Object.entries(categories).forEach(([categoryId, amount]) => {
      if (amount > topAmount) {
        topCategoryId = categoryId;
        topAmount = amount;
      }
    });
    
    if (topCategoryId) {
      // This would normally use getCategoryById, but we'll return a simplified version
      return {
        name: topCategoryId.split('-').pop() || 'Unknown',
        amount: topAmount
      };
    }
    
    return null;
  };
  
  // Generate appropriate trend data based on timeRange
  const getTrendData = () => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Current date to calculate relative periods
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    // Find earliest and latest transaction dates
    const earliestTx = sortedTransactions[0];
    const latestTx = sortedTransactions[sortedTransactions.length - 1];
    
    const earliestDate = earliestTx ? new Date(earliestTx.timestamp) : new Date();
    const earliestYear = earliestDate.getFullYear();
    
    // Generate periods based on selected time range
    let periodData = [];
    
    if (timeRange === 'week') {
      // Last 5 weeks, one bar per week
      for (let i = 4; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // Only include complete weeks up to today
        if (weekEnd > today) {
          weekEnd.setTime(today.getTime());
        }
        
        // Format for "Apr 1-7" style
        const startFormatted = weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        const endFormatted = weekEnd.toLocaleDateString('default', { day: 'numeric' });
        
        const label = `${startFormatted}-${endFormatted}`;
        
        // Calculate spending for this week
        const weekTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate >= weekStart && txDate <= weekEnd && tx.amount < 0;
        });
        
        const spending = weekTransactions.reduce((sum, tx) => 
          sum + Math.abs(tx.amount), 0
        );
        
        // Find top category
        const topCategory = findTopCategory(weekTransactions);
        
        periodData.push({ 
          label,
          spending,
          topCategory,
          start: weekStart,
          end: weekEnd
        });
      }
    } 
    else if (timeRange === 'month') {
      // All months in current year
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(currentYear, month, 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(currentYear, month + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        // Skip future months
        if (monthStart > today) continue;
        
        // For current month, end at today
        if (month === currentMonth) {
          monthEnd.setTime(today.getTime());
        }
        
        // Calculate spending for this month
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate >= monthStart && txDate <= monthEnd && tx.amount < 0;
        });
        
        const spending = monthTransactions.reduce((sum, tx) => 
          sum + Math.abs(tx.amount), 0
        );
        
        // Find top category
        const topCategory = findTopCategory(monthTransactions);
        
        periodData.push({
          label: monthStart.toLocaleDateString('default', { month: 'short' }),
          spending,
          topCategory,
          start: monthStart,
          end: monthEnd
        });
      }
      
      // Filter out empty months at the beginning if the earliest transaction isn't from this year
      if (earliestYear < currentYear) {
        // Find first month with data
        const firstMonthWithData = periodData.findIndex(period => period.spending > 0);
        if (firstMonthWithData > 0) {
          periodData = periodData.slice(firstMonthWithData);
        }
      }
    }
    else if (timeRange === 'quarter') {
      // Last 4 quarters
      for (let i = 3; i >= 0; i--) {
        const quarterShift = Math.floor(currentMonth / 3) - i;
        let quarterYear = currentYear;
        let quarterIndex = quarterShift;
        
        // Handle previous year quarters
        if (quarterShift < 0) {
          quarterYear -= 1;
          quarterIndex = 4 + quarterShift; // e.g., -1 becomes Q3 of previous year (index 3)
        }
        
        const quarterStart = new Date(quarterYear, quarterIndex * 3, 1);
        quarterStart.setHours(0, 0, 0, 0);
        
        const quarterEnd = new Date(quarterYear, (quarterIndex + 1) * 3, 0);
        quarterEnd.setHours(23, 59, 59, 999);
        
        // Skip future quarters
        if (quarterStart > today) continue;
        
        // For current quarter, end at today
        if (i === 0) {
          quarterEnd.setTime(today.getTime());
        }
        
        // Calculate spending for this quarter
        const quarterTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate >= quarterStart && txDate <= quarterEnd && tx.amount < 0;
        });
        
        const spending = quarterTransactions.reduce((sum, tx) => 
          sum + Math.abs(tx.amount), 0
        );
        
        // Find top category
        const topCategory = findTopCategory(quarterTransactions);
        
        periodData.push({
          label: `Q${quarterIndex + 1} ${quarterYear}`,
          spending,
          topCategory,
          start: quarterStart,
          end: quarterEnd
        });
      }
    }
    else if (timeRange === 'year') {
      // All years with data
      const years = [];
      const minYear = earliestYear;
      const maxYear = currentYear;
      
      for (let year = minYear; year <= maxYear; year++) {
        years.push(year);
      }
      
      for (const year of years) {
        const yearStart = new Date(year, 0, 1);
        yearStart.setHours(0, 0, 0, 0);
        
        const yearEnd = new Date(year, 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        
        // For current year, end at today
        if (year === currentYear) {
          yearEnd.setTime(today.getTime());
        }
        
        // Calculate spending for this year
        const yearTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate >= yearStart && txDate <= yearEnd && tx.amount < 0;
        });
        
        const spending = yearTransactions.reduce((sum, tx) => 
          sum + Math.abs(tx.amount), 0
        );
        
        // Find top category
        const topCategory = findTopCategory(yearTransactions);
        
        periodData.push({
          label: year.toString(),
          spending,
          topCategory,
          start: yearStart,
          end: yearEnd
        });
      }
    }
    
    // Sort by date so the most recent appears first (at the top)
return periodData.sort((a, b) => b.start - a.start);
  };
  
  // Use provided data or generate from transactions
  const trendData = data.length > 0 ? data : getTrendData();

  if (!trendData || trendData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-gray-500 bg-gray-100 dark:text-slate-400 dark:bg-slate-700/50 rounded-lg">
        <BarChart2 size={42} className="text-gray-400 dark:text-slate-500 mb-2" />
        <p>No spending data to display</p>
      </div>
    );
  }

  // Calculate average spending
  const average = trendData.reduce((sum, period) => sum + period.spending, 0) / trendData.length;
  
  // Find max spending for better bar scaling
  const maxSpending = Math.max(...trendData.map(period => period.spending), 0.1);
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Helper to get appropriate time label
  const getTimeLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'Weekly';
      case 'month':
        return 'Monthly';
      case 'quarter':
        return 'Quarterly';
      case 'year':
        return 'Yearly';
      default:
        return 'Period';
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
        {trendData.map((period, index) => {
          const barColor = getBarColor(period.spending);
          // Calculate width percentage based on max spending (with min 5% for visibility)
          const barWidth = period.spending > 0 ? Math.max(5, (period.spending / maxSpending * 95)) : 0;
          
          return (
            <div key={index} className="group">
              <div className="flex justify-between text-xs mb-1">
                <div className="text-gray-700 dark:text-slate-300 font-medium">{period.label}</div>
                <div className="text-gray-800 dark:text-white font-medium">
                  {formatCurrency(period.spending)}
                  {period.spending > average ? (
                    <TrendingUp size={12} className="inline ml-1 text-red-500 dark:text-red-400" />
                  ) : (
                    <TrendingDown size={12} className="inline ml-1 text-green-500 dark:text-green-400" />
                  )}
                </div>
              </div>
              
              {/* Progress Bar - with proper scaling based on max spending */}
              <div className="h-8 w-full bg-gray-200 dark:bg-slate-700 rounded-md overflow-hidden transition-all relative">
                <div 
                  className={`h-full ${barColor} group-hover:brightness-110 transition-all flex items-center px-2`}
                  style={{ width: `${barWidth}%` }}
                >
                  {!compact && period.topCategory && barWidth > 20 && (
                    <div className="h-full flex items-center text-white text-xs truncate">
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