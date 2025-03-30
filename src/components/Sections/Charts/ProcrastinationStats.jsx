import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Clock, AlertCircle, TrendingUp, TrendingDown, RefreshCw, BarChart2, Calendar, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getProcrastinationStats } from '../../../utils/taskDeferralService';
import { getStorage } from '../../../utils/storage';
import { formatDateForStorage } from '../../../utils/dateUtils';

const ProcrastinationStats = forwardRef(({ currentMonth, moodData }, ref) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'history', 'tasks'
  const [moodCorrelation, setMoodCorrelation] = useState(null);
  
  // Expose the refresh method to parent components
  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log("Refreshing procrastination stats");
      loadStats();
    }
  }));
  
  const loadStats = () => {
    setIsLoading(true);
    
    // Calculate start and end dates from currentMonth
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get procrastination stats
    const procStats = getProcrastinationStats(start, end);
    
    // Deduplicate tasks in deferralHistory - only keep the most recent entry for each task
    if (procStats && procStats.deferralHistory) {
      // Group by task text
      const taskGroups = {};
      
      procStats.deferralHistory.forEach(entry => {
        if (!taskGroups[entry.task]) {
          taskGroups[entry.task] = [];
        }
        taskGroups[entry.task].push(entry);
      });
      
      // For each task, keep only the latest entry (most recent date)
      const deduplicatedHistory = Object.values(taskGroups).map(entries => {
        // Sort by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Return the latest entry
        return entries[0];
      });
      
      // Sort by count, then by days (most procrastinated first)
      deduplicatedHistory.sort((a, b) => b.count - a.count || b.days - a.days);
      
      // Update the stats object
      procStats.deferralHistory = deduplicatedHistory;
    }
    
    // Analyze correlation with mood and energy if mood data is available
    if (moodData && moodData.length > 0) {
      analyzeMoodCorrelation(procStats, moodData);
    }
    
    setStats(procStats);
    setIsLoading(false);
  };
  
  // Analyze correlation between procrastination and mood/energy
  const analyzeMoodCorrelation = (procStats, moodData) => {
    if (!procStats || !procStats.deferCountByDay || procStats.deferCountByDay.length === 0) {
      setMoodCorrelation(null);
      return;
    }
    
    const correlation = {
      highDeferDays: [],
      lowMoodDays: [],
      lowEnergyDays: [],
      insights: []
    };
    
    // Find days with high deferral counts (top 30%)
    const sortedDeferDays = [...procStats.deferCountByDay].sort((a, b) => b.count - a.count);
    const highDeferThreshold = sortedDeferDays.length > 2 
      ? sortedDeferDays[Math.floor(sortedDeferDays.length * 0.3)].count 
      : 1;
    
    correlation.highDeferDays = sortedDeferDays
      .filter(day => day.count >= highDeferThreshold)
      .map(day => day.date);
    
    // Find days with low mood (bottom 30%)
    const moodValues = moodData
      .filter(day => day.morningMood !== undefined)
      .map(day => ({
        date: day.date,
        morningMood: day.morningMood
      }))
      .sort((a, b) => a.morningMood - b.morningMood);
    
    correlation.lowMoodDays = moodValues
      .slice(0, Math.max(1, Math.floor(moodValues.length * 0.3)))
      .map(day => day.date);
    
    // Check overlap between high defer days and low mood days
    const overlapDays = correlation.highDeferDays.filter(date => 
      correlation.lowMoodDays.includes(date)
    );
    
    const overlapPercentage = correlation.highDeferDays.length > 0
      ? (overlapDays.length / correlation.highDeferDays.length) * 100
      : 0;
    
    // Generate insights based on correlation strength
    if (overlapPercentage > 50) {
      correlation.insights.push({
        type: 'strong',
        text: 'Strong correlation detected between low mood and procrastination. Consider addressing your emotional state to reduce task deferral.'
      });
    } else if (overlapPercentage > 25) {
      correlation.insights.push({
        type: 'moderate',
        text: 'Moderate correlation between mood and procrastination. Your mood may be affecting your task completion on some days.'
      });
    } else if (correlation.highDeferDays.length > 0) {
      correlation.insights.push({
        type: 'weak',
        text: 'Limited correlation between mood and procrastination. Your task deferrals may be driven by other factors than mood.'
      });
    }
    
    // Add specific actionable insights
    if (procStats.maxDeferCount > 3) {
      correlation.insights.push({
        type: 'action',
        text: `Try breaking down frequently deferred tasks into smaller, more manageable steps.`
      });
    }
    
    if (procStats.totalDeferred > 10) {
      correlation.insights.push({
        type: 'action',
        text: 'Consider scheduling specific times for your most challenging tasks when your energy tends to be highest.'
      });
    }
    
    setMoodCorrelation(correlation);
  };
  
  useEffect(() => {
    loadStats();
  }, [currentMonth, moodData]);
  
  const debugProcrastinationData = () => {
    console.log("=== DEBUGGING PROCRASTINATION DATA ===");
    console.log("Current Month:", currentMonth);
    
    // Calculate start and end dates from currentMonth
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    console.log("Date Range:", formatDateForStorage(start), "to", formatDateForStorage(end));
    
    // Get the raw storage data
    const storage = getStorage();
    console.log("Full Storage Data:", storage);
    
    // Look for task deferral history
    const daysWithHistory = [];
    Object.entries(storage).forEach(([key, value]) => {
      if (key.match(/^\d{4}-\d{2}-\d{2}$/) && value.taskDeferHistory) {
        daysWithHistory.push({
          date: key,
          history: value.taskDeferHistory
        });
      }
    });
    console.log("Days with taskDeferHistory:", daysWithHistory);
    
    // Debug the stats calculation
    const procStats = getProcrastinationStats(start, end);
    console.log("Procrastination Stats:", JSON.parse(JSON.stringify(procStats)));
    
    // Specific debug for chart data
    console.log("Chart Data (tasksByDeferCount):", JSON.parse(JSON.stringify(procStats.tasksByDeferCount)));
    console.log("=== END DEBUGGING ===");
  };
  
  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!stats || (stats.totalDeferred === 0 && stats.deferCountByDay.length === 0)) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center">
        <Clock size={40} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Procrastination Data</h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          There's no task deferral data for this month yet. Start tracking your deferred tasks to see procrastination patterns.
        </p>
      </div>
    );
  }
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-sm">
          <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="text-amber-500 dark:text-amber-400" size={18} />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">Deferred Tasks</h3>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.totalDeferred}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">tasks pushed forward</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="text-red-500 dark:text-red-400" size={18} />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">Max Deferrals</h3>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.maxDeferCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">times a task was deferred</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="text-purple-500 dark:text-purple-400" size={18} />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">Oldest Task</h3>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.maxDeferDays}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">days without completion</p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="text-blue-500 dark:text-blue-400" size={18} />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">Avg Deferral</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.averageDeferCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">average times deferred</p>
        </div>
      </div>
      
      {/* Mood-Procrastination Correlation Section */}
      {moodCorrelation && moodCorrelation.insights.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800 mb-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <TrendingUp className="text-amber-500 dark:text-amber-400" size={18} />
            Mood & Procrastination Insights
          </h4>
          <div className="space-y-3">
            {moodCorrelation.insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  insight.type === 'strong' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400' 
                    : insight.type === 'moderate'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400'
                    : insight.type === 'action'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-l-4 border-slate-300'
                }`}
              >
                <p className="text-sm text-slate-700 dark:text-slate-300">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* View Selector Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 transition-colors">
        <button
          className={`flex-1 py-2 px-3 rounded-md flex justify-center items-center gap-2 transition-colors ${
            selectedView === 'overview' 
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600'
          }`}
          onClick={() => setSelectedView('overview')}
        >
          <TrendingUp size={18} />
          <span className="hidden sm:inline">Overview</span>
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-md flex justify-center items-center gap-2 transition-colors ${
            selectedView === 'history' 
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600'
          }`}
          onClick={() => setSelectedView('history')}
        >
          <Calendar size={18} />
          <span className="hidden sm:inline">Timeline</span>
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-md flex justify-center items-center gap-2 transition-colors ${
            selectedView === 'tasks' 
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600'
          }`}
          onClick={() => setSelectedView('tasks')}
        >
          <AlertCircle size={18} />
          <span className="hidden sm:inline">Top Procrastinated</span>
        </button>
      </div>
      
      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors">Tasks by Deferral Count</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stats.tasksByDeferCount.length > 0 ? stats.tasksByDeferCount : [{ deferCount: 0, taskCount: 0 }]} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="deferCount" 
                    label={{ value: 'Number of Deferrals', position: 'bottom', offset: 0 }}
                    tick={{ fill: '#6b7280' }} 
                  />
                  <YAxis 
                    label={{ value: 'Task Count', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#6b7280' }} 
                    allowDecimals={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="taskCount" 
                    name="Number of Tasks" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center italic">
              This chart shows how many tasks were deferred specific numbers of times.
            </p>
          </div>
          
          {stats.deferCountByDay.length > 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors">Daily Deferral Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.deferCountByDay} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6b7280' }} 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.getDate();
                      }}
                    />
                    <YAxis 
                      label={{ value: 'Deferred Count', angle: -90, position: 'insideLeft' }}
                      tick={{ fill: '#6b7280' }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Deferrals" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b' }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center italic">
                This chart shows how many tasks were deferred each day.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* History View */}
      {selectedView === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors">Deferral Timeline</h3>
          
          {stats.deferralHistory.length === 0 ? (
            <div className="text-center p-6">
              <Calendar size={40} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
              <p className="text-slate-600 dark:text-slate-400">
                No detailed deferral history available for this month.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {stats.deferralHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(entry.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="w-6 flex-shrink-0 flex flex-col items-center">
                    <div className="h-full w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="w-4 h-4 rounded-full bg-amber-500 dark:bg-amber-400 -mt-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <div className="text-slate-700 dark:text-slate-200 font-medium mb-1">{entry.task}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                          <RefreshCw size={12} className="mr-1" />
                          Deferred {entry.count} time{entry.count !== 1 ? 's' : ''}
                        </span>
                        {entry.days > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                            <Clock size={12} className="mr-1" />
                            {entry.days} day{entry.days !== 1 ? 's' : ''} old
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Top Procrastinated Tasks View - Fixed for mobile layout */}
      {selectedView === 'tasks' && (
  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors">Most Procrastinated Tasks</h3>
    
    {stats.deferralHistory.length === 0 ? (
      <div className="text-center p-6">
        <AlertCircle size={40} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <p className="text-slate-600 dark:text-slate-400">
          No task history available for this month.
        </p>
      </div>
    ) : (
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {/* Sort by most deferred, then by days */}
        {stats.deferralHistory
          .sort((a, b) => b.count - a.count || b.days - a.days)
          .slice(0, 10) // Top 10
          .map((entry, index) => (
            <div 
              key={index} 
              className="flex items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0 mx-2 overflow-hidden">
                <div className="text-slate-700 dark:text-slate-200 text-sm break-words line-clamp-2">{entry.task}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex-shrink-0">
                    <RefreshCw size={12} className="mr-1" />
                    {entry.count}×
                  </span>
                  {entry.days > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 flex-shrink-0">
                      <Clock size={12} className="mr-1" />
                      {entry.days}d old
                    </span>
                  )}
                </div>
              </div>
              {/* Add a visual indicator based on procrastination severity */}
              <div className="flex-shrink-0">
                {entry.count > 3 || entry.days > 7 ? (
                  <div className="w-2 h-10 bg-red-500 dark:bg-red-400 rounded-full"></div>
                ) : entry.count > 2 || entry.days > 3 ? (
                  <div className="w-2 h-10 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
                ) : (
                  <div className="w-2 h-10 bg-green-500 dark:bg-green-400 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
)}
      
      {/* Procrastination Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 transition-colors">
        <div className="flex items-start gap-3">
          <div className="bg-white dark:bg-slate-800 p-2 rounded-full">
            <TrendingDown size={20} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-1">Procrastination Insight</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {stats.totalDeferred > 10 
                ? "You've deferred several tasks this month. Consider breaking down complex tasks into smaller steps to make them less intimidating."
                : stats.totalDeferred > 0
                  ? "You're doing well at managing procrastination. Keep up the good work!"
                  : "No procrastination data available yet. Keep tracking your tasks to see insights here."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProcrastinationStats;