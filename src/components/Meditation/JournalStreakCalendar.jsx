import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Calendar, Award, 
  Brain, Heart, Briefcase, Users, Star, 
  Sun, Moon, Activity, AlertTriangle
} from 'lucide-react';
import { getStorage } from '../../utils/storage';

const JournalStreakCalendar = ({ journalEntries = [], onSelectDate }) => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    lastEntryDate: null,
    streakDates: []
  });
  
  // Calculate days of week for display
  const getDaysOfWeek = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return days;
  };
  
  // Get the last 7 days for the streak display
  const getLast7Days = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = formatDateForStorage(date);
      
      dates.push({
        date: dateString,
        day: date.getDate(),
        hasEntry: streakData.streakDates.includes(dateString),
        isToday: i === 0
      });
    }
    
    return dates;
  };
  
  // Format a date object to YYYY-MM-DD string for storage
  const formatDateForStorage = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Calculate streak data based on journal entries
  useEffect(() => {
    if (!journalEntries || journalEntries.length === 0) {
      setStreakData({
        currentStreak: 0,
        lastEntryDate: null,
        streakDates: []
      });
      return;
    }
    
    // Get all entry dates and sort them
    const allDates = journalEntries.map(entry => {
      return entry.date || entry.timestamp.split('T')[0];
    }).sort();
    
    // Remove duplicates
    const uniqueDates = [...new Set(allDates)];
    
    // Get the most recent date
    const lastEntryDate = uniqueDates[uniqueDates.length - 1];
    const lastEntryDateObj = new Date(lastEntryDate);
    
    // Check if the last entry was yesterday or today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // If the last entry is older than yesterday, the current streak is broken
    if (lastEntryDateObj < yesterday && lastEntryDateObj.toDateString() !== yesterday.toDateString()) {
      setStreakData({
        currentStreak: 0,
        lastEntryDate,
        streakDates: uniqueDates
      });
      return;
    }
    
    // Calculate current streak
    let currentStreak = 1; // Start with the last entry day
    let checkDate = new Date(lastEntryDateObj);
    
    // Count backwards from the last entry date
    while (currentStreak < uniqueDates.length) {
      // Check the previous day
      checkDate.setDate(checkDate.getDate() - 1);
      const checkDateStr = formatDateForStorage(checkDate);
      
      // If we don't have an entry for this date, the streak is broken
      if (!uniqueDates.includes(checkDateStr)) {
        break;
      }
      
      currentStreak++;
    }
    
    setStreakData({
      currentStreak,
      lastEntryDate,
      streakDates: uniqueDates
    });
  }, [journalEntries]);
  
  // Get predominant category for a day based on entries
  const getPredominantCategory = (date) => {
    const dayEntries = journalEntries.filter(entry => {
      const entryDate = entry.date || entry.timestamp.split('T')[0];
      return entryDate === date;
    });
    
    if (dayEntries.length === 0) return null;
    
    // Count categories
    const categoryCounts = {};
    
    dayEntries.forEach(entry => {
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
  
  // Get category icon based on category name
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meditation': return <Brain size={12} className="text-indigo-500" />;
      case 'gratitude': return <Heart size={12} className="text-rose-500" />;
      case 'work': return <Briefcase size={12} className="text-blue-500" />;
      case 'relationships': return <Users size={12} className="text-emerald-500" />;
      case 'personal': return <Star size={12} className="text-amber-500" />;
      case 'morning': return <Sun size={12} className="text-yellow-500" />;
      case 'evening': return <Moon size={12} className="text-purple-500" />;
      case 'health': return <Activity size={12} className="text-red-500" />;
      default: return null;
    }
  };
  
  // Get days of week
  const daysOfWeek = getDaysOfWeek();
  
  // Get last 7 days for streak calendar
  const last7Days = getLast7Days();
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" />
          <h4 className="text-sm font-medium text-white">Completion History</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 flex items-center text-xs">
            <Award size={14} className="mr-1" />
            {streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Days of week labels */}
      <div className="flex justify-between mb-1">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="w-8 h-8 flex items-center justify-center">
            <span className="text-xs text-indigo-300">{day}</span>
          </div>
        ))}
      </div>
      
      {/* Last 7 days with streak indicators */}
      <div className="flex justify-between">
        {last7Days.map((day, index) => (
          <button
            key={index}
            onClick={() => onSelectDate && onSelectDate(day.date)}
            className={`w-8 h-8 rounded-md flex flex-col items-center justify-center transition-all relative group ${
              day.isToday 
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' 
                : day.hasEntry 
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {day.hasEntry && (
              <CheckCircle 
                size={16} 
                className={`absolute -top-1 -right-1 text-green-500 ${
                  day.isToday ? 'animate-bounce' : ''
                }`} 
                fill="#10b981" 
              />
            )}
            <span className="text-xs font-medium">{day.day}</span>
            
            {/* Category icon */}
            {day.hasEntry && (
              <div className="absolute -bottom-1 -left-1 bg-slate-800 rounded-full p-0.5 transform scale-0 group-hover:scale-100 transition-transform">
                {getCategoryIcon(getPredominantCategory(day.date)) || 
                  <AlertTriangle size={10} className="text-amber-500" />}
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Streak progress indicator */}
      <div className="mt-3">
        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"
            style={{ width: `${(streakData.currentStreak / 7) * 100}%` }}
          ></div>
        </div>
        <div className="mt-1 flex justify-between items-center text-xs text-slate-400">
          <span>Last 7 days:</span>
          <span className="text-indigo-400">
            {Math.round((streakData.currentStreak / 7) * 100)}% completed
          </span>
        </div>
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default JournalStreakCalendar;