import React from 'react';
import { CheckSquare, PenTool, Dumbbell, BarChart } from 'lucide-react';
import { MOODS } from '../MoodSelector';
import { formatDateForStorage } from '../../utils/dateUtils';

export const MonthlyHighlights = ({ currentMonth, storageData }) => {
  const getMonthData = () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    let totalProgress = 0;
    let moodCounts = Object.keys(MOODS).reduce((acc, mood) => ({ ...acc, [mood]: 0 }), {});
    let progressDays = 0;
    let notesDays = 0;
    let workoutDays = 0;  // Days with workouts
    let totalWorkouts = 0; // Total number of workouts
    let daysWithData = new Set(); // Track unique days with any data
    
    // Process each day in the current month
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateForStorage(d);
      const dayData = storageData[dateStr];
      
      if (dayData) {
        // Track progress
        if (dayData.checked) {
          const completed = Object.values(dayData.checked).filter(Boolean).length;
          const total = Object.values(dayData.checked).length;
          if (total > 0) {
            totalProgress += (completed / total) * 100;
            progressDays++;
            daysWithData.add(dateStr);
          }
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
  
        // Track workouts - both days and total count
        let dayHasWorkout = false;
        
        // Check for single workout
        if (dayData.workout) {
          totalWorkouts++; // Count each workout
          dayHasWorkout = true;
          daysWithData.add(dateStr);
        }
  
        // Check for workouts array
        if (dayData.workouts && Array.isArray(dayData.workouts)) {
          totalWorkouts += dayData.workouts.length; // Count all workouts in the array
          dayHasWorkout = true;
          daysWithData.add(dateStr);
        }
        
        // Increment workout days count if this day had any workouts
        if (dayHasWorkout) {
          workoutDays++;
        }
      }
    }
    
    // Calculate additional metrics
    const totalDaysTracked = daysWithData.size;
    const avgProgress = progressDays > 0 ? Math.round(totalProgress / progressDays) : 0;
    
    // Find predominant mood
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
      totalWorkouts // Add this new metric
    };
  };

  const { avgProgress, moodCounts, totalDaysTracked, predominantMood, notesDays, progressDays, workoutDays } = getMonthData();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 transition-colors">
        Monthly Highlights
      </h2>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        {/* Main Stats - Compact Version */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 transition-colors">
          <div className="flex items-center gap-1 mb-1">
            <BarChart className="text-blue-500 dark:text-blue-400" size={14} />
            <h3 className="text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors">Progress</h3>
          </div>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300 transition-colors">{avgProgress}%</p>
        </div>
        
        {/* Tasks Days */}
        <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-2 transition-colors">
          <div className="flex items-center gap-1 mb-1">
            <CheckSquare className="text-teal-500 dark:text-teal-400" size={14} />
            <h3 className="text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors">Tasks</h3>
          </div>
          <p className="text-lg font-bold text-teal-700 dark:text-teal-300 transition-colors">{progressDays}</p>
        </div>
        
        {/* Journal Days */}
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2 transition-colors">
          <div className="flex items-center gap-1 mb-1">
            <PenTool className="text-purple-500 dark:text-purple-400" size={14} />
            <h3 className="text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors">Journal</h3>
          </div>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300 transition-colors">{notesDays}</p>
        </div>
        
        {/* Workout Days */}
        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-2 transition-colors">
          <div className="flex items-center gap-1 mb-1">
            <Dumbbell className="text-orange-500 dark:text-orange-400" size={14} />
            <h3 className="text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors">Workouts</h3>
          </div>
          <p className="text-lg font-bold text-orange-700 dark:text-orange-300 transition-colors">{workoutDays}</p>
        </div>
      </div>
      
      {/* Mood Distribution - Compact Version */}
      <div>
        <h3 className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-2 transition-colors">Mood Distribution</h3>
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(MOODS).map(([key, { emoji, color }]) => {
            // Generate dark mode compatible colors
            const darkColor = color.replace('bg-', 'dark:bg-').replace('-100', '-900/30');
            
            return (
              <div key={key} className={`${color} ${darkColor} rounded-md p-1 text-center transition-colors`}>
                <div className="text-sm">{emoji}</div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
                  {moodCounts[key]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyHighlights;