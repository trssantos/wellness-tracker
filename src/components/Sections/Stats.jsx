import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Flame, BarChart2, LineChart, Activity, TrendingUp, Dumbbell, ChevronLeft, ChevronRight, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';
import { ProgressChart } from './Charts/ProgressChart';
import { MoodTrendChart } from './Charts/MoodTrendChart';
import { WorkoutStatsChart } from './Charts/WorkoutStatsChart';
import { MoodEnergyComparisonChart } from './Charts/MoodEnergyComparisonChart';
import { MoodImpactAnalysis } from './Charts/MoodImpactAnalysis';
import { MOODS } from '../MoodSelector';
import { processMoodComparisonData, analyzeMoodImpacts } from '../../utils/moodAnalysisUtils';
import ProcrastinationStats from './Charts/ProcrastinationStats';

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
    moodImpactData: { insights: {} }
  });
  
  // Add internal state for month selection
  const [currentMonth, setCurrentMonth] = useState(propCurrentMonth || new Date());
  
  // Add state for showing the mood impact section
  const [showMoodImpactSection, setShowMoodImpactSection] = useState(true);
  
  useEffect(() => {
    const data = processStorageData(storageData, currentMonth);
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
    
    // Process each day in the current month
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
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
        
        // Process mood data - prioritize morning mood for backward compatibility
        const moodToUse = dayData.morningMood || dayData.mood;
        if (moodToUse) {
          moodData.push({
            date: dateStr,
            mood: moodToUse,
            day: d.getDate()
          });
        }
        
        // Process workout data
        if (dayData.workout) {
          const workout = dayData.workout;
          totalWorkoutMinutes += workout.duration || 0;
          totalCaloriesBurned += parseInt(workout.calories || 0) || 0;
          
          workoutData.push({
            date: dateStr,
            duration: workout.duration || 0,
            calories: parseInt(workout.calories || 0) || 0,
            day: d.getDate(),
            types: workout.types || []
          });
        }
      }
    }
    
    // Calculate averages and prepare final data
    const avgProgress = daysWithProgress > 0 ? Math.round(totalProgressPercentage / daysWithProgress) : 0;
    
    // Sort data by date
    dailyProgressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    moodData.sort((a, b) => new Date(a.date) - new Date(b.date));
    workoutData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
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
      moodImpactData
    };
  };

  // Helper function to calculate streak
  const calculateStreak = (progressData) => {
    if (!progressData || progressData.length === 0) return 0;
    
    // Sort data by date (most recent first)
    const sortedData = [...progressData]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get current date
    const today = new Date().toISOString().split('T')[0];
    
    // Find the most recent day with data
    const mostRecentDay = sortedData[0];
    
    // If most recent day is not today or yesterday, no active streak
    if (!mostRecentDay) return 0;
    
    const mostRecentDate = new Date(mostRecentDay.date);
    const todayDate = new Date(today);
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if most recent day is from more than a day ago
    if (mostRecentDate < yesterday && mostRecentDate.toISOString().split('T')[0] !== yesterday.toISOString().split('T')[0]) {
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
      
      if (nextEntry.toISOString().split('T')[0] === previousDay.toISOString().split('T')[0]) {
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

  return (
    <div className="space-y-6">
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
          
          {/* Calories Burned */}
          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-red-500 dark:text-red-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Calories</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300 transition-colors">
              {statsData.totalCaloriesBurned} kcal
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
              {statsData.totalCaloriesBurned > 0 ? `~${Math.round(statsData.totalCaloriesBurned / (statsData.workoutData.length || 1))} per session` : '0 per session'}
            </p>
          </div>
          
          {/* NEW: Daily Mood Change */}
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
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-2 sm:p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="text-indigo-500 dark:text-indigo-400" size={20} />
              <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">Productivity</h3>
            </div>
            <div className="flex items-center">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                  style={{ width: `${calculateProductivityScore(statsData)}%` }}
                ></div>
              </div>
              <p className="ml-3 text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300 transition-colors">
                {calculateProductivityScore(statsData)}/100
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors mt-1">
              includes mood improvement
            </p>
          </div>
        </div>
      </div>
      
      {/* Morning/Evening Mood Comparison Chart - NEW SECTION */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
          <Sun className="text-amber-500 dark:text-amber-400" size={20} />
          <Moon className="text-indigo-500 dark:text-indigo-400" size={20} />
          <span>Morning vs Evening Mood</span>
        </h3>
        <div className="h-64">
          <MoodEnergyComparisonChart data={statsData.moodComparisonData} />
        </div>
      </div>
      
      {/* Mood Impact Analysis - NEW SECTION */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div onClick={() => setShowMoodImpactSection(!showMoodImpactSection)} className="cursor-pointer">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-1 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-500 dark:text-purple-400" size={20} />
              <span>Mood Impact Analysis</span>
            </div>
            <ArrowRight className={`transition-transform duration-300 ${showMoodImpactSection ? 'rotate-90' : ''}`} size={20} />
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
            Discover which activities and patterns affect your daily mood
          </p>
        </div>
        
        {showMoodImpactSection && (
          <MoodImpactAnalysis data={statsData.moodImpactData} />
        )}
      </div>
      
      {/* Original Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
            <Activity className="text-blue-500 dark:text-blue-400" size={20} />
            Task Completion Trend
          </h3>
          <div className="h-64">
            <ProgressChart data={statsData.monthlyProgress} />
          </div>
        </div>
        
        {/* Mood Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
            <LineChart className="text-purple-500 dark:text-purple-400" size={20} />
            Morning Mood Trend
          </h3>
          <div className="h-64">
            <MoodTrendChart data={statsData.moodTrend} />
          </div>
        </div>
        
        {/* Workout Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors lg:col-span-2">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
            <Activity className="text-green-500 dark:text-green-400" size={20} />
            Workout Statistics
          </h3>
          <div className="h-64">
            <WorkoutStatsChart data={statsData.workoutData} />
          </div>
        </div>

        {/* Procrastination Stats Section */}
<div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors mb-6 lg:col-span-2">
  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
    <Clock className="text-amber-500 dark:text-amber-400" size={20} />
    Procrastination Analyzer
  </h3>
  <ProcrastinationStats currentMonth={currentMonth} />
</div>
      </div>
    </div>
  );
};

export default Stats;