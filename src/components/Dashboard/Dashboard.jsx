// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, DollarSign, Activity, Heart, Droplets, 
  Target, Brain, CheckCircle, Flame, TrendingUp, TrendingDown,
  Calendar, Clock, Zap, Coffee, Moon as SleepIcon, Utensils, 
  ChevronRight, PlayCircle, PauseCircle, BarChart3,
  Award, AlertCircle, Star, Sparkles, Plus, ChevronDown,
  ChevronUp, RefreshCw, Home
} from 'lucide-react';
import { getStorage } from '../../utils/storage';
import { formatDateForStorage } from '../../utils/dateUtils';
import { getFoodEntries } from '../../utils/nutritionUtils';
import { getWorkoutsForDate } from '../../utils/workoutUtils';
import { getMeditationStats } from '../../utils/meditationStorage';
import { getFinanceData, calculateFinancialStats } from '../../utils/financeUtils';

const Dashboard = ({ onNavigate, currentMonth = new Date() }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [currentMonth]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const storage = getStorage();
      const today = formatDateForStorage(new Date());
      const yesterday = formatDateForStorage(new Date(Date.now() - 24 * 60 * 60 * 1000));
      
      // Get today's data
      const todayData = storage[today] || {};
      const yesterdayData = storage[yesterday] || {};

      // Calculate finance stats
      const financeData = getFinanceData();
      const financeStats = calculateFinancialStats();
      const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
      const monthlyTransactions = financeData.transactions.filter(t => t.date.startsWith(currentMonth));
      const monthlySpent = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const todaySpent = financeData.transactions
        .filter(t => t.date === today && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Get nutrition data
      const nutritionEntries = getFoodEntries(today);
      const waterIntake = storage.nutrition?.[today]?.waterIntake || 0;
      const caloriesConsumed = nutritionEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);

      // Get workout data
      const todayWorkouts = getWorkoutsForDate(today);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      let weeklyWorkoutMinutes = 0;
      let weeklyCaloriesBurned = 0;
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        const dayStr = formatDateForStorage(day);
        const dayWorkouts = getWorkoutsForDate(dayStr);
        weeklyWorkoutMinutes += dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        weeklyCaloriesBurned += dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
      }

      // Check if workout is due today (no workouts completed and it's not too late in the day)
      const hour = new Date().getHours();
      const isWorkoutDue = todayWorkouts.length === 0 && hour < 20; // Before 8 PM

      // Get sleep data
      const sleepData = todayData.sleep || {};
      const yesterdaySleep = yesterdayData.sleep || {};

      // Get habits data - ONLY TODAY'S SCHEDULED HABITS
      const habits = storage.habitSettings?.habits || [];
      const todayHabits = todayData.habitProgress || {};
      
      // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
      const todayDayOfWeek = new Date().getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDayName = dayNames[todayDayOfWeek];
      
      // Filter habits scheduled for today
      const todaysScheduledHabits = habits.filter(habit => {
        if (!habit.schedule || !habit.schedule.days) return false;
        return habit.schedule.days[todayDayName] === true;
      });
      
      const completedHabits = todaysScheduledHabits.filter(h => todayHabits[h.id]?.completed).length;
      const pendingHabits = todaysScheduledHabits.filter(h => !todayHabits[h.id]?.completed).slice(0, 5);
      
      // Calculate longest streak from ALL habits (not just today's)
      let longestStreak = 0;
      let streakHabit = '';
      habits.forEach(habit => {
        const streak = calculateHabitStreak(habit.id, storage);
        if (streak > longestStreak) {
          longestStreak = streak;
          streakHabit = habit.name;
        }
      });

      // Get tasks data - SIMPLIFIED TASK NAMES
      const tasksData = todayData.checked || {};
      const incompleteTasks = Object.entries(tasksData)
        .filter(([key, completed]) => !completed)
        .map(([key]) => {
          // Clean up task name - remove category prefix if present
          let taskName = key;
          if (key.includes('|')) {
            // New format with category|task - extract just the task part
            taskName = key.split('|')[1] || key;
          }
          // Remove underscores and clean up formatting
          taskName = taskName.replace(/_/g, ' ');
          // Capitalize first letter
          taskName = taskName.charAt(0).toUpperCase() + taskName.slice(1);
          
          return { id: key, name: taskName };
        })
        .slice(0, 5);

      // Calculate tasks completed/total  
      const tasksCompleted = todayData.checked ? Object.values(todayData.checked).filter(Boolean).length : 0;
      const totalTasks = todayData.checked ? Object.keys(todayData.checked).length : 0;
      const priorityTasks = todayData.checked ? 
        Object.entries(todayData.checked).filter(([key, val]) => !val && key.includes('priority')).length : 0;

      // Get mood data
      const moodEntries = todayData.mood || {};
      const morningMood = moodEntries.morning?.mood || 0;
      const currentEnergy = moodEntries.evening?.energy || moodEntries.morning?.energy || 0;

      // Get meditation stats
      const meditationStats = getMeditationStats();

      // Get focus data
      const focusData = todayData.focus || {};
      const todayFocusMinutes = focusData.totalMinutes || 0;
      const focusSessions = focusData.sessions?.length || 0;

      // Get upcoming reminders/events
      const upcomingEvent = getNextUpcomingEvent(storage);

      setDashboardData({
        finance: {
          monthlySpent: monthlySpent,
          monthlyBudget: financeStats.monthlyBudget || 3000,
          todaySpent: todaySpent,
          trend: todaySpent > (storage.finance?.dailyAverage || 0) ? 'up' : 'down'
        },
        workout: {
          weeklyMinutes: weeklyWorkoutMinutes,
          weeklyGoal: 300,
          todayCompleted: todayWorkouts.length > 0,
          lastWorkout: getLastWorkoutDate(storage),
          caloriesBurned: weeklyCaloriesBurned,
          isDue: isWorkoutDue
        },
        sleep: {
          lastNightHours: yesterdaySleep.duration || 0,
          averageHours: calculateAverageSleep(storage),
          quality: yesterdaySleep.quality || 'unknown',
          trend: 'stable'
        },
        nutrition: {
          caloriesConsumed: caloriesConsumed,
          caloriesGoal: 2000,
          waterIntake: waterIntake,
          waterGoal: 8,
          mealsLogged: nutritionEntries.length
        },
        habits: {
          todayCompleted: completedHabits,
          todayTotal: todaysScheduledHabits.length,
          longestStreak: longestStreak,
          streakHabit: streakHabit,
          pendingHabits: pendingHabits
        },
        mood: {
          morningMood: morningMood,
          currentEnergy: currentEnergy,
          weekAverage: calculateWeeklyMoodAverage(storage)
        },
        tasks: {
          completed: tasksCompleted,
          total: totalTasks,
          priority: priorityTasks,
          upcoming: upcomingEvent,
          incomplete: incompleteTasks
        },
        focus: {
          todayMinutes: todayFocusMinutes,
          sessions: focusSessions,
          averageSession: focusSessions > 0 ? Math.round(todayFocusMinutes / focusSessions) : 0
        },
        meditation: {
          totalSessions: meditationStats.totalSessions,
          totalMinutes: meditationStats.totalMinutes,
          todaySessions: getTodayMeditationSessions(storage)
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const calculateHabitStreak = (habitId, storage) => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDateForStorage(date);
      const dayData = storage[dateStr];
      
      if (dayData?.habitProgress?.[habitId]?.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateAverageSleep = (storage) => {
    const last7Days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDateForStorage(date);
      const sleepData = storage[dateStr]?.sleep;
      if (sleepData?.duration) {
        last7Days.push(sleepData.duration);
      }
    }
    return last7Days.length > 0 ? (last7Days.reduce((a, b) => a + b) / last7Days.length).toFixed(1) : 0;
  };

  const calculateWeeklyMoodAverage = (storage) => {
    const moodValues = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDateForStorage(date);
      const dayData = storage[dateStr];
      if (dayData?.mood?.morning?.mood) moodValues.push(dayData.mood.morning.mood);
      if (dayData?.mood?.evening?.mood) moodValues.push(dayData.mood.evening.mood);
    }
    return moodValues.length > 0 ? (moodValues.reduce((a, b) => a + b) / moodValues.length).toFixed(1) : 0;
  };

  const getLastWorkoutDate = (storage) => {
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDateForStorage(date);
      const workouts = getWorkoutsForDate(dateStr);
      if (workouts.length > 0) {
        return i === 1 ? 'yesterday' : `${i} days ago`;
      }
    }
    return 'over a month ago';
  };

  const getTodayMeditationSessions = (storage) => {
    const today = formatDateForStorage(new Date());
    const meditationData = storage.meditationData || {};
    const todaySessions = (meditationData.sessions || []).filter(s => 
      formatDateForStorage(new Date(s.timestamp)) === today
    );
    return todaySessions.length;
  };

  const getNextUpcomingEvent = (storage) => {
    // This is a placeholder - you can implement based on your reminder/calendar system
    return 'Review weekly goals';
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleModuleClick = (module) => {
    if (onNavigate) {
      onNavigate(module);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMoodEmoji = (mood) => {
    if (mood >= 4.5) return '😊';
    if (mood >= 3.5) return '🙂';
    if (mood >= 2.5) return '😐';
    if (mood >= 1.5) return '😕';
    return '😢';
  };

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-300">Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-500 dark:text-red-400 mx-auto mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-300">Unable to load dashboard data</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-2">
              {getGreeting()} ✨
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <button
            onClick={loadDashboardData}
            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="text-blue-500 dark:text-blue-400" size={24} />
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          
          {/* Quick Stats Row */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            
            {/* Mood Check */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                 onClick={() => handleModuleClick('overview')}>
              <div className="flex items-center justify-between mb-2">
                <Heart className="text-pink-500" size={20} />
                <span className="text-2xl">{getMoodEmoji(dashboardData.mood.morningMood)}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Today's Mood</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {dashboardData.mood.morningMood || 'Not set'}/5
              </p>
            </div>

            {/* Energy Level */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                 onClick={() => handleModuleClick('overview')}>
              <div className="flex items-center justify-between mb-2">
                <Zap className="text-yellow-500" size={20} />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < dashboardData.mood.currentEnergy 
                          ? 'bg-yellow-500' 
                          : 'bg-slate-200 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Energy</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {dashboardData.mood.currentEnergy || 0}/5
              </p>
            </div>

            {/* Task Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                 onClick={() => handleModuleClick('overview')}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                  {dashboardData.tasks.total > 0 ? Math.round((dashboardData.tasks.completed / dashboardData.tasks.total) * 100) : 0}%
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Tasks Done</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {dashboardData.tasks.completed}/{dashboardData.tasks.total}
              </p>
            </div>

            {/* Focus Time */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                 onClick={() => handleModuleClick('focus')}>
              <div className="flex items-center justify-between mb-2">
                <Brain className="text-purple-500" size={20} />
                <PlayCircle className="text-purple-400" size={16} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Focus Time</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {dashboardData.focus.todayMinutes}m
              </p>
            </div>
          </div>

          {/* Today's Action Items */}
          <div className="md:col-span-2 lg:col-span-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Target className="text-blue-500" size={24} />
              Today's Action Items
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Due Habits - ONLY TODAY'S SCHEDULED HABITS */}
              {dashboardData.habits.pendingHabits.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-purple-500 rounded-lg">
                      <Target className="text-white" size={16} />
                    </div>
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">Due Today</h3>
                    <span className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 rounded-full">
                      {dashboardData.habits.pendingHabits.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {dashboardData.habits.pendingHabits.slice(0, 3).map((habit, index) => (
                      <div key={habit.id} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <span className="text-purple-700 dark:text-purple-300 truncate">{habit.name}</span>
                      </div>
                    ))}
                    {dashboardData.habits.pendingHabits.length > 3 && (
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        +{dashboardData.habits.pendingHabits.length - 3} more
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleModuleClick('habits')}
                    className="mt-3 w-full text-xs py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Complete Habits
                  </button>
                </div>
              )}

              {/* No Habits Scheduled Today */}
              {dashboardData.habits.pendingHabits.length === 0 && dashboardData.habits.todayTotal === 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-slate-400 rounded-lg">
                      <Target className="text-white" size={16} />
                    </div>
                    <h3 className="font-semibold text-slate-600 dark:text-slate-300">No Habits Today</h3>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    No habits scheduled for today. Take a rest day or add new habits!
                  </p>
                  
                  <button
                    onClick={() => handleModuleClick('habits')}
                    className="w-full text-xs py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors"
                  >
                    Manage Habits
                  </button>
                </div>
              )}

              {/* Workout Due */}
              {dashboardData.workout.isDue && (
                <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-800/30 rounded-2xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-orange-500 rounded-lg">
                      <Activity className="text-white" size={16} />
                    </div>
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">Workout Due</h3>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  </div>
                  
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    You haven't worked out today yet. Ready to get moving?
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleModuleClick('workout')}
                      className="w-full text-xs py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Start Workout
                    </button>
                  </div>
                </div>
              )}

              {/* Incomplete Tasks */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Today's Tasks</h3>
                  {dashboardData.tasks.incomplete.length > 0 && (
                    <span className="text-xs px-2 py-1 bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 rounded-full">
                      {dashboardData.tasks.incomplete.length}
                    </span>
                  )}
                </div>
                
                {dashboardData.tasks.incomplete.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData.tasks.incomplete.slice(0, 3).map((task, index) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-blue-700 dark:text-blue-300 truncate">{task.name}</span>
                      </div>
                    ))}
                    {dashboardData.tasks.incomplete.length > 3 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        +{dashboardData.tasks.incomplete.length - 3} more pending
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleModuleClick('overview')}
                      className="mt-3 w-full text-xs py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      View All Tasks
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      No tasks for today yet. Ready to plan your day?
                    </p>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => handleModuleClick('overview')}
                        className="w-full text-xs py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Create Tasks
                      </button>
                      <button
                        onClick={() => handleModuleClick('templates')}
                        className="w-full text-xs py-2 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                      >
                        Use Templates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Overview - Enhanced Design */}
          <div className="md:col-span-1 lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden border border-slate-200 dark:border-slate-700"
               onClick={() => handleModuleClick('finance')}>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-bl-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <DollarSign className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Finance</h3>
                </div>
                <ChevronRight className="text-slate-400" size={20} />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Monthly Budget</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      €{dashboardData.finance.monthlySpent.toFixed(0)} / €{dashboardData.finance.monthlyBudget}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 relative overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        getProgressColor((dashboardData.finance.monthlySpent / dashboardData.finance.monthlyBudget) * 100)
                      }`}
                      style={{
                        width: `${Math.min((dashboardData.finance.monthlySpent / dashboardData.finance.monthlyBudget) * 100, 100)}%`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {Math.round((dashboardData.finance.monthlySpent / dashboardData.finance.monthlyBudget) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <span className="text-sm text-green-700 dark:text-green-300">Today's Spending</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-800 dark:text-green-200">
                      €{dashboardData.finance.todaySpent.toFixed(2)}
                    </span>
                    {dashboardData.finance.trend === 'up' ? (
                      <TrendingUp className="text-red-500" size={16} />
                    ) : (
                      <TrendingDown className="text-green-500" size={16} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workout Status - Enhanced Design */}
          <div className="md:col-span-1 lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
               onClick={() => handleModuleClick('workout')}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Activity className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Fitness</h3>
                </div>
                <div className="flex items-center gap-2">
                  {dashboardData.workout.isDue && (
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  )}
                  <ChevronRight className="text-slate-400" size={20} />
                </div>
              </div>
              
              <div className="space-y-4">
                {dashboardData.workout.isDue && (
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <AlertCircle className="text-orange-500" size={16} />
                    <span className="text-sm text-orange-700 dark:text-orange-300">
                      🏃‍♂️ Ready for today's workout?
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {dashboardData.workout.weeklyMinutes}m
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">This Week</p>
                    <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-1 mt-2">
                      <div
                        className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((dashboardData.workout.weeklyMinutes / dashboardData.workout.weeklyGoal) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {dashboardData.workout.caloriesBurned}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">Calories Burned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sleep & Nutrition Row - Enhanced Designs */}
          <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sleep Tracker - Card Style */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-white"
                 onClick={() => handleModuleClick('overview')}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <SleepIcon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold">Sleep Quality</h3>
                </div>
                <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  {dashboardData.sleep.quality}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-2xl font-bold mb-1">
                    {dashboardData.sleep.lastNightHours}h
                  </p>
                  <p className="text-xs text-white/80">Last Night</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-2xl font-bold mb-1">
                    {dashboardData.sleep.averageHours}h
                  </p>
                  <p className="text-xs text-white/80">7-Day Average</p>
                </div>
              </div>
            </div>

            {/* Nutrition Overview - Enhanced */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700"
                 onClick={() => handleModuleClick('nutrition')}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                    <Utensils className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Nutrition</h3>
                </div>
                <span className="text-xs px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full">
                  {dashboardData.nutrition.mealsLogged} meals
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">Calories Today</span>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    {dashboardData.nutrition.caloriesConsumed} / {dashboardData.nutrition.caloriesGoal}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Droplets className="text-blue-500" size={20} />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Water:</span>
                  <div className="flex gap-1 flex-1">
                    {[...Array(dashboardData.nutrition.waterGoal)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i < dashboardData.nutrition.waterIntake 
                            ? 'bg-blue-500' 
                            : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {dashboardData.nutrition.waterIntake}/{dashboardData.nutrition.waterGoal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Habits & Meditation Row - Updated with varied styles */}
          <div className="md:col-span-1 lg:col-span-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-white"
               onClick={() => handleModuleClick('habits')}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Target className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold">Today's Habits</h3>
              </div>
              <ChevronRight className="text-white/70" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/90">Today's Progress</span>
                <span className="text-xl font-bold">
                  {dashboardData.habits.todayCompleted}/{dashboardData.habits.todayTotal}
                </span>
              </div>
              
              {dashboardData.habits.todayTotal > 0 ? (
                <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${(dashboardData.habits.todayCompleted / dashboardData.habits.todayTotal) * 100}%`
                    }}
                  >
                    <span className="text-purple-600 text-xs font-bold">
                      {Math.round((dashboardData.habits.todayCompleted / dashboardData.habits.todayTotal) * 100)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-white/80">
                    🎯 No habits scheduled for today - enjoy your rest day!
                  </span>
                </div>
              )}
              
              {dashboardData.habits.longestStreak > 0 && (
                <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Award className="text-yellow-300" size={16} />
                  <div>
                    <p className="text-sm font-medium">
                      🔥 {dashboardData.habits.longestStreak} day streak
                    </p>
                    <p className="text-xs text-white/80">
                      {dashboardData.habits.streakHabit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meditation & Mindfulness - Redesigned */}
          <div className="md:col-span-1 lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700"
               onClick={() => handleModuleClick('meditation')}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Brain className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Mindfulness</h3>
              </div>
              <ChevronRight className="text-slate-400" size={20} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboardData.meditation.todaySessions}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Today's Sessions</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {Math.round(dashboardData.meditation.totalMinutes / 60) || 0}h
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">Total Hours</p>
              </div>
            </div>
            
            {dashboardData.meditation.todaySessions === 0 && (
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <Sparkles className="text-blue-500" size={16} />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Take a moment for mindfulness today ✨
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 lg:col-span-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleModuleClick('stats')}
                  className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <BarChart3 size={20} className="mx-auto mb-2" />
                  <span className="text-sm font-medium">View Stats</span>
                </button>
                
                <button
                  onClick={() => handleModuleClick('meditation')}
                  className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Brain size={20} className="mx-auto mb-2" />
                  <span className="text-sm font-medium">Meditate</span>
                </button>
                
                <button
                  onClick={() => handleModuleClick('coach')}
                  className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Coffee size={20} className="mx-auto mb-2" />
                  <span className="text-sm font-medium">Day Coach</span>
                </button>
                
                <button
                  onClick={() => handleModuleClick('notes')}
                  className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Flame size={20} className="mx-auto mb-2" />
                  <span className="text-sm font-medium">Quick Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;