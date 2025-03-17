import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Award, AlertTriangle, AlertCircle, PiggyBank, Calendar, 
  TrendingUp, TrendingDown, DollarSign, PieChart, Info, 
  ArrowRight, ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  getFinanceData, calculateFinancialStats, getFinancialInsights, 
  getSpendingMoodCorrelation, getCategoryById 
} from '../../utils/financeUtils';

// Define chart colors array for consistent coloring
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

const FinancialInsights = ({ 
  refreshTrigger = 0, 
  onRefresh, 
  currency = '$',
  selectedDateRange = { 
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
    end: new Date() 
  },
  setSelectedDateRange
}) => {
  // State variables
  const [transactions, setTransactions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [spendingTrend, setSpendingTrend] = useState([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState([]);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState(selectedDateRange.start.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(selectedDateRange.end.toISOString().split('T')[0]);
  const [insights, setInsights] = useState({ score: 0, insights: [] });
  const [correlations, setCorrelations] = useState([]);
  const [bills, setBills] = useState([]);

  // Fetch data on initial render and when refreshTrigger changes
  useEffect(() => {
    fetchFinancialData();
  }, [refreshTrigger, timeRange, customDateRange, startDate, endDate]);

  // Fetch financial data based on current filters
  const fetchFinancialData = () => {
    const financeData = getFinanceData();
    
    // Filter transactions based on date range
    let filteredTransactions = [...financeData.transactions];
    
    if (customDateRange) {
      // Use custom date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      
      filteredTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= start && txDate <= end;
      });
    } else {
      // Use predefined time range
      const end = new Date();
      let start = new Date();
      
      switch (timeRange) {
        case 'week':
          start.setDate(end.getDate() - 7);
          break;
        case 'month':
          start.setMonth(end.getMonth() - 1);
          break;
        case 'quarter':
          start.setMonth(end.getMonth() - 3);
          break;
        case 'year':
          start.setFullYear(end.getFullYear() - 1);
          break;
        default:
          start.setMonth(end.getMonth() - 1);
      }
      
      filteredTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= start && txDate <= end;
      });
      
      // Update selected date range for other components
      if (setSelectedDateRange) {
        setSelectedDateRange({ start, end });
      }
    }
    
    setTransactions(filteredTransactions);
    
    // Get recurring transactions as bills
    setBills(financeData.recurringTransactions || []);
    
    // Calculate financial stats based on filtered transactions
    calculateStats(filteredTransactions);
    
    // Generate spending trend data
    generateSpendingTrend(filteredTransactions);
    
    // Generate income vs expenses data
    generateIncomeVsExpenses(filteredTransactions);
    
    // Get financial insights
    const financialInsights = getFinancialInsights();
    setInsights(financialInsights);
    
    // Get mood correlations
    const moodCorrelations = getSpendingMoodCorrelation();
    setCorrelations(moodCorrelations);
  };

  // Calculate financial stats from transactions
  const calculateStats = (transactions) => {
    // Calculate total income
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate total expenses
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate balance
    const balance = income - expenses;
    
    // Calculate category breakdown
    const breakdown = {};
    
    transactions.forEach(transaction => {
      if (!transaction.category) return;
      
      const category = transaction.category;
      const amount = Math.abs(transaction.amount);
      
      if (!breakdown[category]) {
        breakdown[category] = 0;
      }
      
      breakdown[category] += amount;
    });
    
    // Prepare chart data for category breakdown
    const categoryData = [];
    Object.entries(breakdown).forEach(([categoryId, amount]) => {
      const category = getCategoryById(categoryId);
      if (category) {
        categoryData.push({
          id: categoryId,
          name: category.name,
          value: amount,
          color: category.color // Use the color from category definition
        });
      }
    });
    
    // Sort by amount, descending
    categoryData.sort((a, b) => b.value - a.value);
    setChartData(categoryData);
    
    // Set category breakdown
    setCategoryBreakdown(breakdown);
    
    // Set stats
    setStats({
      income,
      expenses,
      balance,
      categoryBreakdown: breakdown
    });
  };

  // Generate spending trend data based on timeframe
  const generateSpendingTrend = (transactions) => {
    const now = new Date();
    
    // Determine number of periods based on timeframe
    let periods = 6; // Default for month
    let periodType = 'month';
    
    if (timeRange === 'week' || (customDateRange && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) <= 14)) {
      periods = 7;
      periodType = 'day';
    } else if (timeRange === 'year' || (customDateRange && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) >= 180)) {
      periods = 12;
      periodType = 'month';
    } else if (timeRange === 'quarter' || (customDateRange && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) >= 60)) {
      periods = 12; // Show weeks for quarter
      periodType = 'week';
    }
    
    // Create array of periods
    const periodArray = [];
    
    if (customDateRange) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (periodType === 'day') {
        // Calculate days between dates
        const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        periods = Math.min(14, dayDiff); // Cap at 14 days
        
        for (let i = 0; i < periods; i++) {
          const day = new Date(start);
          day.setDate(start.getDate() + i);
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'week') {
        // Split date range into weeks
        let currentWeekStart = new Date(start);
        while (currentWeekStart <= end) {
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          periodArray.push({
            label: `${currentWeekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', { day: 'numeric' })}`,
            start: new Date(currentWeekStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
          
          // Move to next week
          currentWeekStart = new Date(weekEnd);
          currentWeekStart.setDate(currentWeekStart.getDate() + 1);
          
          // Limit to reasonable number of periods
          if (periodArray.length >= 12) break;
        }
      } else {
        // Split date range into months
        let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentMonth <= end) {
          const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
          
          periodArray.push({
            label: currentMonth.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
            start: new Date(currentMonth),
            end: new Date(Math.min(monthEnd.getTime(), end.getTime()))
          });
          
          // Move to next month
          currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
          
          // Limit to reasonable number of periods
          if (periodArray.length >= 12) break;
        }
      }
    } else {
      // Create predefined periods based on timeframe
      if (periodType === 'day') {
        for (let i = periods - 1; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'week') {
        // For quarter range - fix to create evenly spaced weeks
        if (timeRange === 'quarter') {
          // Start 3 months ago
          const startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          
          for (let i = 0; i < 12; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const isLastWeek = i === 11;
            const endDate = isLastWeek ? now : weekEnd;
            
            periodArray.push({
              label: `Week ${i+1}`,
              start: new Date(weekStart.setHours(0, 0, 0, 0)),
              end: new Date(endDate.setHours(23, 59, 59, 999))
            });
          }
        } else {
          // Regular week range
          for (let i = periods - 1; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            periodArray.push({
              label: `${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', { day: 'numeric' })}`,
              start: new Date(weekStart.setHours(0, 0, 0, 0)),
              end: new Date(weekEnd.setHours(23, 59, 59, 999))
            });
          }
        }
      } else if (periodType === 'month') {
        // For year range - fix to create all 12 months
        if (timeRange === 'year') {
          const startYear = now.getFullYear() - 1;
          const startMonth = now.getMonth() + 1;
          
          for (let i = 0; i < 12; i++) {
            const monthIdx = (startMonth + i) % 12;
            const year = startYear + Math.floor((startMonth + i) / 12);
            
            const monthStart = new Date(year, monthIdx, 1);
            const monthEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
            
            const isLastMonth = i === 11;
            const endDate = isLastMonth ? now : monthEnd;
            
            periodArray.push({
              label: monthStart.toLocaleDateString('default', { month: 'short' }),
              start: monthStart,
              end: endDate
            });
          }
        } else {
          // Regular month range
          for (let i = periods - 1; i >= 0; i--) {
            const month = new Date();
            month.setMonth(month.getMonth() - i);
            
            const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
            const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
            
            periodArray.push({
              label: month.toLocaleDateString('default', { month: 'short' }),
              start: monthStart,
              end: monthEnd
            });
          }
        }
      }
    }
    
    // Calculate spending for each period
    const trend = periodArray.map(period => {
      const periodTransactions = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return txDate >= period.start && txDate <= period.end && t.amount < 0;
      });
      
      const spending = periodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        ...period,
        spending
      };
    });
    
    setSpendingTrend(trend);
  };
  
  // Generate income vs expenses data
  const generateIncomeVsExpenses = (transactions) => {
    const now = new Date();
    
    // Determine the period type based on time range
    let periodType = 'month';
    let periods = 6;
    
    if (timeRange === 'week' || (customDateRange && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) <= 14)) {
      periodType = 'day';
      periods = 7;
    } else if (timeRange === 'year' || (customDateRange && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) >= 180)) {
      periodType = 'month';
      periods = 12;
    } else if (timeRange === 'quarter' || (customDateRange && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) >= 60)) {
      periodType = 'week';
      periods = 12;
    }
    
    // Create array of periods similar to spending trend
    const periodArray = [];
    
    if (customDateRange) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (periodType === 'day') {
        // Calculate days between dates
        const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        periods = Math.min(14, dayDiff); // Cap at 14 days
        
        for (let i = 0; i < periods; i++) {
          const day = new Date(start);
          day.setDate(start.getDate() + i);
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'week') {
        // Split date range into weeks
        let currentWeekStart = new Date(start);
        while (currentWeekStart <= end) {
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          periodArray.push({
            label: `${currentWeekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', { day: 'numeric' })}`,
            start: new Date(currentWeekStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
          
          // Move to next week
          currentWeekStart = new Date(weekEnd);
          currentWeekStart.setDate(currentWeekStart.getDate() + 1);
          
          // Limit to reasonable number of periods
          if (periodArray.length >= 12) break;
        }
      } else {
        // Split date range into months
        let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentMonth <= end) {
          const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
          
          periodArray.push({
            label: currentMonth.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
            start: new Date(currentMonth),
            end: new Date(Math.min(monthEnd.getTime(), end.getTime()))
          });
          
          // Move to next month
          currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
          
          // Limit to reasonable number of periods
          if (periodArray.length >= 12) break;
        }
      }
    } else {
      // Create predefined periods based on timeframe
      if (periodType === 'day') {
        for (let i = periods - 1; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'week') {
        for (let i = periods - 1; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          periodArray.push({
            label: `${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', { day: 'numeric' })}`,
            start: new Date(weekStart.setHours(0, 0, 0, 0)),
            end: new Date(weekEnd.setHours(23, 59, 59, 999))
          });
        }
      } else {
        for (let i = periods - 1; i >= 0; i--) {
          const month = new Date();
          month.setMonth(month.getMonth() - i);
          
          const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
          const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
          
          periodArray.push({
            label: month.toLocaleDateString('default', { month: 'short' }),
            start: monthStart,
            end: monthEnd
          });
        }
      }
    }
    
    // Calculate income and expenses for each period
    const data = periodArray.map(period => {
      const periodTransactions = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return txDate >= period.start && txDate <= period.end;
      });
      
      const income = periodTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = periodTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        label: period.label,
        income,
        expenses
      };
    });
    
    setIncomeVsExpenses(data);
  };

  // Handle date range change
  const handleDateRangeChange = (period) => {
    setTimeRange(period);
    setCustomDateRange(false);
    
    const end = new Date();
    let start = new Date();
    
    switch (period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    if (setSelectedDateRange) {
      setSelectedDateRange({ start, end });
    }
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    setCustomDateRange(true);
    fetchFinancialData();
  };

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Get tooltip color class based on insight type
  const getInsightColorClass = (type) => {
    switch (type) {
      case 'positive':
        return 'finance-bg-green-900/50 finance-text-green-400';
      case 'negative':
        return 'finance-bg-red-900/50 finance-text-red-400';
      case 'warning':
        return 'finance-bg-amber-900/50 finance-text-amber-400';
      default:
        return 'finance-bg-blue-900/50 finance-text-blue-400';
    }
  };

  // Get background color class based on insight type
  const getInsightBgClass = (type) => {
    switch (type) {
      case 'positive':
        return 'finance-bg-green-900/30 finance-border-green-800/50';
      case 'negative':
        return 'finance-bg-red-900/30 finance-border-red-800/50';
      case 'warning':
        return 'finance-bg-amber-900/30 finance-border-amber-800/50';
      default:
        return 'finance-bg-blue-900/30 finance-border-blue-800/50';
    }
  };

  // Render icon based on icon name
  const renderIcon = (iconName, size = 16) => {
    switch (iconName) {
      case 'alert-triangle':
        return <AlertTriangle size={size} />;
      case 'alert-circle':
        return <AlertCircle size={size} />;
      case 'piggy-bank':
        return <PiggyBank size={size} />;
      case 'calendar':
        return <Calendar size={size} />;
      case 'pie-chart':
        return <PieChart size={size} />;
      case 'award':
        return <Award size={size} />;
      case 'trending-up':
        return <TrendingUp size={size} />;
      case 'trending-down':
        return <TrendingDown size={size} />;
      default:
        return <Info size={size} />;
    }
  };

  // Calculate max value for chart scaling
  const getMaxValue = (data, key) => {
    return Math.max(...data.map(item => item[key]));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between w-full">
  {/* Title and time range in first row on mobile, left column on desktop */}
  <div className="mb-4">
  {/* Header with title only */}
  <h4 className="text-lg font-medium text-white flex items-center gap-2 mb-3">
    <BarChart2 className="finance-text-amber-400" size={20} />
    Insights
  </h4>
  
  {/* Time frame selection - scrollable on mobile */}
  <div className="flex flex-col gap-3">
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex bg-slate-700 rounded-lg min-w-max">
        <button 
          onClick={() => handleDateRangeChange('week')} 
          className={`px-3 py-1.5 whitespace-nowrap ${timeRange === 'week' && !customDateRange ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
        >
          Week
        </button>
        <button 
          onClick={() => handleDateRangeChange('month')} 
          className={`px-3 py-1.5 whitespace-nowrap ${timeRange === 'month' && !customDateRange ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
        >
          Month
        </button>
        <button 
          onClick={() => handleDateRangeChange('quarter')} 
          className={`px-3 py-1.5 whitespace-nowrap ${timeRange === 'quarter' && !customDateRange ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
        >
          Quarter
        </button>
        <button 
          onClick={() => handleDateRangeChange('year')} 
          className={`px-3 py-1.5 whitespace-nowrap ${timeRange === 'year' && !customDateRange ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
        >
          Year
        </button>
        <button 
          onClick={() => setCustomDateRange(!customDateRange)} 
          className={`px-3 py-1.5 whitespace-nowrap ${customDateRange ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
        >
          Custom
        </button>
      </div>
    </div>
    
    {/* Date navigation - separated and full width */}
    {!customDateRange && (
      <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
        <button 
          onClick={() => {
            /* Your existing code */
          }}
          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
        >
          <ChevronLeft size={16} />
        </button>
        
        <span className="text-xs text-slate-300 flex-1 text-center">
          {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
        </span>
        
        <button 
          onClick={() => {
            /* Your existing code */
          }}
          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
          disabled={new Date(endDate) >= new Date()}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    )}
  </div>
</div>
          
          {!customDateRange && (
    <div className="flex items-center gap-2 self-start">
      <button 
        onClick={() => {
                  let prevPeriod = new Date(selectedDateRange.start);
                  let newEnd = new Date(selectedDateRange.start);
                  newEnd.setDate(newEnd.getDate() - 1);
                  
                  switch (timeRange) {
                    case 'week':
                      prevPeriod.setDate(prevPeriod.getDate() - 7);
                      break;
                    case 'month':
                      prevPeriod.setMonth(prevPeriod.getMonth() - 1);
                      break;
                    case 'quarter':
                      prevPeriod.setMonth(prevPeriod.getMonth() - 3);
                      break;
                    case 'year':
                      prevPeriod.setFullYear(prevPeriod.getFullYear() - 1);
                      break;
                  }
                  
                  setStartDate(prevPeriod.toISOString().split('T')[0]);
                  setEndDate(newEnd.toISOString().split('T')[0]);
                  
                  if (setSelectedDateRange) {
                    setSelectedDateRange({ start: prevPeriod, end: newEnd });
                  }
                  
                  fetchFinancialData();
                }}
                className="p-1.5 xs:p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-xs xs:text-sm text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
        {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
      </span>
              
              <button 
                onClick={() => {
                  let newStart = new Date(selectedDateRange.end);
                  newStart.setDate(newStart.getDate() + 1);
                  let newEnd = new Date(newStart);
                  
                  switch (timeRange) {
                    case 'week':
                      newEnd.setDate(newEnd.getDate() + 7);
                      break;
                    case 'month':
                      newEnd.setMonth(newEnd.getMonth() + 1);
                      break;
                    case 'quarter':
                      newEnd.setMonth(newEnd.getMonth() + 3);
                      break;
                    case 'year':
                      newEnd.setFullYear(newEnd.getFullYear() + 1);
                      break;
                  }
                  
                  // Don't allow future dates to exceed current date
                  const now = new Date();
                  if (newEnd > now) {
                    newEnd = now;
                  }
                  
                  setStartDate(newStart.toISOString().split('T')[0]);
                  setEndDate(newEnd.toISOString().split('T')[0]);
                  
                  if (setSelectedDateRange) {
                    setSelectedDateRange({ start: newStart, end: newEnd });
                  }
                  
                  fetchFinancialData();
                }}
                className="p-1.5 xs:p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
        disabled={new Date(endDate) >= new Date()}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Custom date range selector */}
        {customDateRange && (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-700 rounded-lg">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="p-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              />
            </div>
            
            <div className="flex-1 flex justify-end">
              <button 
                onClick={applyCustomDateRange}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Apply Range
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Financial Health Score */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-36 h-36 rounded-full bg-slate-700 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#2D3748"
                    strokeWidth="2"
                    className="dark:stroke-slate-600"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={insights.score > 70 ? "#10B981" : insights.score > 40 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="4"
                    strokeDasharray="100"
                    strokeDashoffset={100 - insights.score}
                    className="dark:stroke-opacity-80"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-white">
                    {insights.score}
                  </span>
                  <span className="text-xs text-slate-400">out of 100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h5 className="text-xl font-medium text-white mb-2">
              Financial Health Score
            </h5>
            <p className="text-slate-300 mb-4">
              {insights.score > 70
                ? "Your financial health is excellent! You're managing your money effectively."
                : insights.score > 40
                ? "Your financial health is good, but there's room for improvement."
                : "Your financial health needs attention. Consider the suggestions below."
              }
            </p>
            
            {/* Score breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-sm font-medium text-white mb-1 flex items-center">
                  <TrendingUp size={16} className="mr-1 finance-text-green-400" />
                  Income
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(stats?.income || 0)}
                </div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-sm font-medium text-white mb-1 flex items-center">
                  <TrendingDown size={16} className="mr-1 finance-text-red-400" />
                  Expenses
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(stats?.expenses || 0)}
                </div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-sm font-medium text-white mb-1 flex items-center">
                  <PiggyBank size={16} className="mr-1 finance-text-amber-400" />
                  Savings Rate
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats && stats.income > 0 
                    ? Math.round(((stats.income - stats.expenses) / stats.income) * 100) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h5 className="font-medium text-white mb-4 flex items-center gap-2">
            <PieChart className="finance-text-amber-400" size={18} />
            Expense Breakdown
          </h5>
          
          <div className="h-64 relative">
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#2D3748" strokeWidth="1" className="dark:stroke-slate-700"></circle>
                
                {/* Generate pie chart segments */}
                {chartData.map((category, index, array) => {
                  // Calculate the percentage and angles for this category
                  const totalValue = array.reduce((sum, cat) => sum + cat.value, 0);
                  const percentage = totalValue > 0 ? (category.value / totalValue) * 100 : 0;
                  
                  // Calculate the start angle
                  const previousPercentage = array
                    .slice(0, index)
                    .reduce((sum, cat) => sum + (totalValue > 0 ? (cat.value / totalValue) * 100 : 0), 0);
                  
                  const startAngle = (previousPercentage / 100) * 360;
                  const endAngle = ((previousPercentage + percentage) / 100) * 360;
                  
                  // SVG coordinates
                  const x1 = 21 + 15.91549430918954 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 21 + 15.91549430918954 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 21 + 15.91549430918954 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 21 + 15.91549430918954 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  // Determine if the arc should be drawn larger than 180 degrees
                  const largeArcFlag = percentage > 50 ? 1 : 0;
                  
                  // Use the category's color directly
                  const fixedColors = {
                    'blue': '#3B82F6', 
                    'green': '#10B981',
                    'amber': '#F59E0B',
                    'purple': '#8B5CF6', 
                    'red': '#EF4444',
                    'pink': '#EC4899',
                    'indigo': '#6366F1',
                    'teal': '#14B8A6',
                    'emerald': '#10B981',
                    'cyan': '#06B6D4',
                    'violet': '#8B5CF6',
                    'fuchsia': '#D946EF',
                    'gray': '#6B7280'
                  };
                  
                  const color = fixedColors[category.color] || fixedColors['gray'];
                  
                  return percentage > 0 ? (
                    <path
                      key={category.id}
                      d={`M21 21 L ${x1} ${y1} A 15.91549430918954 15.91549430918954 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={color}
                      className="dark:fill-opacity-80"
                    />
                  ) : null;
                })}
                
                {/* Inner circle for donut effect */}
                <circle cx="21" cy="21" r="10" fill="#1E293B" className="dark:fill-slate-800" />
              </svg>
              
              {/* Total in center */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-xs text-slate-400">Total Expenses</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(stats?.expenses || 0)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Categories Legend */}
          <div className="space-y-2 mt-4">
            {chartData.map((category, index) => {
              const totalValue = chartData.reduce((sum, cat) => sum + cat.value, 0);
              const percentage = totalValue > 0 ? (category.value / totalValue) * 100 : 0;
              
              // Use the category's color
              const fixedColors = {
                'blue': '#3B82F6', 
                'green': '#10B981',
                'amber': '#F59E0B',
                'purple': '#8B5CF6', 
                'red': '#EF4444',
                'pink': '#EC4899',
                'indigo': '#6366F1',
                'teal': '#14B8A6',
                'emerald': '#10B981',
                'cyan': '#06B6D4',
                'violet': '#8B5CF6',
                'fuchsia': '#D946EF',
                'gray': '#6B7280'
              };
              
              const color = fixedColors[category.color] || fixedColors['gray'];
              
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 font-medium">
                      {formatCurrency(category.value)}
                    </span>
                    <span className="text-xs text-slate-400 w-12 text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Spending Trend */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h5 className="font-medium text-white mb-4 flex items-center gap-2">
            <BarChart2 className="finance-text-amber-400" size={18} />
            {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Monthly' : 'Period'} Spending Trend
          </h5>
          
          <div className="h-64 relative">
            {spendingTrend.length > 0 ? (
              <div className="w-full h-full flex items-end justify-between">
                {spendingTrend.map((item, index) => {
                  const maxSpending = Math.max(...spendingTrend.map(i => i.spending));
                  const height = maxSpending > 0 ? (item.spending / maxSpending * 180) || 0 : 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex flex-col items-center"
                      onMouseEnter={() => setHoveredMonth(index)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div 
                        className="w-10 bg-amber-500 dark:bg-amber-600 rounded-t-lg transition-all relative"
                        style={{ height: `${Math.max(20, height)}px` }}
                      >
                        {hoveredMonth === index && (
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                            {formatCurrency(item.spending)}
                          </div>
                        )}
                      </div>
                      <span className="mt-2 text-xs text-slate-400">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-400">No spending data available</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between">
              <div className="text-sm">
                <div className="text-slate-400">Average Spending</div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(
                    spendingTrend.length > 0 
                      ? spendingTrend.reduce((sum, month) => sum + month.spending, 0) / spendingTrend.length
                      : 0
                  )}
                </div>
              </div>
              
              <div className="text-sm text-right">
                <div className="text-slate-400">Highest Period</div>
                <div className="text-lg font-bold text-white">
                  {spendingTrend.length > 0
                    ? formatCurrency(Math.max(...spendingTrend.map(m => m.spending)))
                    : formatCurrency(0)
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Income vs Expenses Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h5 className="font-medium text-white mb-4 flex items-center gap-2">
          <TrendingUp className="finance-text-amber-400" size={18} />
          Income vs Expenses
        </h5>
        
        <div className="h-[300px] relative" style={{ marginBottom: "20px" }}>
          {incomeVsExpenses.length > 0 ? (
            <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="600" y2="0" stroke="#4B5563" strokeWidth="1" />
              <line x1="0" y1="60" x2="600" y2="60" stroke="#4B5563" strokeWidth="1" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#4B5563" strokeWidth="1" />
              <line x1="0" y1="180" x2="600" y2="180" stroke="#4B5563" strokeWidth="1" />
              <line x1="0" y1="240" x2="600" y2="240" stroke="#4B5563" strokeWidth="1" />
              
              {/* Income area */}
              {(() => {
                // Find max value for scaling
                const maxIncome = Math.max(...incomeVsExpenses.map(item => item.income), ...incomeVsExpenses.map(item => item.expenses));
                
                // Calculate path coordinates
                const xStep = 600 / (incomeVsExpenses.length - 1 || 1);
                
                // Income path
                const incomePath = incomeVsExpenses.map((item, i) => {
                  const x = i * xStep;
                  const y = maxIncome > 0 ? 240 - (item.income / maxIncome * 240) : 240;
                  return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                }).join(' ');
                
                // Expenses path
                const expensesPath = incomeVsExpenses.map((item, i) => {
                  const x = i * xStep;
                  const y = maxIncome > 0 ? 240 - (item.expenses / maxIncome * 240) : 240;
                  return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                }).join(' ');
                
                // Income area
                const incomeArea = `${incomePath} L${(incomeVsExpenses.length - 1) * xStep},240 L0,240 Z`;
                
                // Expenses area
                const expensesArea = `${expensesPath} L${(incomeVsExpenses.length - 1) * xStep},240 L0,240 Z`;
                
                return (
                  <>
                    <path 
                      d={incomeArea}
                      fill="rgba(52, 211, 153, 0.2)"
                      stroke="#34D399"
                      strokeWidth="2"
                    />
                    
                    <path 
                      d={expensesPath}
                      fill="none"
                      stroke="#F87171"
                      strokeWidth="2"
                    />
                  </>
                );
              })()}
              
              {/* Month labels */}
              {incomeVsExpenses.map((item, i) => {
                const x = i * (600 / (incomeVsExpenses.length - 1 || 1));
                return (
                  <text key={i} x={x} y="255" fontSize="12" fill="#94A3B8" textAnchor="middle">
                    {item.label}
                  </text>
                );
              })}
            </svg>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-slate-400">No income vs expense data available</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-8 text-sm mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-slate-300">Income</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-slate-300">Expenses</span>
          </div>
        </div>
      </div>
      
      {/* Key Insights */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h5 className="text-lg font-medium text-white mb-4">
          Key Insights & Recommendations
        </h5>
        
        <div className="space-y-4">
          {insights.insights.length > 0 ? (
            insights.insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg ${getInsightBgClass(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getInsightColorClass(insight.type)}`}>
                    {renderIcon(insight.icon, 18)}
                  </div>
                  <div className="flex-1">
                    <h6 className="font-medium text-white mb-1">
                      {insight.title}
                    </h6>
                    <p className="text-slate-300 text-sm">
                      {insight.description}
                    </p>
                    
                    {insight.details && insight.details.length > 0 && (
                      <ul className="mt-2 pl-4 text-sm text-slate-400 space-y-1">
                        {insight.details.map((detail, i) => (
                          <li key={i} className="list-disc">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 p-6">
              Not enough financial data to generate insights. Add more transactions and budgets to get personalized recommendations.
            </div>
          )}
        </div>
      </div>
      
      {/* Wellbeing Connection */}
      {correlations && correlations.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h5 className="text-lg font-medium text-white mb-4">
            Finance & Wellbeing Connections
          </h5>
          
          <div className="space-y-4">
            {correlations.map((correlation, index) => {
              const category = correlation.categoryName || 'overall spending';
              
              return (
                <div 
                  key={index} 
                  className="finance-bg-purple-900/30 rounded-lg p-4 finance-border-purple-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg finance-bg-purple-900/50 finance-text-purple-400">
                      <BarChart2 size={18} />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-white mb-1">
                        {correlation.type === 'negative' 
                          ? `${category} may affect your mood`
                          : `${category} shows positive mood correlation`
                        }
                      </h6>
                      <p className="text-slate-300 text-sm">
                        {correlation.type === 'negative'
                          ? `There's a pattern where higher spending on ${category} is followed by lower mood scores the next day.`
                          : `Days with higher ${category} tend to correlate with improved mood scores.`
                        }
                      </p>
                      
                      <div className="mt-2 text-sm bg-slate-700 p-3 rounded-lg">
                        <span className="font-medium finance-text-purple-400">Recommendation:</span>
                        {correlation.type === 'negative'
                          ? ` Try to be more mindful of your spending on ${category} and notice how it affects your wellbeing.`
                          : ` While financial health is important, maintaining a balanced approach to spending can support overall wellbeing.`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialInsights;