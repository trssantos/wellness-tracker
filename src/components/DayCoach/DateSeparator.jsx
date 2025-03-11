import React from 'react';
import { Calendar } from 'lucide-react';

const DateSeparator = ({ date, isToday }) => {
  const formatDate = (dateStr) => {
    const messageDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the date is today
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if the date is yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, return the formatted date
    return messageDate.toLocaleDateString('default', {
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <div className="flex items-center justify-center my-4 opacity-80">
      <div className="bg-indigo-50 dark:bg-indigo-900/30 py-1 px-3 rounded-full flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 shadow-sm">
        <Calendar size={12} />
        <span>{formatDate(date)}</span>
      </div>
    </div>
  );
};

export default DateSeparator;