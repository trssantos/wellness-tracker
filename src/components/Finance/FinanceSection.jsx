import React, { useState, useEffect } from 'react';
import { 
  Zap,Coins, DollarSign, PiggyBank, TrendingUp, BarChart2, CreditCard, 
  Calendar, Wallet, ChevronUp, ChevronDown, Settings, Tag, Clock, BadgePercent, 
  TrendingDown, Award, Plus, Filter, Search, ArrowRight 
} from 'lucide-react';
import ExpenseTracker from './ExpenseTracker';
import BudgetManager from './BudgetManager';
import SavingsGoals from './SavingsGoals';
import FinancialInsights from './FinancialInsights';
import QuickEntryFAB from './QuickEntryFAB';
import { calculateFinancialStats, processRecurringTransactions, getFinancialInsights, getSpendingMoodCorrelation } from '../../utils/financeUtils';
import AddTransactionModal from './AddTransactionModal';
import AddBudgetModal from './AddBudgetModal';
import AddSavingsGoalModal from './AddSavingsGoalModal';
import AddRecurringModal from './AddRecurringModal';

const FinanceSection = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    transactions: true,
    budget: true,
    savings: true,
    insights: true
  });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [insights, setInsights] = useState({ score: 0, insights: [] });
  const [correlations, setCorrelations] = useState([]);

  // Process recurring transactions on first load
  useEffect(() => {
    processRecurringTransactions();
  }, []);

  // Calculate stats when period changes or data is refreshed
  useEffect(() => {
    const newStats = calculateFinancialStats(selectedPeriod);
    setStats(newStats);
    
    // Get financial insights
    const financialInsights = getFinancialInsights();
    setInsights(financialInsights);
    
    // Get mood correlations
    const moodCorrelations = getSpendingMoodCorrelation();
    setCorrelations(moodCorrelations);
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

  // Handle transaction added
  const handleTransactionAdded = () => {
    setShowAddTransaction(false);
    handleRefresh();
  };

  // Handle budget added
  const handleBudgetAdded = () => {
    setShowAddBudget(false);
    handleRefresh();
  };

  // Handle savings goal added
  const handleSavingsAdded = () => {
    setShowAddSavings(false);
    handleRefresh();
  };

  // Handle recurring transaction added
  const handleRecurringAdded = () => {
    setShowAddRecurring(false);
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Finance Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <Coins className="text-amber-500 dark:text-amber-400" size={24} />
            Finance
          </h2>
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 text-sm border-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <button 
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Refresh data"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Balance */}
            <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Balance</h4>
                </div>
                <span className="font-bold text-xl text-amber-600 dark:text-amber-300">
                  ${stats.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Change</span>
                <span className={`flex items-center ${stats.monthlyChange >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'}`}>
                  {stats.monthlyChange >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  ${Math.abs(stats.monthlyChange).toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Income */}
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-500 dark:text-green-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Income</h4>
                </div>
                <span className="font-bold text-xl text-green-600 dark:text-green-300">
                  ${stats.income.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Savings Rate</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.income > 0 ? 
                    Math.round(((stats.income - stats.expenses) / stats.income) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
            
            {/* Expenses */}
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown size={18} className="text-red-500 dark:text-red-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Expenses</h4>
                </div>
                <span className="font-bold text-xl text-red-600 dark:text-red-300">
                  ${stats.expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Budget Utilization</span>
                <span className="text-slate-600 dark:text-slate-400">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">Add Transaction</span>
          </button>
          
          <button 
            onClick={() => setShowAddBudget(true)}
            className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
          >
            <Wallet size={16} />
            <span className="text-sm">Add Budget</span>
          </button>
          
          <button 
            onClick={() => setShowAddSavings(true)}
            className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
          >
            <PiggyBank size={16} />
            <span className="text-sm">Add Savings Goal</span>
          </button>
          
          <button 
            onClick={() => setShowAddRecurring(true)}
            className="flex items-center justify-center gap-1 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
          >
            <Calendar size={16} />
            <span className="text-sm">Add Recurring</span>
          </button>
        </div>
      </div>
      
      {/* Financial Dashboard */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview' 
                ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'transactions' 
                ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Transactions
          </button>
          
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'budget' 
                ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Budget
          </button>
          
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              activeTab === 'savings' 
                ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Savings Goals
          </button>
          
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'insights' 
                ? 'bg-amber-500 dark:bg-amber-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Insights
          </button>
        </div>
        
        {/* Main Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Transactions */}
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('transactions')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Recent Transactions</h4>
                </div>
                {expandedSections.transactions ? 
                  <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />}
              </div>
              
              {expandedSections.transactions && (
                <ExpenseTracker compact refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
              )}
            </div>
            
            {/* Budget Overview */}
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('budget')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Budget Overview</h4>
                </div>
                {expandedSections.budget ? 
                  <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />}
              </div>
              
              {expandedSections.budget && (
                <BudgetManager compact refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
              )}
            </div>
            
            {/* Savings Goals */}
            <div className="mb-6">
              <div 
                onClick={() => toggleSection('savings')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <PiggyBank size={18} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Savings Goals</h4>
                </div>
                {expandedSections.savings ? 
                  <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />}
              </div>
              
              {expandedSections.savings && (
                <SavingsGoals compact refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
              )}
            </div>
            
            {/* Quick Insights */}
            <div>
              <div 
                onClick={() => toggleSection('insights')} 
                className="flex items-center justify-between mb-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Financial Insights</h4>
                </div>
                {expandedSections.insights ? 
                  <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />}
              </div>
              
              {expandedSections.insights && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 p-2 rounded-lg">
                        <Award size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-700 dark:text-slate-300">Financial Health Score</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Based on your spending, savings, and budgeting</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{insights.score}/100</div>
                  </div>
                  
                  {/* Top insights preview */}
                  {insights.insights.length > 0 && (
                    <div className="space-y-3">
                      {insights.insights.slice(0, 2).map((insight, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg flex items-start gap-2 ${
                            insight.type === 'positive' 
                              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50' 
                              : insight.type === 'negative'
                                ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50'
                                : insight.type === 'warning'
                                  ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50'
                                  : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md ${
                            insight.type === 'positive' 
                              ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400' 
                              : insight.type === 'negative'
                                ? 'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400'
                                : insight.type === 'warning'
                                  ? 'bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400'
                                  : 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400'
                          }`}>
                            {insight.icon === 'alert-triangle' && <AlertTriangle size={16} />}
                            {insight.icon === 'alert-circle' && <AlertCircle size={16} />}
                            {insight.icon === 'piggy-bank' && <PiggyBank size={16} />}
                            {insight.icon === 'calendar' && <Calendar size={16} />}
                            {insight.icon === 'pie-chart' && <PieChart size={16} />}
                            {insight.icon === 'award' && <Award size={16} />}
                            {insight.icon === 'trending-up' && <TrendingUp size={16} />}
                            {insight.icon === 'trending-down' && <TrendingDown size={16} />}
                          </div>
                          <div className="flex-1">
                            <h6 className="text-sm font-medium text-slate-700 dark:text-slate-300">{insight.title}</h6>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{insight.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => setActiveTab('insights')}
                      className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 mx-auto"
                    >
                      <span>View all insights</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <ExpenseTracker refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        )}
        
        {activeTab === 'budget' && (
          <BudgetManager refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        )}
        
        {activeTab === 'savings' && (
          <SavingsGoals refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        )}
        
        {activeTab === 'insights' && (
          <FinancialInsights 
            refreshTrigger={refreshTrigger} 
            onRefresh={handleRefresh}
            insights={insights}
            correlations={correlations}
          />
        )}
      </div>
      
      {/* Wellbeing Integration Section */}
      {activeTab === 'overview' && correlations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
            <Zap className="text-amber-500 dark:text-amber-400" size={20} />
            Financial Wellbeing Insights
          </h3>
          
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 mb-5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={18} className="text-amber-500 dark:text-amber-400" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">Spending Pattern</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className={correlations[0].type === 'negative' ? 
                      "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {correlations[0].categoryName 
                        ? `Higher spending on ${correlations[0].categoryName}`
                        : `Overall spending of $${correlations[0].spending.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-slate-500 dark:text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {correlations[0].categoryName 
                        ? `Category: ${correlations[0].categoryName}`
                        : `Date: ${new Date(correlations[0].date).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-amber-600 dark:text-amber-400">
                <ArrowRight size={24} className="hidden sm:block" />
                <ArrowRight size={24} className="sm:hidden rotate-90" />
              </div>
              
              <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={18} className="text-purple-500 dark:text-purple-400" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">Mood Correlation</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {correlations[0].categoryName 
                    ? `There's a pattern between your spending on ${correlations[0].categoryName} and lower mood scores the following day.`
                    : `Days with higher overall spending tend to be followed by lower mood scores the next day.`}
                </p>
                <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  {correlations[0].categoryName 
                    ? `Try reducing discretionary spending on ${correlations[0].categoryName} to see if your mood improves!`
                    : `Try setting a daily spending limit to improve your financial wellbeing and mood.`}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The finance module connects with your mood tracking, habits, and focus sessions to provide deeper insights into how your financial health affects your overall wellbeing. Discover patterns and make meaningful changes to improve both your financial and mental health.
          </p>
        </div>
      )}
      
      {/* Quick Entry Floating Action Button */}
      <QuickEntryFAB onTransactionAdded={handleRefresh} />
      
      {/* Modals */}
      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}
      
      {showAddBudget && (
        <AddBudgetModal
          onClose={() => setShowAddBudget(false)}
          onBudgetAdded={handleBudgetAdded}
        />
      )}
      
      {showAddSavings && (
        <AddSavingsGoalModal
          onClose={() => setShowAddSavings(false)}
          onSavingsAdded={handleSavingsAdded}
        />
      )}
      
      {showAddRecurring && (
        <AddRecurringModal
          onClose={() => setShowAddRecurring(false)}
          onRecurringAdded={handleRecurringAdded}
        />
      )}
    </div>
  );
};

// Missing Lucide icons
const AlertTriangle = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={props.size || 24} 
    height={props.size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const AlertCircle = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={props.size || 24} 
    height={props.size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={props.className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const PieChart = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={props.size || 24} 
    height={props.size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export default FinanceSection;