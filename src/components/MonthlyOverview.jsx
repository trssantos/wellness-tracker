import React from 'react';
import { BarChart, Calendar as CalendarIcon, SmilePlus, PenTool, CheckSquare, Dumbbell, Clock, Flame } from 'lucide-react';
import { MOODS } from './MoodSelector';

export const MonthlyOverview = ({ currentMonth, storageData }) => {
  const getMonthData = () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    let totalProgress = 0;
    let moodCounts = Object.keys(MOODS).reduce((acc, mood) => ({ ...acc, [mood]: 0 }), {});
    let progressDays = 0;
    let notesDays = 0;
    let totalWorkoutDuration = 0;
    let totalCaloriesBurned = 0;
    let workoutDays = 0;
    let workoutsWithCalories = 0;
    let daysWithData = new Set(); // Track unique days with any data
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = storageData[dateStr];
      
      if (dayData) {
        // Track progress
        if (dayData.checked) {
          const completed = Object.values(dayData.checked).filter(Boolean).length;
          const total = Object.values(dayData.checked).length;
          totalProgress += (completed / total) * 100;
          progressDays++;
          daysWithData.add(dateStr);
        }
        
        // Track mood
        if (dayData.mood) {
          moodCounts[dayData.mood]++;
          daysWithData.add(dateStr);
        }

        // Track notes
        if (dayData.notes) {
          notesDays++;
          daysWithData.add(dateStr);
        }

        // Track workouts and calories
        if (dayData.workout) {
          workoutDays++;
          totalWorkoutDuration += dayData.workout.duration || 0;
          
          // Track calories
          if (dayData.workout.calories) {
            totalCaloriesBurned += parseInt(dayData.workout.calories) || 0;
            workoutsWithCalories++;
          }
          
          daysWithData.add(dateStr);
        }
      }
    }
    
    const totalDaysTracked = daysWithData.size;
    const avgProgress = progressDays > 0 ? Math.round(totalProgress / progressDays) : 0;
    const avgWorkoutDuration = workoutDays > 0 ? Math.round(totalWorkoutDuration / workoutDays) : 0;
    const avgCaloriesBurned = workoutsWithCalories > 0 ? Math.round(totalCaloriesBurned / workoutsWithCalories) : 0;
    
    // Find predominant mood, if there are any moods
    const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const predominantMood = totalMoods > 0 
      ? Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0][0]
      : 'OKAY'; // Default mood when none is set
    
    return { 
      avgProgress, 
      moodCounts, 
      totalDaysTracked, 
      predominantMood, 
      notesDays, 
      progressDays,
      workoutDays,
      avgWorkoutDuration,
      totalCaloriesBurned,
      avgCaloriesBurned
    };
  };

  const { 
    avgProgress, 
    moodCounts, 
    totalDaysTracked, 
    predominantMood, 
    notesDays, 
    progressDays,
    workoutDays,
    avgWorkoutDuration,
    totalCaloriesBurned,
    avgCaloriesBurned
  } = getMonthData();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 transition-colors">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 transition-colors">Monthly Overview</h2>
      
      {/* Main Stats Section - Now using same grid styling as Monthly Highlights */}
      <div>
        <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-3 transition-colors">Main Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Days Tracked */}
          <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-teal-500 dark:text-teal-400" />
              <span className="text-slate-700 dark:text-slate-200">Days Tracked</span>
            </div>
            <span className="font-bold text-teal-700 dark:text-teal-400">{totalDaysTracked}</span>
          </div>

          {/* Average Progress */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <BarChart size={18} className="text-blue-500 dark:text-blue-400" />
              <span className="text-slate-700 dark:text-slate-200">Avg Progress</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400">{avgProgress}%</span>
          </div>

          {/* Predominant Mood */}
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <SmilePlus size={18} className="text-purple-500 dark:text-purple-400" />
              <span className="text-slate-700 dark:text-slate-200">Main Mood</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl">{MOODS[predominantMood].emoji}</span>
              <span className="font-bold text-purple-700 dark:text-purple-400">{MOODS[predominantMood].label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Highlights */}
      <div className="mt-6">
        <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-3 transition-colors">Monthly Highlights</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Days with Tasks section */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-blue-500 dark:text-blue-400" />
              <span className="text-slate-700 dark:text-slate-200">Days with Tasks</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400">{progressDays}</span>
          </div>
          
          {/* Days with Notes section */}
          <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <PenTool size={18} className="text-teal-500 dark:text-teal-400" />
              <span className="text-slate-700 dark:text-slate-200">Journal Entries</span>
            </div>
            <span className="font-bold text-teal-700 dark:text-teal-400">{notesDays}</span>
          </div>
          
          {/* Workouts section */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-blue-500 dark:text-blue-400" />
              <span className="text-slate-700 dark:text-slate-200">Workouts</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400">{workoutDays}</span>
          </div>
          
          {/* Average workout duration */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500 dark:text-blue-400" />
              <span className="text-slate-700 dark:text-slate-200">Avg Workout</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400">
              {avgWorkoutDuration > 0 ? `${avgWorkoutDuration} min` : '-'}
            </span>
          </div>

          {/* Total Calories Burned */}
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-orange-500 dark:text-orange-400" />
              <span className="text-slate-700 dark:text-slate-200">Calories Burned</span>
            </div>
            <span className="font-bold text-orange-700 dark:text-orange-400">
              {totalCaloriesBurned > 0 ? `${totalCaloriesBurned} kcal` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="mt-6">
        <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-3 transition-colors">Mood Distribution</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(MOODS).map(([key, { emoji, color }]) => {
            // Generate dark mode compatible colors
            const darkColor = color.replace('bg-', 'dark:bg-').replace('-100', '-900/30');
            
            return (
              <div key={key} className={`${color} ${darkColor} rounded-lg p-3 text-center transition-colors`}>
                <div className="text-xl mb-1">{emoji}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{moodCounts[key]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverview;