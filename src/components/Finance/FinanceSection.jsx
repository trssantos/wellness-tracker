import React, { useState, useEffect } from 'react';
import { 
  Zap, Coins, DollarSign, PiggyBank, TrendingUp, BarChart2, CreditCard, 
  Calendar, Wallet, ChevronUp, ChevronDown, Settings, Tag, Clock, BadgePercent, 
  TrendingDown, Award, Plus, Filter, Search, ArrowRight, Download, RefreshCw,
  LayoutDashboard, FileText, LineChart
} from 'lucide-react';

// Import components
import ExpenseTracker from './ExpenseTracker';
import BudgetManager from './BudgetManager';
import SavingsGoals from './SavingsGoals';
import FinancialInsights from './FinancialInsights';
import QuickEntryFAB from './QuickEntryFAB';
import SpendingChart from './SpendingChart';
import UpcomingBills from './UpcomingBills';
import CalendarView from './CalendarView';
import SettingsModal from './SettingsModal';
import TransactionModal from './TransactionModal';
import AddBudgetModal from './AddBudgetModal';
import AddSavingsGoalModal from './AddSavingsGoalModal';
import ConfirmationModal from './ConfirmationModal';
import ModalContainer from './ModalContainer';
import recurringTransactionService from '../../utils/RecurringTransactionService';

// Import utilities
import { 
  calculateFinancialStats, processRecurringTransactions, 
  getFinancialInsights, getSpendingMoodCorrelation, getFinanceData,
  getCategoryById, addBudget, addSavingsGoal, updateBudget,getCategoryIconComponent
} from '../../utils/financeUtils';

const FinanceSection = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    transactions: true,
    budget: true,
    savings: true,
    insights: true,
    upcoming: true
  });
  
  // Modal states
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Data states
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [insights, setInsights] = useState({ score: 0, insights: [] });
  const [correlations, setCorrelations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [currency, setCurrency] = useState('€');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  // Calendar mode for upcoming tab
  const [calendarMode, setCalendarMode] = useState(false);

  // Add this helper function to your FinanceSection.jsx
const getCategoryColorClass = (category) => {
  if (!category) return 'bg-slate-600';
  
  // Map color names to Tailwind classes
  const colorMap = {
    'blue': 'bg-blue-500/20 text-blue-300',
    'green': 'bg-green-500/20 text-green-300', 
    'amber': 'bg-amber-500/20 text-amber-300',
    'red': 'bg-red-500/20 text-red-300',
    'purple': 'bg-purple-500/20 text-purple-300',
    'pink': 'bg-pink-500/20 text-pink-300',
    'indigo': 'bg-indigo-500/20 text-indigo-300',
    'teal': 'bg-teal-500/20 text-teal-300',
    'emerald': 'bg-emerald-500/20 text-emerald-300',
    'cyan': 'bg-cyan-500/20 text-cyan-300',
    'violet': 'bg-violet-500/20 text-violet-300',
    'fuchsia': 'bg-fuchsia-500/20 text-fuchsia-300',
    'rose': 'bg-rose-500/20 text-rose-300',
    'slate': 'bg-slate-500/20 text-slate-300',
    'gray': 'bg-gray-500/20 text-gray-300'
  };
  
  return colorMap[category.color] || 'bg-slate-600 text-white';
};


  // Define tab items with icons and labels
  const tabItems = [
    { id: 'overview', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { id: 'transactions', icon: <FileText size={16} />, label: 'Transactions' },
    { id: 'budget', icon: <Wallet size={16} />, label: 'Budget' },
    { id: 'savings', icon: <PiggyBank size={16} />, label: 'Savings' },
    { id: 'upcoming', icon: <Calendar size={16} />, label: 'Upcoming' },
    { id: 'insights', icon: <LineChart size={16} />, label: 'Insights' }
  ];

  useEffect(() => {
    // Use a setTimeout to delay initialization until after component rendering
    const timer = setTimeout(() => {
      // Wrap in try/catch for extra safety
      try {
        recurringTransactionService.init();

         // Check if we need to archive budgets and create new ones for a new month
      const { checkAndResetBudgets } = require('../../utils/financeUtils');
      checkAndResetBudgets();
      } catch (error) {
        console.error("Failed to initialize recurring service:", error);
      }
    }, 2000); // 2 second delay to ensure full component mount
    
    // Clean up timer
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures it runs only once

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process recurring transactions on first load and when page refreshes
  useEffect(() => {
    const processTransactions = async () => {
      // Process recurring transactions
      const processed = processRecurringTransactions();
      
      if (processed.length > 0) {
        console.log(`Processed ${processed.length} recurring transactions`);
      }
    };
    
    processTransactions();
    
    // Set up timer to check every hour for recurring transactions
    const interval = setInterval(processTransactions, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to filter transactions by date (past or future)
const filterTransactionsByDate = (transactions, futureOnly = false) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return transactions.filter(transaction => {
    const txDate = new Date(transaction.date || transaction.timestamp);
    txDate.setHours(0, 0, 0, 0);
    
    if (futureOnly) {
      return txDate > today; // Future transactions only
    } else {
      return txDate <= today; // Past and today's transactions only
    }
  });
};


  // Calculate stats when period changes or data is refreshed
  useEffect(() => {
    // Get data
    const financeData = getFinanceData();
    
    // Get settings
    if (financeData.settings) {
      setCurrency(financeData.settings.currencySymbol || '€');
    }
    
    // Get transactions
    setTransactions(financeData.transactions || []);
    
    // Get recurring transactions as bills
    setBills(financeData.recurringTransactions || []);
    
    // Calculate financial stats
    const newStats = calculateFinancialStats(selectedPeriod);
    setStats(newStats);
    
    // Get financial insights
    const financialInsights = getFinancialInsights();
    setInsights(financialInsights);
    
    // Get mood correlations
    const moodCorrelations = getSpendingMoodCorrelation();
    setCorrelations(moodCorrelations);
    
    // Prepare chart data - for category breakdown
    const categoryData = [];
    Object.entries(newStats.categoryBreakdown).forEach(([categoryId, amount]) => {
      const category = getCategoryById(categoryId);
      if (category) {
        categoryData.push({
          id: categoryId,
          name: category.name,
          value: amount,
          color: category.color
        });
      }
    });
    
    // Sort by amount, descending
    categoryData.sort((a, b) => b.value - a.value);
    setChartData(categoryData);
  }, [selectedPeriod, refreshTrigger]);

  // Toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Refresh data
  const handleRefresh = () => {
    processRecurringTransactions();
    setRefreshTrigger(prev => prev + 1);
  };

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Handler for "View All" buttons (navigate to corresponding tab)
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    
    // If the page doesn't scroll to the top, manually do it
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for "Add Budget" button
  const handleAddBudget = () => {
    setShowAddBudget(true);
  };

  // Handler for "Add Savings Goal" button
  const handleAddSavingsGoal = () => {
    setShowAddSavings(true);
  };

  // Handler for reset budgets
  const handleResetBudgets = () => {
    setConfirmAction({
      title: "Reset All Budgets",
      message: "Are you sure you want to reset all budgets? This will set the spent amount to zero for all categories while keeping your allocated budget amounts. This action cannot be undone.",
      onConfirm: () => {
        // Logic to reset all budgets
        const financeData = getFinanceData();
        
        financeData.budgets.forEach(budget => {
          updateBudget(budget.id, { ...budget, spent: 0 });
        });
        
        handleRefresh();
        setConfirmAction(null);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Finance Header */}
      <div className="bg-slate-800 dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white dark:text-white flex items-center gap-2 transition-colors">
            <Coins className="text-amber-500 dark:text-amber-400" size={24} />
            Finance
          </h2>
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-700 dark:bg-slate-700 text-white dark:text-white rounded-lg px-2 py-1 text-xs border-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600 transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {/* Stats Summary */}
        {stats && (
  <div className="grid grid-cols-2 gap-2 mb-3">
    {/* Balance */}
    <div className="bg-amber-900/30 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-800/50 dark:border-amber-800/50">
      <div className="flex items-center mb-1">
        <div className="flex items-center gap-1">
          <DollarSign size={16} className="text-amber-400 dark:text-amber-400" />
          <h4 className="font-medium text-white dark:text-white text-sm">Balance</h4>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-xs text-slate-400 dark:text-slate-400">
          Projected
          <span className={`ml-1 flex items-center ${stats.upcoming.net >= 0 
            ? 'text-green-400 dark:text-green-400' 
            : 'text-red-400 dark:text-red-400'}`}>
            {stats.upcoming.net <= 0 ? (
              <TrendingDown size={10} className="mr-0.5" />
            ) : (
              <TrendingUp size={10} className="mr-0.5" />
            )}
            {formatCurrency(stats.projected.balance)}
          </span>
        </div>
        <span className="font-bold text-lg text-amber-300 dark:text-amber-300 break-words">
          {formatCurrency(stats.current.balance)}
        </span>
      </div>
    </div>
    
    {/* Income */}
    <div className="bg-green-900/30 dark:bg-green-900/30 p-3 rounded-lg border border-green-800/50 dark:border-green-800/50">
      <div className="flex items-center mb-1">
        <div className="flex items-center gap-1">
          <TrendingUp size={16} className="text-green-400 dark:text-green-400" />
          <h4 className="font-medium text-white dark:text-white text-sm">Income</h4>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-xs text-slate-400 dark:text-slate-400">
          Upcoming
          <span className="ml-1 text-green-400 dark:text-green-400">
            +{formatCurrency(stats.upcoming.income)}
          </span>
        </div>
        <span className="font-bold text-lg text-green-300 dark:text-green-300 break-words">
          {formatCurrency(stats.current.income)}
        </span>
      </div>
    </div>
    
    {/* Expenses (Full Width) */}
    <div className="bg-red-900/30 dark:bg-red-900/30 p-3 rounded-lg border border-red-800/50 dark:border-red-800/50 col-span-2 mb-1">
      <div className="flex items-center mb-1">
        <div className="flex items-center gap-1">
          <TrendingDown size={16} className="text-red-400 dark:text-red-400" />
          <h4 className="font-medium text-white dark:text-white text-sm">Expenses</h4>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-xs text-slate-400 dark:text-slate-400">
          Upcoming
          <span className="ml-1 text-red-400 dark:text-red-400">
            -{formatCurrency(stats.upcoming.expenses)}
          </span>
        </div>
        <span className="font-bold text-lg text-red-300 dark:text-red-300 break-words">
          {formatCurrency(stats.current.expenses)}
        </span>
      </div>
    </div>
  </div>
)}

        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">Add Transaction</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleAddBudget}
              className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              <Wallet size={16} />
              <span className="text-sm">Add Budget</span>
            </button>
            
            <button 
              onClick={handleAddSavingsGoal}
              className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
            >
              <PiggyBank size={16} />
              <span className="text-sm">Add Savings Goal</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-slate-800 dark:bg-slate-800 rounded-xl overflow-hidden">
        <div className="flex justify-between">
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                  : 'bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="bg-slate-800 dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Upcoming Bills Section */}
            <div>
              <div 
                onClick={() => toggleSection('upcoming')} 
                className="flex items-center justify-between mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-amber-400 dark:text-amber-400" />
                  <h4 className="font-medium text-white dark:text-white">Upcoming Bills</h4>
                </div>
                {expandedSections.upcoming ? 
                  <ChevronUp size={18} className="text-slate-400 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-400 dark:text-slate-400" />}
              </div>
              
              {expandedSections.upcoming && (
  <div className="mb-3">
    <UpcomingBills 
      transactions={transactions}
      bills={bills}
      currency={currency}
      onRefresh={handleRefresh}
      onBillClick={(item) => {
        console.log('Bill clicked:', item);
      }}
      compact={true} 
    />
    
    <div className="mt-2 text-center">
      <button 
        onClick={() => navigateToTab('upcoming')}
        className="text-sm text-amber-400 dark:text-amber-400 hover:text-amber-300 dark:hover:text-amber-300 flex items-center gap-1 mx-auto"
      >
        <span>View calendar</span>
        <ArrowRight size={16} />
      </button>
    </div>
  </div>
)}
            </div>
            
            {/* Recent Transactions */}
            <div>
  <div 
    onClick={() => toggleSection('transactions')} 
    className="flex items-center justify-between mb-2 cursor-pointer"
  >
    <div className="flex items-center gap-2">
      <CreditCard size={18} className="text-amber-400 dark:text-amber-400" />
      <h4 className="font-medium text-white dark:text-white">Recent Transactions</h4>
    </div>
    {expandedSections.transactions ? 
      <ChevronUp size={18} className="text-slate-400 dark:text-slate-400" /> : 
      <ChevronDown size={18} className="text-slate-400 dark:text-slate-400" />}
  </div>
  
  {expandedSections.transactions && (
    <div className="mb-3">
      {/* Filter to get only past and today's transactions */}
      {(() => {
        const recentTransactions = filterTransactionsByDate(transactions, false);
        
        if (recentTransactions.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-700/50 rounded-lg">
              <CreditCard size={42} className="text-slate-500 mb-2" />
              <p>No transactions found</p>
            </div>
          );
        }
        
        return (
          <div className="rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700 text-xs text-white">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600 bg-slate-700/50">
                {/* Limit to just 3 most recent transactions */}
                {recentTransactions.slice(0, 3).map((transaction, index) => {
                  const category = getCategoryById(transaction.category);
                  return (
                    <tr key={transaction.id || index} className="hover:bg-slate-700/70 transition-colors">
                      <td className="p-2 text-white text-xs">
                        {new Date(transaction.timestamp).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="p-2 text-white text-xs max-w-[80px] truncate">
                        {transaction.name}
                      </td>
                      <td className="p-2 text-xs">
                        {category && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getCategoryColorClass(category)}`}>
                            {getCategoryIconComponent(category.id, 12)}
                            <span className="hidden sm:inline">{category.name}</span>
                          </span>
                        )}
                      </td>
                      <td className={`p-2 text-right font-medium text-xs ${
                        transaction.amount > 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        <div className="flex items-center justify-end">
                          {transaction.amount > 0 ? (
                            <TrendingUp size={14} className="mr-1 text-green-500" />
                          ) : (
                            <TrendingDown size={14} className="mr-1 text-red-500" />
                          )}
                          {transaction.amount > 0 ? '+' : ''}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })()}
      
      <div className="mt-2 text-center">
        <button 
          onClick={() => navigateToTab('transactions')}
          className="text-sm text-amber-400 dark:text-amber-400 hover:text-amber-300 dark:hover:text-amber-300 flex items-center gap-1 mx-auto"
        >
          <span>View all transactions</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )}
</div>
           
            
            {/* Budget Overview */}
            <div>
              <div 
                onClick={() => toggleSection('budget')} 
                className="flex items-center justify-between mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-amber-400 dark:text-amber-400" />
                  <h4 className="font-medium text-white dark:text-white">Budget Overview</h4>
                </div>
                {expandedSections.budget ? 
                  <ChevronUp size={18} className="text-slate-400 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-400 dark:text-slate-400" />}
              </div>
              
              {expandedSections.budget && (
                <div className="mb-3">
                  <div className="space-y-3 mb-3">
                    {stats && stats.budgets && stats.budgets.length > 0 ? (
                      <>
                        {stats.budgets.slice(0, 3).map((budget) => {
                          const category = getCategoryById(budget.category);
                          const percentage = Math.min(100, Math.round((budget.spent / budget.allocated) * 100));
                          
                          return (
                            <div key={budget.id || budget.category}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-white">{category ? category.name : 'Budget'}</span>
                                <span className="text-white">
                                  {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                          <div className="text-xs text-slate-300">
                            <div>Total Budget: {formatCurrency(stats.budgets.reduce((sum, b) => sum + b.allocated, 0))}</div>
                            <div>Spent: {formatCurrency(stats.budgets.reduce((sum, b) => sum + b.spent, 0))} ({Math.round((stats.budgets.reduce((sum, b) => sum + b.spent, 0) / stats.budgets.reduce((sum, b) => sum + b.allocated, 0)) * 100)}%)</div>
                          </div>
                          
                          <button 
                            onClick={() => navigateToTab('budget')}
                            className="px-3 py-1 bg-amber-600 text-white text-xs rounded-lg"
                          >
                            View All
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-700/50 rounded-lg">
                        <Wallet size={42} className="text-slate-500 mb-2" />
                        <p>No budgets created yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Savings Goals */}
            <div>
              <div 
                onClick={() => toggleSection('savings')} 
                className="flex items-center justify-between mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <PiggyBank size={18} className="text-amber-400 dark:text-amber-400" />
                  <h4 className="font-medium text-white dark:text-white">Savings Goals</h4>
                </div>
                {expandedSections.savings ? 
                  <ChevronUp size={18} className="text-slate-400 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-400 dark:text-slate-400" />}
              </div>
              
              {expandedSections.savings && (
                <div className="mb-3">
                  <SavingsGoals 
                    compact 
                    refreshTrigger={refreshTrigger} 
                    onRefresh={() => navigateToTab('savings')}
                    currency={currency}
                  />
                </div>
              )}
            </div>
            
            {/* Quick Insights - Spending Breakdown */}
            <div>
              <div 
                onClick={() => toggleSection('insights')} 
                className="flex items-center justify-between mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} className="text-amber-400 dark:text-amber-400" />
                  <h4 className="font-medium text-white dark:text-white">Spending Breakdown</h4>
                </div>
                {expandedSections.insights ? 
                  <ChevronUp size={18} className="text-slate-400 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-400 dark:text-slate-400" />}
              </div>
              
              {expandedSections.insights && (
                <div className="mb-3">
                  {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-700/50 rounded-lg">
                      <BarChart2 size={42} className="text-slate-500 mb-2" />
                      <p>No spending data to display</p>
                    </div>
                  ) : (
                    <>
                      <SpendingChart 
                        data={chartData} 
                        currency={currency}
                      />
                    </>
                  )}
                  
                  <div className="mt-2 text-center">
                    <button 
                      onClick={() => navigateToTab('insights')}
                      className="text-sm text-amber-400 dark:text-amber-400 hover:text-amber-300 dark:hover:text-amber-300 flex items-center gap-1 mx-auto"
                    >
                      <span>View detailed insights</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <ExpenseTracker 
            refreshTrigger={refreshTrigger} 
            onRefresh={handleRefresh}
            currency={currency}
          />
        )}
        
        {activeTab === 'budget' && (
          <div>
            <div className="flex justify-between items-center gap-2 mb-4">
              <h4 className="text-base font-medium text-white dark:text-white flex items-center gap-2">
                <Wallet className="text-amber-400 dark:text-amber-400" size={18} />
                Budget Manager
              </h4>
              
              
            </div>
            <BudgetManager 
              refreshTrigger={refreshTrigger} 
              onRefresh={handleRefresh}
              currency={currency}
            />
          </div>
        )}
        
        {activeTab === 'savings' && (
          <SavingsGoals 
            refreshTrigger={refreshTrigger} 
            onRefresh={handleRefresh}
            currency={currency}
          />
        )}
        
        {activeTab === 'upcoming' && (
  <div>
    {/* Header section remains the same */}
    
    {calendarMode ? (
      <CalendarView 
        transactions={transactions}
        bills={bills}
        currency={currency}
        onDateClick={(date) => {
          console.log('Date clicked:', date);
        }}
      />
    ) : (
      <>
        {transactions.length === 0 && bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-slate-400 bg-slate-700/50 rounded-lg">
            <Calendar size={42} className="text-slate-500 mb-2" />
            <p>No upcoming bills</p>
          </div>
        ) : (
          <UpcomingBills 
            transactions={transactions}
            bills={bills}
            currency={currency}
            onRefresh={handleRefresh} // Add this line
            onBillClick={(item) => {
              console.log('Bill clicked:', item);
            }}
          />
        )}
      </>
    )}
  </div>
)}
        
        {activeTab === 'insights' && (
          <FinancialInsights 
            refreshTrigger={refreshTrigger} 
            onRefresh={handleRefresh}
            insights={insights}
            correlations={correlations}
            currency={currency}
            selectedDateRange={selectedDateRange}
            setSelectedDateRange={setSelectedDateRange}
          />
        )}
      </div>
      
      {/* Wellbeing Integration Section */}
      {activeTab === 'overview' && correlations.length > 0 && (
        <div className="bg-slate-800 dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
          <h3 className="text-base font-medium text-white dark:text-white mb-3 transition-colors flex items-center gap-2">
            <Zap className="text-amber-400 dark:text-amber-400" size={18} />
            Financial Wellbeing Insights
          </h3>
          
          <div className="bg-amber-900/30 dark:bg-amber-900/30 rounded-lg p-3 mb-3">
            <div className="flex flex-col gap-3">
              <div className="bg-slate-800 dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-amber-400 dark:text-amber-400" />
                  <p className="font-medium text-white dark:text-white text-sm">Spending Pattern</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} className={correlations[0].type === 'negative' ? 
                      "text-red-400 dark:text-red-400" : "text-green-400 dark:text-green-400"} />
                    <span className="text-white dark:text-white break-words">
                      {correlations[0].categoryName 
                        ? `Higher spending on ${correlations[0].categoryName}`
                        : `Overall spending of ${formatCurrency(correlations[0].spending)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag size={12} className="text-slate-400 dark:text-slate-400" />
                    <span className="text-white dark:text-white break-words">
                      {correlations[0].categoryName 
                        ? `Category: ${correlations[0].categoryName}`
                        : `Date: ${new Date(correlations[0].date).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-amber-400 dark:text-amber-400 text-center">
                <ArrowRight size={18} className="hidden xs:inline-block rotate-90 xs:rotate-0 mx-auto" />
              </div>
              
              <div className="bg-slate-800 dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={16} className="text-purple-400 dark:text-purple-400" />
                  <p className="font-medium text-white dark:text-white text-sm">Mood Correlation</p>
                </div>
                <p className="text-xs text-white dark:text-white mb-2 break-words">
                  {correlations[0].categoryName 
                    ? `There's a pattern between your spending on ${correlations[0].categoryName} and lower mood scores the following day.`
                    : `Days with higher overall spending tend to be followed by lower mood scores the next day.`}
                </p>
                <div className="text-xs text-teal-400 dark:text-teal-400 font-medium break-words">
                  Try reducing spending to improve mood
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-white dark:text-white break-words">
            The finance module connects with your mood tracking to provide insights into how financial health affects your overall wellbeing.
          </p>
        </div>
      )}
      
      {/* Quick Entry Floating Action Button */}
      <QuickEntryFAB onTransactionAdded={handleRefresh} />
      
      {/* Modals */}
      {showAddTransaction && (
        <TransactionModal
          onClose={() => setShowAddTransaction(false)}
          onTransactionAdded={() => {
            setShowAddTransaction(false);
            handleRefresh();
          }}
          currency={currency}
        />
      )}
      
      {/* Add Budget Modal */}
      {showAddBudget && (
        <AddBudgetModal
          onClose={() => setShowAddBudget(false)}
          onBudgetAdded={() => {
            setShowAddBudget(false);
            handleRefresh();
          }}
          currency={currency}
        />
      )}
      
      {/* Add Savings Goal Modal */}
      {showAddSavings && (
        <AddSavingsGoalModal
          onClose={() => setShowAddSavings(false)}
          onSavingsAdded={() => {
            setShowAddSavings(false);
            handleRefresh();
          }}
          currency={currency}
        />
      )}
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSettingsUpdated={handleRefresh}
        />
      )}
      
      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmationModal
          isOpen={true}
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default FinanceSection;