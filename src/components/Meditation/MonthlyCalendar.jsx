import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Edit2, Trash2, X, Eye,
  Brain, Heart, Briefcase, Users, Star,
  Sun, Moon, Activity, AlertTriangle, Palette, Map
} from 'lucide-react';
import { getStorage,setStorage } from '../../utils/storage';
import { getJournalEntriesForDate } from '../../utils/journalMigration';
import JournalEntry from './JournalEntry';
import JournalEditor from './JournalEditor';
import { formatDateForStorage } from '../../utils/dateUtils';

const MonthlyCalendar = ({ journalEntries = [], onSelectDate, selectedDate, onEditEntry }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [showSelectedDayEntries, setShowSelectedDayEntries] = useState(false);
  const [dailyNote, setDailyNote] = useState('');
  const [editingDailyNote, setEditingDailyNote] = useState(false);
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Define available categories
  const availableCategories = [
    { id: 'meditation', name: 'Meditation', icon: <Brain size={16} className="text-indigo-500 dark:text-indigo-400" /> },
    { id: 'gratitude', name: 'Gratitude', icon: <Heart size={16} className="text-rose-500 dark:text-rose-400" /> },
    { id: 'work', name: 'Work', icon: <Briefcase size={16} className="text-blue-500 dark:text-blue-400" /> },
    { id: 'relationships', name: 'Relationships', icon: <Users size={16} className="text-emerald-500 dark:text-emerald-400" /> },
    { id: 'personal', name: 'Personal', icon: <Star size={16} className="text-amber-500 dark:text-amber-400" /> },
    { id: 'health', name: 'Health', icon: <Activity size={16} className="text-red-500 dark:text-red-400" /> },
    { id: 'morning', name: 'Morning', icon: <Sun size={16} className="text-yellow-500 dark:text-yellow-400" /> },
    { id: 'evening', name: 'Evening', icon: <Moon size={16} className="text-purple-500 dark:text-purple-400" /> },
    { id: 'social', name: 'Social', icon: <Users size={16} className="text-pink-500 dark:text-pink-400" /> },
    { id: 'hobbies', name: 'Hobbies', icon: <Palette size={16} className="text-teal-500 dark:text-teal-400" /> },
    { id: 'travel', name: 'Travel', icon: <Map size={16} className="text-cyan-500 dark:text-cyan-400" /> }
  ];
  
  // Popular tags
  const popularTags = [
    'reflection', 'progress', 'challenge', 'success', 'goal', 
    'habit', 'mindfulness', 'focus', 'peace', 'stress', 
    'sleep', 'energy', 'productivity', 'inspiration', 'growth'
  ];
  
  // Generate calendar days whenever the month changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentMonth));
  }, [currentMonth, journalEntries]);
  
  // Update selected day entries when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      loadSelectedDateData(selectedDate);
    }
  }, [selectedDate, journalEntries]);
  
  // Load entries and notes for the selected date
  const loadSelectedDateData = (date) => {
    // Get entries for this date
    const entriesForDate = journalEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp?.split('T')[0];
      return entryDate === date;
    });
    
    setSelectedDayEntries(entriesForDate);
    setShowSelectedDayEntries(true);
    
    // Get daily note for this date
    const dailyNote = getDailyNote(date);
    setDailyNote(dailyNote);
  };
  
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
  
  // Get the predominant category for a day based on entries
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
    const category = availableCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : <AlertTriangle size={12} className="text-amber-500" />;
  };
  
  // Handle day click
  const handleDayClick = (date) => {
    // Set as selected date
    if (onSelectDate) onSelectDate(date);
    
    // Load data for this date
    loadSelectedDateData(date);
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
  
  // Get daily note for a specific date
  const getDailyNote = (date) => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    return dayData.notes || '';
  };
  
  // Save daily note
  const saveDailyNote = (noteText) => {
    const storage = getStorage();
    const dayData = storage[selectedDate] || {};
    
    storage[selectedDate] = {
      ...dayData,
      notes: noteText.trim()
    };
    
    setStorage(storage);
    setDailyNote(noteText);
    setEditingDailyNote(false);
  };
  
  // Handle adding a new journal entry
  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowJournalEditor(true);
  };
  
  // Handle editing an existing journal entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowJournalEditor(true);
  };
  
  // Handle saving a journal entry
  const handleSaveEntry = (entryData) => {
    // Use the provided onEditEntry function or implement locally
    if (onEditEntry) {
      onEditEntry(entryData);
    } else {
      // Local implementation would go here
      console.log('Entry saved:', entryData);
    }
    
    // Close editor
    setShowJournalEditor(false);
    setEditingEntry(null);
    
    // Refresh entries for this date
    loadSelectedDateData(selectedDate);
  };
  
  // Handle deleting a journal entry
  const handleDeleteEntry = (entryId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this journal entry?');
    if (!confirmDelete) return;
    
    // Implement delete functionality or call parent handler
    if (onEditEntry) {
      // Pass a special flag to indicate deletion
      onEditEntry({ id: entryId, isDeleting: true });
    } else {
      // Local implementation would go here
      console.log('Delete entry:', entryId);
    }
    
    // Refresh entries for this date
    loadSelectedDateData(selectedDate);
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
          aria-label="Previous month"
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
          aria-label="Next month"
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
            aria-label={`${day.day}, ${day.entries.length} entries`}
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
                  {getCategoryIcon(getPredominantCategory(day.entries))}
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
      
    
      
      {/* Journal Entry Editor Dialog */}
      {showJournalEditor && (
        <JournalEditor
          entry={editingEntry}
          date={selectedDate}
          onSave={handleSaveEntry}
          onCancel={() => {
            setShowJournalEditor(false);
            setEditingEntry(null);
          }}
          availableCategories={availableCategories}
          popularTags={popularTags}
        />
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

export default MonthlyCalendar;