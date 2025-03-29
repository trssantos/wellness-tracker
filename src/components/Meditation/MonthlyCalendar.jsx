import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Brain, Heart, Briefcase, Users, Star,
  Sun, Moon, Activity, AlertTriangle
} from 'lucide-react';

const MonthlyCalendar = ({ journalEntries = [], onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Generate calendar days whenever the month changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentMonth));
  }, [currentMonth, journalEntries]);
  
  // Generate calendar days for the current month view
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0-6, 0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Calendar days array
    const days = [];
    
    // Add days from previous month if needed
    if (daysFromPrevMonth > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = prevMonth.getDate();
      
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const date = new Date(year, month - 1, day);
        const dateString = formatDateForStorage(date);
        
        days.push({
          day,
          date: dateString,
          isCurrentMonth: false,
          isToday: isToday(date),
          entries: getEntriesForDate(dateString)
        });
      }
    }
    
    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = formatDateForStorage(date);
      
      days.push({
        day,
        date: dateString,
        isCurrentMonth: true,
        isToday: isToday(date),
        entries: getEntriesForDate(dateString)
      });
    }
    
    // Add days from next month if needed to complete the grid
    const totalDaysShown = Math.ceil(days.length / 7) * 7;
    const daysFromNextMonth = totalDaysShown - days.length;
    
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = formatDateForStorage(date);
      
      days.push({
        day,
        date: dateString,
        isCurrentMonth: false,
        isToday: isToday(date),
        entries: getEntriesForDate(dateString)
      });
    }
    
    return days;
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Format a date to YYYY-MM-DD string
  const formatDateForStorage = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Get entries for a specific date
  const getEntriesForDate = (dateString) => {
    return journalEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp.split('T')[0];
      return entryDate === dateString;
    });
  };
  
  // Get the predominant category for a day
  const getPredominantCategory = (entries) => {
    if (!entries || entries.length === 0) return null;
    
    // Count categories
    const categoryCounts = {};
    
    entries.forEach(entry => {
      if (entry.categories && entry.categories.length > 0) {
        entry.categories.forEach(category => {
          if (!categoryCounts[category]) categoryCounts[category] = 0;
          categoryCounts[category]++;
        });
      }
    });
    
    // Find the most frequent category
    let predominantCategory = null;
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        predominantCategory = category;
      }
    });
    
    return predominantCategory;
  };
  
  // Get category icon based on category ID
  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'meditation': return <Brain size={16} className="text-indigo-500 dark:text-indigo-400" />;
      case 'gratitude': return <Heart size={16} className="text-rose-500 dark:text-rose-400" />;
      case 'work': return <Briefcase size={16} className="text-blue-500 dark:text-blue-400" />;
      case 'relationships': return <Users size={16} className="text-emerald-500 dark:text-emerald-400" />;
      case 'personal': return <Star size={16} className="text-amber-500 dark:text-amber-400" />;
      case 'health': return <Activity size={16} className="text-red-500 dark:text-red-400" />;
      case 'morning': return <Sun size={16} className="text-yellow-500 dark:text-yellow-400" />;
      case 'evening': return <Moon size={16} className="text-purple-500 dark:text-purple-400" />;
      default: return null;
    }
  };
  
  // Get average mood for entries
  const getAverageMood = (entries) => {
    if (!entries || entries.length === 0) return 0;
    
    const sum = entries.reduce((total, entry) => total + (entry.mood || 3), 0);
    return Math.round(sum / entries.length);
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Get month name and year
  const getMonthYearString = () => {
    return currentMonth.toLocaleDateString('default', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Get day of week headers (Monday first)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 transition-colors animate-fadeIn">
      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
            {getMonthYearString()}
          </h3>
          <button
            onClick={goToCurrentMonth}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-1">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onSelectDate(day.date)}
            className={`min-h-14 p-1 rounded-lg flex flex-col items-center relative group ${
              day.isToday 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                : day.isCurrentMonth 
                  ? day.entries.length > 0
                    ? 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  : 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            } ${
              selectedDate === day.date
                ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                : ''
            } transition-all duration-200`}
          >
            {/* Day number */}
            <span className={`text-sm ${
              !day.isCurrentMonth 
                ? 'text-slate-400 dark:text-slate-600' 
                : day.isToday
                  ? 'font-medium text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300'
            }`}>
              {day.day}
            </span>
            
            {/* Entry indicators */}
            {day.entries.length > 0 && (
              <div className="flex flex-col items-center mt-1">
                {/* Category icon */}
                <div className="mb-1">
                  {getCategoryIcon(getPredominantCategory(day.entries)) || 
                    (day.entries.length > 0 && <AlertTriangle size={14} className="text-amber-500" />)}
                </div>
                
                {/* Entry count indicator */}
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                  {day.entries.length}
                </span>
              </div>
            )}
            
            {/* Hover effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 transition-opacity"></div>
          </button>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MonthlyCalendar;