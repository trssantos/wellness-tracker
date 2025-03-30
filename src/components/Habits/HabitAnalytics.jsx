import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, AreaChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Award, Calendar, Clock, TrendingUp, BarChart2, Activity, ArrowLeft, Filter } from 'lucide-react';
import { getHabits, getHabitCalendarData, getHabitStatusForDate } from '../../utils/habitTrackerUtils';
import { formatDateForStorage } from '../../utils/dateUtils';

const HabitAnalytics = ({ onBack }) => {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [chartData, setChartData] = useState([]);
  const [dayOfWeekData, setDayOfWeekData] = useState([]);
  const [timeOfDayData, setTimeOfDayData] = useState([]);
  const [streakData, setStreakData] = useState([]);
  
  useEffect(() => {
    // Load all habits
    const allHabits = getHabits();
    setHabits(allHabits);
    
    // Set the first habit as selected by default
    if (allHabits.length > 0 && !selectedHabit) {
      setSelectedHabit(allHabits[0]);
    }
  }, []);
  
  useEffect(() => {
    if (selectedHabit) {
      generateChartData();
    }
  }, [selectedHabit, timeRange]);
  
  const generateChartData = () => {
    const today = new Date();
    let startDate;
    
    // Calculate start date based on time range
    if (timeRange === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
    } else if (timeRange === 'year') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 365);
    }
    
    const dateStr = (date) => formatDateForStorage(date);
    
    // Get habit data for selected range
    const habitData = getHabitCalendarData(selectedHabit, dateStr(startDate), dateStr(today));
    
    // Prepare data for main chart
    const data = habitData.map(item => {
      const date = new Date(item.date);
      return {
        date: item.date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        monthDay: date.getDate(),
        status: item.status,
        statusValue: item.status === 1 ? 1 : 0,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        })
      };
    });
    
    setChartData(data);
    
    // Prepare day of week data
    const dayMap = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
    const dayTotalMap = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
    
    data.forEach(item => {
      if (item.status === 1) {
        dayMap[item.dayName]++;
      }
      if (item.status !== 0) { // Count only days when habit was scheduled (not 0)
        dayTotalMap[item.dayName]++;
      }
    });
    
    const weekdayData = Object.keys(dayMap).map(day => ({
      day,
      value: dayTotalMap[day] ? Math.round((dayMap[day] / dayTotalMap[day]) * 100) : 0,
      completions: dayMap[day],
      total: dayTotalMap[day]
    }));
    
    setDayOfWeekData(weekdayData);
    
    // Prepare time of day data
    const timeDistribution = [
      { name: 'Morning', value: 0 },
      { name: 'Afternoon', value: 0 },
      { name: 'Evening', value: 0 },
      { name: 'Anytime', value: 0 }
    ];
    
    // Add 1 to the appropriate time slot
    const timeIndex = timeDistribution.findIndex(t => 
      t.name.toLowerCase() === (selectedHabit.timeOfDay || 'anytime').toLowerCase()
    );
    
    if (timeIndex !== -1) {
      timeDistribution[timeIndex].value = 100;
    }
    
    setTimeOfDayData(timeDistribution);
    
    // Prepare streak data
    if (selectedHabit.streakHistory && selectedHabit.streakHistory.length > 0) {
      const streakHistory = [...selectedHabit.streakHistory]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-10); // Get the last 10 streak records
      
      setStreakData(streakHistory.map(record => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        streak: record.streak
      })));
    } else {
      setStreakData([]);
    }
  };
  
  const getStreakColor = (streak) => {
    if (streak >= 100) return '#f59e0b'; // amber-500
    if (streak >= 30) return '#10b981'; // emerald-500
    if (streak >= 7) return '#3b82f6'; // blue-500
    return '#6b7280'; // gray-500
  };
  
  const calculateStats = () => {
    if (!selectedHabit) return {};
    
    const { stats } = selectedHabit;
    const completedDays = chartData.filter(d => d.status === 1).length;
    const totalScheduledDays = chartData.filter(d => d.status !== 0).length;
    const recentRate = totalScheduledDays ? Math.round((completedDays / totalScheduledDays) * 100) : 0;
    
    return {
      currentStreak: stats.streakCurrent,
      longestStreak: stats.streakLongest,
      completionRate: stats.completionRate * 100,
      recentCompletionRate: recentRate,
      totalCompletions: stats.totalCompletions
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 sm:p-6 w-full transition-colors">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-xl font-semibold text-slate-800 dark:text-slate-100">Habit Analytics</h2>
      </div>
      
      {/* Habit Selector and Time Range */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
            Select Habit
          </label>
          <select 
            value={selectedHabit?.id || ''}
            onChange={(e) => {
              const habit = habits.find(h => h.id === e.target.value);
              setSelectedHabit(habit);
            }}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm"
          >
            {habits.map(habit => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 flex items-center gap-1">
            <Filter size={12} className="sm:w-4 sm:h-4" />
            Time Range
          </label>
          <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeRange('week')}
              className={`flex-1 py-1.5 sm:py-2 text-center text-xs sm:text-sm ${
                timeRange === 'week' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`flex-1 py-1.5 sm:py-2 text-center text-xs sm:text-sm ${
                timeRange === 'month' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`flex-1 py-1.5 sm:py-2 text-center text-xs sm:text-sm ${
                timeRange === 'year' 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg transition-colors">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <TrendingUp size={14} className="sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400" />
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Current Streak</div>
          </div>
          <div className="text-base sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.currentStreak} days
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg transition-colors">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Award size={14} className="sm:w-5 sm:h-5 text-purple-500 dark:text-purple-400" />
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Longest</div>
          </div>
          <div className="text-base sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
            {stats.longestStreak} days
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg transition-colors">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Activity size={14} className="sm:w-5 sm:h-5 text-green-500 dark:text-green-400" />
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Completion</div>
          </div>
          <div className="text-base sm:text-2xl font-bold text-green-700 dark:text-green-300">
            {Math.round(stats.completionRate)}%
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/30 p-2 sm:p-3 rounded-lg transition-colors">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Calendar size={14} className="sm:w-5 sm:h-5 text-amber-500 dark:text-amber-400" />
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {timeRange === 'week' ? '7-day' : timeRange === 'month' ? '30-day' : 'Year'}
            </div>
          </div>
          <div className="text-base sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
            {stats.recentCompletionRate}%
          </div>
        </div>
        
        <div className="bg-teal-50 dark:bg-teal-900/30 p-2 sm:p-3 rounded-lg transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <BarChart2 size={14} className="sm:w-5 sm:h-5 text-teal-500 dark:text-teal-400" />
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total</div>
          </div>
          <div className="text-base sm:text-2xl font-bold text-teal-700 dark:text-teal-300">
            {stats.totalCompletions}
          </div>
        </div>
      </div>
      
      {/* Main Chart - Habit Completion Timeline */}
      <div className="mb-4 sm:mb-6 overflow-hidden">
        <h3 className="text-sm sm:text-md font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">Habit Completion Timeline</h3>
        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 sm:p-4 h-56 sm:h-64 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 10 }}
                tickFormatter={(value, index) => {
                  // Only show every nth label depending on the time range
                  const interval = timeRange === 'week' ? 1 : timeRange === 'month' ? 6 : 30;
                  return index % interval === 0 ? value : '';
                }}
              />
              <YAxis domain={[0, 1]} hide={true} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-xs">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{data.formattedDate}</p>
                        <p className="text-slate-600 dark:text-slate-400">{data.dayName}</p>
                        <p className={`font-medium ${
                          data.status === 1 
                            ? 'text-green-600 dark:text-green-400' 
                            : data.status === -1 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {data.status === 1 ? 'Completed' : data.status === -1 ? 'Missed' : 'Not Scheduled'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="statusValue" 
                stroke="#3b82f6" 
                fill="#93c5fd" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Secondary Charts Row - Modified for mobile */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {/* Day of Week Performance */}
        <div className="overflow-hidden">
          <h3 className="text-sm sm:text-md font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">Day of Week Performance</h3>
          <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 sm:p-4 h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dayOfWeekData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} width={30} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-xs">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{data.day}</p>
                          <p className="text-green-600 dark:text-green-400">
                            Completed: {data.completions} of {data.total}
                          </p>
                          <p className="font-medium text-blue-600 dark:text-blue-400">
                            {data.value}% success rate
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Time of Day Distribution */}
        <div className="overflow-hidden">
          <h3 className="text-sm sm:text-md font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">Preferred Time</h3>
          <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 sm:p-4 h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeOfDayData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} hide tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#a78bfa">
                  {timeOfDayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#a78bfa' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Streak Progress */}
        <div className="overflow-hidden">
          <h3 className="text-sm sm:text-md font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">Streak Progress</h3>
          <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 sm:p-4 h-48 sm:h-56">
            {streakData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={streakData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="streak"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                No streak data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitAnalytics;