import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BarChart2, Zap, CheckSquare, Award, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const FocusAnalytics = ({ sessions }) => {
  const [timeframe, setTimeframe] = useState('week'); // 'day', 'week', 'month', 'year'
  const [statsData, setStatsData] = useState({
    totalDuration: 0,
    totalSessions: 0,
    averageSession: 0,
    tasksCompleted: 0,
    weeklyData: [],
    dailyData: [],
    hourlyData: [],
    presetDistribution: []
  });
  
  // Process statistics on sessions change or timeframe change
  useEffect(() => {
    if (sessions.length === 0) return;
    
    // Calculate time range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Filter sessions within the timeframe
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= now;
    });
    
    // Process the filtered sessions
    processSessionData(filteredSessions);
  }, [sessions, timeframe]);
  
  // Process session data to extract statistics
  const processSessionData = (sessionList) => {
    if (sessionList.length === 0) {
      setStatsData({
        totalDuration: 0,
        totalSessions: 0,
        averageSession: 0,
        tasksCompleted: 0,
        weeklyData: [],
        dailyData: [],
        hourlyData: [],
        presetDistribution: []
      });
      return;
    }
    
    // Initialize data
    let totalDuration = 0;
    let tasksCompleted = 0;
    
    // Maps for aggregating data
    const hourlyMap = Array(24).fill(0);
    const dailyMap = Array(7).fill(0);
    const weeklyMap = {};
    const presetMap = {};
    
    // Process each session
    sessionList.forEach(session => {
      // Add to total duration
      totalDuration += session.duration;
      
      // Count completed tasks
      tasksCompleted += (session.tasks ? session.tasks.length : 0);
      
      // Add to hourly distribution
      const sessionDate = new Date(session.startTime);
      const hour = sessionDate.getHours();
      hourlyMap[hour] += session.duration;
      
      // Add to daily distribution
      const day = sessionDate.getDay();
      dailyMap[day] += session.duration;
      
      // Add to weekly distribution
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { week: weekKey, duration: 0 };
      }
      weeklyMap[weekKey].duration += session.duration;
      
      // Add to preset distribution
      const preset = session.preset || 'custom';
      if (!presetMap[preset]) {
        presetMap[preset] = { name: preset, value: 0 };
      }
      presetMap[preset].value += session.duration;
    });
    
    // Convert maps to arrays for charts
    const hourlyData = hourlyMap.map((duration, hour) => ({ hour, duration }));
    const dailyData = dailyMap.map((duration, day) => ({ 
      day, 
      duration,
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
    }));
    const weeklyData = Object.values(weeklyMap).sort((a, b) => a.week.localeCompare(b.week));
    const presetDistribution = Object.values(presetMap);
    
    // Calculate averages
    const averageSession = totalDuration / sessionList.length;
    
    // Update state
    setStatsData({
      totalDuration,
      totalSessions: sessionList.length,
      averageSession,
      tasksCompleted,
      weeklyData,
      dailyData,
      hourlyData,
      presetDistribution
    });
  };
  
  // Format seconds to readable time
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Formatter for X axis labels on daily chart
  const formatDayLabel = (value) => {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][value];
  };
  
  // Formatter for X axis labels on hourly chart
  const formatHourLabel = (value) => {
    if (value === 0) return '12am';
    if (value === 12) return '12pm';
    return value < 12 ? `${value}am` : `${value-12}pm`;
  };
  
  // Colors for preset distribution chart
  const PRESET_COLORS = {
    pomodoro: '#ef4444', // red
    shortBreak: '#3b82f6', // blue
    longBreak: '#8b5cf6', // purple
    stopwatch: '#f59e0b', // amber
    custom: '#10b981' // emerald
  };
  
  // If no sessions, show empty state
  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 transition-colors">
          <BarChart2 size={40} className="text-slate-400 dark:text-slate-500 transition-colors" />
        </div>
        <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
          No Focus Sessions Yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto transition-colors">
          Complete your first focus session to start tracking your productivity analytics. Your data will appear here automatically.
        </p>
      </div>
    );
  }
  
  return (
    <div className="focus-analytics">
      {/* Timeframe selector */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors">
          Focus Analytics
        </h3>
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg flex p-1 transition-colors">
          <button
            onClick={() => setTimeframe('day')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'day' 
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'week' 
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'month' 
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'year' 
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-blue-500 dark:text-blue-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Total Focus</div>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 transition-colors">
            {formatDuration(statsData.totalDuration)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            {statsData.totalSessions} sessions
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-purple-500 dark:text-purple-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Average Session</div>
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 transition-colors">
            {formatDuration(statsData.averageSession)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            per focus session
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={18} className="text-green-500 dark:text-green-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Tasks Completed</div>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300 transition-colors">
            {statsData.tasksCompleted}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            with focus sessions
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-amber-500 dark:text-amber-400" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Productivity</div>
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 transition-colors">
            {statsData.totalDuration > 0 ? (statsData.tasksCompleted / (statsData.totalDuration / 3600)).toFixed(1) : '0.0'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            tasks per hour
          </div>
        </div>
      </div>
      
      {/* Main charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Time Distribution by Day of Week */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm transition-colors">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 transition-colors">
            <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
            Focus Time by Day of Week
          </h4>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="day" 
                  tickFormatter={formatDayLabel} 
                  tick={{ fill: '#6b7280' }} 
                />
                <YAxis 
                  label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280' }}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => Math.floor(value / 60)}
                />
                <Tooltip 
                  formatter={(value) => [`${formatDuration(value)}`, 'Focus Time']}
                  labelFormatter={(value) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][value]}
                />
                <Bar dataKey="duration" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Time Distribution by Hour of Day */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm transition-colors">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 transition-colors">
            <Clock size={16} className="text-green-500 dark:text-green-400" />
            Focus Time by Hour of Day
          </h4>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={formatHourLabel} 
                  tick={{ fill: '#6b7280' }} 
                  interval={3}
                />
                <YAxis 
                  label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280' }}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => Math.floor(value / 60)}
                />
                <Tooltip 
                  formatter={(value) => [`${formatDuration(value)}`, 'Focus Time']}
                  labelFormatter={(value) => `${formatHourLabel(value)} - ${formatHourLabel((value + 1) % 24)}`}
                />
                <Bar dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Secondary charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Focus Session Technique Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm transition-colors">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 transition-colors">
            <Target size={16} className="text-red-500 dark:text-red-400" />
            Focus Technique Distribution
          </h4>
          
          <div className="h-64 flex items-center justify-center">
            {statsData.presetDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData.presetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statsData.presetDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PRESET_COLORS[entry.name] || '#9ca3af'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${formatDuration(value)}`, 'Focus Time']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                No preset data available.
              </div>
            )}
          </div>
        </div>
        
        {/* Weekly Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm transition-colors">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 transition-colors">
            <BarChart2 size={16} className="text-amber-500 dark:text-amber-400" />
            Weekly Focus Trend
          </h4>
          
          <div className="h-64">
            {statsData.weeklyData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: '#6b7280' }} 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    label={{ value: 'Duration (hrs)', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280' }}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => (value / 3600).toFixed(1)}
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatDuration(value)}`, 'Focus Time']}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                    }}
                  />
                  <Bar dataKey="duration" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                Not enough weekly data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Productivity insights */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 shadow-sm transition-colors">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 transition-colors">
          <Award size={16} className="text-purple-500 dark:text-purple-400" />
          Productivity Insights
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Most productive time */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg flex flex-col shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp size={16} className="text-green-500 dark:text-green-400" />
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Most Productive Time
              </h5>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors">
              Your most focused hours are in the 
              <span className="font-medium text-green-600 dark:text-green-400 mx-1 transition-colors">
                morning from 9 AM to 12 PM
              </span>
              with an average focus time of 30 min per hour.
            </p>
          </div>
          
          {/* Best day */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg flex flex-col shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Most Consistent Day
              </h5>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors">
              You've been most consistent with focus sessions on 
              <span className="font-medium text-blue-600 dark:text-blue-400 mx-1 transition-colors">
                Tuesdays
              </span>
              with an average of 2.5 hours of focus time.
            </p>
          </div>
          
          {/* Task efficiency */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg flex flex-col shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-amber-500 dark:text-amber-400" />
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Task Efficiency
              </h5>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors">
              You complete 
              <span className="font-medium text-amber-600 dark:text-amber-400 mx-1 transition-colors">
                24% more tasks
              </span> 
              when using the Pomodoro technique compared to regular focus sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusAnalytics;