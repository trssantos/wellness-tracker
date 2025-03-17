import React, { useState, useEffect } from 'react';
import { 
  X,BarChart2, Award, AlertTriangle, AlertCircle, PiggyBank, Calendar, 
  TrendingUp, TrendingDown, DollarSign, PieChart, Info, 
  ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Settings, Filter
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
  const [hoveredBar, setHoveredBar] = useState(null);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState(selectedDateRange.start.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(selectedDateRange.end.toISOString().split('T')[0]);
  const [insights, setInsights] = useState({ score: 0, insights: [] });
  const [correlations, setCorrelations] = useState([]);
  const [bills, setBills] = useState([]);
  
  // New state for selective chart application
  const [chartSettings, setChartSettings] = useState({
    showCustomDateSettings: false,
    applyCustomToSpendingTrend: true,
    applyCustomToIncomeExpenses: true,
    applyCustomToCategoryBreakdown: true
  });

  // Fetch data on initial render and when refreshTrigger changes
  useEffect(() => {
    fetchFinancialData();
  }, [refreshTrigger, timeRange, customDateRange, startDate, endDate]);

  // Get date range based on current timeframe selection
  const getDateRangeForTimeframe = (timeframe) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const start = new Date();
    
    switch (timeframe) {
      case 'week':
        // Start from 6 days ago to include today (7 days total)
        start.setDate(today.getDate() - 6);
        break;
      case 'month':
        // Start from 6 months ago to include current month (7 months total)
        start.setMonth(today.getMonth() - 6);
        start.setDate(1); // First day of the month
        break;
      case 'quarter':
        // Start from 6 quarters ago (18 months total)
        start.setMonth(today.getMonth() - 18);
        break;
      case 'year':
        // Start from 6 years ago to include current year (7 years total)
        start.setFullYear(today.getFullYear() - 6);
        start.setMonth(0); // January
        start.setDate(1); // First day of the year
        break;
      default:
        start.setMonth(today.getMonth() - 6);
    }
    
    start.setHours(0, 0, 0, 0);
    return { start, end: today };
  };

  // Fetch financial data based on current filters
  const fetchFinancialData = () => {
    const financeData = getFinanceData();
    
    // Start with all transactions
    let filteredTransactions = [...financeData.transactions];
    
    // Standard date range based on selected timeframe
    const standardDateRange = getDateRangeForTimeframe(timeRange);
    
    // Custom date range if active
    const customRange = {
      start: new Date(startDate),
      end: new Date(endDate)
    };
    customRange.end.setHours(23, 59, 59, 999);
    
    // Filter transactions based on date range
    filteredTransactions = filteredTransactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      
      // Use custom range only for transactions chart if enabled
      if (customDateRange) {
        return txDate >= customRange.start && txDate <= customRange.end;
      } else {
        return txDate >= standardDateRange.start && txDate <= standardDateRange.end;
      }
    });
    
    setTransactions(filteredTransactions);
    
    // Get recurring transactions as bills
    setBills(financeData.recurringTransactions || []);
    
    // Calculate financial stats based on filtered transactions
    calculateStats(filteredTransactions);
    
    // Generate spending trend data - this will use the standard range or custom range based on settings
    generateSpendingTrend(
      filteredTransactions, 
      customDateRange && chartSettings.applyCustomToSpendingTrend ? customRange : standardDateRange
    );
    
    // Generate income vs expenses data - this will use the standard range or custom range based on settings
    generateIncomeVsExpenses(
      filteredTransactions, 
      customDateRange && chartSettings.applyCustomToIncomeExpenses ? customRange : standardDateRange
    );
    
    // Get financial insights
    const financialInsights = getFinancialInsights();
    setInsights(financialInsights);
    
    // Get mood correlations
    const moodCorrelations = getSpendingMoodCorrelation();
    setCorrelations(moodCorrelations);
    
    // Update parent component's date range if available
    if (setSelectedDateRange) {
      setSelectedDateRange(customDateRange ? customRange : standardDateRange);
    }
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

  // IMPROVED: Generate spending trend data based on timeframe - always showing 7 periods
  const generateSpendingTrend = (transactions, dateRange) => {
    // Define period type based on selected time range
    let periodType = 'month'; // Default
    
    if (timeRange === 'week') {
      periodType = 'day';
    } else if (timeRange === 'month') {
      periodType = 'month';
    } else if (timeRange === 'quarter') {
      periodType = 'week';
    } else if (timeRange === 'year') {
      periodType = 'month';
    }
    
    // Always show 7 periods (current + 6 previous)
    const periods = 7;
    
    // Create array of period objects
    const periodArray = [];
    
    if (customDateRange && chartSettings.applyCustomToSpendingTrend) {
      const start = dateRange.start;
      const end = dateRange.end;
      
      // Calculate appropriate periods based on the date range duration
      const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (durationInDays <= 14) {
        // For short ranges, use daily periods
        const dayStep = Math.max(1, Math.floor(durationInDays / 7));
        
        for (let i = 0; i < periods; i++) {
          const day = new Date(end);
          day.setDate(day.getDate() - ((periods - 1 - i) * dayStep));
          
          // Skip days beyond the start date
          if (day < start) continue;
          
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(new Date(day).setHours(0, 0, 0, 0)),
            end: new Date(new Date(day).setHours(23, 59, 59, 999))
          });
        }
      } else if (durationInDays <= 90) {
        // For medium ranges, use weekly periods
        const weekStep = Math.max(1, Math.floor(durationInDays / 7 / 7));
        
        for (let i = 0; i < periods; i++) {
          const weekStart = new Date(end);
          weekStart.setDate(weekStart.getDate() - ((periods - 1 - i) * 7 * weekStep));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          // Skip weeks beyond the start date
          if (weekStart < start) continue;
          
          periodArray.push({
            label: `${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`,
            start: new Date(weekStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      } else {
        // For long ranges, use monthly periods
        const monthStep = Math.max(1, Math.floor(durationInDays / 30 / 7));
        
        for (let i = 0; i < periods; i++) {
          const monthStart = new Date(end);
          monthStart.setMonth(monthStart.getMonth() - ((periods - 1 - i) * monthStep));
          monthStart.setDate(1); // First day of month
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          monthEnd.setDate(0); // Last day of month
          
          // Skip months beyond the start date
          if (monthStart < start) continue;
          
          periodArray.push({
            label: monthStart.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
            start: new Date(monthStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(monthEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      }
    } else {
      // Use standard periods based on selected time range
      const end = dateRange.end;
      const start = dateRange.start;
      
      if (periodType === 'day') {
        // DAILY VIEW: Today + 6 previous days
        for (let i = 0; i < periods; i++) {
          const day = new Date(end);
          day.setDate(day.getDate() - (periods - 1 - i));
          
          // Skip future days
          if (day > end) continue;
          
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'week') {
        // WEEKLY VIEW: This week + 6 previous weeks
        for (let i = 0; i < periods; i++) {
          const weekStart = new Date(end);
          // Adjust to go back by (periods - 1 - i) weeks
          weekStart.setDate(weekStart.getDate() - 7 * (periods - 1 - i));
          
          // Adjust to the beginning of the week (Sunday or Monday depending on locale)
          const dayOfWeek = weekStart.getDay();
          const diff = weekStart.getDate() - dayOfWeek;
          weekStart.setDate(diff);
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          // Skip weeks beyond the date range
          if (weekStart < start) continue;
          
          periodArray.push({
            label: `Week ${i+1}`,
            start: new Date(weekStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      } else if (periodType === 'month') {
        // MONTHLY VIEW: This month + 6 previous months
        for (let i = 0; i < periods; i++) {
          const monthStart = new Date(end);
          monthStart.setDate(1); // First day of month
          monthStart.setMonth(monthStart.getMonth() - (periods - 1 - i));
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          monthEnd.setDate(0); // Last day of month
          
          // Skip months beyond the date range
          if (monthStart < start) continue;
          
          periodArray.push({
            label: monthStart.toLocaleDateString('default', { month: 'short' }),
            start: new Date(monthStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(monthEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      }
    }
    
    // Sort periods chronologically
    periodArray.sort((a, b) => a.start - b.start);
    
    // Calculate spending for each period
    const trend = periodArray.map(period => {
      const periodTransactions = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return txDate >= period.start && txDate <= period.end && t.amount < 0;
      });
      
      const spending = periodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Add some analysis to each period
      const topCategory = findTopCategory(periodTransactions);
      
      return {
        ...period,
        spending,
        topCategory
      };
    });
    
    setSpendingTrend(trend);
  };
  
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
      const category = getCategoryById(topCategoryId);
      return {
        name: category ? category.name : 'Unknown',
        amount: topAmount
      };
    }
    
    return null;
  };
  
  // Generate income vs expenses data
  const generateIncomeVsExpenses = (transactions, dateRange) => {
    // Define period type based on selected time range
    let periodType = 'month'; // Default
    const periods = 7; // Always show 7 periods
    
    if (timeRange === 'week') {
      periodType = 'day';
    } else if (timeRange === 'month') {
      periodType = 'month';
    } else if (timeRange === 'quarter') {
      periodType = 'week';
    } else if (timeRange === 'year') {
      periodType = 'month';
    }
    
    // Create array of period objects (similar to spending trend function)
    const periodArray = [];
    
    if (customDateRange && chartSettings.applyCustomToIncomeExpenses) {
      // Logic similar to generateSpendingTrend for custom date range
      const start = dateRange.start;
      const end = dateRange.end;
      
      // Calculate appropriate periods based on the date range duration
      const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (durationInDays <= 14) {
        // For short ranges, use daily periods
        const dayStep = Math.max(1, Math.floor(durationInDays / 7));
        
        for (let i = 0; i < periods; i++) {
          const day = new Date(end);
          day.setDate(day.getDate() - ((periods - 1 - i) * dayStep));
          
          // Skip days beyond the start date
          if (day < start) continue;
          
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(new Date(day).setHours(0, 0, 0, 0)),
            end: new Date(new Date(day).setHours(23, 59, 59, 999))
          });
        }
      } else if (durationInDays <= 90) {
        // For medium ranges, use weekly periods
        const weekStep = Math.max(1, Math.floor(durationInDays / 7 / 7));
        
        for (let i = 0; i < periods; i++) {
          const weekStart = new Date(end);
          weekStart.setDate(weekStart.getDate() - ((periods - 1 - i) * 7 * weekStep));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          // Skip weeks beyond the start date
          if (weekStart < start) continue;
          
          periodArray.push({
            label: `${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`,
            start: new Date(weekStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      } else {
        // For long ranges, use monthly periods
        const monthStep = Math.max(1, Math.floor(durationInDays / 30 / 7));
        
        for (let i = 0; i < periods; i++) {
          const monthStart = new Date(end);
          monthStart.setMonth(monthStart.getMonth() - ((periods - 1 - i) * monthStep));
          monthStart.setDate(1); // First day of month
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          monthEnd.setDate(0); // Last day of month
          
          // Skip months beyond the start date
          if (monthStart < start) continue;
          
          periodArray.push({
            label: monthStart.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
            start: new Date(monthStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(monthEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      }
    } else {
      // Use standard periods based on selected time range
      const end = dateRange.end;
      
      if (periodType === 'day') {
        // Today + 6 previous days
        for (let i = 0; i < periods; i++) {
          const day = new Date(end);
          day.setDate(day.getDate() - (periods - 1 - i));
          
          periodArray.push({
            label: day.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'week') {
        // This week + 6 previous weeks
        for (let i = 0; i < periods; i++) {
          const weekStart = new Date(end);
          weekStart.setDate(weekStart.getDate() - 7 * (periods - 1 - i));
          
          // Adjust to the beginning of the week (Sunday or Monday depending on locale)
          const dayOfWeek = weekStart.getDay();
          const diff = weekStart.getDate() - dayOfWeek;
          weekStart.setDate(diff);
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          periodArray.push({
            label: `Week ${i+1}`,
            start: new Date(weekStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      } else if (periodType === 'month') {
        // This month + 6 previous months
        for (let i = 0; i < periods; i++) {
          const monthStart = new Date(end);
          monthStart.setDate(1); // First day of month
          monthStart.setMonth(monthStart.getMonth() - (periods - 1 - i));
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          monthEnd.setDate(0); // Last day of month
          
          periodArray.push({
            label: monthStart.toLocaleDateString('default', { month: 'short' }),
            start: new Date(monthStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(monthEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      }
    }
    
    // Sort periods chronologically
    periodArray.sort((a, b) => a.start - b.start);
    
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
        expenses,
        net: income - expenses
      };
    });
    
    setIncomeVsExpenses(data);
  };

  // Handle date range change
  const handleDateRangeChange = (period) => {
    setTimeRange(period);
    setCustomDateRange(false);
    
    // Calculate appropriate date range
    const dateRange = getDateRangeForTimeframe(period);
    setStartDate(dateRange.start.toISOString().split('T')[0]);
    setEndDate(dateRange.end.toISOString().split('T')[0]);
    
    // Update parent component's date range
    if (setSelectedDateRange) {
      setSelectedDateRange(dateRange);
    }
  };

  // Handle navigation through time periods
  const handleNavigatePrevious = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timespan = end - start; // In milliseconds
    
    // Move the date range back by one full period
    const newEnd = new Date(start);
    newEnd.setDate(newEnd.getDate() - 1);
    const newStart = new Date(newEnd - timespan);
    
    setStartDate(newStart.toISOString().split('T')[0]);
    setEndDate(newEnd.toISOString().split('T')[0]);
    
    // Update parent component's date range
    if (setSelectedDateRange) {
      setSelectedDateRange({ start: newStart, end: newEnd });
    }
    
    fetchFinancialData();
  };

  const handleNavigateNext = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timespan = end - start; // In milliseconds
    
    // Move the date range forward by one full period
    const newStart = new Date(end);
    newStart.setDate(newStart.getDate() + 1);
    const newEnd = new Date(newStart.getTime() + timespan);
    
    // Don't allow future dates beyond today
    const today = new Date();
    if (newEnd > today) {
      newEnd.setTime(today.getTime());
    }
    
    setStartDate(newStart.toISOString().split('T')[0]);
    setEndDate(newEnd.toISOString().split('T')[0]);
    
    // Update parent component's date range
    if (setSelectedDateRange) {
      setSelectedDateRange({ start: newStart, end: newEnd });
    }
    
    fetchFinancialData();
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

  // Get insight color class based on type
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

  // Get color for spending trend bars
  const getSpendingTrendBarColor = (index, spending, average) => {
    // Use colors to indicate spending relative to average
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
    <div className="space-y-6">
      {/* Header Section with improved Time Navigation */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h4 className="text-lg font-medium text-white flex items-center gap-2 mb-2">
              <BarChart2 className="finance-text-amber-400" size={20} />
              Insights
              <span className="text-sm text-slate-400 font-normal">
                {customDateRange 
                  ? `Custom Range` 
                  : timeRange === 'week' 
                    ? 'Daily View' 
                    : timeRange === 'month' 
                      ? 'Monthly View' 
                      : timeRange === 'quarter' 
                        ? 'Quarterly View' 
                        : 'Yearly View'
                }
              </span>
            </h4>
            <p className="text-slate-400 text-sm hidden md:block">
              Gain insights into your spending patterns and financial health to make better financial decisions.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDateRangeChange('week')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeRange === 'week' && !customDateRange 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeRange === 'month' && !customDateRange 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleDateRangeChange('quarter')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeRange === 'quarter' && !customDateRange 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => handleDateRangeChange('year')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeRange === 'year' && !customDateRange 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setChartSettings(prev => ({
                ...prev,
                showCustomDateSettings: !prev.showCustomDateSettings
              }))}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                customDateRange || chartSettings.showCustomDateSettings
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
        
        {/* Time Navigation Controls */}
        <div className="flex items-center justify-between bg-slate-700 rounded-lg p-2">
          <button 
            onClick={handleNavigatePrevious}
            className="p-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-sm text-slate-300">
            {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
          </span>
          
          <button 
            onClick={handleNavigateNext}
            className="p-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
            disabled={new Date(endDate) >= new Date()}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        {/* Custom Date Settings Panel */}
        {chartSettings.showCustomDateSettings && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-white font-medium">Custom Date Settings</h5>
              <button
                onClick={() => setChartSettings(prev => ({
                  ...prev,
                  showCustomDateSettings: false
                }))}
                className="p-1 rounded-full hover:bg-slate-600 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm text-slate-300 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                />
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="block text-sm text-slate-300 mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-sm text-white font-medium">Apply custom date range to:</label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="applyToSpendingTrend"
                  checked={chartSettings.applyCustomToSpendingTrend}
                  onChange={() => setChartSettings(prev => ({
                    ...prev,
                    applyCustomToSpendingTrend: !prev.applyCustomToSpendingTrend
                  }))}
                  className="mr-2"
                />
                <label htmlFor="applyToSpendingTrend" className="text-slate-300 text-sm">
                  Spending Trend Chart
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="applyToIncomeExpenses"
                  checked={chartSettings.applyCustomToIncomeExpenses}
                  onChange={() => setChartSettings(prev => ({
                    ...prev,
                    applyCustomToIncomeExpenses: !prev.applyCustomToIncomeExpenses
                  }))}
                  className="mr-2"
                />
                <label htmlFor="applyToIncomeExpenses" className="text-slate-300 text-sm">
                  Income vs Expenses Chart
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="applyToCategoryBreakdown"
                  checked={chartSettings.applyCustomToCategoryBreakdown}
                  onChange={() => setChartSettings(prev => ({
                    ...prev,
                    applyCustomToCategoryBreakdown: !prev.applyCustomToCategoryBreakdown
                  }))}
                  className="mr-2"
                />
                <label htmlFor="applyToCategoryBreakdown" className="text-slate-300 text-sm">
                  Category Breakdown
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setCustomDateRange(true);
                  fetchFinancialData();
                  setChartSettings(prev => ({
                    ...prev,
                    showCustomDateSettings: false
                  }));
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Apply Custom Range
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
      
      {/* ENHANCED: Spending Trend Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h5 className="font-medium text-white mb-4 flex items-center gap-2">
          <BarChart2 className="finance-text-amber-400" size={18} />
          Spending Trend
          <span className="text-sm text-slate-400 font-normal">
            {timeRange === 'week' ? 'Daily View' : timeRange === 'month' ? 'Monthly View' : 'Period View'}
          </span>
        </h5>
        
        <div className="h-64 relative">
          {spendingTrend.length > 0 ? (
            <div className="w-full h-full flex items-end justify-between">
              {(() => {
                // Calculate average spending across all periods
                const totalSpending = spendingTrend.reduce((sum, item) => sum + item.spending, 0);
                const averageSpending = totalSpending / spendingTrend.length;
                
                return spendingTrend.map((item, index) => {
                  const maxSpending = Math.max(...spendingTrend.map(i => i.spending));
                  const height = maxSpending > 0 ? (item.spending / maxSpending * 180) || 0 : 0;
                  const barColor = getSpendingTrendBarColor(index, item.spending, averageSpending);
                  
                  return (
                    <div 
                      key={index} 
                      className="flex flex-col items-center"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div 
                        className={`w-10 ${barColor} rounded-t-lg transition-all relative`}
                        style={{ height: `${Math.max(20, height)}px` }}
                      >
                        {hoveredBar === index && (
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white p-2 rounded text-xs whitespace-nowrap z-10 min-w-[120px] border border-slate-700">
                            <div className="font-bold mb-1">{formatCurrency(item.spending)}</div>
                            {item.topCategory && (
                              <div className="text-xs">
                                Top: {item.topCategory.name} ({formatCurrency(item.topCategory.amount)})
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full mt-2 text-center">
                        <div className="text-xs text-slate-300 font-medium">{item.label}</div>
                        
                        {hoveredBar === index && (
                          <div className="text-xs text-slate-400 absolute left-1/2 transform -translate-x-1/2">
                            {item.spending > averageSpending * 1.1 
                              ? '↑ Higher' 
                              : item.spending < averageSpending * 0.9 
                                ? '↓ Lower' 
                                : '= Average'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-slate-400">No spending data available</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-sm">
              <div className="text-slate-400">Average Spending</div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(
                  spendingTrend.length > 0 
                    ? spendingTrend.reduce((sum, period) => sum + period.spending, 0) / spendingTrend.length
                    : 0
                )}
              </div>
            </div>
            
            <div className="text-sm text-right">
              <div className="text-slate-400">Highest Period</div>
              <div className="text-lg font-bold text-white">
                {spendingTrend.length > 0
                  ? formatCurrency(Math.max(...spendingTrend.map(period => period.spending)))
                  : formatCurrency(0)
                }
              </div>
            </div>
            
            <div className="text-sm">
              <div className="text-slate-400">Total Spending</div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(
                  spendingTrend.reduce((sum, period) => sum + period.spending, 0)
                )}
              </div>
            </div>
          </div>
          
          {/* Spending Trend Analysis */}
          {spendingTrend.length > 0 && (
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-amber-400 mt-0.5" />
                <div>
                  {(() => {
                    // Calculate trend analysis
                    const firstHalf = spendingTrend.slice(0, Math.ceil(spendingTrend.length / 2));
                    const secondHalf = spendingTrend.slice(Math.ceil(spendingTrend.length / 2));
                    
                    const firstHalfTotal = firstHalf.reduce((sum, period) => sum + period.spending, 0);
                    const secondHalfTotal = secondHalf.reduce((sum, period) => sum + period.spending, 0);
                    
                    const percentChange = firstHalfTotal > 0 
                      ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100
                      : 0;
                    
                    // Find the highest spending period
                    const highestPeriod = [...spendingTrend].sort((a, b) => b.spending - a.spending)[0];
                    
                    if (Math.abs(percentChange) < 5) {
                      return (
                        <span className="text-slate-300">
                          Your spending has been relatively stable during this period. 
                          {highestPeriod && highestPeriod.topCategory && (
                            ` Your highest spending was in ${highestPeriod.label} with ${highestPeriod.topCategory.name} as the top category.`
                          )}
                        </span>
                      );
                    } else if (percentChange > 0) {
                      return (
                        <span className="text-slate-300">
                          Your spending has increased by approximately {Math.abs(percentChange).toFixed(0)}% from earlier to later in this period.
                          {highestPeriod && highestPeriod.topCategory && (
                            ` Your highest spending was in ${highestPeriod.label} with ${highestPeriod.topCategory.name} as the top category.`
                          )}
                        </span>
                      );
                    } else {
                      return (
                        <span className="text-slate-300">
                          Your spending has decreased by approximately {Math.abs(percentChange).toFixed(0)}% from earlier to later in this period.
                          {highestPeriod && highestPeriod.topCategory && (
                            ` Your highest spending was in ${highestPeriod.label} with ${highestPeriod.topCategory.name} as the top category.`
                          )}
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart Grid */}
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
          
          {/* Top spending category analysis */}
          {chartData.length > 0 && (
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-slate-300">
                <span className="font-medium text-white">Spending Insight: </span>
                Your highest spending category is {chartData[0].name} at {formatCurrency(chartData[0].value)} 
                ({Math.round((chartData[0].value / (stats?.expenses || 1)) * 100)}% of total expenses).
                {chartData.length > 1 && (
                  ` This is ${Math.round((chartData[0].value / chartData[1].value) * 100) - 100}% higher than your second highest category, ${chartData[1].name}.`
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Income vs Expenses */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h5 className="font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp className="finance-text-amber-400" size={18} />
            Income vs Expenses
          </h5>
          
          <div className="h-64 relative">
            {incomeVsExpenses.length > 0 ? (
              <div className="w-full h-full">
                <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="0" x2="600" y2="0" stroke="#4B5563" strokeWidth="1" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#4B5563" strokeWidth="1" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#4B5563" strokeWidth="1" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#4B5563" strokeWidth="1" />
                  <line x1="0" y1="240" x2="600" y2="240" stroke="#4B5563" strokeWidth="1" />
                  
                  {/* Income and expenses lines */}
                  {(() => {
                    // Find max value for scaling
                    const maxValue = Math.max(
                      ...incomeVsExpenses.map(item => Math.max(item.income, item.expenses))
                    );
                    
                    // Calculate path coordinates
                    const xStep = 600 / (incomeVsExpenses.length - 1 || 1);
                    
                    // Income path
                    const incomePath = incomeVsExpenses.map((item, i) => {
                      const x = i * xStep;
                      const y = maxValue > 0 ? 240 - (item.income / maxValue * 240) : 240;
                      return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                    }).join(' ');
                    
                    // Expenses path
                    const expensesPath = incomeVsExpenses.map((item, i) => {
                      const x = i * xStep;
                      const y = maxValue > 0 ? 240 - (item.expenses / maxValue * 240) : 240;
                      return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                    }).join(' ');
                    
                    // Income area
                    const incomeArea = `${incomePath} L${(incomeVsExpenses.length - 1) * xStep},240 L0,240 Z`;
                    
                    return (
                      <>
                        {/* Income area */}
                        <path 
                          d={incomeArea}
                          fill="rgba(52, 211, 153, 0.2)"
                          stroke="#34D399"
                          strokeWidth="2"
                        />
                        
                        {/* Expenses line */}
                        <path 
                          d={expensesPath}
                          fill="none"
                          stroke="#F87171"
                          strokeWidth="2"
                        />
                        
                        {/* Labels and data points */}
                        {incomeVsExpenses.map((item, i) => {
                          const x = i * xStep;
                          
                          // Income data point
                          const incomeY = maxValue > 0 ? 240 - (item.income / maxValue * 240) : 240;
                          
                          // Expenses data point
                          const expensesY = maxValue > 0 ? 240 - (item.expenses / maxValue * 240) : 240;
                          
                          return (
                            <g key={i}>
                              {/* Income data point */}
                              <circle cx={x} cy={incomeY} r="4" fill="#34D399" />
                              
                              {/* Expenses data point */}
                              <circle cx={x} cy={expensesY} r="4" fill="#F87171" />
                              
                              {/* Period label */}
                              <text x={x} y="255" fontSize="12" fill="#94A3B8" textAnchor="middle">
                                {item.label}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-400">No income vs expense data available</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-8 text-sm mt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-slate-300">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-slate-300">Expenses</span>
            </div>
          </div>
          
          {/* Income vs Expenses Analysis */}
          {incomeVsExpenses.length > 0 && (
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-slate-300">
                {(() => {
                  // Calculate totals and averages
                  const totalIncome = incomeVsExpenses.reduce((sum, item) => sum + item.income, 0);
                  const totalExpenses = incomeVsExpenses.reduce((sum, item) => sum + item.expenses, 0);
                  const totalNet = totalIncome - totalExpenses;
                  
                  // Find best and worst periods
                  const bestPeriod = [...incomeVsExpenses].sort((a, b) => (b.income - b.expenses) - (a.income - a.expenses))[0];
                  const worstPeriod = [...incomeVsExpenses].sort((a, b) => (a.income - a.expenses) - (b.income - b.expenses))[0];
                  
                  if (totalNet > 0) {
                    return (
                      <>
                        <span className="font-medium text-white">Positive Cash Flow: </span>
                        Your income exceeded expenses by {formatCurrency(totalNet)} during this period. 
                        Your best performing period was {bestPeriod.label} with a net of {formatCurrency(bestPeriod.income - bestPeriod.expenses)}.
                      </>
                    );
                  } else {
                    return (
                      <>
                        <span className="font-medium text-white">Negative Cash Flow: </span>
                        Your expenses exceeded income by {formatCurrency(Math.abs(totalNet))} during this period. 
                        Your most challenging period was {worstPeriod.label} with a net of {formatCurrency(worstPeriod.income - worstPeriod.expenses)}.
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          )}
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