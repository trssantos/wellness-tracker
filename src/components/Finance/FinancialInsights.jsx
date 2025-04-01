import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Award, AlertTriangle, AlertCircle, PiggyBank, Calendar, 
  TrendingUp, TrendingDown, DollarSign, PieChart, Info, Coffee, Utensils,
  ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Settings, Filter, ShoppingBag
} from 'lucide-react';
import CategoryGroupAnalysis from './CategoryGroupAnalysis';
import { 
  getFinanceData, calculateFinancialStats, getFinancialInsights, 
  getSpendingMoodCorrelation, getCategoryById, getSpendingByGroup
} from '../../utils/financeUtils';
import HorizontalSpendingTrend from './HorizontalSpendingTrend';
import { formatDateForStorage } from '../../utils/dateUtils';

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
  const [startDate, setStartDate] = useState(formatDateForStorage(selectedDateRange.start));
  const [endDate, setEndDate] = useState(formatDateForStorage(selectedDateRange.end));
  const [insights, setInsights] = useState({ score: 0, insights: [] });
  const [correlations, setCorrelations] = useState([]);
  const [bills, setBills] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'categoryBreakdown', 'foodAnalysis', etc.
  const [spendingByGroup, setSpendingByGroup] = useState([]);
  
  // New state for selective chart application
  const [chartSettings, setChartSettings] = useState({
    showCustomDateSettings: false,
    applyCustomToSpendingTrend: true,
    applyCustomToIncomeExpenses: true,
    applyCustomToCategoryBreakdown: true
  });

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data on initial render and when refreshTrigger changes
  useEffect(() => {
    fetchFinancialData();
  }, [refreshTrigger, timeRange, customDateRange, startDate, endDate]);

  // Get date range based on current timeframe selection
  const getDateRangeForTimeframe = (timeframe) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let start = new Date();
    let end = new Date(today);
    
    switch (timeframe) {
      case 'week':
        // Start from the beginning of the current week
        start = new Date(today);
        const dayOfWeek = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
        start.setDate(start.getDate() - dayOfWeek); // Go to start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        break;
      
      case 'month':
        // Start from the beginning of the current month
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        if (end > today) end = today;
        break;
      
      case 'quarter':
        // Start from the beginning of the current quarter
        const currentQuarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), currentQuarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
        if (end > today) end = today;
        break;
      
      case 'year':
        // Start from the beginning of the current year
        start = new Date(today.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        if (end > today) end = today;
        break;
      
      default:
        // Default to current month
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        if (end > today) end = today;
    }
    
    return { start, end };
  }

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
    
    // Update category group spending
    const spendingByGroupData = getSpendingByGroup(filteredTransactions);
    setSpendingByGroup(spendingByGroupData);
    
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
          color: category.color, // Use the color from category definition
          group: category.group || 'Other'
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

  // IMPROVED: Generate spending trend data based on timeframe - always showing 7 periods
  const generateSpendingTrend = (transactions, dateRange) => {
    // Define period type based on selected time range
    let periodType = 'month'; // Default
    
    if (timeRange === 'week') {
      periodType = 'day';
    } else if (timeRange === 'month') {
      periodType = 'day'; // Changed to show days in the month
    } else if (timeRange === 'quarter') {
      periodType = 'week';
    } else if (timeRange === 'year') {
      periodType = 'month';
    }
    
    // Always show appropriate number of periods based on the range
    const periods = (periodType === 'day' && timeRange === 'month') ? Math.min(dateRange.end.getDate(), 31) : 7;
    
    // Create array of period objects
    const periodArray = [];
    
    if (customDateRange && chartSettings.applyCustomToSpendingTrend) {
      const start = dateRange.start;
      const end = dateRange.end;
      
      // Calculate appropriate periods based on the date range duration
      const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (durationInDays <= 31) {
        // For short ranges, use daily periods
        const dayStep = Math.max(1, Math.floor(durationInDays / periods));
        
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
        const weekStep = Math.max(1, Math.floor(durationInDays / 7 / periods));
        
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
        const monthStep = Math.max(1, Math.floor(durationInDays / 30 / periods));
        
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
      // Use standard periods based on current time range
      const end = dateRange.end;
      
      if (periodType === 'day' && timeRange === 'week') {
        // DAILY VIEW for Week: Start of week to today
        const startOfWeek = new Date(end);
        const day = startOfWeek.getDay(); // 0 for Sunday, 1 for Monday, etc.
        startOfWeek.setDate(startOfWeek.getDate() - day); // Go to beginning of week (Sunday)
        
        for (let i = 0; i <= 6; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          
          // Skip future days
          if (day > end) break;
          
          periodArray.push({
            label: day.toLocaleDateString('default', { weekday: 'short' }),
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'day' && timeRange === 'month') {
        // DAILY VIEW for Month: Selected days throughout the month
        const startOfMonth = new Date(end.getFullYear(), end.getMonth(), 1);
        const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
        const dayStep = Math.max(1, Math.floor(daysInMonth / periods));
        
        for (let i = 0; i < periods; i++) {
          // Distribute days evenly through the month
          const dayOfMonth = Math.min(1 + (i * dayStep), daysInMonth);
          const day = new Date(end.getFullYear(), end.getMonth(), dayOfMonth);
          
          // Skip future days
          if (day > end) break;
          
          periodArray.push({
            label: day.getDate().toString(), // Just the day number
            start: new Date(day.setHours(0, 0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59, 999))
          });
        }
      } else if (periodType === 'week') {
        // WEEKLY VIEW: Weeks throughout the quarter
        const startOfQuarter = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
        
        for (let i = 0; i < periods; i++) {
          const weekStart = new Date(startOfQuarter);
          weekStart.setDate(weekStart.getDate() + (i * 7));
          
          // Skip weeks beyond today
          if (weekStart > end) break;
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          periodArray.push({
            label: `Week ${i+1}`,
            start: new Date(weekStart.setHours(0, 0, 0, 0)),
            end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
          });
        }
      } else if (periodType === 'month') {
        // MONTHLY VIEW: Months throughout the year
        const startOfYear = new Date(end.getFullYear(), 0, 1);
        
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(startOfYear);
          monthStart.setMonth(i);
          
          // Skip months beyond today
          if (monthStart > end) break;
          
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
  }
  
  // Generate income vs expenses data
const generateIncomeVsExpenses = (transactions, dateRange) => {
  // Define period type based on selected time range
  let periodType = 'month'; // Default
  const periods = 7; // Always show appropriate number of periods
  
  if (timeRange === 'week') {
    periodType = 'day';
  } else if (timeRange === 'month') {
    periodType = 'week'; // Show weekly data for the month
  } else if (timeRange === 'quarter') {
    periodType = 'month';
  } else if (timeRange === 'year') {
    periodType = 'quarter';
  }
  
  // Create array of period objects
  const periodArray = [];
  
  if (customDateRange && chartSettings.applyCustomToIncomeExpenses) {
    // Logic for custom date range
    const start = dateRange.start;
    const end = dateRange.end;
    
    // Calculate appropriate periods based on the date range duration
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (durationInDays <= 14) {
      // For short ranges, use daily periods
      const dayStep = Math.max(1, Math.floor(durationInDays / periods));
      
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
      const weekStep = Math.max(1, Math.floor(durationInDays / 7 / periods));
      
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
      const monthStep = Math.max(1, Math.floor(durationInDays / 30 / periods));
      
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
      // Daily view for week
      const startOfWeek = new Date(end);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day); // Beginning of week (Sunday)
      
      for (let i = 0; i <= 6; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        
        if (day > end) break; // Skip future days
        
        periodArray.push({
          label: day.toLocaleDateString('default', { weekday: 'short' }),
          start: new Date(day.setHours(0, 0, 0, 0)),
          end: new Date(day.setHours(23, 59, 59, 999))
        });
      }
    } else if (periodType === 'week') {
      // Weekly view for month
      const startOfMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      
      // Get number of weeks in the month
      const endOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
      const weeksInMonth = Math.ceil((endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7);
      
      for (let i = 0; i < weeksInMonth; i++) {
        const weekStart = new Date(startOfMonth);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        
        if (weekStart > end) break; // Skip future weeks
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekLabel = `Week ${i+1}`; 
        
        periodArray.push({
          label: weekLabel,
          start: new Date(weekStart.setHours(0, 0, 0, 0)),
          end: new Date(Math.min(weekEnd.setHours(23, 59, 59, 999), end.getTime()))
        });
      }
    } else if (periodType === 'month') {
      // Monthly view for quarter
      const startOfQuarter = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
      
      for (let i = 0; i < 3; i++) {
        const monthStart = new Date(startOfQuarter);
        monthStart.setMonth(startOfQuarter.getMonth() + i);
        
        if (monthStart > end) break; // Skip future months
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);
        monthEnd.setDate(0); // Last day of month
        
        periodArray.push({
          label: monthStart.toLocaleDateString('default', { month: 'short' }),
          start: new Date(monthStart.setHours(0, 0, 0, 0)),
          end: new Date(Math.min(monthEnd.setHours(23, 59, 59, 999), end.getTime()))
        });
      }
    } else if (periodType === 'quarter') {
      // Quarterly view for year
      for (let i = 0; i < 4; i++) {
        const quarterStart = new Date(end.getFullYear(), i * 3, 1);
        
        if (quarterStart > end) break; // Skip future quarters
        
        const quarterEnd = new Date(quarterStart);
        quarterEnd.setMonth(quarterStart.getMonth() + 3);
        quarterEnd.setDate(0); // Last day of the quarter
        
        periodArray.push({
          label: `Q${i+1}`,
          start: new Date(quarterStart.setHours(0, 0, 0, 0)),
          end: new Date(Math.min(quarterEnd.setHours(23, 59, 59, 999), end.getTime()))
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
}

  // Handle date range change
  const handleDateRangeChange = (period) => {
    setTimeRange(period);
    setCustomDateRange(false);
    
    // Calculate appropriate date range
    const dateRange = getDateRangeForTimeframe(period);
    setStartDate(formatDateForStorage(dateRange.start));
    setEndDate(formatDateForStorage(dateRange.end));
    
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
    
    setStartDate(formatDateForStorage(newStart));
    setEndDate(formatDateForStorage(newEnd));
    
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
    
    setStartDate(formatDateForStorage(newStart));
    setEndDate(formatDateForStorage(newEnd));
    
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
      case 'utensils':
        return <Utensils size={size} />;
      case 'coffee':
        return <Coffee size={size} />;
      case 'shopping-bag':
        return <ShoppingBag size={size} />;
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

  // Render the appropriate view based on activeView state
  const renderView = () => {
    switch (activeView) {
      case 'categoryBreakdown':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white mb-4">Category Breakdown</h3>
            <CategoryGroupAnalysis 
              spendingByGroup={spendingByGroup} 
              totalExpenses={stats?.expenses || 0}
              currency={currency}
            />
          </div>
        );
      
      case 'foodAnalysis':
        const foodGroup = spendingByGroup.find(group => group.name === 'Food');
        
        if (!foodGroup) {
          return (
            <div className="text-center p-6 bg-slate-700/50 rounded-lg">
              <Utensils size={48} className="text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No food expenses to analyze.</p>
            </div>
          );
        }
        
        // Find specific categories
        const groceries = foodGroup.subcategories.find(sub => sub.id === 'expense-food-groceries');
        const restaurants = foodGroup.subcategories.find(sub => sub.id === 'expense-food-restaurants');
        const takeaway = foodGroup.subcategories.find(sub => sub.id === 'expense-food-takeaway');
        const coffee = foodGroup.subcategories.find(sub => sub.id === 'expense-food-coffee');
        
        // Calculate totals
        const diningOutTotal = (restaurants?.total || 0) + (takeaway?.total || 0);
        const groceryTotal = groceries?.total || 0;
        const coffeeTotal = coffee?.total || 0;
        const foodTotal = foodGroup.total;
        
        // Calculate ratios and percentages
        const homeVsOutRatio = groceryTotal > 0 ? diningOutTotal / groceryTotal : 0;
        const groceryPercent = (groceryTotal / foodTotal) * 100;
        const diningOutPercent = (diningOutTotal / foodTotal) * 100;
        const coffeePercent = (coffeeTotal / foodTotal) * 100;
        
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
              <Utensils className="text-green-400" size={24} />
              Food Spending Analysis
            </h3>
            
            {/* Food spending summary */}
            <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm text-slate-400">Total Food Spending</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(foodTotal)}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {Math.round((foodTotal / stats.expenses) * 100)}% of your total expenses
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{Math.round(groceryPercent)}%</div>
                    <div className="text-xs text-slate-400">Groceries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{Math.round(diningOutPercent)}%</div>
                    <div className="text-xs text-slate-400">Dining Out</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{Math.round(coffeePercent)}%</div>
                    <div className="text-xs text-slate-400">Coffee</div>
                  </div>
                </div>
              </div>
              
              {/* Progress bars */}
              <div className="space-y-3">
                {groceries && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">Groceries</span>
                      <span className="text-white">{formatCurrency(groceryTotal)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${groceryPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {restaurants && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">Restaurants</span>
                      <span className="text-white">{formatCurrency(restaurants.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(restaurants.total / foodTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {takeaway && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">Takeaway</span>
                      <span className="text-white">{formatCurrency(takeaway.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(takeaway.total / foodTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {coffee && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">Coffee & Cafes</span>
                      <span className="text-white">{formatCurrency(coffee.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(coffee.total / foodTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Analysis Section */}
            <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4">
              <h4 className="text-lg font-medium text-white mb-3">Food Budget Analysis</h4>
              
              <div className="space-y-4">
                {homeVsOutRatio > 0 && (
                  <div className={`p-3 rounded-lg ${
                    homeVsOutRatio > 1.5 ? 'bg-red-900/30 border border-red-800/50' :
                    homeVsOutRatio > 1 ? 'bg-amber-900/30 border border-amber-800/50' :
                    'bg-green-900/30 border border-green-800/50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className={`p-2 rounded-lg ${
                        homeVsOutRatio > 1.5 ? 'bg-red-900/50 text-red-400' :
                        homeVsOutRatio > 1 ? 'bg-amber-900/50 text-amber-400' :
                        'bg-green-900/50 text-green-400'
                      }`}>
                        {homeVsOutRatio > 1 ? 
                          <TrendingUp size={18} /> : 
                          <TrendingDown size={18} />
                        }
                      </div>
                      <div>
                        <h5 className="font-medium text-white">
                          {homeVsOutRatio > 1.5 ? 'High Eating Out Ratio' :
                           homeVsOutRatio > 1 ? 'Moderate Eating Out Ratio' :
                           'Good Home Cooking Ratio'}
                        </h5>
                        <p className="text-sm text-slate-300">
                          {homeVsOutRatio > 0 ? 
                            `You're spending ${homeVsOutRatio.toFixed(1)}x more on dining out than on groceries.` :
                            'You have no eating out expenses recorded.'
                          }
                          {homeVsOutRatio > 1.5 && ' Consider cooking at home more to reduce food costs.'}
                          {homeVsOutRatio <= 1 && ' Keep up the good habit of home cooking!'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {coffee && coffeePercent > 10 && (
                  <div className="bg-amber-900/30 border border-amber-800/50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded-lg bg-amber-900/50 text-amber-400">
                        <Coffee size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium text-white">Coffee Shop Spending</h5>
                        <p className="text-sm text-slate-300">
                          Coffee shops represent {Math.round(coffeePercent)}% of your food budget.
                          You could save approximately {formatCurrency(coffeeTotal * 0.7)} per month
                          by making coffee at home more often.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Add monthly trend analysis if available */}
                {incomeVsExpenses.length > 0 && (
                  <div className="pt-3">
                    <h5 className="text-white font-medium mb-2">Monthly Food Spending Trend</h5>
                    <p className="text-sm text-slate-300">
                      Your food spending this month is {
                        spendingTrend[spendingTrend.length - 1]?.spending > 
                        spendingTrend[spendingTrend.length - 2]?.spending ?
                        'higher' : 'lower'
                      } than last month. {
                        spendingTrend[spendingTrend.length - 1]?.spending > 
                        spendingTrend[spendingTrend.length - 2]?.spending ?
                        'Look for ways to reduce unnecessary spending.' : 
                        'Great job managing your food budget!'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Financial Health Score */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative mb-4 sm:mb-0">
                  <div className="w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-slate-700 flex items-center justify-center mx-auto">
                    <div className="w-20 sm:w-28 h-20 sm:h-28 rounded-full bg-slate-800 flex items-center justify-center relative">
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
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                          {insights.score}
                        </span>
                        <span className="text-xs text-slate-400">out of 100</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-slate-700 rounded-lg p-2 sm:p-3">
                      <div className="text-sm font-medium text-white mb-1 flex items-center justify-center sm:justify-start">
                        <TrendingUp size={16} className="mr-1 finance-text-green-400" />
                        Income
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {formatCurrency(stats?.income || 0)}
                      </div>
                    </div>
                    
                    <div className="bg-slate-700 rounded-lg p-2 sm:p-3">
                      <div className="text-sm font-medium text-white mb-1 flex items-center justify-center sm:justify-start">
                        <TrendingDown size={16} className="mr-1 finance-text-red-400" />
                        Expenses
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {formatCurrency(stats?.expenses || 0)}
                      </div>
                    </div>
                    
                    <div className="bg-slate-700 rounded-lg p-2 sm:p-3">
                      <div className="text-sm font-medium text-white mb-1 flex items-center justify-center sm:justify-start">
                        <PiggyBank size={16} className="mr-1 finance-text-amber-400" />
                        Savings Rate
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {stats && stats.income > 0 
                          ? Math.round(((stats.income - stats.expenses) / stats.income) * 100) 
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Trend Section */}
<div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
  {/* The header is now inside the HorizontalSpendingTrend component */}
  <HorizontalSpendingTrend 
    data={spendingTrend} 
    currency={currency}
    timeRange={timeRange}
    showAverage={true}
    compact={isMobile}
  />
  
  {/* Time-based explanation - this is optional as it's also in the component */}
  <div className="mt-2 text-center">
    <button 
      onClick={() => setActiveView('categoryBreakdown')}
      className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 mx-auto"
    >
      <span>View category breakdown</span>
      <ArrowRight size={16} />
    </button>
  </div>
</div>
            
            {/* ENHANCED: Category Group Analysis */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium text-white mb-0 flex items-center gap-2">
                  <BarChart2 className="finance-text-amber-400" size={18} />
                  Spending Categories
                </h5>
                
                <button 
                  onClick={() => setActiveView('categoryBreakdown')}
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Detailed Analysis</span>
                  <ArrowRight size={16} />
                </button>
              </div>
              
              <CategoryGroupAnalysis 
                spendingByGroup={spendingByGroup} 
                totalExpenses={stats?.expenses || 0}
                currency={currency}
                compact={true}
              />
            </div>
            
            {/* Food Analysis Summary - if we have food data */}
            {spendingByGroup.some(group => group.name === 'Food') && (
              <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium text-white mb-0 flex items-center gap-2">
                    <Utensils className="text-amber-400" size={18} />
                    Food Spending
                  </h5>
                  
                  <button 
                    onClick={() => setActiveView('foodAnalysis')}
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Detailed Analysis</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                {(() => {
                  const foodGroup = spendingByGroup.find(group => group.name === 'Food');
                  if (!foodGroup) return null;
                  
                  // Find specific categories
                  const groceries = foodGroup.subcategories.find(sub => sub.id === 'expense-food-groceries');
                  const restaurants = foodGroup.subcategories.find(sub => sub.id === 'expense-food-restaurants');
                  const takeaway = foodGroup.subcategories.find(sub => sub.id === 'expense-food-takeaway');
                  
                  // Calculate totals
                  const diningOutTotal = (restaurants?.total || 0) + (takeaway?.total || 0);
                  const groceryTotal = groceries?.total || 0;
                  const foodTotal = foodGroup.total;
                  
                  // Calculate ratios
                  const homeVsOutRatio = groceryTotal > 0 ? diningOutTotal / groceryTotal : 0;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 bg-green-900/30 p-3 rounded-lg border border-green-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-900/50 rounded-lg">
                            <ShoppingBag size={20} className="text-green-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">Groceries</div>
                            <div className="text-xs text-slate-300">
                              {Math.round((groceryTotal / foodTotal) * 100)}% of food budget
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-white">{formatCurrency(groceryTotal)}</div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 bg-amber-900/30 p-3 rounded-lg border border-amber-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-900/50 rounded-lg">
                            <Utensils size={20} className="text-amber-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">Dining Out</div>
                            <div className="text-xs text-slate-300">
                              {Math.round((diningOutTotal / foodTotal) * 100)}% of food budget
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-white">{formatCurrency(diningOutTotal)}</div>
                      </div>
                      
                      {/* Home vs Eating Out Ratio Indicator */}
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-slate-400">Home vs Eating Out Ratio</div>
                          <div className={`text-sm font-medium ${
                            homeVsOutRatio > 1.5 ? 'text-red-400' :
                            homeVsOutRatio > 1 ? 'text-amber-400' :
                            'text-green-400'
                          }`}>
                            {homeVsOutRatio > 0 ? `${homeVsOutRatio.toFixed(1)}x` : 'No data'}
                          </div>
                        </div>
                        
                        {homeVsOutRatio > 0 && (
                          <div className="text-xs text-slate-400 mt-1">
                            {homeVsOutRatio > 1.5 ? 'High dining out expenses compared to groceries.' :
                             homeVsOutRatio > 1 ? 'Moderate dining out compared to groceries.' :
                             'Great job cooking at home more than eating out!'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Key Insights */}
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h5 className="text-lg font-medium text-white mb-4">
                Key Insights & Recommendations
              </h5>
              
              <div className="space-y-4">
                {insights.insights.length > 0 ? (
                  insights.insights.slice(0, 3).map((insight, index) => (
                    <div 
                      key={index} 
                      className={`p-3 sm:p-4 rounded-lg ${getInsightBgClass(insight.type)}`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`p-2 rounded-lg ${getInsightColorClass(insight.type)} flex-shrink-0`}>
                          {renderIcon(insight.icon, 18)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-medium text-white mb-1 break-words">
                            {insight.title}
                          </h6>
                          <p className="text-slate-300 text-sm break-words">
                            {insight.description}
                          </p>
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
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header Section with improved Time Navigation - MOBILE OPTIMIZED */}
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-medium text-white flex items-center gap-2 mb-2">
                <BarChart2 className="finance-text-amber-400" size={20} />
                <span className="truncate max-w-xs">Financial Insights</span>
                {!isMobile && (
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
                )}
              </h4>
              {!isMobile && (
                <p className="text-slate-400 text-sm">
                  Gain insights into your spending patterns and financial health.
                </p>
              )}
            </div>
            
            {/* Time range selector - MOBILE OPTIMIZED */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleDateRangeChange('week')}
                className={`px-2 py-1 rounded-lg text-xs ${
                  timeRange === 'week' && !customDateRange 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => handleDateRangeChange('month')}
                className={`px-2 py-1 rounded-lg text-xs ${
                  timeRange === 'month' && !customDateRange 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handleDateRangeChange('quarter')}
                className={`px-2 py-1 rounded-lg text-xs ${
                  timeRange === 'quarter' && !customDateRange 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => handleDateRangeChange('year')}
                className={`px-2 py-1 rounded-lg text-xs ${
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
                className={`p-1 rounded-lg text-xs ${
                  customDateRange || chartSettings.showCustomDateSettings
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
          
          {/* Navigation for specific insights views */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                activeView === 'overview' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('categoryBreakdown')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                activeView === 'categoryBreakdown' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Category Groups
            </button>
            <button
              onClick={() => setActiveView('foodAnalysis')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                activeView === 'foodAnalysis' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              disabled={!spendingByGroup.some(group => group.name === 'Food')}
            >
              Food Analysis
            </button>
          </div>
          
          {/* Time Navigation Controls - MOBILE OPTIMIZED */}
          <div className="flex items-center justify-between bg-slate-700 rounded-lg p-2">
            <button 
              onClick={handleNavigatePrevious}
              className="p-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-xs text-slate-300 px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-48">
              {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
            </span>
            
            <button 
              onClick={handleNavigateNext}
              className="p-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
              disabled={new Date(endDate) >= new Date()}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Custom Date Settings Panel - MOBILE OPTIMIZED */}
        {chartSettings.showCustomDateSettings && (
          <div className="mt-4 p-3 bg-slate-700 rounded-lg border border-slate-600">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-white font-medium text-sm">Custom Date Settings</h5>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Start Date
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-1 text-xs bg-slate-600 border border-slate-500 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  End Date
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={formatDateForStorage(new Date())}
                  className="w-full p-1 text-xs bg-slate-600 border border-slate-500 rounded-lg text-white"
                />
              </div>
            </div>
            
            <div className="space-y-1 mb-3">
              <label className="text-xs text-white">Apply custom date to:</label>
              
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="applyToSpendingTrend"
                    checked={chartSettings.applyCustomToSpendingTrend}
                    onChange={() => setChartSettings(prev => ({
                      ...prev,
                      applyCustomToSpendingTrend: !prev.applyCustomToSpendingTrend
                    }))}
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="applyToSpendingTrend" className="text-slate-300 text-xs">
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
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="applyToIncomeExpenses" className="text-slate-300 text-xs">
                    Income vs Expenses
                  </label>
                </div>
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
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
              >
                Apply Range
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Render the active view */}
      {renderView()}
    </div>
  );
};

export default FinancialInsights;