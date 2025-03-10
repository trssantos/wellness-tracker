import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Activity, Calendar, BarChart2, Award, TrendingUp, 
         TrendingDown, Dumbbell, ChevronLeft, ChevronRight, Sparkles, 
         Sun, Moon, ArrowRight, Flame, ChevronUp, ChevronDown, Clock,
         Filter, Heart, Zap, Target } from 'lucide-react';
import { BarChart, LineChart, PieChart, AreaChart, Bar, Line, Pie, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getAllCompletedWorkouts, getWorkoutTypes, calculateWorkoutStats, getWorkoutTypesWithColors } from '../../utils/workoutUtils';
import WorkoutCalendar from './WorkoutCalendar';

// Exercise List Component with Collapse/Expand functionality
const CollapsibleExercises = ({ exercises, initialExpanded = false }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  if (!exercises || exercises.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-3">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-2 bg-slate-700/50 dark:bg-slate-800/80 rounded-lg text-left text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        <span>Exercises ({exercises.length})</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {expanded && (
        <div className="mt-2 space-y-2">
          {exercises.map((exercise, index) => (
            <div 
              key={index}
              className="flex justify-between bg-slate-700 dark:bg-slate-800 p-2 rounded text-sm"
            >
              <div className="text-slate-200">
                {exercise.name}
                {exercise.weight && <span className="text-xs text-slate-400 ml-2">Weight: {exercise.weight}</span>}
              </div>
              <div className="text-slate-300">
                {exercise.sets} × {exercise.reps}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for detailed day view
const DayDetailsView = ({ date, workouts, onBack }) => {
  // Calculate totals for the day
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0);
  
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Get workout type color
  const getTypeColor = (type) => {
    const typeColors = {
      'strength': 'bg-blue-500',
      'cardio': 'bg-red-500',
      'yoga': 'bg-purple-500',
      'cycling': 'bg-green-500',
      'hiit': 'bg-orange-500',
      'weightlifting': 'bg-blue-500',
      'boxing': 'bg-red-500',
      'running': 'bg-amber-500',
      'walking': 'bg-green-500'
    };
    
    return typeColors[type?.toLowerCase()] || 'bg-slate-500';
  };
  
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-medium text-slate-100 mb-1">
          Workouts on {formatDate(date)}
        </h3>
        <button
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Back to Calendar
        </button>
      </div>
      
      {/* Day Summary Stats - NEW SECTION */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={16} className="text-blue-400" />
            <div className="text-xs text-slate-400">Workouts</div>
          </div>
          <div className="text-lg font-bold text-blue-300">
            {workouts.length}
          </div>
        </div>
        
        <div className="bg-amber-900/30 p-3 rounded-lg border border-amber-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-amber-400" />
            <div className="text-xs text-slate-400">Duration</div>
          </div>
          <div className="text-lg font-bold text-amber-300">
            {totalDuration} min
          </div>
        </div>
        
        <div className="bg-red-900/30 p-3 rounded-lg border border-red-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-red-400" />
            <div className="text-xs text-slate-400">Calories</div>
          </div>
          <div className="text-lg font-bold text-red-300">
            {totalCalories || 0}
          </div>
        </div>
      </div>
      
      {/* Workout List */}
      <div className="space-y-4">
        {workouts.map((workout, index) => (
          <div 
            key={index}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-slate-100 text-lg">
                {workout.name}
              </h4>
              <div className="text-sm text-slate-400">
                {formatTime(workout.completedAt || workout.timestamp)}
              </div>
            </div>
            
            {/* Workout Type Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {workout.types && workout.types.map((type, i) => (
                <span 
                  key={i}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTypeColor(type)} text-white`}
                >
                  {type}
                </span>
              ))}
              
              {(!workout.types || workout.types.length === 0) && workout.type && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTypeColor(workout.type)} text-white`}>
                  {workout.type}
                </span>
              )}
            </div>
            
            {/* Workout Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-slate-700 p-2 rounded-lg text-center">
                <div className="text-xs text-slate-400">Duration</div>
                <div className="text-sm font-medium text-slate-100">{workout.duration} min</div>
              </div>
              
              {workout.calories && (
                <div className="bg-slate-700 p-2 rounded-lg text-center">
                  <div className="text-xs text-slate-400">Calories</div>
                  <div className="text-sm font-medium text-slate-100">{workout.calories}</div>
                </div>
              )}
              
              {workout.intensity && (
                <div className="bg-slate-700 p-2 rounded-lg text-center">
                  <div className="text-xs text-slate-400">Intensity</div>
                  <div className="text-sm font-medium text-slate-100">{workout.intensity}/5</div>
                </div>
              )}
            </div>
            
            {/* Collapsible Exercises Section */}
            {workout.exercises && workout.exercises.length > 0 && (
              <CollapsibleExercises exercises={workout.exercises} />
            )}
            
            {/* Notes if available */}
            {workout.notes && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Notes:</div>
                <div className="text-sm text-slate-300">
                  {workout.notes}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkoutAnalytics = ({ onBack }) => {
  const [workouts, setWorkouts] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'year', 'all'
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'calendar', 'details'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState([]);
  const [statsData, setStatsData] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    avgDuration: 0,
    consistency: 0,
    frequencyByDay: [],
    workoutsByType: [],
    caloriesTrend: [],
    durationTrend: [],
    completionRate: 0,
    longestStreak: 0,
    currentStreak: 0,
  });
  
  // Load workout data
  useEffect(() => {
    loadWorkouts();
  }, []);
  
  // Process data when workouts or filters change
  useEffect(() => {
    if (workouts.length > 0) {
      processWorkoutData();
    }
  }, [workouts, timeRange, workoutTypeFilter]);
  
  const loadWorkouts = () => {
    try {
      // Get data directly from localStorage - using the same method as Stats.jsx
      const storageString = localStorage.getItem('wellnessTracker');
      
      if (!storageString) {
        console.warn("No zentrack data found in localStorage");
        setWorkouts([]);
        return;
      }
      
      const storageData = JSON.parse(storageString);
      console.log("Successfully loaded zentrack data");
      
      let allWorkouts = [];
      const processedWorkoutIds = new Set();
      
      // STEP 1: Process completedWorkouts array (top level)
      if (storageData.completedWorkouts && Array.isArray(storageData.completedWorkouts)) {
        storageData.completedWorkouts.forEach(workout => {
          const workoutId = workout.id;
          if (!processedWorkoutIds.has(workoutId)) {
            processedWorkoutIds.add(workoutId);
            allWorkouts.push({
              ...workout,
              date: workout.date,
              id: workoutId
            });
          }
        });
      }
      
      // STEP 2: Process date entries with workout property
      Object.entries(storageData).forEach(([dateKey, dateData]) => {
        // Skip if not a date entry or if it's a special key
        if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/) || 
            !dateData || 
            typeof dateData !== 'object') {
          return;
        }
        
        // Process single workout
        if (dateData.workout) {
          const workout = dateData.workout;
          const workoutId = workout.id || `workout-${dateKey}`;
          
          if (!processedWorkoutIds.has(workoutId)) {
            processedWorkoutIds.add(workoutId);
            allWorkouts.push({
              ...workout,
              date: dateKey,
              id: workoutId
            });
          }
        }
        
        // Process workouts array
        if (dateData.workouts && Array.isArray(dateData.workouts)) {
          dateData.workouts.forEach(workout => {
            const workoutId = workout.id;
            
            if (!processedWorkoutIds.has(workoutId)) {
              processedWorkoutIds.add(workoutId);
              allWorkouts.push({
                ...workout,
                date: workout.date || dateKey,
                id: workoutId
              });
            }
          });
        }
      });
      
      console.log(`Found ${allWorkouts.length} total workouts`);
      setWorkouts(allWorkouts);
    } catch (error) {
      console.error("Error loading workouts:", error);
      setWorkouts([]);
    }
  };

  // Comprehensive function to get all workouts from all storage locations
const getAllWorkouts = () => {
  let allWorkouts = [];
  
  try {
    // Get data from localStorage to account for all workout types
    const storageData = JSON.parse(localStorage.getItem('zentrack-data') || '{}');
    
    // 1. Get workouts from completedWorkouts array
    if (storageData.completedWorkouts && Array.isArray(storageData.completedWorkouts)) {
      allWorkouts = [...storageData.completedWorkouts];
    }
    
    // 2. Get workouts directly stored in date entries
    Object.entries(storageData).forEach(([dateKey, dateData]) => {
      // Skip if not a date entry or if it's a special key
      if (!dateData || typeof dateData !== 'object' || 
          dateKey === 'completedWorkouts' || dateKey === 'settings' || 
          dateKey === 'habits' || dateKey === 'workouts' || 
          dateKey === 'reminderSettings' || dateKey === 'focusSessions') {
        return;
      }
      
      // Check for single workout
      if (dateData.workout) {
        const workout = {
          ...dateData.workout,
          date: dateKey,
          id: dateData.workout.id || `workout-${dateKey}-${Date.now()}`
        };
        allWorkouts.push(workout);
      }
      
      // Check for workouts array
      if (dateData.workouts && Array.isArray(dateData.workouts)) {
        dateData.workouts.forEach(workout => {
          allWorkouts.push({
            ...workout,
            date: workout.date || dateKey
          });
        });
      }
    });
    
    // Add console logs for debugging
    console.log("Raw workout data found:", allWorkouts);
    
    // 3. Deduplicate workouts by ID if needed
    const workoutMap = new Map();
    allWorkouts.forEach(workout => {
      // Make sure we have a valid ID
      const id = workout.id || `workout-${Date.now()}-${Math.random()}`;
      
      // Use the workout ID as the key in the map (this will automatically deduplicate)
      workoutMap.set(id, {
        ...workout,
        id: id
      });
    });
    
    const result = Array.from(workoutMap.values());
    console.log("After deduplication:", result.length, "workouts found");
    return result;
  } catch (error) {
    console.error("Error getting workouts:", error);
    return [];
  }
};
  
  const processWorkoutData = () => {
    // Filter workouts based on selected time range
    const filteredWorkouts = filterWorkoutsByTimeRange(workouts, timeRange);
    
    // Filter by workout type if needed
    const typeFilteredWorkouts = workoutTypeFilter === 'all' 
      ? filteredWorkouts 
      : filteredWorkouts.filter(workout => 
          workout.type === workoutTypeFilter || 
          (workout.types && workout.types.includes(workoutTypeFilter))
        );
    
    // Calculate stats
    const stats = calculateWorkoutStatsImproved(typeFilteredWorkouts);
    
    // Create data for charts
    const frequencyByDay = calculateFrequencyByDay(typeFilteredWorkouts);
    const workoutsByType = calculateWorkoutsByType(filteredWorkouts);
    const caloriesTrend = calculateCaloriesTrend(typeFilteredWorkouts);
    const durationTrend = calculateDurationTrend(typeFilteredWorkouts);
    
    setStatsData({
      ...stats,
      frequencyByDay,
      workoutsByType,
      caloriesTrend,
      durationTrend
    });
  };

  // Improved stats calculation function
  const calculateWorkoutStatsImproved = (workouts) => {
    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0, 
        avgDuration: 0,
        avgIntensity: 0,
        consistency: 0,
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0
      };
    }

    // Sort workouts by date
    const sortedWorkouts = [...workouts].sort((a, b) => {
      const dateA = new Date(a.date || a.completedAt || a.timestamp);
      const dateB = new Date(b.date || b.completedAt || b.timestamp);
      return dateA - dateB;
    });

    // Basic stats
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, workout) => {
      const calories = parseInt(workout.calories) || 0;
      return sum + calories;
    }, 0);
    
    const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
    
    // Calculate average intensity if available
    let intensitySum = 0;
    let intensityCount = 0;
    workouts.forEach(workout => {
      if (workout.intensity) {
        intensitySum += workout.intensity;
        intensityCount++;
      }
    });
    const avgIntensity = intensityCount > 0 ? intensitySum / intensityCount : 0;

    // Calculate streaks and consistency
    const uniqueDates = new Map();
    workouts.forEach(workout => {
      const dateStr = typeof workout.date === 'string' ? workout.date : 
                   new Date(workout.completedAt || workout.timestamp).toISOString().split('T')[0];
      uniqueDates.set(dateStr, true);
    });

    // Calculate streaks
    const dates = Array.from(uniqueDates.keys()).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreak2 = 0;

    // Calculate longest streak
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak2 = 1;
      } else {
        const current = new Date(dates[i]);
        const prev = new Date(dates[i-1]);
        const diffDays = Math.round((current - prev) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak2++;
        } else {
          currentStreak2 = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, currentStreak2);
    }

    // Calculate current streak (consecutive days ending with today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if today or yesterday had a workout
    const hasTodayWorkout = uniqueDates.has(todayStr);
    const hasYesterdayWorkout = uniqueDates.has(yesterdayStr);
    
    if (hasTodayWorkout || hasYesterdayWorkout) {
      // Start with 1 for today/yesterday
      currentStreak = 1;
      
      // Start checking from yesterday or the day before
      const startDate = hasTodayWorkout ? yesterday : new Date(yesterday);
      startDate.setDate(startDate.getDate() - 1);
      
      // Go backwards day by day
      for (let d = new Date(startDate); ; d.setDate(d.getDate() - 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (uniqueDates.has(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate consistency (% of days with workouts in the period)
    const firstDate = dates.length > 0 ? new Date(dates[0]) : new Date();
    const lastDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date();
    const totalDays = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const consistency = totalDays > 0 ? Math.round((uniqueDates.size / totalDays) * 100) : 0;

    // Calculate completion rate (if workout templates were used)
    let completionRate = 100; // Default to 100% if no templates were used

    return {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      avgDuration,
      avgIntensity,
      consistency,
      currentStreak,
      longestStreak,
      completionRate
    };
  };
  
  // Filter workouts based on proper time range
  const filterWorkoutsByTimeRange = (workouts, range) => {
    if (!workouts || workouts.length === 0) return [];
    
    // If range is 'all', return all workouts
    if (range === 'all') {
      return workouts;
    }
    
    const now = new Date();
    let startDate, endDate;
    
    switch (range) {
      case 'week':
        // Last 7 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        // Current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        // Current year
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        return workouts; // Default to all workouts
    }
    
    return workouts.filter(workout => {
      // Parse the date from various formats
      let workoutDate;
      
      if (typeof workout.date === 'string' && workout.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Handle YYYY-MM-DD format
        const [year, month, day] = workout.date.split('-').map(Number);
        workoutDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      } else if (workout.completedAt) {
        workoutDate = new Date(workout.completedAt);
      } else if (workout.timestamp) {
        workoutDate = new Date(workout.timestamp);
      } else {
        // If no usable date is found, skip this workout
        return false;
      }
      
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  };
  
  // Calculate workout frequency by day of week
  const calculateFrequencyByDay = (workouts) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    
    workouts.forEach(workout => {
      let workoutDate;
      if (workout.date && typeof workout.date === 'string') {
        // Handle date as string (YYYY-MM-DD)
        workoutDate = new Date(workout.date + 'T12:00:00');
      } else {
        // Handle timestamp or completedAt
        workoutDate = new Date(workout.completedAt || workout.timestamp);
      }
      
      dayCounts[workoutDate.getDay()]++;
    });
    
    return days.map((day, index) => ({
      day: day.substring(0, 3),
      count: dayCounts[index]
    }));
  };
  
  // Calculate workout distribution by type
  const calculateWorkoutsByType = (workouts) => {
    const typeMap = {};
    const types = getWorkoutTypesWithColors();
    
    workouts.forEach(workout => {
      // Handle workouts with multiple types
      if (workout.types && workout.types.length > 0) {
        workout.types.forEach(type => {
          const normalizedType = type.toLowerCase();
          typeMap[normalizedType] = (typeMap[normalizedType] || 0) + 1;
        });
      } else if (workout.type) {
        const normalizedType = workout.type.toLowerCase();
        typeMap[normalizedType] = (typeMap[normalizedType] || 0) + 1;
      } else {
        typeMap['other'] = (typeMap['other'] || 0) + 1;
      }
    });
    
    return Object.entries(typeMap).map(([type, count]) => {
      const typeInfo = types.find(t => t.value.toLowerCase() === type.toLowerCase());
      return {
        type: typeInfo ? typeInfo.label : type,
        count,
        color: typeInfo ? typeInfo.color : '#6B7280'
      };
    }).sort((a, b) => b.count - a.count);
  };
  
  // Calculate calories burned trend - fixed to properly sum by date
  const calculateCaloriesTrend = (workouts) => {
    // Group by date
    const caloriesByDate = {};
    
    workouts.forEach(workout => {
      let dateStr;
      if (workout.date && typeof workout.date === 'string') {
        // Handle date string
        dateStr = workout.date;
      } else {
        // Handle timestamp or completedAt
        const date = new Date(workout.completedAt || workout.timestamp);
        dateStr = date.toISOString().split('T')[0];
      }
      
      if (!caloriesByDate[dateStr]) {
        caloriesByDate[dateStr] = 0;
      }
      
      // Ensure calories are parsed as numbers
      const calories = parseInt(workout.calories) || 0;
      caloriesByDate[dateStr] += calories;
    });
    
    // Convert to array and sort by date
    return Object.entries(caloriesByDate)
      .map(([date, calories]) => ({
        date,
        calories,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Calculate duration trend with proper aggregation by date
  const calculateDurationTrend = (workouts) => {
    // Group by date
    const durationByDate = {};
    const countByDate = {};
    
    workouts.forEach(workout => {
      let dateStr;
      if (workout.date && typeof workout.date === 'string') {
        // Handle date string
        dateStr = workout.date;
      } else {
        // Handle timestamp or completedAt
        const date = new Date(workout.completedAt || workout.timestamp);
        dateStr = date.toISOString().split('T')[0];
      }
      
      if (!durationByDate[dateStr]) {
        durationByDate[dateStr] = 0;
        countByDate[dateStr] = 0;
      }
      
      durationByDate[dateStr] += workout.duration || 0;
      countByDate[dateStr]++;
    });
    
    // Convert to array and sort by date
    return Object.entries(durationByDate)
      .map(([date, duration]) => ({
        date,
        totalDuration: duration,
        avgDuration: Math.round(duration / countByDate[date]),
        workouts: countByDate[date],
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800 dark:text-slate-200">{payload[0].payload.formattedDate || label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Handle calendar date click
  const handleCalendarDateClick = (date, workoutList) => {
    if (workoutList && workoutList.length > 0) {
      setSelectedDate(date);
      setSelectedDateWorkouts(workoutList);
      setActiveSection('details');
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-sm p-3 sm:p-6 w-full">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-800"
        >
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <h2 className="text-base sm:text-xl font-semibold text-white">Workout Analytics</h2>
      </div>
      
      {/* Section Tabs */}
      <div className="flex border-b border-slate-700 mb-6">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSection === 'overview'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSection('calendar')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSection === 'calendar'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Calendar
        </button>
      </div>
      
      {workouts.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <Dumbbell size={40} className="text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Workout Data Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Complete workouts to see analytics and track your progress over time.
          </p>
        </div>
      ) : activeSection === 'details' ? (
        // Selected Date Details
        <DayDetailsView 
          date={selectedDate} 
          workouts={selectedDateWorkouts}
          onBack={() => setActiveSection('calendar')}
        />
      ) : activeSection === 'calendar' ? (
        // Calendar View
        <div>
          {/* Time Range Selector for Calendar */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-lg overflow-hidden">
              <button
                onClick={() => setTimeRange('month')}
                className={`py-1 px-3 text-xs ${
                  timeRange === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`py-1 px-3 text-xs ${
                  timeRange === 'year' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`py-1 px-3 text-xs ${
                  timeRange === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <WorkoutCalendar 
              workoutData={workouts}
              onDateClick={handleCalendarDateClick}
            />
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell size={16} className="text-blue-400" />
                <div className="text-xs text-slate-400">Total Workouts</div>
              </div>
              <div className="text-lg font-bold text-white">
                {statsData.totalWorkouts}
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={16} className="text-green-400" />
                <div className="text-xs text-slate-400">Current Streak</div>
              </div>
              <div className="text-lg font-bold text-white">
                {statsData.currentStreak} days
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-red-400" />
                <div className="text-xs text-slate-400">Total Calories</div>
              </div>
              <div className="text-lg font-bold text-white">
                {formatNumber(statsData.totalCalories || 0)}
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-amber-400" />
                <div className="text-xs text-slate-400">Total Time</div>
              </div>
              <div className="text-lg font-bold text-white">
                {formatNumber(statsData.totalMinutes)} min
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Overview Section
        <>
          {/* Time Range Selector */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2 flex items-center gap-1">
                <Filter size={12} className="sm:w-4 sm:h-4" />
                Time Range
              </label>
              <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`flex-1 py-1.5 sm:py-2 text-center text-xs sm:text-sm ${
                    timeRange === 'week' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`flex-1 py-1.5 sm:py-2 text-center text-xs sm:text-sm ${
                    timeRange === 'month' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`flex-1 py-1.5 sm:py-2 text-center text-xs sm:text-sm ${
                    timeRange === 'year' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Year
                </button>
                <button
                  onClick={() => setTimeRange('all')}
                  className={`flex-1 py-1.5 sm:py-2 text-center text-xs sm:text-sm ${
                    timeRange === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell size={16} className="text-blue-400" />
                <div className="text-xs sm:text-sm text-slate-400">Total Workouts</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {statsData.totalWorkouts}
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-green-400" />
                <div className="text-xs sm:text-sm text-slate-400">Total Time</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {formatNumber(statsData.totalMinutes)} min
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-red-400" />
                <div className="text-xs sm:text-sm text-slate-400">Calories Burned</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {formatNumber(statsData.totalCalories || 0)}
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-purple-400" />
                <div className="text-xs sm:text-sm text-slate-400">Current Streak</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {statsData.currentStreak} days
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-amber-400" />
                <div className="text-xs sm:text-sm text-slate-400">Consistency</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {statsData.consistency}%
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-teal-400" />
                <div className="text-xs sm:text-sm text-slate-400">Longest Streak</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {statsData.longestStreak} days
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Heart size={16} className="text-indigo-400" />
                <div className="text-xs sm:text-sm text-slate-400">Avg. Duration</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {statsData.avgDuration} min
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-orange-400" />
                <div className="text-xs sm:text-sm text-slate-400">Completion Rate</div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {statsData.completionRate}%
              </div>
            </div>
          </div>
          
          {/* Main Chart - Workout Frequency */}
          <div className="mb-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-sm sm:text-base font-medium text-slate-300 mb-3">
              Workout Frequency
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={statsData.durationTrend}
                  margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgDuration"
                    name="Avg. Duration (min)"
                    stroke="#3B82F6"
                    fill="#93c5fd"
                    fillOpacity={0.5}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="workouts"
                    name="Workouts"
                    stroke="#10B981"
                    fill="#6EE7B7"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Secondary Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Workout Distribution by Type */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm sm:text-base font-medium text-slate-300 mb-3">
                Workout Types
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData.workoutsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statsData.workoutsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [value, props.payload.type]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Day of Week Distribution */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm sm:text-base font-medium text-slate-300 mb-3">
                Day of Week Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsData.frequencyByDay}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Workouts" fill="#8B5CF6">
                      {statsData.frequencyByDay.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#8B5CF6' : '#1E293B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Calories Burned Trend */}
          <div className="mb-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-sm sm:text-base font-medium text-slate-300 mb-3">
              Calories Burned Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={statsData.caloriesTrend}
                  margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    name="Calories"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ stroke: '#EF4444', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Extra Stats and Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Most Active Day */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                Most Active Day
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <Calendar size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-medium text-white">
                    {statsData.frequencyByDay.length > 0 
                      ? statsData.frequencyByDay.reduce((max, day) => day.count > max.count ? day : max, { count: 0 }).day
                      : 'N/A'
                    }
                  </div>
                  <div className="text-xs text-slate-400">
                    Most frequent workout day
                  </div>
                </div>
              </div>
            </div>
            
            {/* Favorite Workout Type */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                Favorite Workout
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <Activity size={20} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-medium text-white">
                    {statsData.workoutsByType.length > 0 
                      ? statsData.workoutsByType[0].type
                      : 'N/A'
                    }
                  </div>
                  <div className="text-xs text-slate-400">
                    Most frequent workout type
                  </div>
                </div>
              </div>
            </div>
            
            {/* Average Intensity */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                Workout Intensity
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center">
                  <Target size={20} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-lg font-medium text-white">
                    {statsData.avgIntensity ? statsData.avgIntensity.toFixed(1) : 'N/A'}/5
                  </div>
                  <div className="text-xs text-slate-400">
                    Average intensity level
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkoutAnalytics;