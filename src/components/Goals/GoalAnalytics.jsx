import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Calendar, Filter, ChevronDown, ChevronUp, 
  CheckCircle, Circle, ArrowUp, ArrowDown, Clock, TrendingUp,
  PieChart, Award, Target, BarChart3, ArrowUpRight, LineChart,
  Mountain, Brain, Dumbbell, Briefcase, Wallet, Sparkles, Star 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend 
} from 'recharts';
import { getGoals, getCategories, getSummaryStats } from '../../utils/bucketListUtils';

const GoalAnalytics = () => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [timeRange, setTimeRange] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expanded, setExpanded] = useState({
    completion: true,
    categories: true,
    trends: true,
    priorities: true
  });
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    const loadedGoals = getGoals();
    const loadedCategories = getCategories();
    const summaryStats = getSummaryStats();
    
    setGoals(loadedGoals);
    setCategories(loadedCategories);
    setStats(summaryStats);
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Get category icon
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'experiences': return <Mountain size={18} className="text-purple-500" />;
      case 'personal': return <Brain size={18} className="text-blue-500" />;
      case 'fitness': return <Dumbbell size={18} className="text-green-500" />;
      case 'career': return <Briefcase size={18} className="text-amber-500" />;
      case 'finance': return <Wallet size={18} className="text-emerald-500" />;
      case 'creative': return <Sparkles size={18} className="text-rose-500" />;
      default: return <Star size={18} className="text-slate-500" />;
    }
  };
  
  // Calculate completion rate by month
  const getCompletionByMonth = () => {
    // Only use completed goals for this chart
    const completedGoals = getFilteredGoals().filter(g => g.completed);
    
    // Group by month
    const monthlyData = {};
    
    completedGoals.forEach(goal => {
      // Use modification date as completion date
      const completionDate = goal.modifiedAt || goal.createdAt;
      const date = new Date(completionDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          count: 0
        };
      }
      
      monthlyData[monthYear].count++;
    });
    
    // Convert to array and sort by date
    const result = Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA - dateB;
    });
    
    // Return most recent 6 months
    return result.slice(-6);
  };
  
  // Calculate goal distribution by category
  const getGoalsByCategory = () => {
    const categoryCounts = {};
    
    // Initialize with all categories
    categories.forEach(cat => {
      categoryCounts[cat.id] = {
        name: cat.name,
        value: 0,
        completed: 0
      };
    });
    
    // Count goals by category
    getFilteredGoals().forEach(goal => {
      if (goal.category) {
        if (!categoryCounts[goal.category]) {
          // In case there's a category that doesn't exist in our categories array
          const catName = categories.find(c => c.id === goal.category)?.name || goal.category;
          categoryCounts[goal.category] = { name: catName, value: 0, completed: 0 };
        }
        
        categoryCounts[goal.category].value++;
        
        if (goal.completed) {
          categoryCounts[goal.category].completed++;
        }
      } else {
        // Handle uncategorized goals
        if (!categoryCounts['uncategorized']) {
          categoryCounts['uncategorized'] = { name: 'Uncategorized', value: 0, completed: 0 };
        }
        
        categoryCounts['uncategorized'].value++;
        
        if (goal.completed) {
          categoryCounts['uncategorized'].completed++;
        }
      }
    });
    
    // Convert to array and filter out categories with 0 goals
    return Object.entries(categoryCounts)
      .map(([id, data]) => ({ id, ...data }))
      .filter(cat => cat.value > 0)
      .sort((a, b) => b.value - a.value);
  };
  
  // Calculate goal distribution by priority
  const getGoalsByPriority = () => {
    const priorityCounts = {
      high: { name: 'High', value: 0 },
      medium: { name: 'Medium', value: 0 },
      low: { name: 'Low', value: 0 }
    };
    
    // Count goals by priority
    getFilteredGoals().forEach(goal => {
      const priority = goal.priority || 'medium';
      priorityCounts[priority].value++;
    });
    
    // Convert to array
    return Object.values(priorityCounts);
  };
  
  // Get goals filtered by time range and category
  const getFilteredGoals = () => {
    let filtered = [...goals];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(g => g.category === categoryFilter);
    }
    
    // Apply time range filter
    if (timeRange !== 'all') {
      const today = new Date();
      const pastDate = new Date();
      
      if (timeRange === '30days') {
        pastDate.setDate(today.getDate() - 30);
      } else if (timeRange === '90days') {
        pastDate.setDate(today.getDate() - 90);
      } else if (timeRange === '365days') {
        pastDate.setDate(today.getDate() - 365);
      }
      
      filtered = filtered.filter(g => {
        const createdAt = new Date(g.createdAt);
        return createdAt >= pastDate;
      });
    }
    
    return filtered;
  };
  
  // Calculate week over week change in completed goals
  const getCompletionTrend = () => {
    // Only consider the last 8 weeks
    const today = new Date();
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(today.getDate() - 56); // 8 weeks = 56 days
    
    // Filter goals completed in the last 8 weeks
    const recentlyCompleted = goals.filter(g => {
      if (!g.completed) return false;
      
      const completionDate = new Date(g.modifiedAt || g.createdAt);
      return completionDate >= eightWeeksAgo;
    });
    
    // Group by week
    const weeklyData = {};
    
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date();
      weekStart.setDate(today.getDate() - (7 * i) - (today.getDay() === 0 ? 6 : today.getDay() - 1));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekKey = weekStart.toISOString().substring(0, 10);
      
      weeklyData[weekKey] = {
        start: weekStart,
        end: weekEnd,
        count: 0
      };
    }
    
    // Count completions by week
    recentlyCompleted.forEach(goal => {
      const completionDate = new Date(goal.modifiedAt || goal.createdAt);
      
      for (const [weekKey, week] of Object.entries(weeklyData)) {
        if (completionDate >= week.start && completionDate <= week.end) {
          week.count++;
          break;
        }
      }
    });
    
    // Calculate week-over-week change
    const weeks = Object.entries(weeklyData)
      .map(([key, data]) => ({ 
        week: key, 
        count: data.count 
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week)); // Sort chronologically
    
    if (weeks.length >= 2) {
      const currentWeek = weeks[weeks.length - 1].count;
      const prevWeek = weeks[weeks.length - 2].count;
      
      if (prevWeek === 0) {
        return currentWeek > 0 ? 100 : 0; // Avoid division by zero
      }
      
      const percentChange = ((currentWeek - prevWeek) / prevWeek) * 100;
      return Math.round(percentChange);
    }
    
    return 0;
  };
  
  // Calculate average time to complete goals (in days)
  const getAverageCompletionTime = () => {
    const completedGoals = goals.filter(g => g.completed && g.createdAt && g.modifiedAt);
    
    if (completedGoals.length === 0) return null;
    
    let totalDays = 0;
    
    completedGoals.forEach(goal => {
      const createdDate = new Date(goal.createdAt);
      const completedDate = new Date(goal.modifiedAt);
      
      const diffTime = completedDate - createdDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      totalDays += diffDays;
    });
    
    return Math.round(totalDays / completedGoals.length);
  };
  
  // Colors for charts
  const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  
  // Calculate the completion trend change
  const completionTrendChange = getCompletionTrend();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-amber-500" />
            <span>Goal Analytics</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your progress and spot trends
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="365days">Last Year</option>
            </select>
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
          
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
      </div>
      
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Target size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Goals</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.totalGoals || 0}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Completed Goals</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.completedGoals || 0}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Circle size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.inProgressGoals || 0}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Award size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.avgCompletionRate || 0}%</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insight Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Completion Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Weekly Trend</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Completed goals</p>
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              completionTrendChange > 0 
                ? 'text-green-600 dark:text-green-400' 
                : completionTrendChange < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-slate-500 dark:text-slate-400'
            }`}>
              {completionTrendChange > 0 ? (
                <ArrowUp size={16} />
              ) : completionTrendChange < 0 ? (
                <ArrowDown size={16} />
              ) : null}
              <span>{Math.abs(completionTrendChange)}%</span>
            </div>
          </div>
          
          <div className="h-32 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <div className={`text-4xl font-bold mb-2 ${
                completionTrendChange > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : completionTrendChange < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-slate-800 dark:text-slate-200'
              }`}>
                {completionTrendChange > 0 ? '+' : ''}{completionTrendChange}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {completionTrendChange > 0 
                  ? 'Increase in completed goals week over week' 
                  : completionTrendChange < 0 
                    ? 'Decrease in completed goals week over week' 
                    : 'No change in completed goals'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Average Days to Complete */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Average Time</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Days to complete goals</p>
            </div>
            <div className="text-blue-500 dark:text-blue-400">
              <Clock size={20} />
            </div>
          </div>
          
          <div className="h-32 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-2 text-slate-800 dark:text-slate-200">
                {getAverageCompletionTime() !== null 
                  ? getAverageCompletionTime() 
                  : '-'}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {getAverageCompletionTime() !== null 
                  ? `Average days to complete a goal` 
                  : 'No completed goals yet'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Goal Velocity</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Goals completed recently</p>
            </div>
            <div className="text-amber-500 dark:text-amber-400">
              <TrendingUp size={20} />
            </div>
          </div>
          
          <div className="h-32 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              {getCompletionByMonth().length > 0 ? (
                <>
                  <div className="text-4xl font-bold mb-2 text-slate-800 dark:text-slate-200">
                    {getCompletionByMonth()[getCompletionByMonth().length - 1].count}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Goals completed this month
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  No completed goals in the selected time period
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LineChart size={18} className="text-blue-500" />
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Completion Trend</h3>
            </div>
            <button 
              onClick={() => toggleSection('completion')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              {expanded.completion ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {expanded.completion && (
            <div className="p-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={getCompletionByMonth()}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8' }}
                      axisLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={{ stroke: '#475569' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} goals`, 'Completed']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="Completed Goals"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        {/* Goals by Category */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-purple-500" />
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Goals by Category</h3>
            </div>
            <button 
              onClick={() => toggleSection('categories')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              {expanded.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {expanded.categories && (
            <div className="p-4">
              <div className="h-72">
                {getGoalsByCategory().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={getGoalsByCategory()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {getGoalsByCategory().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        formatter={(value, entry, index) => {
                          const item = getGoalsByCategory()[index];
                          return (
                            <span style={{ color: '#94a3b8' }}>
                              {value} ({item.completed}/{item.value})
                            </span>
                          );
                        }} 
                      />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const item = getGoalsByCategory().find(c => c.name === name);
                          return [`${value} goals (${item.completed} completed)`, name];
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400 text-center">
                      No goals in the selected time period
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Priority Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-500" />
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Goals by Priority</h3>
            </div>
            <button 
              onClick={() => toggleSection('priorities')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              {expanded.priorities ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {expanded.priorities && (
            <div className="p-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getGoalsByPriority()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8' }}
                      axisLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={{ stroke: '#475569' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} goals`, 'Count']}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Goals Count"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-green-500" />
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Category Breakdown</h3>
            </div>
            <button 
              onClick={() => toggleSection('trends')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              {expanded.trends ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {expanded.trends && (
            <div className="p-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getGoalsByCategory()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#94a3b8' }}
                      axisLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: '#94a3b8' }}
                      axisLine={{ stroke: '#475569' }}
                      width={100} 
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} goals`, 
                        name === 'value' ? 'Total' : 'Completed'
                      ]}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#8b5cf6" 
                      name="Total"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="#10b981" 
                      name="Completed"
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Performance Insights */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <ArrowUpRight size={18} className="text-blue-500" />
          <span>Goal Insights</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-2">Completion Pattern</h4>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              {stats.completedGoals > 0 
                ? `You've completed ${stats.completedGoals} goals with an average completion time of ${getAverageCompletionTime() || 'N/A'} days.`
                : "You haven't completed any goals yet. Start by tackling your high-priority tasks."}
            </p>
            
            {stats.completedGoals > 0 && (
              <div className="mt-3 flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <ArrowUpRight size={16} />
                <span>View completed goals</span>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
            <h4 className="text-green-800 dark:text-green-300 font-medium mb-2">Category Focus</h4>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              {getGoalsByCategory().length > 0 
                ? `Your goals are primarily focused on ${getGoalsByCategory()[0].name} (${getGoalsByCategory()[0].value} goals) with a ${getGoalsByCategory()[0].completed}/${getGoalsByCategory()[0].value} completion rate.`
                : "You haven't created any goals yet in the selected time period."}
            </p>
            
            {getGoalsByCategory().length > 0 && (
              <div className="mt-3 flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                <ArrowUpRight size={16} />
                <span>Explore category breakdown</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalAnalytics;