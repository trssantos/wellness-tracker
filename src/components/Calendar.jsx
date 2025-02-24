import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles, PenTool } from 'lucide-react';
import { MOODS } from './MoodSelector';

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
    
    if (!dayData) return { completionRate: 0, mood: null, hasAITasks: false, hasNotes: false };
    
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
    
    return {
      completionRate,
      mood,
      hasAITasks: !!dayData.aiTasks,
      hasNotes: !!dayData.notes
    };
  };

  const getProgressColorClass = (rate) => {
    if (rate === 0) return 'bg-white';
    if (rate <= 25) return 'bg-red-50';
    if (rate <= 50) return 'bg-yellow-50';
    if (rate <= 75) return 'bg-lime-50';
    return 'bg-green-50';
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => onMonthChange(prevMonth(currentMonth))}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onMonthChange(nextMonth(currentMonth))}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-4">
          {WEEKDAYS.map((day) => (
            <div key={day.full} className="text-center font-medium text-slate-600 text-sm sm:text-base">
              {day.short}
            </div>
          ))}
          
          {weeks.map((week, i) => 
            week.map((date, j) => {
              const dateStr = date.toISOString().split('T')[0];
              const { completionRate, mood, hasAITasks, hasNotes } = getDayData(date);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDay === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDay(dateStr)}
                  className={`
                    aspect-square rounded-lg relative p-1 sm:p-2
                    ${isCurrentMonth ? getProgressColorClass(completionRate) : 'bg-slate-50 opacity-50'}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${isToday(date) ? 'ring-2 ring-amber-500' : ''}
                    hover:ring-2 hover:ring-blue-200 transition-all
                  `}
                >
                  <span className={`
                    text-xs sm:text-sm
                    ${isToday(date) ? 'font-bold text-amber-500' : 'text-slate-600'}
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {/* AI Tasks indicator */}
                  {hasAITasks && (
                    <div className="absolute bottom-0.5 right-0.5">
                      <Sparkles size={12} className="text-amber-500" />
                    </div>
                  )}
                  
                  {/* Notes indicator */}
                  {hasNotes && (
                    <div className="absolute bottom-0.5 left-0.5">
                      <PenTool size={10} className="text-teal-500" />
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