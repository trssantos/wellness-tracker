import React, { useState, useEffect } from 'react';
import { 
  Zap, Coins, DollarSign, PiggyBank, TrendingUp, BarChart2, CreditCard, 
  Calendar, Wallet, ChevronUp, ChevronDown, Settings, Tag, Clock, BadgePercent, 
  TrendingDown, Award, Plus, Filter, Search, ArrowRight, Download, RefreshCw
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

// Import utilities
import { 
  calculateFinancialStats, processRecurringTransactions, 
  getFinancialInsights, getSpendingMoodCorrelation, getFinanceData,
  getCategoryById, addBudget, addSavingsGoal, updateBudget
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
  const [currency, setCurrency] = useState('$');
  
  // Calendar mode for upcoming tab
  const [calendarMode, setCalendarMode] = useState(false);

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

  // Calculate stats when period changes or data is refreshed
  useEffect(() => {
    // Get data
    const financeData = getFinanceData();
    
    // Get settings
    if (financeData.settings) {
      setCurrency(financeData.settings.currencySymbol || '$');
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
    <div className="space-y-6">
      {/* Finance Header */}
      <div className="bg-slate-800 dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white dark:text-white flex items-center gap-2 transition-colors">
            <Coins className="text-amber-500 dark:text-amber-400" size={24} />
            Finance
          </h2>
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-700 dark:bg-slate-700 text-white dark:text-white rounded-lg px-3 py-1.5 text-sm border-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Balance */}
            <div className="bg-amber-900/30 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-800/50 dark:border-amber-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-amber-400 dark:text-amber-400" />
                  <h4 className="font-medium text-white dark:text-white">Balance</h4>
                </div>
                <span className="font-bold text-xl text-amber-300 dark:text-amber-300">
                  {formatCurrency(stats.balance)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-400">
                <span>Change</span>
                <span className={`flex items-center ${stats.monthlyChange >= 0 
                  ? 'text-green-400 dark:text-green-400' 
                  : 'text-red-400 dark:text-red-400'}`}>
                  {stats.monthlyChange >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  {formatCurrency(Math.abs(stats.monthlyChange))}
                </span>
              </div>
            </div>
            
            {/* Income */}
            <div className="bg-green-900/30 dark:bg-green-900/30 p-4 rounded-lg border border-green-800/50 dark:border-green-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-400 dark:text-green-400" />
                  <h4 className="font-medium text-white dark:text-white">Income</h4>
                </div>
                <span className="font-bold text-xl text-green-300 dark:text-green-300">
                  {formatCurrency(stats.income)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-400">
                <span>Savings Rate</span>
                <span className="text-white dark:text-white">
                  {stats.income > 0 ? 
                    Math.round(((stats.income - stats.expenses) / stats.income) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
            
            {/* Expenses */}
            <div className="bg-red-900/30 dark:bg-red-900/30 p-4 rounded-lg border border-red-800/50 dark:border-red-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown size={18} className="text-red-400 dark:text-red-400" />
                  <h4 className="font-medium text-white dark:text-white">Expenses</h4>
                </div>
                <span className="font-bold text-xl text-red-300 dark:text-red-300">
                  {formatCurrency(stats.expenses)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-400">
                <span>Budget Utilization</span>
                <span className="text-white dark:text-white">
                  {stats.budgets.length > 0 ? 
                    Math.round((stats.budgets.reduce((sum, b) => sum + b.spent, 0) / 
                    stats.budgets.reduce((sum, b) => sum + b.allocated, 0)) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">Add Transaction</span>
          </button>
          
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
      
      {/* Financial Dashboard */}
      <div className="bg-slate-800 dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview' 
                ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                : 'bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'transactions' 
                ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                : 'bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            Transactions
          </button>
          
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'budget' 
                ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                : 'bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            Budget
          </button>
          
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'savings' 
                ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                : 'bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            Savings Goals
          </button>
          
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'upcoming' 
                ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                : 'bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            Upcoming Bills
          </button>
          
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'insights' 
                ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                : 'bg-slate-700 dark:bg-slate-700 text-white dark:text-white hover:bg-slate-600 dark:hover:bg-slate-600'
            }`}
          >
            Insights
          </button>
        </div>
        
        {/* Main Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Upcoming Bills Section */}
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('upcoming')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
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
                <div className="mb-4">
                  <UpcomingBills 
                    bills={bills}
                    currency={currency}
                    onBillClick={(bill) => {
                      // Show details or mark as paid logic
                      console.log('Bill clicked:', bill);
                    }}
                  />
                  
                  <div className="mt-4 text-center">
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
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('transactions')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
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
                <div className="mb-4">
                  <ExpenseTracker 
                    compact 
                    refreshTrigger={refreshTrigger} 
                    onRefresh={handleRefresh} 
                    hideActions={true}
                    currency={currency}
                  />
                  
                  <div className="mt-4 text-center">
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
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('budget')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
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
                <div className="mb-4">
                  <BudgetManager 
                    compact 
                    refreshTrigger={refreshTrigger} 
                    onRefresh={() => navigateToTab('budget')}
                    currency={currency}
                  />
                </div>
              )}
            </div>
            
            {/* Savings Goals */}
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('savings')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
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
                <div className="mb-4">
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
                className="flex items-center justify-between mb-3 cursor-pointer"
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
                <div className="mb-4">
                  {/* Updated Chart Component */}
                  <SpendingChart 
                    data={chartData} 
                    currency={currency}
                  />
                  
                  <div className="mt-4 text-center">
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h4 className="text-lg font-medium text-white dark:text-white flex items-center gap-2">
                <Wallet className="text-amber-400 dark:text-amber-400" size={20} />
                Budget Management
              </h4>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>
                
                <button
                  onClick={handleResetBudgets}
                  className="px-3 py-2 rounded-lg bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Clock size={16} />
                  <span>Reset Budgets</span>
                </button>
              </div>
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
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-white dark:text-white flex items-center gap-2">
                <Calendar className="text-amber-400 dark:text-amber-400" size={20} />
                Upcoming Bills
              </h4>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCalendarMode(!calendarMode)}
                  className={`px-3 py-2 rounded-lg ${
                    calendarMode 
                      ? 'bg-amber-600 dark:bg-amber-600 text-white' 
                      : 'bg-slate-700 dark:bg-slate-700 text-white hover:bg-slate-600'
                  } transition-colors flex items-center gap-1`}
                >
                  <Calendar size={16} />
                  <span>Calendar View</span>
                </button>
                
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-lg bg-slate-700 dark:bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
            
            {calendarMode ? (
              <CalendarView 
                transactions={transactions}
                bills={bills}
                currency={currency}
                onDateClick={(date) => {
                  console.log('Date clicked:', date);
                  // Show transactions for this date
                }}
              />
            ) : (
              <UpcomingBills 
                bills={bills}
                currency={currency}
                onBillClick={(bill) => {
                  // Show details or mark as paid logic
                  console.log('Bill clicked:', bill);
                }}
              />
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
        <div className="bg-slate-800 dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-medium text-white dark:text-white mb-4 transition-colors flex items-center gap-2">
            <Zap className="text-amber-400 dark:text-amber-400" size={20} />
            Financial Wellbeing Insights
          </h3>
          
          <div className="bg-amber-900/30 dark:bg-amber-900/30 rounded-lg p-4 mb-5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0 bg-slate-800 dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={18} className="text-amber-400 dark:text-amber-400" />
                  <p className="font-medium text-white dark:text-white">Spending Pattern</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className={correlations[0].type === 'negative' ? 
                      "text-red-400 dark:text-red-400" : "text-green-400 dark:text-green-400"} />
                    <span className="text-sm text-white dark:text-white">
                      {correlations[0].categoryName 
                        ? `Higher spending on ${correlations[0].categoryName}`
                        : `Overall spending of ${formatCurrency(correlations[0].spending)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-slate-400 dark:text-slate-400" />
                    <span className="text-sm text-white dark:text-white">
                      {correlations[0].categoryName 
                        ? `Category: ${correlations[0].categoryName}`
                        : `Date: ${new Date(correlations[0].date).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-amber-400 dark:text-amber-400">
                <ArrowRight size={24} className="hidden sm:block" />
                <ArrowRight size={24} className="sm:hidden rotate-90" />
              </div>
              
              <div className="flex-1 bg-slate-800 dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={18} className="text-purple-400 dark:text-purple-400" />
                  <p className="font-medium text-white dark:text-white">Mood Correlation</p>
                </div>
                <p className="text-sm text-white dark:text-white mb-3">
                  {correlations[0].categoryName 
                    ? `There's a pattern between your spending on ${correlations[0].categoryName} and lower mood scores the following day.`
                    : `Days with higher overall spending tend to be followed by lower mood scores the next day.`}
                </p>
                <div className="text-xs text-teal-400 dark:text-teal-400 font-medium">
                  {correlations[0].categoryName 
                    ? `Try reducing discretionary spending on ${correlations[0].categoryName} to see if your mood improves!`
                    : `Try setting a daily spending limit to improve your financial wellbeing and mood.`}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-white dark:text-white">
            The finance module connects with your mood tracking, habits, and focus sessions to provide deeper insights into how your financial health affects your overall wellbeing. Discover patterns and make meaningful changes to improve both your financial and mental health.
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