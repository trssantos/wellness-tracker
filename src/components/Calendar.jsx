import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles, PenTool, Dumbbell, Zap } from 'lucide-react';
import { MOODS } from './MoodSelector';
import { getHabitsForDate } from '../utils/habitTrackerUtils';

export const Calendar = ({ selectedDay, onSelectDay, currentMonth, onMonthChange, storageData }) => {
  const weeks = getCalendarWeeks(currentMonth);

  const WEEKDAYS = [
    { short: 'S', full: 'Sun' },
    { short: 'M', full: 'Mon' },
    { short: 'T', full: 'Tue' },
    { short: 'W', full: 'Wed' },
    { short: 'T', full: 'Thu' },
    { short: 'F', full: 'Fri' },
    { short: 'S', full: 'Sat' }
  ];

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const getDayData = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = storageData[dateStr];
    
    if (!dayData) return { 
      completionRate: 0, 
      mood: null, 
      hasAITasks: false, 
      hasNotes: false,
      hasWorkout: false,
      hasTaskList: false,
      habitCount: 0,
      habitCompletedCount: 0 
    };
    
    let completionRate = 0;
    if (dayData.checked) {
      const checkedItems = Object.values(dayData.checked).filter(Boolean).length;
      const totalItems = Object.values(dayData.checked).length;
      if (totalItems > 0) {
        completionRate = Math.round((checkedItems / totalItems) * 100);
      }
    }

    // Check for mood at root level first, then in aiContext
    let mood = dayData.mood;
    if (!mood && dayData.aiContext?.mood) {
      mood = dayData.aiContext.mood;
    }
    
    // Check if the day has any task list (AI, custom, or default)
    const hasTaskList = (dayData.aiTasks && dayData.aiTasks.length > 0) || 
                        (dayData.customTasks && dayData.customTasks.length > 0) ||
                        (dayData.defaultTasks && dayData.defaultTasks.length > 0) ||
                        (dayData.checked && Object.keys(dayData.checked).length > 0);

    // Get habit data for this date
    const habits = getHabitsForDate(dateStr);
    const habitCount = habits.length;

    // Count completed habits
    let habitCompletedCount = 0;
    habits.forEach(habit => {
      if (habit.completions && habit.completions[dateStr]) {
        habitCompletedCount++;
      }
    });
    
    return {
      completionRate,
      mood,
      hasAITasks: !!dayData.aiTasks,
      hasNotes: !!dayData.notes,
      hasWorkout: !!dayData.workout,
      hasTaskList,
      habitCount,
      habitCompletedCount
    };
  };

  const getProgressColorClass = (rate) => {
    if (rate === 0) return 'bg-white dark:bg-slate-800';
    if (rate <= 25) return 'bg-red-50 dark:bg-red-900/30';
    if (rate <= 50) return 'bg-yellow-50 dark:bg-yellow-900/30';
    if (rate <= 75) return 'bg-lime-50 dark:bg-lime-900/30';
    return 'bg-green-50 dark:bg-green-900/30';
  };

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 transition-colors">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => onMonthChange(prevMonth(currentMonth))}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => onMonthChange(nextMonth(currentMonth))}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-4">
          {WEEKDAYS.map((day) => (
            <div key={day.full} className="text-center font-medium text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              {day.short}
            </div>
          ))}
          
          {weeks.map((week, i) => 
            week.map((date, j) => {
              const dateStr = date.toISOString().split('T')[0];
              const { completionRate, mood, hasAITasks, hasNotes, hasWorkout, hasTaskList, habitCount, habitCompletedCount } = getDayData(date);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDay === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDay(dateStr)}
                  className={`
                    aspect-square rounded-lg relative p-1 sm:p-2
                    ${isCurrentMonth ? getProgressColorClass(completionRate) : 'bg-slate-50 dark:bg-slate-700 opacity-50'}
                    ${hasTaskList && isCurrentMonth ? 'border border-slate-300 dark:border-slate-600' : ''}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${isToday(date) ? 'ring-2 ring-amber-500' : ''}
                    hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-700 transition-all
                  `}
                >
                  <span className={`
                    text-xs sm:text-sm
                    ${isToday(date) ? 'font-bold text-amber-500 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {/* AI Tasks indicator */}
                  {hasAITasks && (
                    <div className="absolute bottom-0.5 right-0.5">
                      <Sparkles size={12} className="text-amber-500 dark:text-amber-400" />
                    </div>
                  )}
                  
                  {/* Notes indicator */}
                  {hasNotes && (
                    <div className="absolute bottom-0.5 left-0.5">
                      <PenTool size={10} className="text-teal-500 dark:text-teal-400" />
                    </div>
                  )}
                  
                  {/* Workout indicator */}
                  {hasWorkout && (
                    <div className="absolute top-0.5 left-0.5">
                      <Dumbbell size={10} className="text-blue-500 dark:text-blue-400" />
                    </div>
                  )}

                  {/* NEW: Habit indicator */}
                  {habitCount > 0 && (
                    <div className="absolute top-0.5 right-0.5 flex items-center">
                      <Zap size={10} className={`
                        ${habitCompletedCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}
                      `} />
                      {habitCount > 1 && (
                        <span className={`text-[8px] font-bold ml-0.5 
                          ${habitCompletedCount === habitCount ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}
                        `}>
                          {habitCompletedCount}/{habitCount}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Mood indicator */}
                  {mood && (
                    <div className="absolute top-0.5 right-0.5 text-[10px] sm:text-sm">
                      {MOODS[mood].emoji}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const getCalendarWeeks = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());
  
  const weeks = [];
  let currentWeek = [];
  
  for (let i = 0; i < 42; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    
    currentWeek.push(current);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  return weeks;
};

const prevMonth = (date) => {
  const prev = new Date(date);
  prev.setMonth(prev.getMonth() - 1);
  return prev;
};

const nextMonth = (date) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
};

export default Calendar;