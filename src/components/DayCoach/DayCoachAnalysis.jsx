import React, { useState, useEffect } from 'react';
import { 
  BarChart2, PieChart, LineChart, TrendingUp, TrendingDown, RefreshCw,
  Zap, Award, Calendar, Clock, Smile, Brain, Dumbbell, Heart, Info,
  CheckSquare, AlertTriangle
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { BarChart, PieChart as RechartsPieChart, LineChart as RechartsLineChart, 
         Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
         ResponsiveContainer, Cell } from 'recharts';

const DayCoachAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('mood'); // mood, focus, habits, workouts
  const [timeRange, setTimeRange] = useState('month'); // week, month, all
  
  // Load analysis data
  useEffect(() => {
    loadAnalysis();
  }, [timeRange]);
  
  const loadAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const storage = getStorage();
      
      // Get cached summaries if they exist
      const cachedSummaries = storage.dayCoachSummaries || {
        weeklySummaries: {},
        monthlySummaries: {},
        lastSummarized: null
      };
      
      // Get recent data
      const recentData = getRecentData(storage);
      
      // Compile mood data
      const moodData = compileMoodData(recentData, cachedSummaries, timeRange);
      
      // Get focus session data
      const focusSessions = storage.focusSessions || [];
      
      // Get habit data
      const habits = storage.habits || [];
      
      // Get workout data
      const workouts = storage.completedWorkouts || [];
      
      // Compile analysis data
      setAnalysis({
        mood: moodData,
        focus: processFocusData(focusSessions, timeRange),
        habits: processHabitData(habits, timeRange),
        workouts: processWorkoutData(workouts, timeRange)
      });
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get recent data for analysis
  const getRecentData = (storage) => {
    const today = new Date();
    const result = {};
    
    // Get data from the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (storage[dateStr]) {
        result[dateStr] = storage[dateStr];
      }
    }
    
    return result;
  };
  
  // Compile mood data from recent data and summaries
  const compileMoodData = (recentData, summaries, timeRange) => {
    const moodTrends = [];
    const insights = [];
    
    // Add mood data from recent days
    Object.entries(recentData).forEach(([dateStr, dayData]) => {
      if (dayData.morningMood || dayData.eveningMood) {
        moodTrends.push({
          date: dateStr,
          day: new Date(dateStr).getDate(),
          morningMood: moodToNumber(dayData.morningMood),
          eveningMood: moodToNumber(dayData.eveningMood),
          morningEnergy: dayData.morningEnergy,
          eveningEnergy: dayData.eveningEnergy,
          hadWorkout: !!(dayData.workout || (dayData.workouts && dayData.workouts.length > 0)),
          hadJournal: !!dayData.notes,
          taskCompletion: calculateTaskCompletion(dayData)
        });
      }
    });
    
    // Sort by date
    moodTrends.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add insights from weekly summaries if timeRange is 'month' or 'all'
    if (timeRange === 'month' || timeRange === 'all') {
      // Get the last 4 weeks of summaries
      const weeklySummaries = Object.entries(summaries.weeklySummaries || {})
        .sort(([a], [b]) => b.localeCompare(a)) // Sort by week key (descending)
        .slice(0, 4);
      
      weeklySummaries.forEach(([weekKey, summary]) => {
        if (summary && summary.moodPattern) {
          insights.push({
            type: 'weeklyMood',
            text: `${weekKey}: ${summary.moodPattern}`,
            weekKey
          });
        }
        
        if (summary && summary.achievements && summary.achievements.length > 0) {
          insights.push({
            type: 'weeklyAchievements',
            text: `Achievements in ${weekKey}: ${summary.achievements.join(', ')}`,
            weekKey
          });
        }
      });
    }
    
    // Add insights from monthly summaries if timeRange is 'all'
    if (timeRange === 'all') {
      // Get the last 3 months of summaries
      const monthlySummaries = Object.entries(summaries.monthlySummaries || {})
        .sort(([a], [b]) => b.localeCompare(a)) // Sort by month key (descending)
        .slice(0, 3);
      
      monthlySummaries.forEach(([monthKey, summary]) => {
        if (summary && summary.keyInsight) {
          insights.push({
            type: 'monthlyInsight',
            text: `${monthKey}: ${summary.keyInsight}`,
            monthKey
          });
        }
        
        if (summary && summary.dominantMood) {
          insights.push({
            type: 'monthlyMood',
            text: `Dominant mood in ${monthKey}: ${summary.dominantMood}`,
            monthKey
          });
        }
      });
    }
    
    // Analyze mood patterns in recent data
    if (moodTrends.length >= 3) {
      // Check for morning vs evening mood patterns
      const morningMoods = moodTrends.filter(d => d.morningMood).map(d => d.morningMood);
      const eveningMoods = moodTrends.filter(d => d.eveningMood).map(d => d.eveningMood);
      
      if (morningMoods.length > 3 && eveningMoods.length > 3) {
        const avgMorning = morningMoods.reduce((sum, val) => sum + val, 0) / morningMoods.length;
        const avgEvening = eveningMoods.reduce((sum, val) => sum + val, 0) / eveningMoods.length;
        
        if (Math.abs(avgMorning - avgEvening) > 0.5) {
          insights.push({
            type: 'morningVsEvening',
            text: avgMorning > avgEvening 
              ? "You typically have a better mood in the morning than in the evening."
              : "Your mood tends to improve as the day progresses.",
            difference: Math.abs(avgMorning - avgEvening).toFixed(1)
          });
        }
      }
      
      // Check for workout correlation
      const workoutDays = moodTrends.filter(d => d.hadWorkout);
      const nonWorkoutDays = moodTrends.filter(d => !d.hadWorkout);
      
      if (workoutDays.length > 2 && nonWorkoutDays.length > 2) {
        const avgWorkoutMood = workoutDays
          .map(d => Math.max(d.morningMood || 0, d.eveningMood || 0))
          .reduce((sum, val) => sum + val, 0) / workoutDays.length;
        
        const avgNonWorkoutMood = nonWorkoutDays
          .map(d => Math.max(d.morningMood || 0, d.eveningMood || 0))
          .reduce((sum, val) => sum + val, 0) / nonWorkoutDays.length;
        
        if (Math.abs(avgWorkoutMood - avgNonWorkoutMood) > 0.3) {
          insights.push({
            type: 'workoutImpact',
            text: avgWorkoutMood > avgNonWorkoutMood
              ? "Your mood tends to be better on days when you work out."
              : "Interestingly, your mood appears to be better on days without workouts.",
            difference: Math.abs(avgWorkoutMood - avgNonWorkoutMood).toFixed(1)
          });
        }
      }
    }
    
    return {
      moodData: moodTrends,
      insights,
      notEnoughData: moodTrends.length < 3
    };
  };
  
  // Process focus session data
  const processFocusData = (focusSessions, timeRange) => {
    if (!focusSessions || focusSessions.length === 0) {
      return { notEnoughData: true, insights: [] };
    }
    
    // Sort sessions by date
    const sortedSessions = [...focusSessions].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );
    
    // Filter based on time range
    const filteredSessions = filterByTimeRange(sortedSessions, timeRange, 'startTime');
    
    if (filteredSessions.length < 3) {
      return { notEnoughData: true, insights: [] };
    }
    
    // Extract daily focus times
    const focusByDay = {};
    filteredSessions.forEach(session => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      
      if (!focusByDay[date]) {
        focusByDay[date] = {
          date,
          duration: 0,
          sessions: 0,
          interruptions: 0
        };
      }
      
      focusByDay[date].duration += session.duration || 0;
      focusByDay[date].sessions += 1;
      focusByDay[date].interruptions += session.interruptionsCount || 0;
    });
    
    // Convert to array
    const focusData = Object.values(focusByDay).map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgDuration: Math.round(day.duration / day.sessions),
      avgInterruptions: day.interruptions / day.sessions
    }));
    
    // Calculate insights
    const insights = [];
    
    // Calculate average focus time per session
    const avgFocusTime = Math.round(
      filteredSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 
      filteredSessions.length
    );
    
    insights.push({
      type: 'avgFocusTime',
      text: `Your average focus session lasts ${Math.floor(avgFocusTime / 60)} minutes.`,
      value: avgFocusTime
    });
    
    // Calculate most productive time of day
    const hourCounts = Array(24).fill(0);
    const hourDurations = Array(24).fill(0);
    
    filteredSessions.forEach(session => {
      if (!session.startTime) return;
      
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour]++;
      hourDurations[hour] += session.duration || 0;
    });
    
    const mostProductiveHour = hourDurations.indexOf(Math.max(...hourDurations));
    
    insights.push({
      type: 'mostProductiveTime',
      text: `Your most productive hour is ${formatHour(mostProductiveHour)}.`,
      hour: mostProductiveHour
    });
    
    // Calculate interruption patterns
    const sessions = filteredSessions.filter(s => s.interruptionsCount !== undefined);
    if (sessions.length > 0) {
      const totalInterruptions = sessions.reduce((sum, s) => sum + (s.interruptionsCount || 0), 0);
      const avgInterruptions = totalInterruptions / sessions.length;
      
      insights.push({
        type: 'interruptions',
        text: `You average ${avgInterruptions.toFixed(1)} interruptions per focus session.`,
        value: avgInterruptions
      });
    }
    
    return {
      notEnoughData: false,
      insights,
      focusData,
      hourlyData: hourDurations.map((duration, hour) => ({
        hour,
        duration,
        count: hourCounts[hour]
      }))
    };
  };
  
  // Process habit data
  const processHabitData = (habits, timeRange) => {
    if (!habits || habits.length === 0) {
      return { notEnoughData: true, insights: [] };
    }
    
    // Identify active habits
    const activeHabits = habits.filter(h => h.stats && h.stats.streakCurrent > 0);
    
    if (activeHabits.length === 0) {
      return { notEnoughData: true, insights: [] };
    }
    
    // Calculate insights
    const insights = [];
    
    // Best streak
    const bestStreakHabit = [...habits].sort((a, b) => 
      (b.stats?.streakCurrent || 0) - (a.stats?.streakCurrent || 0)
    )[0];
    
    if (bestStreakHabit && bestStreakHabit.stats && bestStreakHabit.stats.streakCurrent > 0) {
      insights.push({
        type: 'bestStreak',
        text: `Your longest current streak is ${bestStreakHabit.stats.streakCurrent} days with "${bestStreakHabit.name}".`,
        habit: bestStreakHabit
      });
    }
    
    // Completion rate
    const avgCompletionRate = habits.reduce(
      (sum, h) => sum + (h.stats?.completionRate || 0), 0
    ) / habits.length;
    
    insights.push({
      type: 'completionRate',
      text: `Your overall habit completion rate is ${Math.round(avgCompletionRate * 100)}%.`,
      value: avgCompletionRate
    });
    
    // Prepare data for visualization
    const habitCompletionData = habits.map(habit => ({
      name: habit.name,
      streak: habit.stats?.streakCurrent || 0,
      completed: habit.stats?.totalCompletions || 0,
      rate: habit.stats?.completionRate || 0,
      longestStreak: habit.stats?.streakLongest || 0
    }));
    
    return {
      notEnoughData: false,
      insights,
      habitData: habitCompletionData
    };
  };
  
  // Process workout data
  const processWorkoutData = (workouts, timeRange) => {
    if (!workouts || workouts.length === 0) {
      return { notEnoughData: true, insights: [] };
    }
    
    // Filter based on time range
    const filteredWorkouts = filterByTimeRange(workouts, timeRange, 'completedAt');
    
    if (filteredWorkouts.length < 2) {
      return { notEnoughData: true, insights: [] };
    }
    
    // Calculate insights
    const insights = [];
    
    // Total workout time
    const totalDuration = filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    
    insights.push({
      type: 'totalWorkoutTime',
      text: `You've spent ${Math.floor(totalDuration / 60)} hours and ${totalDuration % 60} minutes working out.`,
      value: totalDuration
    });
    
    // Most common workout type
    const typeCounts = {};
    filteredWorkouts.forEach(workout => {
      if (workout.types && workout.types.length > 0) {
        workout.types.forEach(type => {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
      } else if (workout.type) {
        typeCounts[workout.type] = (typeCounts[workout.type] || 0) + 1;
      }
    });
    
    if (Object.keys(typeCounts).length > 0) {
      const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
      
      insights.push({
        type: 'favoriteWorkout',
        text: `Your most common workout type is ${mostCommonType.toLowerCase()}.`,
        workoutType: mostCommonType
      });
    }
    
    // Average workout duration
    const avgDuration = totalDuration / filteredWorkouts.length;
    
    insights.push({
      type: 'avgWorkoutDuration',
      text: `Your average workout duration is ${Math.floor(avgDuration)} minutes.`,
      value: avgDuration
    });
    
    // Prepare data for visualization
    const workoutByDay = {};
    filteredWorkouts.forEach(workout => {
      let date;
      if (workout.date) {
        date = workout.date;
      } else if (workout.completedAt) {
        date = new Date(workout.completedAt).toISOString().split('T')[0];
      } else {
        date = new Date().toISOString().split('T')[0]; // Fallback
      }
      
      if (!workoutByDay[date]) {
        workoutByDay[date] = {
          date,
          duration: 0,
          calories: 0,
          count: 0
        };
      }
      
      workoutByDay[date].duration += workout.duration || 0;
      workoutByDay[date].calories += parseInt(workout.calories) || 0;
      workoutByDay[date].count += 1;
    });
    
    // Convert to array and format dates
    const workoutData = Object.values(workoutByDay).map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
    
    // Type distribution data
    const typeData = Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
    
    return {
      notEnoughData: false,
      insights,
      workoutData,
      typeData
    };
  };
  
  // Helper functions
  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  
  const filterByTimeRange = (data, range, dateField) => {
    const now = new Date();
    let startDate;
    
    switch (range) {
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
      default:
        return data; // No filtering for 'all'
    }
    
    return data.filter(item => {
      let itemDate;
      
      if (item.date && typeof item.date === 'string') {
        itemDate = new Date(item.date);
      } else if (item[dateField]) {
        itemDate = new Date(item[dateField]);
      } else {
        return false; // Skip items without date
      }
      
      return itemDate >= startDate && itemDate <= now;
    });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Analyzing your data...</p>
      </div>
    );
  }
  
  // Convert mood string to number for calculations
  const moodToNumber = (mood) => {
    if (!mood) return null;
    
    switch (mood) {
      case 'GREAT': return 5;
      case 'GOOD': return 4;
      case 'OKAY': return 3;
      case 'MEH': return 2;
      case 'BAD': return 1;
      case 'OVERWHELMED': return 0;
      default: return null;
    }
  };
  
  // Calculate task completion for a day
  const calculateTaskCompletion = (dayData) => {
    if (!dayData.checked) return null;
    
    const totalTasks = Object.keys(dayData.checked).length;
    if (totalTasks === 0) return null;
    
    const completedTasks = Object.values(dayData.checked).filter(Boolean).length;
    return Math.round((completedTasks / totalTasks) * 100);
  };
  
  // Mood Analysis UI
  const renderMoodAnalysis = () => {
    const moodData = analysis?.mood;
    
    if (!moodData || moodData.notEnoughData) {
      return (
        <div className="text-center py-8">
          <Smile size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Not Enough Mood Data
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Track your mood for at least a week to see insights and patterns. Your day coach will analyze how your activities affect your wellbeing.
          </p>
        </div>
      );
    }
    
    // Prepare data for mood trend chart
    const moodTrendData = moodData.moodData.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      morningMood: day.morningMood,
      eveningMood: day.eveningMood,
      morningEnergy: day.morningEnergy,
      eveningEnergy: day.eveningEnergy,
      hadWorkout: day.hadWorkout ? 1 : 0,
      taskCompletion: day.taskCompletion || 0
    })).filter(day => day.morningMood !== null || day.eveningMood !== null);
    
    const MOOD_COLORS = {
      morningMood: "#3b82f6", // blue
      eveningMood: "#8b5cf6", // purple
      morningEnergy: "#10b981", // green
      eveningEnergy: "#f59e0b" // amber
    };
    
    return (
      <div>
        {/* Insights Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
            Mood & Wellbeing Insights
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moodData.insights.map((insight, index) => (
              <div key={index} className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'morningVsEvening' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                    insight.type === 'workoutImpact' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' :
                    insight.type === 'taskCompletionImpact' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                    insight.type === 'weeklyMood' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' :
                    insight.type === 'monthlyMood' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' :
                    'bg-slate-100 dark:bg-slate-600/40 text-slate-600 dark:text-slate-400'
                  }`}>
                    {insight.type === 'morningVsEvening' ? <Clock size={20} /> :
                     insight.type === 'workoutImpact' ? <Dumbbell size={20} /> :
                     insight.type === 'taskCompletionImpact' ? <CheckSquare size={20} /> :
                     insight.type === 'weeklyMood' || insight.type === 'monthlyMood' ? <Calendar size={20} /> :
                     <Heart size={20} />}
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">{insight.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {moodData.insights.length === 0 && (
              <div className="col-span-1 sm:col-span-2 bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-center">
                  No significant mood insights yet. Continue tracking to reveal patterns.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Mood Trend Chart */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4">
            Mood & Energy Trends
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moodTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="morningMood" 
                  name="Morning Mood" 
                  stroke={MOOD_COLORS.morningMood}
                  strokeWidth={2}
                  dot={{ fill: MOOD_COLORS.morningMood, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="eveningMood" 
                  name="Evening Mood" 
                  stroke={MOOD_COLORS.eveningMood}
                  strokeWidth={2}
                  dot={{ fill: MOOD_COLORS.eveningMood, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Correlation Chart */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-500 dark:text-amber-400" />
            Mood Correlations
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={moodTrendData.filter(d => d.taskCompletion > 0)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fill: '#6b7280' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="eveningMood" 
                  name="Evening Mood" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="taskCompletion" 
                  name="Task Completion %" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="hadWorkout" 
                  name="Workout (Yes/No)" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  // Focus Analysis UI
  const renderFocusAnalysis = () => {
    const focusData = analysis?.focus;
    
    if (!focusData || focusData.notEnoughData) {
      return (
        <div className="text-center py-8">
          <Brain size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Not Enough Focus Data
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete more focus sessions to see insights about your productivity patterns. Your day coach will analyze how time of day and interruptions affect your focus.
          </p>
        </div>
      );
    }
    
    return (
      <div>
        {/* Insights Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
            Focus & Productivity Insights
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {focusData.insights.map((insight, index) => (
              <div key={index} className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'avgFocusTime' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                    insight.type === 'mostProductiveTime' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' :
                    'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                  }`}>
                    {insight.type === 'avgFocusTime' ? <Clock size={20} /> :
                     insight.type === 'mostProductiveTime' ? <TrendingUp size={20} /> :
                     <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">{insight.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Focus by Time of Day Chart */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4">
            Focus by Time of Day
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={focusData.hourlyData
                  .map(hour => ({
                    ...hour,
                    hour: hour.hour,
                    hourLabel: formatHour(hour.hour),
                    durationMinutes: Math.round(hour.duration / 60)
                  }))
                  .filter(hour => hour.duration > 0)
                }
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />
                <XAxis dataKey="hourLabel" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} label={{ value: 'Focus Time (min)', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                <Tooltip />
                <Bar dataKey="durationMinutes" name="Focus Time (min)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Focus Sessions by Day Chart */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4">
            Daily Focus Sessions
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={focusData.focusData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fill: '#6b7280' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax']} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="duration" 
                  name="Total Focus Time (sec)" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="interruptions" 
                  name="Interruptions" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  // Habit Analysis UI
  const renderHabitAnalysis = () => {
    const habitData = analysis?.habits;
    
    if (!habitData || habitData.notEnoughData) {
      return (
        <div className="text-center py-8">
          <Zap size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Not Enough Habit Data
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Track your habits consistently to see insights about your streaks and completion rates. Your day coach will help you identify patterns in your habit formation.
          </p>
        </div>
      );
    }
    
    // Colors for the charts
    const HABIT_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
    
    return (
      <div>
        {/* Insights Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
            Habit Insights
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {habitData.insights.map((insight, index) => (
              <div key={index} className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'bestStreak' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                    'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                  }`}>
                    {insight.type === 'bestStreak' ? <Award size={20} /> : <Zap size={20} />}
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">{insight.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Habit Streak Comparison Chart */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4">
            Habit Streaks
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={habitData.habitData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />
                <XAxis type="number" tick={{ fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280' }} width={100} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="streak" 
                  name="Current Streak (days)" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]} 
                />
                <Bar 
                  dataKey="longestStreak" 
                  name="Longest Streak (days)" 
                  fill="#8b5cf6" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Habit Completion Rate Chart */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4">
            Habit Completion Rates
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={habitData.habitData.map(habit => ({
                    name: habit.name,
                    value: habit.rate * 100
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {habitData.habitData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={HABIT_COLORS[index % HABIT_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  // Workout Analysis UI
  const renderWorkoutAnalysis = () => {
    const workoutData = analysis?.workouts;
    
    if (!workoutData || workoutData.notEnoughData) {
      return (
        <div className="text-center py-8">
          <Dumbbell size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Not Enough Workout Data
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Log more workouts to see insights about your exercise patterns. Your day coach will analyze your workout frequency, duration, and calories burned.
          </p>
        </div>
      );
    }
    
    // Colors for the charts
    const WORKOUT_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
    
    return (
      <div>
        {/* Insights Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
            Workout Insights
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workoutData.insights.map((insight, index) => (
              <div key={index} className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'totalWorkoutTime' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                    insight.type === 'favoriteWorkout' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' :
                    'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                  }`}>
                    {insight.type === 'totalWorkoutTime' ? <Clock size={20} /> :
                     insight.type === 'favoriteWorkout' ? <Heart size={20} /> :
                     <Dumbbell size={20} />}
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">{insight.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Workout Duration Chart */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4">
            Workout Duration by Date
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workoutData.workoutData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="duration" 
                  name="Duration (min)" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Workout Type Distribution */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-4">
            Workout Type Distribution
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={workoutData.typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {workoutData.typeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={WORKOUT_COLORS[index % WORKOUT_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('mood')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'mood' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            <Smile size={16} />
            <span className="hidden sm:inline">Mood</span>
          </button>
          
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'focus' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            <Brain size={16} />
            <span className="hidden sm:inline">Focus</span>
          </button>
          
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'habits' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            <Zap size={16} />
            <span className="hidden sm:inline">Habits</span>
          </button>
          
          <button
            onClick={() => setActiveTab('workouts')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              activeTab === 'workouts' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            <Dumbbell size={16} />
            <span className="hidden sm:inline">Workouts</span>
          </button>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-l-lg text-xs ${
              timeRange === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Week
          </button>
          
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-xs ${
              timeRange === 'month' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            Month
          </button>
          
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-r-lg text-xs ${
              timeRange === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            } transition-colors`}
          >
            All
          </button>
          
          <button
            onClick={loadAnalysis}
            className="ml-1 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Refresh Analysis"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      {/* Render appropriate content based on active tab */}
      {activeTab === 'mood' && renderMoodAnalysis()}
      {activeTab === 'focus' && renderFocusAnalysis()}
      {activeTab === 'habits' && renderHabitAnalysis()}
      {activeTab === 'workouts' && renderWorkoutAnalysis()}
    </div>
  );
};

export default DayCoachAnalysis;