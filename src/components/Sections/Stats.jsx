import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Flame, BarChart2, LineChart, Activity, TrendingUp, 
         TrendingDown, Dumbbell, ChevronLeft, ChevronRight, Sparkles, 
         Sun, Moon, ArrowRight } from 'lucide-react';
import { ProgressChart } from './Charts/ProgressChart';
import { MoodTrendChart } from './Charts/MoodTrendChart';
import { WorkoutStatsChart } from './Charts/WorkoutStatsChart';
import { MoodEnergyComparisonChart } from './Charts/MoodEnergyComparisonChart';
import { MoodImpactAnalysis } from './Charts/MoodImpactAnalysis';
import { MOODS } from '../MoodSelector';
import { processMoodComparisonData, analyzeMoodImpacts } from '../../utils/moodAnalysisUtils';
import ProcrastinationStats from './Charts/ProcrastinationStats';
import TemplateStatsWidget from '../Templates/TemplateStatsWidget';
import SleepAnalyticsChart from './Charts/SleepAnalyticsChart';
import TopTasksList from '../Stats/TopTasksList';
import { formatDateForStorage } from '../../utils/dateUtils';

export const Stats = ({ storageData, currentMonth: propCurrentMonth }) => {
  const [statsData, setStatsData] = useState({
    monthlyProgress: [],
    totalTasksCompleted: 0,
    avgProgress: 0,
    totalWorkoutMinutes: 0,
    totalCaloriesBurned: 0,
    moodTrend: [],
    workoutData: [],
    moodComparisonData: [],
    moodImpactData: { insights: {} },
    sleepData: []
  });

  // Create ref for ProcrastinationStats
  const procrastinationStatsRef = useRef(null);
  
  // Function to refresh stats
  const refreshProcrastinationStats = () => {
    if (procrastinationStatsRef.current) {
      console.log("Manually refreshing procrastination stats");
      procrastinationStatsRef.current.refresh();
    }
  };
  
  // Add internal state for month selection
  const [currentMonth, setCurrentMonth] = useState(propCurrentMonth || new Date());
  
  // Section visibility state
  const [sectionsVisible, setSectionsVisible] = useState({
    procrastination: true,
    moodComparison: true,
    moodImpact: true,
    sleepAnalysis: true,
    taskCompletion: true,
    moodTrend: true,
    workoutStats: true,
    templateStats: true
  });
  
  // Toggle section visibility
  const toggleSection = (section) => {
    setSectionsVisible(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  useEffect(() => {
    const data = processStorageData(storageData, currentMonth);
    refreshProcrastinationStats();
    setStatsData(data);
  }, [storageData, currentMonth]);
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // This is a partial update focusing on the workout data processing in Stats.jsx
const processStorageData = (data, month) => {
  // Get start and end date for the current month
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  // Data processing variables
  let totalTasksCompleted = 0;
  let totalTasksCreated = 0;
  let totalProgressPercentage = 0;
  let daysWithProgress = 0;
  let totalWorkoutMinutes = 0;
  let totalCaloriesBurned = 0;
  
  const dailyProgressData = [];
  const moodData = [];
  const workoutData = [];
  const sleepData = []; // Added for sleep tracking
  
  // Create a set to track unique workout IDs to avoid duplicates
  const processedWorkoutIds = new Set();
  
  // Process each day in the current month
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDateForStorage(d);
    const dayData = data[dateStr];
    
    if (dayData) {
      // Process tasks and progress
      if (dayData.checked) {
        const completed = Object.values(dayData.checked).filter(Boolean).length;
        const total = Object.values(dayData.checked).length;
        
        if (total > 0) {
          const progressPercentage = Math.round((completed / total) * 100);
          totalTasksCompleted += completed;
          totalTasksCreated += total;
          totalProgressPercentage += progressPercentage;
          daysWithProgress++;
          
          dailyProgressData.push({
            date: dateStr,
            progress: progressPercentage,
            day: d.getDate()
          });
        }
      }
      
      // Process mood data
      const moodToUse = dayData.morningMood || dayData.mood;
      if (moodToUse) {
        moodData.push({
          date: dateStr,
          mood: moodToUse,
          day: d.getDate()
        });
      }
      
      // Process single workout entry
      if (dayData.workout) {
        const workout = dayData.workout;
        const workoutId = workout.id || `workout-${dateStr}-single`;
        
        // Only process if we haven't seen this workout before
        if (!processedWorkoutIds.has(workoutId)) {
          processedWorkoutIds.add(workoutId);
          totalWorkoutMinutes += workout.duration || 0;
          totalCaloriesBurned += parseInt(workout.calories || 0) || 0;
          
          workoutData.push({
            id: workoutId,
            date: dateStr,
            duration: workout.duration || 0,
            calories: parseInt(workout.calories || 0) || 0,
            day: d.getDate(),
            types: workout.types || []
          });
        }
      }
      
      // Process workout array if it exists
      if (dayData.workouts && Array.isArray(dayData.workouts)) {
        dayData.workouts.forEach(workout => {
          const workoutId = workout.id || `workout-${dateStr}-${workoutData.length}`;
          
          // Only process if we haven't seen this workout before
          if (!processedWorkoutIds.has(workoutId)) {
            processedWorkoutIds.add(workoutId);
            totalWorkoutMinutes += workout.duration || 0;
            totalCaloriesBurned += parseInt(workout.calories || 0) || 0;
            
            workoutData.push({
              id: workoutId,
              date: dateStr,
              duration: workout.duration || 0,
              calories: parseInt(workout.calories || 0) || 0,
              day: d.getDate(),
              types: workout.types || []
            });
          }
        });
      }
      
      // Process sleep data
      if (dayData.sleep) {
        const sleep = dayData.sleep;
        sleepData.push({
          date: dateStr,
          day: d.getDate(),
          duration: sleep.duration || 0,
          quality: sleep.quality || 0,
          bedtime: sleep.bedtime || '',
          wakeTime: sleep.wakeTime || '',
          factors: sleep.factors || []
        });
      }
    }
  }
  
  // Also process completedWorkouts from the top level if present
  if (data.completedWorkouts && Array.isArray(data.completedWorkouts)) {
    data.completedWorkouts.forEach(workout => {
      // Parse date from workout
      const workoutDate = new Date(workout.date || workout.completedAt || workout.timestamp);
      const workoutDateStr = formatDateForStorage(workoutDate);
      const workoutId = workout.id || `completed-${workoutDateStr}-${Math.random()}`;
      
      // Only include if it's in the current month and not already processed
      if (workoutDate >= start && workoutDate <= end && !processedWorkoutIds.has(workoutId)) {
        processedWorkoutIds.add(workoutId);
        totalWorkoutMinutes += workout.duration || 0;
        totalCaloriesBurned += parseInt(workout.calories || 0) || 0;
        
        workoutData.push({
          id: workoutId,
          date: workoutDateStr,
          duration: workout.duration || 0,
          calories: parseInt(workout.calories || 0) || 0,
          day: workoutDate.getDate(),
          types: workout.types || []
        });
      }
    });
  }
  
  // Calculate averages and prepare final data
  const avgProgress = daysWithProgress > 0 ? Math.round(totalProgressPercentage / daysWithProgress) : 0;
  
  // Sort data by date
  dailyProgressData.sort((a, b) => new Date(a.date) - new Date(b.date));
  moodData.sort((a, b) => new Date(a.date) - new Date(b.date));
  workoutData.sort((a, b) => new Date(a.date) - new Date(b.date));
  sleepData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Process the morning/evening mood comparison data
  const moodComparisonData = processMoodComparisonData(data, month);
  
  // Analyze the mood impact data
  const moodImpactData = analyzeMoodImpacts(data, month);
  
  return {
    monthlyProgress: dailyProgressData,
    totalTasksCompleted,
    totalTasksCreated,
    avgProgress,
    totalWorkoutMinutes,
    totalCaloriesBurned,
    moodTrend: moodData,
    workoutData: workoutData,
    moodComparisonData,
    moodImpactData,
    sleepData
  };
};

  // Helper function to calculate streak
  const calculateStreak = (progressData) => {
    if (!progressData || progressData.length === 0) return 0;
    
    // Sort data by date (most recent first)
    const sortedData = [...progressData]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get current date
    const today = formatDateForStorage(new Date());
    
    // Find the most recent day with data
    const mostRecentDay = sortedData[0];
    
    // If most recent day is not today or yesterday, no active streak
    if (!mostRecentDay) return 0;
    
    const mostRecentDate = new Date(mostRecentDay.date);
    const todayDate = new Date(today);
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if most recent day is from more than a day ago
    if (mostRecentDate < yesterday && formatDateForStorage(mostRecentDate) !== formatDateForStorage(yesterday)) {
      return 0;
    }
    
    // Calculate streak
    let streak = 1;
    let currentDate = new Date(mostRecentDay.date);
    
    for (let i = 1; i < sortedData.length; i++) {
      // Get previous day
      const previousDay = new Date(currentDate);
      previousDay.setDate(previousDay.getDate() - 1);
      
      // Check if the next entry in our sorted data is the previous day
      const nextEntry = new Date(sortedData[i].date);
      
      if (formatDateForStorage(nextEntry) === formatDateForStorage(previousDay)) {
        // If it's the previous day, increment streak and update current date
        streak++;
        currentDate = previousDay;
      } else {
        // Streak is broken
        break;
      }
    }
    
    return streak;
  };
  
  // Find the most productive day
  const findMostProductiveDay = (progressData) => {
    if (!progressData || progressData.length === 0) return 'N/A';
    
    // Find day with highest progress
    const mostProductiveDay = progressData.reduce((max, day) => 
      day.progress > max.progress ? day : max, 
      { progress: 0 }
    );
    
    // Format as "Mar 15" or return N/A if no data
    if (mostProductiveDay.date) {
      const date = new Date(mostProductiveDay.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return 'N/A';
  };
  
  // Calculate the dominant mood
  const calculateDominantMood = (moodData) => {
    if (!moodData || moodData.length === 0) return 'N/A';
    
    // Count occurrences of each mood
    const moodCounts = {};
    moodData.forEach(item => {
      moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
    });
    
    // Find mood with highest count
    let dominantMood = null;
    let maxCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        dominantMood = mood;
        maxCount = count;
      }
    });
    
    // Return emoji for the dominant mood
    if (dominantMood && MOODS[dominantMood]) {
      return MOODS[dominantMood].emoji;
    }
    
    return 'N/A';
  };

  // Calculate the dominant mood
  const calculateDominantLabel = (moodData) => {
    if (!moodData || moodData.length === 0) return 'N/A';
    
    // Count occurrences of each mood
    const moodCounts = {};
    moodData.forEach(item => {
      moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
    });
    
    // Find mood with highest count
    let dominantMood = null;
    let maxCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        dominantMood = mood;
        maxCount = count;
      }
    });
    
    // Return emoji for the dominant mood
    if (dominantMood && MOODS[dominantMood]) {
      return MOODS[dominantMood].label;
    }
    
    return 'N/A';
  };
  
  // Calculate average mood improvement - NEW METRIC
  const calculateAvgMoodImprovement = () => {
    if (!statsData.moodComparisonData || statsData.moodComparisonData.length === 0) return null;
    
    // Only include days with both morning and evening moods
    const daysWithBothMoods = statsData.moodComparisonData.filter(
      day => day.morningMood !== null && day.eveningMood !== null
    );
    
    if (daysWithBothMoods.length === 0) return null;
    
    // Calculate average change
    const totalChange = daysWithBothMoods.reduce((sum, day) => sum + (day.change || 0), 0);
    const avgChange = totalChange / daysWithBothMoods.length;
    
    return {
      value: avgChange,
      daysCount: daysWithBothMoods.length
    };
  };
  
  // Calculate overall productivity score (0-100)
  const calculateProductivityScore = (data) => {
    // Initial weights for different metrics
    const weights = {
      taskCompletion: 0.4,  // 40% of score
      moodPositivity: 0.2,  // 20% of score
      moodImprovement: 0.2, // 20% of score - NEW
      consistency: 0.2      // 20% of score
    };
    
    // Task completion score (0-100)
    const completionScore = data.avgProgress || 0;
    
    // Mood positivity score (0-100)
    let moodScore = 0;
    if (data.moodTrend && data.moodTrend.length > 0) {
      // Convert moods to numerical values (0-5, where 5 is best)
      const moodValues = data.moodTrend.map(item => {
        const moodMap = {
          'GREAT': 5,
          'GOOD': 4,
          'OKAY': 3, 
          'MEH': 2,
          'BAD': 1,
          'OVERWHELMED': 0
        };
        return moodMap[item.mood] || 3;
      });
      
      // Calculate average mood value
      const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
      // Convert to 0-100 scale
      moodScore = (avgMood / 5) * 100;
    }
    
    // Mood improvement score (0-100) - NEW
    let moodImprovementScore = 50; // Default to neutral
    const avgImprovement = calculateAvgMoodImprovement();
    if (avgImprovement && avgImprovement.daysCount >= 3) {
      // Map from -5 to +5 scale to 0-100 scale (50 is neutral)
      moodImprovementScore = Math.max(0, Math.min(100, (avgImprovement.value + 2.5) * 20));
    }
    
    // Consistency score (0-100)
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    
    // Combine unique days with data
    const uniqueDates = new Set();
    if (data.monthlyProgress) {
      data.monthlyProgress.forEach(item => uniqueDates.add(item.date));
    }
    if (data.moodTrend) {
      data.moodTrend.forEach(item => uniqueDates.add(item.date));
    }
    if (data.workoutData) {
      data.workoutData.forEach(item => uniqueDates.add(item.date));
    }
    
    // Calculate consistency score
    const consistencyScore = Math.min(100, (uniqueDates.size / daysInMonth) * 100);
    
    // Calculate final score
    const finalScore = Math.round(
      (completionScore * weights.taskCompletion) +
      (moodScore * weights.moodPositivity) +
      (moodImprovementScore * weights.moodImprovement) +
      (consistencyScore * weights.consistency)
    );
    
    return finalScore;
  };

  // Get average mood improvement for display
  const avgMoodImprovement = calculateAvgMoodImprovement();

  // Calculate average sleep metrics for display
  const calculateAvgSleepMetrics = () => {
    if (!statsData.sleepData || statsData.sleepData.length === 0) return null;
    
    const totalDuration = statsData.sleepData.reduce((sum, day) => sum + day.duration, 0);
    const totalQuality = statsData.sleepData.reduce((sum, day) => sum + day.quality, 0);
    
    return {
      avgDuration: totalDuration / statsData.sleepData.length,
      avgQuality: totalQuality / statsData.sleepData.length,
      daysTracked: statsData.sleepData.length
    };
  };
  
  const avgSleepMetrics = calculateAvgSleepMetrics();

  // Create section header component for consistency
  const SectionHeader = ({ title, icon, section, isVisible }) => (
    <div 
      onClick={() => toggleSection(section)} 
      className="cursor-pointer mb-4"
    >
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <ArrowRight className={`transition-transform duration-300 ${isVisible ? 'rotate-90' : ''}`} size={20} />
      </h3>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards Section - Always visible */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 transition-colors">
            Stats for {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          
          {/* Month Selector */}
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
          {/* Productivity Streak */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-blue-500 dark:text-blue-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Streak</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 transition-colors">
              {calculateStreak(statsData.monthlyProgress)} days
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
              current productivity streak
            </p>
          </div>
          
          {/* Most Productive Day */}
          <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-teal-500 dark:text-teal-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Best Day</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-300 transition-colors">
              {findMostProductiveDay(statsData.monthlyProgress)}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
              most productive date
            </p>
          </div>
          
          {/* Task Completion Rate */}
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="text-green-500 dark:text-green-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Completion</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300 transition-colors">
              {statsData.totalTasksCompleted}/{statsData.totalTasksCreated}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
              {statsData.avgProgress}% average rate
            </p>
          </div>
          
          {/* Mood Distribution */}
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <LineChart className="text-purple-500 dark:text-purple-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Dominant Mood</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300 transition-colors">
              {calculateDominantMood(statsData.moodTrend)}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {calculateDominantLabel(statsData.moodTrend)}
            </p>
          </div>
        </div>
        
        {/* Second row with more detailed metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
          {/* Sleep Stats Card - NEW */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="text-indigo-500 dark:text-indigo-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Sleep</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300 transition-colors">
              {avgSleepMetrics ? avgSleepMetrics.avgDuration.toFixed(1) + 'h' : 'N/A'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
              {avgSleepMetrics ? `${avgSleepMetrics.daysTracked} nights tracked` : 'no data'}
            </p>
          </div>
          
          {/* Workout Statistics */}
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="text-orange-500 dark:text-orange-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Workouts</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-orange-700 dark:text-orange-300 transition-colors">
              {statsData.workoutData.length} sessions
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
              {statsData.totalWorkoutMinutes} total minutes
            </p>
          </div>
          
          {/* Daily Mood Change */}
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="text-amber-500 dark:text-amber-400" size={20} />
              <Moon className="text-indigo-500 dark:text-indigo-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Mood Trend</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 transition-colors">
              {avgMoodImprovement ? (
                <span className={
                  avgMoodImprovement.value > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : avgMoodImprovement.value < 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : ''
                }>
                  {avgMoodImprovement.value > 0 ? '+' : ''}
                  {avgMoodImprovement.value.toFixed(1)}
                </span>
              ) : 'N/A'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
              {avgMoodImprovement ? `avg daily change (${avgMoodImprovement.daysCount} days)` : 'not enough data'}
            </p>
          </div>
          
          {/* Productivity Rating */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="text-blue-500 dark:text-blue-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Productivity</h3>
            </div>
            <div className="flex items-center">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                  style={{ width: `${calculateProductivityScore(statsData)}%` }}
                ></div>
              </div>
              <p className="ml-3 text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 transition-colors">
                {calculateProductivityScore(statsData)}/100
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors mt-1">
              includes mood improvement
            </p>
          </div>
        </div>
      </div>

      {/* Sleep Analytics Section - NEW */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <SectionHeader 
          title="Sleep Analysis" 
          icon={<Moon className="text-indigo-500 dark:text-indigo-400" size={20} />}
          section="sleepAnalysis"
          isVisible={sectionsVisible.sleepAnalysis}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
          Track how your sleep quality affects your mood and productivity
        </p>
        
        {sectionsVisible.sleepAnalysis && (
          <SleepAnalyticsChart 
            data={statsData.sleepData} 
            moodData={statsData.moodComparisonData}
          />
        )}
      </div>

      {/* Procrastination Stats Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors mb-6">
        <SectionHeader 
          title="Procrastination Analyzer" 
          icon={<Clock className="text-amber-500 dark:text-amber-400" size={20} />}
          section="procrastination"
          isVisible={sectionsVisible.procrastination}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
          Analyze and understand your task deferral patterns
        </p>
        
        {sectionsVisible.procrastination && (
          <ProcrastinationStats 
            ref={procrastinationStatsRef}
            currentMonth={currentMonth} 
            moodData={statsData.moodComparisonData}
          />
        )}
      </div>
      
      {/* Morning/Evening Mood Comparison Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <SectionHeader 
          title="Morning vs Evening Mood" 
          icon={<><Sun className="text-amber-500 dark:text-amber-400" size={20} />
                 <Moon className="text-indigo-500 dark:text-indigo-400" size={20} /></>}
          section="moodComparison"
          isVisible={sectionsVisible.moodComparison}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
          Compare your mood and energy levels throughout the day
        </p>
        
        {sectionsVisible.moodComparison && (
          <div className="h-64">
            <MoodEnergyComparisonChart data={statsData.moodComparisonData} />
          </div>
        )}
      </div>
      
      {/* Mood Impact Analysis Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <SectionHeader 
          title="Mood Impact Analysis" 
          icon={<Sparkles className="text-purple-500 dark:text-purple-400" size={20} />}
          section="moodImpact"
          isVisible={sectionsVisible.moodImpact}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
          Discover which activities and patterns affect your daily mood
        </p>
        
        {sectionsVisible.moodImpact && (
          <MoodImpactAnalysis data={statsData.moodImpactData} />
        )}
      </div>
      
      {/* Charts Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <SectionHeader 
            title="Task Completion Trend" 
            icon={<Activity className="text-blue-500 dark:text-blue-400" size={20} />}
            section="taskCompletion"
            isVisible={sectionsVisible.taskCompletion}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
            Track your daily task completion percentage
          </p>
          
          {sectionsVisible.taskCompletion && (
            <div className="h-64">
              <ProgressChart data={statsData.monthlyProgress} />
            </div>
          )}
        </div>

        {/* Top Tasks Chart */}
        <div className="lg:col-span-2">
  <TopTasksList />
</div>
        
        {/* Mood Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <SectionHeader 
            title="Morning Mood Trend" 
            icon={<LineChart className="text-purple-500 dark:text-purple-400" size={20} />}
            section="moodTrend"
            isVisible={sectionsVisible.moodTrend}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
            Monitor how your mood fluctuates over time
          </p>
          
          {sectionsVisible.moodTrend && (
            <div className="h-64">
              <MoodTrendChart data={statsData.moodTrend} />
            </div>
          )}
        </div>
        
        {/* Workout Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors lg:col-span-2">
          <SectionHeader 
            title="Workout Statistics" 
            icon={<Activity className="text-green-500 dark:text-green-400" size={20} />}
            section="workoutStats"
            isVisible={sectionsVisible.workoutStats}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
            Track your exercise duration and calories burned
          </p>
          
          {sectionsVisible.workoutStats && (
            <div className="h-64">
              <WorkoutStatsChart data={statsData.workoutData} />
            </div>
          )}
        </div>

        {/* Template Stats Widget */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
            <SectionHeader 
              title="Template Usage" 
              icon={<BarChart2 className="text-teal-500 dark:text-teal-400" size={20} />}
              section="templateStats"
              isVisible={sectionsVisible.templateStats}
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
              Track which task templates you use most frequently
            </p>
            
            {sectionsVisible.templateStats && <TemplateStatsWidget />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;