import React, { useState, useEffect } from 'react';
import { Info,Clock, Calendar, BarChart2, Zap, CheckSquare, Award, Target, ArrowUp, ArrowDown, AlertTriangle, 
         Dumbbell, ChevronLeft, ChevronRight, Sparkles, Sun, Moon, Lightbulb } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, 
         Pie, Cell, Legend, ComposedChart, Line } from 'recharts';

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
    presetDistribution: [],
    // New interruption metrics
    totalInterruptions: 0,
    totalPauseDuration: 0,
    avgFocusScore: 0,
    hourlyInterruptionData: [],
    sessionsWithInterruptionData: 0
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
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    // Filter sessions within the timeframe
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime || session.timestamp);
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
        presetDistribution: [],
        totalInterruptions: 0,
        totalPauseDuration: 0,
        avgFocusScore: 0,
        hourlyInterruptionData: [],
        sessionsWithInterruptionData: 0
      });
      return;
    }
    
    // Initialize data
    let totalDuration = 0;
    let tasksCompleted = 0;
    
    // Initialize new data for interruption stats
    const hourlyInterruptionMap = Array(24).fill(0);
    const dailyInterruptionMap = Array(7).fill(0);
    let totalInterruptions = 0;
    let totalPauseDuration = 0;
    let totalFocusScore = 0;
    let sessionsWithInterruptionData = 0;
    
    // Maps for aggregating data
    const hourlyMap = Array(24).fill(0);
    const dailyMap = Array(7).fill(0);
    const weeklyMap = {};
    const presetMap = {};
    
    // Process each session
    sessionList.forEach(session => {
      // Add to total duration
      totalDuration += session.duration || 0;
      
      // Count completed tasks
      tasksCompleted += (session.tasks ? session.tasks.length : 0);
      
      // Add to hourly distribution
      const sessionDate = new Date(session.startTime || session.timestamp);
      const hour = sessionDate.getHours();
      hourlyMap[hour] += session.duration || 0;
      
      // Add to daily distribution
      const day = sessionDate.getDay();
      dailyMap[day] += session.duration || 0;
      
      // Add to weekly distribution
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { week: weekKey, duration: 0 };
      }
      weeklyMap[weekKey].duration += session.duration || 0;
      
      // Add to preset distribution
      const preset = session.technique || session.preset || 'custom';
      if (!presetMap[preset]) {
        presetMap[preset] = { name: getTechniqueName(preset), value: 0, id: preset };
      }
      presetMap[preset].value += session.duration || 0;
      
      // Process interruption data if available
      if (session.interruptionsCount !== undefined) {
        totalInterruptions += session.interruptionsCount;
        sessionsWithInterruptionData++;
        
        // Add to hourly interruption distribution
        hourlyInterruptionMap[hour] += session.interruptionsCount;
        
        // Add to daily interruption distribution
        dailyInterruptionMap[day] += session.interruptionsCount;
        
        // Track total pause duration
        totalPauseDuration += session.totalPauseDuration || 0;
        
        // Track focus scores
        if (session.focusScore !== undefined) {
          totalFocusScore += session.focusScore;
        }
      }
    });
    
    // Calculate averages
    const averageSession = totalDuration / sessionList.length;
    
    // Calculate average focus score
    const avgFocusScore = sessionsWithInterruptionData > 0 
      ? Math.round(totalFocusScore / sessionsWithInterruptionData) 
      : 0;
    
    // Convert maps to arrays for charts
    const hourlyData = hourlyMap.map((duration, hour) => ({ hour, duration }));
    const dailyData = dailyMap.map((duration, day) => ({ 
      day, 
      duration,
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
    }));
    const weeklyData = Object.values(weeklyMap).sort((a, b) => a.week.localeCompare(b.week));
    const presetDistribution = Object.values(presetMap);
    
    // Create hourly interruption data for chart
    const hourlyInterruptionData = hourlyMap.map((duration, hour) => ({
      hour,
      duration,
      interruptions: hourlyInterruptionMap[hour]
    }));
    
    // Update state
    setStatsData({
      totalDuration,
      totalSessions: sessionList.length,
      averageSession,
      tasksCompleted,
      weeklyData,
      dailyData,
      hourlyData,
      presetDistribution,
      // Interruption metrics
      totalInterruptions,
      totalPauseDuration,
      avgFocusScore,
      hourlyInterruptionData,
      sessionsWithInterruptionData
    });
  };
  
  // Helper function to get a readable name for a technique
  const getTechniqueName = (techniqueId) => {
    const techniqueMap = {
      'pomodoro': 'Pomodoro Technique',
      'flowtime': 'Flowtime Method',
      '5217': '52/17 Method',
      'desktime': '90-Minute Focus',
      'custom': 'Custom Timer',
      'shortBreak': 'Short Break',
      'longBreak': 'Long Break',
      'stopwatch': 'Stopwatch'
    };
    
    return techniqueMap[techniqueId] || techniqueId;
  };
  
  // Format seconds to readable time
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "0m";
    
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
    custom: '#10b981', // emerald
    flowtime: '#0ea5e9', // sky
    '5217': '#ec4899', // pink
    desktime: '#14b8a6' // teal
  };
  
  // Get color for a technique
  const getPresetColor = (techniqueId) => {
    return PRESET_COLORS[techniqueId] || '#9ca3af'; // Default gray
  };
  
  // Format tooltip value
  const formatTooltipValue = (value, name) => {
    if (name.includes('Duration') || name.includes('Focus') || name.includes('Time')) {
      return formatDuration(value);
    }
    return value;
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
      
      {/* Interruption Analytics - NEW */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm transition-colors">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 transition-colors">
          <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />
          Focus Interruption Analysis
        </h4>
        
        {statsData.sessionsWithInterruptionData > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center transition-colors">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1 transition-colors">
                  {statsData.totalInterruptions}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                  Total Interruptions
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 text-center transition-colors">
                <div className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-1 transition-colors">
                  {formatDuration(statsData.totalPauseDuration)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                  Total Pause Time
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center transition-colors">
                <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-1 transition-colors">
                  {statsData.avgFocusScore}/100
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                  Avg Focus Score
                </div>
              </div>
            </div>
            
            <div className="h-64 mt-6">
              <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Interruptions by Hour of Day
              </h5>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={statsData.hourlyInterruptionData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={formatHourLabel} 
                    tick={{ fill: '#6b7280' }} 
                    interval={3}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Focus Time (min)', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280' }}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => Math.floor(value / 60)}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Interruptions', angle: 90, position: 'insideRight', offset: -5, fill: '#6b7280' }}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Focus Time') return formatDuration(value);
                      return value;
                    }}
                    labelFormatter={(value) => `${formatHourLabel(value)} - ${formatHourLabel((value + 1) % 24)}`}
                  />
                  <Bar yAxisId="left" dataKey="duration" name="Focus Time" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="interruptions" 
                    name="Interruptions" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
                Insight
              </h5>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {statsData.hourlyInterruptionData.reduce((a, b) => a.interruptions > b.interruptions ? a : b).hour === 
                 statsData.hourlyInterruptionData.reduce((a, b) => a.duration > b.duration ? a : b).hour ?
                  `Your most productive hour (${formatHourLabel(statsData.hourlyInterruptionData.reduce((a, b) => a.duration > b.duration ? a : b).hour)}) is also your most interrupted time. Consider setting stronger boundaries during this productive period.` :
                  `You experience the most interruptions at ${formatHourLabel(statsData.hourlyInterruptionData.reduce((a, b) => a.interruptions > b.interruptions ? a : b).hour)}, but your most focused hour is ${formatHourLabel(statsData.hourlyInterruptionData.reduce((a, b) => a.duration > b.duration ? a : b).hour)}. Consider scheduling important focus work during your least interrupted times.`
                }
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            No interruption data available yet. Complete more focus sessions to see analytics.
          </div>
        )}
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
    <Tooltip content={
      <div>
        <p className="font-medium mb-1">Technique Distribution</p>
        <p>Shows which focus methods you use most frequently, by total time spent.</p>
      </div>
    }>
      <Info size={14} className="text-slate-400 dark:text-slate-500 ml-1" />
    </Tooltip>
  </h4>
  
  <div className="h-64 flex items-center justify-center mobile-pie-chart">
    {statsData.presetDistribution.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 30, left: 0 }}>
          <Pie
            data={statsData.presetDistribution}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
              // Only show labels on desktop
              if (window.innerWidth < 640) return null;
              const RADIAN = Math.PI / 180;
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fill="#6b7280"
                  fontSize={12}
                >
                  {statsData.presetDistribution[index].name}
                </text>
              );
            }}
          >
            {statsData.presetDistribution.map((entry) => (
              <Cell 
                key={`cell-${entry.id}`} 
                fill={getPresetColor(entry.id)} 
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [`${formatDuration(value)}`, props.payload.name]}
          />
          <Legend 
            layout={window.innerWidth < 640 ? "horizontal" : "vertical"}
            verticalAlign={window.innerWidth < 640 ? "bottom" : "middle"}
            align={window.innerWidth < 640 ? "center" : "right"}
            wrapperStyle={window.innerWidth < 640 ? { bottom: -20 } : {}}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: window.innerWidth < 640 ? '10px' : '12px' }}>
                {entry.payload.name}
              </span>
            )}
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
                {statsData.hourlyData.length > 0 
                  ? formatHourLabel(statsData.hourlyData.reduce((a, b) => a.duration > b.duration ? a : b).hour) 
                  : 'morning'} to {statsData.hourlyData.length > 0 
                    ? formatHourLabel(statsData.hourlyData.reduce((a, b) => a.duration > b.duration ? a : b).hour + 2) 
                    : 'noon'}
              </span>
              time block with the highest focus metrics.
            </p>
          </div>
          
          {/* Interruption peak */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg flex flex-col shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Interruption Patterns
              </h5>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors">
              {statsData.sessionsWithInterruptionData > 0 ? (
                <>
                  Your sessions are most frequently interrupted  
                  <span className="font-medium text-amber-600 dark:text-amber-400 mx-1 transition-colors">
                    {formatHourLabel(statsData.hourlyInterruptionData.reduce((a, b) => a.interruptions > b.interruptions ? a : b).hour)}
                  </span>
                  with an average of 
                  <span className="font-medium text-amber-600 dark:text-amber-400 mx-1 transition-colors">
                    {(statsData.totalInterruptions / (statsData.sessionsWithInterruptionData || 1)).toFixed(1)}
                  </span>
                  interruptions per session.
                </>
              ) : (
                <>
                  No interruption data available yet. Continue tracking focus sessions to reveal your interruption patterns.
                </>
              )}
            </p>
          </div>
          
          {/* Focus score improvement */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg flex flex-col shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-amber-500 dark:text-amber-400" />
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Focus Score
              </h5>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors">
              {statsData.sessionsWithInterruptionData > 0 ? (
                <>
                  Your average focus score is 
                  <span className={`font-medium mx-1 ${
                    statsData.avgFocusScore >= 80 ? 'text-green-600 dark:text-green-400' :
                    statsData.avgFocusScore >= 60 ? 'text-lime-600 dark:text-lime-400' :
                    statsData.avgFocusScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {statsData.avgFocusScore}/100
                  </span>
                  - {statsData.avgFocusScore >= 80 ? 'excellent' : 
                     statsData.avgFocusScore >= 60 ? 'good' : 
                     statsData.avgFocusScore >= 40 ? 'moderate' : 'needs improvement'}.
                </>
              ) : (
                <>
                  Focus scores will appear after you complete more sessions with the latest tracking features.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusAnalytics;