import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getGoals, getCategories } from '../../utils/bucketListUtils';
import { Trophy, Target, Calendar, Clock, ArrowUpRight, Sparkles, Star, Quote, BookOpen, Flame, Zap, Filter } from 'lucide-react';

const GoalAnalytics = () => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeView, setActiveView] = useState('mascot');
  const [timeRange, setTimeRange] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dailyQuote, setDailyQuote] = useState({});
  const [focusGoal, setFocusGoal] = useState(null);
  const [mascotState, setMascotState] = useState({
    type: 'fox',  // Default mascot
    mood: 'excited', // Default mood
    message: "I'm your goal buddy! Let's achieve great things together!",
    tip: "Start by setting a new goal or making progress on an existing one.",
    lastActivity: null,
    activityDays: 0,
    completionRate: 0
  });
  
  // Motivational quotes
  const inspirationalQuotes = [
    { text: "Goals are dreams with deadlines.", author: "Diana Scharf" },
    { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
    { text: "The only limit to the height of your achievements is the reach of your dreams.", author: "Michelle Obama" },
    { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
  ];
  
  useEffect(() => {
    // Load goals and categories
    const loadedGoals = getGoals();
    const loadedCategories = getCategories();
    setGoals(loadedGoals);
    setCategories(loadedCategories);
    
    // Set a random daily quote
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    setDailyQuote(randomQuote);
    
    // Find a focus goal (closest upcoming deadline or most recently added)
    selectFocusGoal(loadedGoals);
    
    // Determine mascot state based on goal data
    updateMascotState(loadedGoals);
  }, []);
  
  // Calculate mascot state based on goal data
  const updateMascotState = (goalsData) => {
    // Find most recent activity (completion or progress update)
    let lastActivityDate = null;
    let mostRecentGoal = null;
    
    goalsData.forEach(goal => {
      const modifiedDate = goal.modifiedAt ? new Date(goal.modifiedAt) : null;
      if (modifiedDate && (!lastActivityDate || modifiedDate > lastActivityDate)) {
        lastActivityDate = modifiedDate;
        mostRecentGoal = goal;
      }
    });
    
    // Calculate days since last activity
    const today = new Date();
    const daysSinceActivity = lastActivityDate ? 
      Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24)) : 
      null;
    
    // Calculate completion rate
    const totalGoals = goalsData.length;
    const completedGoals = goalsData.filter(g => g.completed).length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Calculate upcoming deadlines
    const upcomingDeadlines = goalsData.filter(g => {
      if (g.completed) return false;
      if (!g.targetDate) return false;
      
      const targetDate = new Date(g.targetDate);
      const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    
    // Determine mascot mood based on activity and completion rate
    let mood = 'neutral';
    let message = '';
    let tip = '';
    
    if (daysSinceActivity === null) {
      mood = 'curious';
      message = "Hello! I'm your goal buddy. Want to set your first goal?";
      tip = "Start by creating a simple, achievable goal to build momentum.";
    } else if (daysSinceActivity === 0) {
      mood = 'excited';
      message = "You're on fire today! Keep up the great work!";
      tip = mostRecentGoal?.completed ? 
        "Great job completing a goal! Time to set a new challenge?" : 
        "You're making progress! Remember to celebrate small wins.";
    } else if (daysSinceActivity <= 2) {
      mood = 'happy';
      message = "Nice to see you back! You've been making good progress.";
      tip = "Consistency is key to achieving your goals.";
    } else if (daysSinceActivity <= 7) {
      mood = 'waiting';
      message = `It's been ${daysSinceActivity} days since your last update. Time to make progress?`;
      tip = "Even small steps forward count. What can you do today?";
    } else {
      mood = 'sleepy';
      message = "I've missed you! Your goals are waiting for some attention.";
      tip = "Start fresh today - don't worry about the past, focus on what you can do now.";
    }
    
    // Override based on completion rate milestones
    if (completionRate >= 80) {
      mood = 'proud';
      message = "Wow! You're crushing it with an impressive completion rate!";
      tip = "You're clearly a goal achiever! Consider setting some stretch goals.";
    }
    
    // Override if there are upcoming deadlines
    if (upcomingDeadlines > 0) {
      mood = 'alert';
      message = `Heads up! You have ${upcomingDeadlines} goal${upcomingDeadlines > 1 ? 's' : ''} due soon.`;
      tip = "Plan your week to make sure you complete these goals on time.";
    }
    
    setMascotState({
      type: 'fox', // For now, just use fox as default mascot
      mood,
      message,
      tip,
      lastActivity: lastActivityDate,
      activityDays: daysSinceActivity,
      completionRate
    });
  };
  
  // Select a focus goal
  const selectFocusGoal = (goalsData) => {
    if (goalsData.length === 0) return;
    
    const incompleteGoals = goalsData.filter(g => !g.completed);
    if (incompleteGoals.length === 0) return;
    
    // Goals with deadlines
    const goalsWithDeadlines = incompleteGoals.filter(g => g.targetDate);
    
    if (goalsWithDeadlines.length > 0) {
      // Sort by closest deadline
      goalsWithDeadlines.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
      
      // Find the first non-overdue goal
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingGoal = goalsWithDeadlines.find(g => new Date(g.targetDate) >= today);
      
      if (upcomingGoal) {
        setFocusGoal(upcomingGoal);
        return;
      }
    }
    
    // If no upcoming deadline goal, use the most recently added
    incompleteGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFocusGoal(incompleteGoals[0]);
  };

  // Get filtered goals
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
      } else if (timeRange === '1year') {
        pastDate.setFullYear(today.getFullYear() - 1);
      }
      
      filtered = filtered.filter(g => {
        const createdAt = new Date(g.createdAt);
        return createdAt >= pastDate;
      });
    }
    
    return filtered;
  };

  // Get category data for horizontal bar chart
  const getCategoryData = () => {
    const filtered = getFilteredGoals();
    const catCounts = {};
    
    // Initialize with 0 for all categories
    categories.forEach(cat => {
      catCounts[cat.id] = 0;
    });
    
    // Count goals by category
    filtered.forEach(goal => {
      if (goal.category) {
        catCounts[goal.category] = (catCounts[goal.category] || 0) + 1;
      } else {
        catCounts['uncategorized'] = (catCounts['uncategorized'] || 0) + 1;
      }
    });
    
    // Convert to chart data format and sort by count
    return Object.entries(catCounts)
      .filter(([_, count]) => count > 0) // Only include categories with goals
      .map(([catId, count]) => {
        const category = categories.find(c => c.id === catId) || { name: 'Uncategorized' };
        return {
          name: category.name,
          goals: count
        };
      })
      .sort((a, b) => b.goals - a.goals) // Sort by count descending
      .slice(0, 5); // Top 5 categories
  };

  // Get completion trend data
  const getCompletionTrendData = () => {
    const completedGoals = getFilteredGoals().filter(g => g.completed);
    
    // Group by month
    const monthlyData = {};
    
    completedGoals.forEach(goal => {
      const completedDate = goal.modifiedAt || goal.createdAt;
      const date = new Date(completedDate);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          count: 0
        };
      }
      
      monthlyData[monthYear].count++;
    });
    
    // Convert to array and sort by date
    return Object.values(monthlyData)
      .sort((a, b) => {
        const dateA = new Date(`${a.year}-${a.month}-01`);
        const dateB = new Date(`${b.year}-${b.month}-01`);
        return dateA - dateB;
      })
      .map(item => ({
        name: `${item.month} ${item.year}`,
        completed: item.count
      }))
      .slice(-6); // Show last 6 months
  };

  // Format date as relative (e.g. "in 3 days", "2 days ago")
  const formatRelativeDate = (dateString) => {
    if (!dateString) return 'No deadline';
    
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return targetDate.toLocaleDateString();
  };

  // Get upcoming goals
  const getUpcomingGoals = () => {
    return goals
      .filter(goal => !goal.completed && goal.targetDate)
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
      .slice(0, 3);
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Render mascot based on current state
  const renderMascot = () => {
    const { type, mood } = mascotState;
    
    // For this demo, we'll use a fox mascot with different expressions
    // In a real implementation, you'd have different SVGs for each mood
    return (
      <div className="flex justify-center">
        <div className={`w-40 h-40 relative ${mood === 'excited' ? 'animate-bounce' : ''}`}>
          {/* Fox mascot - simplified for demo */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Fox base */}
            <circle cx="50" cy="50" r="40" fill="#ff9a3c" />
            
            {/* White face patch */}
            <ellipse cx="50" cy="60" rx="30" ry="25" fill="white" />
            
            {/* Ears */}
            <polygon points="25,30 15,5 35,15" fill="#ff9a3c" />
            <polygon points="75,30 85,5 65,15" fill="#ff9a3c" />
            
            {/* Face - Different expressions based on mood */}
            {mood === 'excited' && (
              <>
                {/* Happy eyes */}
                <circle cx="35" cy="40" r="5" fill="#333" />
                <circle cx="65" cy="40" r="5" fill="#333" />
                {/* Big smile */}
                <path d="M35,60 Q50,75 65,60" stroke="#333" strokeWidth="2" fill="none" />
                {/* Rosy cheeks */}
                <circle cx="30" cy="55" r="5" fill="#ffcccc" opacity="0.6" />
                <circle cx="70" cy="55" r="5" fill="#ffcccc" opacity="0.6" />
              </>
            )}
            
            {mood === 'happy' && (
              <>
                {/* Happy eyes */}
                <circle cx="35" cy="40" r="5" fill="#333" />
                <circle cx="65" cy="40" r="5" fill="#333" />
                {/* Smile */}
                <path d="M40,60 Q50,70 60,60" stroke="#333" strokeWidth="2" fill="none" />
              </>
            )}
            
            {mood === 'proud' && (
              <>
                {/* Proud eyes */}
                <path d="M30,40 Q35,35 40,40" stroke="#333" strokeWidth="2" fill="none" />
                <path d="M60,40 Q65,35 70,40" stroke="#333" strokeWidth="2" fill="none" />
                {/* Confident smile */}
                <path d="M40,60 Q50,68 60,60" stroke="#333" strokeWidth="2" fill="none" />
                {/* Star */}
                <text x="42" y="30" fontSize="20" fill="#FFD700">★</text>
              </>
            )}
            
            {mood === 'sleepy' && (
              <>
                {/* Sleepy eyes */}
                <path d="M30,40 Q35,45 40,40" stroke="#333" strokeWidth="2" fill="none" />
                <path d="M60,40 Q65,45 70,40" stroke="#333" strokeWidth="2" fill="none" />
                {/* Neutral mouth */}
                <line x1="42" y1="60" x2="58" y2="60" stroke="#333" strokeWidth="2" />
                {/* Z's */}
                <text x="70" y="30" fontSize="14" fill="#333">z</text>
                <text x="75" y="25" fontSize="10" fill="#333">z</text>
                <text x="79" y="20" fontSize="8" fill="#333">z</text>
              </>
            )}
            
            {mood === 'waiting' && (
              <>
                {/* Neutral eyes */}
                <circle cx="35" cy="40" r="4" fill="#333" />
                <circle cx="65" cy="40" r="4" fill="#333" />
                {/* Waiting mouth */}
                <path d="M45,60 Q50,58 55,60" stroke="#333" strokeWidth="2" fill="none" />
                {/* Clock */}
                <text x="75" y="35" fontSize="12" fill="#333">⏰</text>
              </>
            )}
            
            {mood === 'alert' && (
              <>
                {/* Alert eyes */}
                <circle cx="35" cy="40" r="6" fill="#333" />
                <circle cx="65" cy="40" r="6" fill="#333" />
                {/* Alert mouth */}
                <path d="M45,62 Q50,60 55,62" stroke="#333" strokeWidth="2" fill="none" />
                {/* Alert symbol */}
                <text x="45" y="25" fontSize="20" fill="#e11d48">!</text>
              </>
            )}
            
            {mood === 'curious' && (
              <>
                {/* Curious eyes */}
                <circle cx="35" cy="40" r="5" fill="#333" />
                <circle cx="65" cy="40" r="5" fill="#333" />
                {/* Curious mouth */}
                <path d="M45,60 Q50,65 55,60" stroke="#333" strokeWidth="2" fill="none" />
                {/* Question mark */}
                <text x="45" y="30" fontSize="16" fill="#333">?</text>
              </>
            )}
            
            {mood === 'neutral' && (
              <>
                {/* Neutral eyes */}
                <circle cx="35" cy="40" r="5" fill="#333" />
                <circle cx="65" cy="40" r="5" fill="#333" />
                {/* Neutral mouth */}
                <line x1="42" y1="60" x2="58" y2="60" stroke="#333" strokeWidth="2" />
              </>
            )}
            
            {/* Nose */}
            <circle cx="50" cy="50" r="5" fill="#333" />
          </svg>
          
          {/* Achievement indicator */}
          {mascotState.completionRate >= 70 && (
            <div className="absolute -top-2 -right-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full w-8 h-8 flex items-center justify-center border-2 border-amber-500">
              <Trophy size={16} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20} />
          <span>Goal Inspiration</span>
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('mascot')}
            className={`text-sm px-3 py-1 rounded-lg ${
              activeView === 'mascot' 
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Mascot
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`text-sm px-3 py-1 rounded-lg ${
              activeView === 'analytics' 
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
      
      {/* Daily Quote */}
      <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/30 dark:to-purple-900/30 p-4 rounded-lg border border-amber-100 dark:border-amber-800 shadow-sm">
        <div className="flex items-start gap-3">
          <Quote size={24} className="text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-slate-800 dark:text-slate-200 text-lg font-medium italic mb-2">
              "{dailyQuote.text}"
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              — {dailyQuote.author}
            </p>
          </div>
        </div>
      </div>
      
      {activeView === 'mascot' && (
        <>
          {/* Mascot Section */}
          <div className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-600 p-4">
            <div className="mb-6">
              {renderMascot()}
            </div>
            
            <div className="text-center mb-6">
              <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                {mascotState.message}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {mascotState.tip}
              </p>
            </div>
            
            {/* Progress Indicator */}
            {goals.length > 0 && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {mascotState.completionRate}% Complete
                  </span>
                </div>
                
                <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 dark:bg-amber-600 rounded-full"
                    style={{ width: `${mascotState.completionRate}%` }}
                  ></div>
                </div>
                
                {/* Milestone markers */}
                <div className="relative h-4 mt-1">
                  {[25, 50, 75, 100].map(milestone => (
                    <div key={milestone} className="absolute transform -translate-x-1/2" style={{ left: `${milestone}%` }}>
                      <div className={`w-1 h-2 ${
                        mascotState.completionRate >= milestone ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-500'
                      }`}></div>
                      <div className={`text-xs mt-1 transform -translate-x-1/2 ${
                        mascotState.completionRate >= milestone 
                          ? 'text-amber-600 dark:text-amber-400 font-medium' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>{milestone}%</div>
                    </div>
                  ))}
                </div>
                
                {/* Achievement message */}
                {mascotState.completionRate >= 75 ? (
                  <div className="text-center text-sm text-amber-600 dark:text-amber-400 mt-4">
                    <Trophy size={16} className="inline-block mr-1" />
                    <span>Impressive! You're a goal-crushing superstar!</span>
                  </div>
                ) : mascotState.completionRate >= 50 ? (
                  <div className="text-center text-sm text-amber-600 dark:text-amber-400 mt-4">
                    <Star size={16} className="inline-block mr-1" />
                    <span>You're making excellent progress!</span>
                  </div>
                ) : mascotState.completionRate >= 25 ? (
                  <div className="text-center text-sm text-amber-600 dark:text-amber-400 mt-4">
                    <Zap size={16} className="inline-block mr-1" />
                    <span>You're building momentum! Keep going!</span>
                  </div>
                ) : (
                  <div className="text-center text-sm text-amber-600 dark:text-amber-400 mt-4">
                    <Flame size={16} className="inline-block mr-1" />
                    <span>You've started your journey! Every goal counts!</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Focus Goal */}
          {focusGoal && (
            <div className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-600">
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 border-b border-amber-100 dark:border-amber-800">
                <h4 className="flex items-center gap-2 mb-1 text-slate-800 dark:text-slate-200 font-medium">
                  <Target size={16} className="text-amber-500" />
                  <span>Priority Goal</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Focus on this goal next
                </p>
              </div>
              
              <div className="p-4">
                <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-1">{focusGoal.title}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {getCategoryName(focusGoal.category)}
                  </span>
                  
                  {focusGoal.targetDate && (
                    <span className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Calendar size={12} />
                      <span>{formatRelativeDate(focusGoal.targetDate)}</span>
                    </span>
                  )}
                </div>
                
                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 dark:bg-amber-600 rounded-full"
                      style={{ 
                        width: `${focusGoal.progressType === 'percentage' ? focusGoal.progress :
                                focusGoal.progressType === 'counter' ? (focusGoal.currentValue / focusGoal.targetValue) * 100 :
                                focusGoal.progressType === 'milestone' ? (focusGoal.completedMilestones / focusGoal.milestones?.length) * 100 :
                                10}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Upcoming Goals - Simplified */}
          <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600">
            <div className="p-3 border-b border-slate-200 dark:border-slate-600">
              <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calendar size={16} className="text-amber-500" />
                <span>Coming Up</span>
              </h4>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-slate-600 max-h-48 overflow-y-auto">
              {getUpcomingGoals().map(goal => {
                const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isNearDeadline = daysLeft >= 0 && daysLeft <= 3;
                
                return (
                  <div key={goal.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        daysLeft < 0 ? 'bg-red-500' : 
                        isNearDeadline ? 'bg-amber-500' : 
                        'bg-green-500'
                      }`}></div>
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {goal.title}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs whitespace-nowrap ${
                      daysLeft < 0 ? 'text-red-500' : 
                      isNearDeadline ? 'text-amber-500' : 
                      'text-green-500'
                    }`}>
                      {formatRelativeDate(goal.targetDate)}
                    </div>
                  </div>
                );
              })}
              
              {getUpcomingGoals().length === 0 && (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  No upcoming goals. Set target dates to see them here.
                </div>
              )}
            </div>
          </div>
          
          {/* Goal Setting Tips */}
          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-600">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-amber-500" />
              <span>Quick Tips</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-1 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">1</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">Break big goals into smaller milestones</p>
              </div>
              
              <div className="flex gap-2">
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-1 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">2</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">Update your progress regularly to stay motivated</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeView === 'analytics' && (
        <>
          {/* Analytics Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 p-2"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 p-2"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {/* Categories Distribution */}
          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 mb-6">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Top Categories
            </h4>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={getCategoryData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                  <XAxis type="number" domain={[0, 'auto']} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} goals`, 'Count']}
                    labelFormatter={(value) => `Category: ${value}`}
                  />
                  <Bar dataKey="goals" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Completion Trend */}
          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Completion Trend
            </h4>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getCompletionTrendData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value) => [`${value} goals`, 'Completed']}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed Goals"
                    stroke="#f59e0b"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GoalAnalytics;