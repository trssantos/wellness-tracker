import React from 'react';
import { Plus } from 'lucide-react';

export const FloatingMenu = ({ onDaySelect }) => {
  const handleClick = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    onDaySelect(today);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className="p-4 rounded-full shadow-lg text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};