import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Edit2, Trash2, X, Eye,
  Brain, Heart, Briefcase, Users, Star,
  Sun, Moon, Activity, AlertTriangle
} from 'lucide-react';
import { getDayNotes, saveDailyNote } from '../../utils/storage';

const MonthlyCalendar = ({ journalEntries = [], onSelectDate, selectedDate, onEditEntry }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [showSelectedDayEntries, setShowSelectedDayEntries] = useState(false);
  
  // Generate calendar days whenever the month changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentMonth));
  }, [currentMonth, journalEntries]);
  
  // Update selected day entries when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const entriesForDate = journalEntries.filter(entry => {
        const entryDate = entry.date || entry.timestamp?.split('T')[0];
        return entryDate === selectedDate;
      });
      
      setSelectedDayEntries(entriesForDate);
      setShowSelectedDayEntries(true);
    }
  }, [selectedDate, journalEntries]);
  
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
  
  // Format a date as readable string
  const formatDateReadable = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get entries for a specific date
  const getEntriesForDate = (dateString) => {
    return journalEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp?.split('T')[0];
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
  
  // Handle day click
  const handleDayClick = (date) => {
    // Set as selected date
    if (onSelectDate) onSelectDate(date);
    
    // Get entries for this date and show them
    const entriesForDate = journalEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp?.split('T')[0];
      return entryDate === date;
    });
    
    setSelectedDayEntries(entriesForDate);
    setShowSelectedDayEntries(true);
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
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day.date)}
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
      
      {/* Selected day entries - NEW SECTION */}
      {showSelectedDayEntries && selectedDate && (
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-slate-700 dark:text-slate-300">
              Entries for {formatDateReadable(selectedDate)}
            </h3>
            <button 
              onClick={() => setShowSelectedDayEntries(false)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Daily notes for selected date */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-4 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                Daily Note
              </h5>
            </div>
            
            <textarea
              id="daily-note-textarea"
              value={getDayNotes(selectedDate)}
              onChange={(e) => saveDailyNote(selectedDate, e.target.value)}
              placeholder="Add notes for this day..."
              className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-amber-800 dark:text-amber-200 placeholder-amber-400 dark:placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 min-h-[80px] transition-colors"
            />
          </div>
          
          {selectedDayEntries.length > 0 ? (
            <div className="space-y-3">
              {selectedDayEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-4 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-md font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {entry.title || 'Journal Entry'}
                      {entry.mood && (
                        <span className="text-xl" title={`Mood: ${entry.mood}/5`}>
                          {getMoodEmoji(entry.mood)}
                        </span>
                      )}
                    </h5>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditEntry && onEditEntry(entry)}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Entry content */}
                  <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap mb-2">
                    {entry.text}
                  </p>
                  
                  {/* Categories if available */}
                  {entry.categories && entry.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.categories.map(categoryId => {
                        return (
                          <span
                            key={categoryId}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getCategoryColorClass(categoryId)}`}
                          >
                            {getCategoryIcon(categoryId)}
                            <span>{getCategoryName(categoryId)}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">
                No journal entries for this date.
              </p>
              <button
                onClick={() => {
                  // Navigate to add entry view
                  if (onEditEntry) onEditEntry({
                    date: selectedDate,
                    text: '',
                    title: '',
                    isNew: true
                  });
                }}
                className="mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg inline-flex items-center gap-2 text-sm"
              >
                Add New Entry
              </button>
            </div>
          )}
        </div>
      )}
      
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

// Helper functions
const getMoodEmoji = (mood) => {
  switch (mood) {
    case 1: return '😔';
    case 2: return '😕';
    case 3: return '😐';
    case 4: return '🙂';
    case 5: return '😊';
    default: return '😐';
  }
};

const getCategoryColorClass = (categoryId) => {
  switch (categoryId) {
    case 'meditation': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
    case 'gratitude': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
    case 'work': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'relationships': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    case 'personal': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    case 'health': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'morning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'evening': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  }
};

const getCategoryName = (categoryId) => {
  switch (categoryId) {
    case 'meditation': return 'Meditation';
    case 'gratitude': return 'Gratitude';
    case 'work': return 'Work';
    case 'relationships': return 'Relationships';
    case 'personal': return 'Personal';
    case 'health': return 'Health';
    case 'morning': return 'Morning';
    case 'evening': return 'Evening';
    default: return categoryId;
  }
};

export default MonthlyCalendar;