import React, { useState } from 'react';
import { 
  Coins, DollarSign, PiggyBank, TrendingUp, BarChart2, CreditCard, 
  Calendar, ArrowRight, Zap, Target, Wallet, Banknote, ChevronUp, 
  ChevronDown, Settings, Tag, Clock, BadgePercent, TrendingDown, Award 
} from 'lucide-react';

export const FinancePlaceholder = () => {
  // Features for finance section
  const features = [
    { icon: <Wallet size={18} />, title: "Expense Tracking", description: "Categorize and monitor your daily spending with ease" },
    { icon: <Target size={18} />, title: "Savings Goals", description: "Set visual targets and track your progress over time" },
    { icon: <TrendingUp size={18} />, title: "Financial Analytics", description: "Gain insights into your spending patterns and habits" },
    { icon: <Calendar size={18} />, title: "Bill Reminders", description: "Never miss important payments with smart notifications" }
  ];

  // Mock data for recent transactions
  const transactions = [
    { id: 1, name: 'Grocery Store', amount: -78.52, category: 'Food', date: 'Mar 13' },
    { id: 2, name: 'Paycheck', amount: 1250.00, category: 'Income', date: 'Mar 12' },
    { id: 3, name: 'Coffee Shop', amount: -4.75, category: 'Dining', date: 'Mar 11' },
    { id: 4, name: 'Gas Station', amount: -42.30, category: 'Transportation', date: 'Mar 10' },
    { id: 5, name: 'Online Subscription', amount: -12.99, category: 'Entertainment', date: 'Mar 9' },
  ];

  // Mock data for budget categories
  const budgetCategories = [
    { name: 'Housing', allocated: 1200, spent: 1150, color: 'amber' },
    { name: 'Food', allocated: 600, spent: 520, color: 'green' },
    { name: 'Transportation', allocated: 300, spent: 260, color: 'blue' },
    { name: 'Entertainment', allocated: 200, spent: 240, color: 'purple' },
    { name: 'Utilities', allocated: 250, spent: 230, color: 'teal' },
  ];

  // Mock data for savings goals
  const savingsGoals = [
    { name: 'Emergency Fund', current: 2500, target: 5000, color: 'amber' },
    { name: 'Vacation', current: 1800, target: 3000, color: 'blue' },
    { name: 'New Laptop', current: 600, target: 1500, color: 'purple' },
  ];

  // State for collapsed sections
  const [expandedSections, setExpandedSections] = useState({
    transactions: true,
    budget: true,
    savings: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to calculate percentage
  const calculatePercentage = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Coins className="text-amber-500 dark:text-amber-400" size={24} />
          Finance
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-amber-50 dark:bg-amber-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Coins className="text-amber-500 dark:text-amber-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Take control of your financial well-being with our comprehensive tracking tools.
              Monitor expenses, set budgets, track savings goals, and gain valuable insights
              into your spending habits.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <DollarSign className="text-amber-500 dark:text-amber-400" size={20} />
          Financial Dashboard
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-amber-500 dark:text-amber-400" />
                <h4 className="font-medium text-slate-700 dark:text-slate-300">Balance</h4>
              </div>
              <span className="font-bold text-xl text-amber-600 dark:text-amber-300">$5,240.75</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Monthly Change</span>
              <span className="text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp size={14} className="mr-1" /> +$312.40
              </span>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-green-500 dark:text-green-400" />
                <h4 className="font-medium text-slate-700 dark:text-slate-300">Income</h4>
              </div>
              <span className="font-bold text-xl text-green-600 dark:text-green-300">$3,750.00</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>vs Last Month</span>
              <span className="text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp size={14} className="mr-1" /> +2.4%
              </span>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-red-500 dark:text-red-400" />
                <h4 className="font-medium text-slate-700 dark:text-slate-300">Expenses</h4>
              </div>
              <span className="font-bold text-xl text-red-600 dark:text-red-300">$2,184.32</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>vs Last Month</span>
              <span className="text-red-600 dark:text-red-400 flex items-center">
                <TrendingDown size={14} className="mr-1" /> -5.1%
              </span>
            </div>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6">
          <div 
            onClick={() => toggleSection('transactions')} 
            className="flex items-center justify-between mb-2 cursor-pointer"
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
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden transition-all">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className="text-sm">
                        <td className="p-2 text-slate-500 dark:text-slate-400">{transaction.date}</td>
                        <td className="p-2 text-slate-700 dark:text-slate-300">{transaction.name}</td>
                        <td className="p-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs 
                            ${transaction.category === 'Income' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : transaction.category === 'Food' 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                : transaction.category === 'Dining'
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                                  : transaction.category === 'Transportation'
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                                    : 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
                            }`}
                          >
                            {transaction.category}
                          </span>
                        </td>
                        <td className={`p-2 text-right font-medium 
                          ${transaction.amount > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'}`}
                        >
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-2 text-center">
                <button className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
                  View All Transactions
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Budget Categories */}
        <div className="mb-6">
          <div 
            onClick={() => toggleSection('budget')} 
            className="flex items-center justify-between mb-2 cursor-pointer"
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
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 transition-all">
              <div className="space-y-4">
                {budgetCategories.map((category) => {
                  const percentage = calculatePercentage(category.spent, category.allocated);
                  const isOverBudget = category.spent > category.allocated;
                  
                  return (
                    <div key={category.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                        <span className={`font-medium ${
                          isOverBudget 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          ${category.spent} / ${category.allocated}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isOverBudget 
                              ? 'bg-red-500 dark:bg-red-600' 
                              : `bg-${category.color}-500 dark:bg-${category.color}-600`
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-200 dark:border-slate-600">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <div className="font-medium">Monthly Budget: $2,550</div>
                  <div>Spent: $2,400 (94%)</div>
                </div>
                <button className="px-3 py-1.5 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg text-sm">
                  Adjust Budget
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Interactive Piggy Bank Visualization */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <PiggyBank className="text-amber-500 dark:text-amber-400" size={20} />
          Savings Goals
        </h3>
        
        <div 
          onClick={() => toggleSection('savings')} 
          className="flex items-center justify-between mb-4 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Target size={18} className="text-amber-500 dark:text-amber-400" />
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Your Goals</h4>
          </div>
          {expandedSections.savings ? 
            <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" /> : 
            <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />}
        </div>
        
        {expandedSections.savings && (
          <div className="space-y-6 mb-6">
            {savingsGoals.map((goal, index) => {
              const percentage = calculatePercentage(goal.current, goal.target);
              
              return (
                <div key={goal.name} className={`bg-${goal.color}-50 dark:bg-${goal.color}-900/30 rounded-lg p-4 border border-${goal.color}-200 dark:border-${goal.color}-800/50 relative overflow-hidden`}>
                  {/* Visual coin pile animation - we'll use a pseudo-animated static view for the placeholder */}
                  <div className="absolute right-4 bottom-4 opacity-10">
                    <PiggyBank size={60} className={`text-${goal.color}-500 dark:text-${goal.color}-400`} />
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-slate-700 dark:text-slate-200">{goal.name}</h5>
                    <div className="text-right">
                      <div className="font-bold text-lg text-amber-600 dark:text-amber-400">
                        ${goal.current.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        of ${goal.target.toLocaleString()} goal
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full bg-${goal.color}-500 dark:bg-${goal.color}-600 rounded-full relative`}
                      style={{ width: `${percentage}%` }}
                    >
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 shimmer-effect"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{percentage}% complete</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      ${(goal.target - goal.current).toLocaleString()} to go
                    </span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg text-xs flex items-center">
                      <Banknote size={14} className="mr-1" /> Add Funds
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs flex items-center">
                      <Settings size={14} className="mr-1" /> Edit Goal
                    </button>
                  </div>
                </div>
              );
            })}
            
            <button className="w-full py-2 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <Zap size={18} className="mr-2" />
              Create New Savings Goal
            </button>
          </div>
        )}
        
        {/* Achievement Preview */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-lg p-4 text-white flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-full mr-4">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <h5 className="font-medium text-lg">Financial Milestone Achieved!</h5>
              <p className="text-white/80 text-sm">You've saved 20% of your monthly income</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-white/90 transition-colors">
            View All
          </button>
        </div>
      </div>
      
      {/* Analytics Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <BarChart2 className="text-amber-500 dark:text-amber-400" size={20} />
          Financial Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Spending Chart */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Monthly Spending by Category
            </h4>
            
            <div className="h-48 relative">
              {/* Simulated chart - for a real implementation, you'd use a chart library */}
              <div className="absolute inset-0 flex items-end justify-between px-2">
                <div className="w-1/5 flex flex-col items-center">
                  <div className="h-20 w-12 bg-amber-500 dark:bg-amber-600 rounded-t-lg"></div>
                  <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">Housing</span>
                </div>
                <div className="w-1/5 flex flex-col items-center">
                  <div className="h-10 w-12 bg-blue-500 dark:bg-blue-600 rounded-t-lg"></div>
                  <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">Food</span>
                </div>
                <div className="w-1/5 flex flex-col items-center">
                  <div className="h-6 w-12 bg-green-500 dark:bg-green-600 rounded-t-lg"></div>
                  <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">Transport</span>
                </div>
                <div className="w-1/5 flex flex-col items-center">
                  <div className="h-8 w-12 bg-purple-500 dark:bg-purple-600 rounded-t-lg"></div>
                  <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">Shopping</span>
                </div>
                <div className="w-1/5 flex flex-col items-center">
                  <div className="h-12 w-12 bg-red-500 dark:bg-red-600 rounded-t-lg"></div>
                  <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">Other</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <button className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
                View Detailed Report
              </button>
            </div>
          </div>
          
          {/* Spending Insights */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Smart Insights
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <TrendingDown size={16} />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Spending Decrease
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your dining expenses decreased 15% compared to last month
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <Clock size={16} />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upcoming Payment
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Internet bill ($59.99) is due in 3 days
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                  <BadgePercent size={16} />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Savings Opportunity
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You could save $85/month by adjusting your subscription services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Income vs. Expenses Trend */}
        <div className="mt-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Income vs. Expenses (6 Month Trend)
          </h4>
          
          <div className="h-48 relative">
            {/* Simulated area chart - for a real implementation, you'd use a chart library */}
            <div className="absolute inset-0">
              <svg width="100%" height="100%" viewBox="0 0 400 150">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="400" y2="0" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="0" y1="150" x2="400" y2="150" stroke="#CBD5E1" strokeWidth="1" />
                
                {/* Income area */}
                <path 
                  d="M0,80 L66,70 L133,60 L200,40 L266,50 L333,30 L400,20 L400,150 L0,150 Z" 
                  fill="rgba(52, 211, 153, 0.2)" 
                  stroke="#34D399" 
                  strokeWidth="2"
                />
                
                {/* Expenses area */}
                <path 
                  d="M0,100 L66,90 L133,110 L200,80 L266,100 L333,70 L400,90 L400,150 L0,150 Z" 
                  fill="rgba(248, 113, 113, 0.2)" 
                  stroke="#F87171" 
                  strokeWidth="2"
                />
                
                {/* Month labels */}
                <text x="0" y="165" fontSize="10" fill="#94A3B8">Nov</text>
                <text x="66" y="165" fontSize="10" fill="#94A3B8">Dec</text>
                <text x="133" y="165" fontSize="10" fill="#94A3B8">Jan</text>
                <text x="200" y="165" fontSize="10" fill="#94A3B8">Feb</text>
                <text x="266" y="165" fontSize="10" fill="#94A3B8">Mar</text>
                <text x="333" y="165" fontSize="10" fill="#94A3B8">Apr</text>
              </svg>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 text-sm mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-slate-600 dark:text-slate-400">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-slate-600 dark:text-slate-400">Expenses</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Integration with other modules */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Zap className="text-amber-500 dark:text-amber-400" size={20} />
          Financial Wellbeing Integration
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
                  <TrendingUp size={14} className="text-red-500 dark:text-red-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Increased spending on takeout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Spending category: Dining</span>
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
                There's a pattern between your spending on takeout and lower mood scores the following day.
              </p>
              <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                Try cooking at home more often to see if your mood improves!
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The finance module connects with your mood tracking, habits, and focus sessions to provide deeper insights into how your financial health affects your overall wellbeing. Discover patterns and make meaningful changes to improve both your financial and mental health.
        </p>
      </div>
    </div>
  );
};

export default FinancePlaceholder;