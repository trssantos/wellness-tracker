import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Activity, Droplet, Zap } from 'lucide-react';

/**
 * A reusable calendar component for tracking workout completions
 * @param {Array} workoutData - Array of workout completion data with dates
 * @param {string} workoutId - Optional ID to filter for a specific workout
 * @param {Function} onDateClick - Optional handler for date clicks
 */
const WorkoutCalendar = ({ 
  workoutData = [], 
  workoutId = null,
  onDateClick = null
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Filter workouts if a specific ID is provided
  const filteredWorkouts = workoutId 
    ? workoutData.filter(workout => workout.workoutId === workoutId || workout.id === workoutId)
    : workoutData;

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Generate calendar grid for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, type: 'empty' });
    }
    
    // Create a lookup map for workout dates
    const workoutMap = {};
    
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.date || workout.completedAt || workout.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!workoutMap[dateStr]) {
        workoutMap[dateStr] = [];
      }
      
      workoutMap[dateStr].push(workout);
    });
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const hasWorkout = workoutMap[dateStr] && workoutMap[dateStr].length > 0;
      
      let dayInfo = {
        date: date,
        dateStr: dateStr,
        day: day,
        type: 'day',
        workouts: workoutMap[dateStr] || [],
        hasWorkout: hasWorkout
      };
      
      // Determine workout types for this day
      if (hasWorkout) {
        // Get all workout types for the day
        const workoutTypes = new Set();
        workoutMap[dateStr].forEach(workout => {
          if (workout.types && workout.types.length > 0) {
            workout.types.forEach(type => workoutTypes.add(type));
          } else if (workout.type) {
            workoutTypes.add(workout.type);
          }
        });
        
        dayInfo.workoutTypes = Array.from(workoutTypes);
        dayInfo.multipleTypes = workoutTypes.size > 1;
        
        // Get the primary type for color coding
        dayInfo.primaryType = workoutTypes.size > 0 ? Array.from(workoutTypes)[0].toLowerCase() : 'other';
      }
      
      days.push(dayInfo);
    }
    
    return days;
  };

  // Get color for a workout type
  const getTypeColor = (type) => {
    type = type?.toLowerCase() || '';
    
    const typeColorMap = {
      'strength': 'bg-blue-500',
      'cardio': 'bg-red-500',
      'yoga': 'bg-purple-500',
      'cycling': 'bg-green-500',
      'hiit': 'bg-orange-500',
      'multiple': 'bg-gradient-to-r from-blue-500 to-purple-500',
      'running': 'bg-amber-500',
      'swimming': 'bg-cyan-500',
    };
    
    return typeColorMap[type] || 'bg-slate-500';
  };
  
  // Get icon for a workout type
  const getTypeIcon = (type) => {
    type = type?.toLowerCase() || '';
    
    switch (type) {
      case 'strength':
        return <Dumbbell size={14} className="text-blue-500" />;
      case 'cardio':
      case 'running':
        return <Activity size={14} className="text-red-500" />;
      case 'yoga':
        return <Droplet size={14} className="text-purple-500" />;
      case 'cycling':
        return <Activity size={14} className="text-green-500" />;
      case 'hiit':
        return <Zap size={14} className="text-orange-500" />;
      default:
        return <Dumbbell size={14} className="text-slate-500" />;
    }
  };

  // Format month for display
  const formatMonth = (date) => {
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  const days = generateCalendarDays();
  const today = new Date().toISOString().split('T')[0];
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        
        <h3 className="font-medium text-slate-800 dark:text-slate-100">
          {formatMonth(currentMonth)}
        </h3>
        
        <button 
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 pb-1">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((day, index) => {
          if (day.type === 'empty') {
            return (
              <div key={`empty-${index}`} className="aspect-square"></div>
            );
          }
          
          const isToday = day.dateStr === today;
          
          return (
            <div 
              key={day.dateStr}
              onClick={() => onDateClick && onDateClick(day.date, day.workouts)}
              className={`
                aspect-square relative flex flex-col items-center justify-center rounded-md border transition-colors cursor-pointer
                ${isToday ? 'border-blue-500 dark:border-blue-400' : 'border-slate-200 dark:border-slate-700'}
                ${day.hasWorkout 
                  ? isDarkMode ? 'bg-slate-800' : 'bg-white'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70'}
              `}
            >
              <span className={`${isToday ? 'font-bold text-blue-500 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {day.day}
              </span>
              
              {/* Workout indicators */}
              {day.hasWorkout && (
                <div className="absolute bottom-1 flex justify-center gap-1">
                  {day.multipleTypes ? (
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  ) : (
                    day.workoutTypes && day.workoutTypes.slice(0, 1).map((type, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full flex items-center justify-center ${getTypeColor(type)}`}>
                        {/* Icon can be added here */}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend for all workout types */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Strength</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Cardio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Yoga</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Cycling</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-slate-600 dark:text-slate-400">HIIT</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Multiple</span>
        </div>
      </div>
      
      <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
        Click on a day to see detailed workout information
      </div>
    </div>
  );
};

export default WorkoutCalendar;