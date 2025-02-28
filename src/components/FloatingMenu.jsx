import React, { useState } from 'react';
import { Plus, Mic, X, List, Calendar } from 'lucide-react';

export const FloatingMenu = ({ onDaySelect, onVoiceInput }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDaySelect = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    onDaySelect(today);
    setIsExpanded(false);
  };

  const handleVoiceInput = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    onVoiceInput(today);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isExpanded && (
        <>
          {/* Voice Input Option */}
          <button
            onClick={handleVoiceInput}
            className="p-4 rounded-full shadow-lg text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
            aria-label="Add task with voice"
          >
            <Mic size={24} />
          </button>
          {/* Today's Tasks Option */}
          <button
            onClick={handleDaySelect}
            className="p-4 rounded-full shadow-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            aria-label="View today's tasks"
          >
            <Calendar size={24} />
          </button>
        </>
      )}
      
      {/* Main Button */}
      <button
        onClick={handleMainClick}
        className="p-4 rounded-full shadow-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
      >
        {isExpanded ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
};