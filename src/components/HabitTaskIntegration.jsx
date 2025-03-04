import React, { useState, useEffect } from 'react';
import { Calendar, Info, Zap } from 'lucide-react';
import { getHabitsForDate } from '../utils/habitTrackerUtils';

const HabitTaskIntegration = ({ date }) => {
  const [habits, setHabits] = useState([]);
  
  useEffect(() => {
    if (date) {
      // Load habits for this day
      const todaysHabits = getHabitsForDate(date);
      setHabits(todaysHabits);
    }
  }, [date]);
  
  if (!date || habits.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 mb-6">
      <h3 className="text-md font-medium mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <Calendar size={18} className="text-blue-500" />
        Habits for Today
      </h3>
      
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        <p>The steps for your scheduled habits have been added to your task list. Complete them to build your habits!</p>
      </div>
      
      <div className="space-y-3">
        {habits.map(habit => (
          <div key={habit.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                {habit.name}
                {habit.stats.streakCurrent > 0 && (
                  <div className="flex items-center gap-1">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-xs text-amber-500">{habit.stats.streakCurrent} day streak</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {habit.timeOfDay !== 'anytime' && (
                  <span className="capitalize">{habit.timeOfDay}</span>
                )}
              </div>
            </div>
            
            {/* Info about where to find the tasks */}
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Info size={12} />
              <span>Complete these tasks in your checklist to build this habit.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTaskIntegration;