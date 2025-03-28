import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart, Calendar, Clock, Award, 
         ArrowUp, ArrowDown, Activity, Heart, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         PieChart as RPieChart, Pie, Cell, Legend } from 'recharts';
import { getMeditationStats } from '../../utils/meditationStorage';

const MeditationAnalytics = ({ sessions, categories }) => {
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year', 'all'
  const [stats, setStats] = useState(null);
  
  // Process stats when sessions or timeframe changes
  useEffect(() => {
    // Filter sessions based on timeframe
    let filteredSessions = [...sessions];
    
    if (timeframe !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      if (timeframe === 'week') {
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === 'year') {
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }
      
      filteredSessions = sessions.filter(session => 
        new Date(session.timestamp) >= cutoffDate
      );
    }
    
    // Calculate stats
    calculateStats(filteredSessions);
  }, [sessions, timeframe]);
  
  // Calculate meditation statistics
  const calculateStats = (filteredSessions) => {
    if (!filteredSessions || filteredSessions.length === 0) {
      setStats(null);
      return;
    }
    
    // Total sessions and minutes
    const totalSessions = filteredSessions.length;
    const totalMinutes = filteredSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    
    // Average session length
    const avgSessionLength = totalMinutes / totalSessions;
    
    // Count by category
    const categoryCounts = {};
    categories.forEach(cat => {
      categoryCounts[cat.id] = 0;
    });
    
    filteredSessions.forEach(session => {
      if (categoryCounts[session.category] !== undefined) {
        categoryCounts[session.category]++;
      }
    });
    
    // Session streak
    const streak = calculateStreak(filteredSessions);
    
    // Mood improvement
    const moodData = calculateMoodImprovement(filteredSessions);
    
    // Daily distribution
    const dailyDistribution = calculateDailyDistribution(filteredSessions);
    
    // Time of day distribution
    const timeOfDayDistribution = calculateTimeOfDayDistribution(filteredSessions);
    
    // Most used techniques
    const techniques = calculateTopTechniques(filteredSessions);
    
    setStats({
      totalSessions,
      totalMinutes,
      avgSessionLength,
      categoryCounts,
      streak,
      moodData,
      dailyDistribution,
      timeOfDayDistribution,
      techniques
    });
  };
  
  // Calculate current streak
  const calculateStreak = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;
    
    // Sort sessions by date (most recent first)
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Get most recent session date
    const mostRecentDate = new Date(sortedSessions[0].timestamp);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If most recent session isn't from today or yesterday, streak is broken
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (mostRecentDate < yesterday) {
      return 0;
    }
    
    // Calculate streak by checking consecutive days
    let streak = 1;
    let currentDate = mostRecentDate;
    
    // Create a set of dates that have sessions
    const sessionDates = new Set();
    sortedSessions.forEach(session => {
      const date = new Date(session.timestamp);
      sessionDates.add(date.toISOString().split('T')[0]);
    });
    
    // Check previous days
    let checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (sessionDates.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  };
  
  // Calculate mood improvement
  const calculateMoodImprovement = (sessions) => {
    // Filter sessions that have both before and after moods
    const sessionsWithMood = sessions.filter(session => 
      session.moodBefore !== undefined && session.moodAfter !== undefined
    );
    
    if (sessionsWithMood.length === 0) {
      return {
        averageBefore: 0,
        averageAfter: 0,
        improvement: 0,
        sessions: 0
      };
    }
    
    // Calculate averages
    const totalBefore = sessionsWithMood.reduce((sum, session) => sum + session.moodBefore, 0);
    const totalAfter = sessionsWithMood.reduce((sum, session) => sum + session.moodAfter, 0);
    
    const averageBefore = totalBefore / sessionsWithMood.length;
    const averageAfter = totalAfter / sessionsWithMood.length;
    
    return {
      averageBefore,
      averageAfter,
      improvement: averageAfter - averageBefore,
      sessions: sessionsWithMood.length
    };
  };
  
  // Calculate daily distribution
  const calculateDailyDistribution = (sessions) => {
    // Initialize counts for each day of the week
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    
    sessions.forEach(session => {
      const date = new Date(session.timestamp);
      const day = date.getDay(); // 0-6, where 0 is Sunday
      dayCounts[day]++;
    });
    
    // Format for chart
    return [
      { name: 'Sun', count: dayCounts[0] },
      { name: 'Mon', count: dayCounts[1] },
      { name: 'Tue', count: dayCounts[2] },
      { name: 'Wed', count: dayCounts[3] },
      { name: 'Thu', count: dayCounts[4] },
      { name: 'Fri', count: dayCounts[5] },
      { name: 'Sat', count: dayCounts[6] }
    ];
  };
  
  // Calculate time of day distribution
  const calculateTimeOfDayDistribution = (sessions) => {
    // Time periods
    const periods = {
      morning: 0, // 5-11
      afternoon: 0, // 12-16
      evening: 0, // 17-20
      night: 0 // 21-4
    };
    
    sessions.forEach(session => {
      const date = new Date(session.timestamp);
      const hour = date.getHours();
      
      if (hour >= 5 && hour < 12) {
        periods.morning++;
      } else if (hour >= 12 && hour < 17) {
        periods.afternoon++;
      } else if (hour >= 17 && hour < 21) {
        periods.evening++;
      } else {
        periods.night++;
      }
    });
    
    // Format for chart
    return [
      { name: 'Morning', value: periods.morning, color: '#f59e0b' },
      { name: 'Afternoon', value: periods.afternoon, color: '#3b82f6' },
      { name: 'Evening', value: periods.evening, color: '#8b5cf6' },
      { name: 'Night', value: periods.night, color: '#1e293b' }
    ];
  };
  
  // Calculate top techniques
  const calculateTopTechniques = (sessions) => {
    const techniqueCounts = {};
    
    sessions.forEach(session => {
      const id = session.exerciseId;
      if (!techniqueCounts[id]) {
        techniqueCounts[id] = { count: 0, duration: 0, name: '' };
      }
      techniqueCounts[id].count++;
      techniqueCounts[id].duration += session.duration || 0;
      
      // Set the name if not already set
      if (!techniqueCounts[id].name) {
        // Try to find the exercise in categories
        for (const category of categories) {
          const exercise = category.exercises.find(ex => ex.id === id);
          if (exercise) {
            techniqueCounts[id].name = exercise.name;
            techniqueCounts[id].category = category.id;
            break;
          }
        }
        
        // If still no name (shouldn't happen), use the ID
        if (!techniqueCounts[id].name) {
          techniqueCounts[id].name = id;
        }
      }
    });
    
    // Convert to array and sort by count
    return Object.values(techniqueCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  };
  
  // Get color for category from categories array
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return '#64748b'; // Default slate color
    
    // Extract color from bg class
    const colorClass = category.color;
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('purple')) return '#8b5cf6';
    if (colorClass.includes('green')) return '#10b981';
    if (colorClass.includes('amber')) return '#f59e0b';
    if (colorClass.includes('indigo')) return '#6366f1';
    if (colorClass.includes('rose')) return '#f43f5e';
    
    return '#64748b'; // Default slate color
  };
  
  // Format minutes as hours and minutes
  const formatMinutes = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };
  
  // Render empty state
  if (!stats) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="py-12 text-center">
          <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <Brain size={32} className="text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            No meditation data yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete your first meditation to start seeing your stats. Your progress and insights will appear here.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Timeframe selector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="text-blue-500 dark:text-blue-400" size={20} />
            Meditation Analytics
          </h3>
          
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg flex p-1">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'week' 
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'month' 
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'year' 
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 'all' 
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-blue-500 dark:text-blue-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Sessions</div>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.totalSessions}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {timeframe === 'week' ? 'this week' : 
             timeframe === 'month' ? 'this month' :
             timeframe === 'year' ? 'this year' : 'total'}
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-purple-500 dark:text-purple-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Time</div>
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {formatMinutes(stats.totalMinutes)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stats.avgSessionLength.toFixed(1)} min avg per session
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Award size={20} className="text-green-500 dark:text-green-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Streak</div>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {stats.streak}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            days in a row
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={20} className="text-amber-500 dark:text-amber-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Mood Boost</div>
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {stats.moodData.improvement > 0 ? '+' : ''}{stats.moodData.improvement.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            average improvement after sessions
          </div>
        </div>
      </div>
      
      {/* Charts and detailed stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily distribution chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500 dark:text-blue-400" />
            Sessions by Day of Week
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip
                  formatter={(value) => [`${value} sessions`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Time of day distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-500 dark:text-purple-400" />
            Sessions by Time of Day
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={stats.timeOfDayDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.timeOfDayDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} sessions`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1'
                  }}
                />
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Top techniques and mood comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top techniques */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Award size={18} className="text-green-500 dark:text-green-400" />
            Most Used Techniques
          </h3>
          
          <div className="space-y-4">
            {stats.techniques.map((technique, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-2 h-10 rounded-full mr-3" 
                  style={{ backgroundColor: getCategoryColor(technique.category) }}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{technique.name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{technique.count} sessions</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(technique.count / stats.totalSessions) * 100}%`,
                        backgroundColor: getCategoryColor(technique.category)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mood improvement */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Heart size={18} className="text-amber-500 dark:text-amber-400" />
            Mood Improvement
          </h3>
          
          {stats.moodData.sessions > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full">
                    <ArrowUp className="text-green-500" size={24} />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {((stats.moodData.improvement / stats.moodData.averageBefore) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Average Improvement
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Before Meditation</div>
                  <div className="flex justify-center mb-2">
                    <span className="text-3xl">
                      {stats.moodData.averageBefore <= 1.5 ? '😔' : 
                       stats.moodData.averageBefore <= 2.5 ? '😕' : 
                       stats.moodData.averageBefore <= 3.5 ? '😐' : 
                       stats.moodData.averageBefore <= 4.5 ? '🙂' : 
                       '😊'}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    {stats.moodData.averageBefore.toFixed(1)}/5
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">After Meditation</div>
                  <div className="flex justify-center mb-2">
                    <span className="text-3xl">
                      {stats.moodData.averageAfter <= 1.5 ? '😔' : 
                       stats.moodData.averageAfter <= 2.5 ? '😕' : 
                       stats.moodData.averageAfter <= 3.5 ? '😐' : 
                       stats.moodData.averageAfter <= 4.5 ? '🙂' : 
                       '😊'}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    {stats.moodData.averageAfter.toFixed(1)}/5
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                Based on {stats.moodData.sessions} tracked sessions
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Complete more sessions with mood tracking to see your improvement data.
            </div>
          )}
        </div>
      </div>
      
      {/* Insight cards */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 transition-colors">
        <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Brain size={18} className="text-indigo-500 dark:text-indigo-400" />
          Meditation Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insight on best time of day */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-1">
                  Best Time of Day
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stats.timeOfDayDistribution.length > 0 ? (
                    <>
                      {(() => {
                        const bestTime = [...stats.timeOfDayDistribution].sort((a, b) => b.value - a.value)[0];
                        return `You meditate most often in the ${bestTime.name.toLowerCase()}. ${
                          bestTime.name === 'Morning' ? 'Morning sessions help start your day with clarity.' :
                          bestTime.name === 'Afternoon' ? 'Afternoon sessions provide a helpful midday reset.' :
                          bestTime.name === 'Evening' ? 'Evening sessions help transition to a restful state.' :
                          'Night sessions may help with sleep and relaxation.'
                        }`;
                      })()}
                    </>
                  ) : (
                    'Complete more sessions to discover your optimal meditation time.'
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* Insight on technique effectiveness */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                <Award size={18} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-1">
                  Most Effective Technique
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stats.techniques.length > 0 ? (
                    `Your most used technique is ${stats.techniques[0].name}. Consider trying ${
                      stats.techniques.length > 1 ? stats.techniques[1].name : 'other techniques'
                    } to diversify your practice.`
                  ) : (
                    'Try different meditation techniques to see which ones work best for you.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationAnalytics;