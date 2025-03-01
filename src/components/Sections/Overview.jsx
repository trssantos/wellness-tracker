import React from 'react';
import { Calendar } from '../Calendar';
import { MonthlyHighlights } from './MonthlyHighlights';

export const Overview = ({ 
  selectedDay, 
  onSelectDay, 
  currentMonth, 
  onMonthChange, 
  storageData 
}) => {
  return (
    <div className="space-y-6">
      {/* Stats on top */}
      <MonthlyHighlights
        currentMonth={currentMonth}
        storageData={storageData}
      />
      
      {/* Calendar below */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 transition-colors">
          Monthly Calendar
        </h2>
        
        <Calendar 
          selectedDay={selectedDay} 
          onSelectDay={onSelectDay}
          currentMonth={currentMonth}
          onMonthChange={onMonthChange}
          storageData={storageData}
        />
      </div>
    </div>
  );
};

export default Overview;