import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Award, AlertTriangle, AlertCircle, PiggyBank, Calendar, 
  TrendingUp, TrendingDown, DollarSign, PieChart, Info
} from 'lucide-react';
import { 
  getFinanceData, calculateFinancialStats, getFinancialInsights, 
  getSpendingMoodCorrelation, getCategoryById 
} from '../../utils/financeUtils';

const FinancialInsights = ({ refreshTrigger = 0, onRefresh, insights, correlations }) => {
  // State variables
  const [transactions, setTransactions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');

  // Fetch data on initial render and when refreshTrigger changes
  useEffect(() => {
    const financeData = getFinanceData();
    setTransactions(financeData.transactions);
    
    // Calculate financial stats
    const statsData = calculateFinancialStats(timeRange);
    setStats(statsData);
    
    // Prepare chart data - for category breakdown
    const categoryData = [];
    Object.entries(statsData.categoryBreakdown).forEach(([categoryId, amount]) => {
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
    
    // Setting category breakdown
    setCategoryBreakdown(statsData.categoryBreakdown);
  }, [refreshTrigger, timeRange]);

  // Format currency amount
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Get tooltip color class based on insight type
  const getInsightColorClass = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400';
      case 'negative':
        return 'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400';
    }
  };

  // Get background color class based on insight type
  const getInsightBgClass = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50';
      case 'negative':
        return 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50';
      default:
        return 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <BarChart2 className="text-amber-500 dark:text-amber-400" size={20} />
          Financial Insights
        </h4>
        
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      {/* Financial Health Score */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-36 h-36 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
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
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {insights.score}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">out of 100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h5 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
              Financial Health Score
            </h5>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {insights.score > 70
                ? "Your financial health is excellent! You're managing your money effectively."
                : insights.score > 40
                ? "Your financial health is good, but there's room for improvement."
                : "Your financial health needs attention. Consider the suggestions below."
              }
            </p>
            
            {/* Score breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <TrendingUp size={16} className="mr-1 text-green-500 dark:text-green-400" />
                  Income
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(stats?.income || 0)}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <TrendingDown size={16} className="mr-1 text-red-500 dark:text-red-400" />
                  Expenses
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(stats?.expenses || 0)}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <PiggyBank size={16} className="mr-1 text-amber-500 dark:text-amber-400" />
                  Savings Rate
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {stats && stats.income > 0 
                    ? Math.round(((stats.income - stats.expenses) / stats.income) * 100) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Insights */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h5 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
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
                    <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                      {insight.title}
                    </h6>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {insight.description}
                    </p>
                    
                    {insight.details && insight.details.length > 0 && (
                      <ul className="mt-2 pl-4 text-sm text-slate-500 dark:text-slate-400 space-y-1">
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
            <div className="text-center text-slate-500 dark:text-slate-400 p-6">
              Not enough financial data to generate insights. Add more transactions and budgets to get personalized recommendations.
            </div>
          )}
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h5 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
          Spending Breakdown by Category
        </h5>
        
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual chart */}
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E2E8F0" strokeWidth="1" className="dark:stroke-slate-700"></circle>
                    
                    {/* Generate pie chart segments */}
                    {chartData.map((category, index, array) => {
                      // Calculate the percentage and angles for this category
                      const totalValue = array.reduce((sum, cat) => sum + cat.value, 0);
                      const percentage = (category.value / totalValue) * 100;
                      
                      // Calculate the start angle
                      const previousPercentage = array
                        .slice(0, index)
                        .reduce((sum, cat) => sum + (cat.value / totalValue) * 100, 0);
                      
                      const startAngle = (previousPercentage / 100) * 360;
                      const endAngle = ((previousPercentage + percentage) / 100) * 360;
                      
                      // SVG coordinates
                      const x1 = 21 + 15.91549430918954 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const y1 = 21 + 15.91549430918954 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const x2 = 21 + 15.91549430918954 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const y2 = 21 + 15.91549430918954 * Math.sin((endAngle - 90) * Math.PI / 180);
                      
                      // Determine if the arc should be drawn larger than 180 degrees
                      const largeArcFlag = percentage > 50 ? 1 : 0;
                      
                      return (
                        <path
                          key={category.id}
                          d={`M21 21 L ${x1} ${y1} A 15.91549430918954 15.91549430918954 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={`var(--color-${category.color}-500)`}
                          className={`dark:fill-${category.color}-600 dark:fill-opacity-80`}
                        />
                      );
                    })}
                    
                    {/* Inner circle for donut effect */}
                    <circle cx="21" cy="21" r="10" fill="white" className="dark:fill-slate-800" />
                  </svg>
                </div>
                
                {/* Total in center */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Expenses</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(stats?.expenses || 0)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Category legend */}
            <div className="space-y-3">
              {chartData.map(category => {
                const totalValue = chartData.reduce((sum, cat) => sum + cat.value, 0);
                const percentage = (category.value / totalValue) * 100;
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className={`w-3 h-3 rounded-full bg-${category.color}-500 dark:bg-${category.color}-600 mr-2`}
                      ></div>
                      <span className="text-slate-700 dark:text-slate-300">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {formatCurrency(category.value)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 p-6">
            No spending data available for this period.
          </div>
        )}
      </div>
      
      {/* Wellbeing Connection */}
      {correlations && correlations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h5 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
            Finance & Wellbeing Connections
          </h5>
          
          <div className="space-y-4">
            {correlations.map((correlation, index) => {
              const category = correlation.categoryName || 'overall spending';
              
              return (
                <div 
                  key={index} 
                  className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400">
                      <BarChart2 size={18} />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                        {correlation.type === 'negative' 
                          ? `${category} may affect your mood`
                          : `${category} shows positive mood correlation`
                        }
                      </h6>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {correlation.type === 'negative'
                          ? `There's a pattern where higher spending on ${category} is followed by lower mood scores the next day.`
                          : `Days with higher ${category} tend to correlate with improved mood scores.`
                        }
                      </p>
                      
                      <div className="mt-2 text-sm bg-white dark:bg-slate-700 p-3 rounded-lg">
                        <span className="font-medium text-purple-600 dark:text-purple-400">Recommendation:</span>
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