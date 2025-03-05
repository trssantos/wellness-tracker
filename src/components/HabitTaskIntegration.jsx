import React, { useState, useEffect } from 'react';
import { Calendar, Info, Zap, CheckCircle2 } from 'lucide-react';
import { getHabitsForDate } from '../utils/habitTrackerUtils';

const HabitTaskIntegration = ({ date, checked = {} }) => {
  const [habits, setHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  
  useEffect(() => {
    if (date) {
      // Load habits for this day
      const todaysHabits = getHabitsForDate(date);
      setHabits(todaysHabits);
      
      // Check which habits are completed based on task completion
      updateCompletedHabits(todaysHabits, checked);
    }
  }, [date]);
  
  // This effect will run when the checked state changes
  useEffect(() => {
    if (habits.length > 0) {
      updateCompletedHabits(habits, checked);
    }
  }, [checked, habits]);
  
  // Calculate which habits are completed based on their tasks
  const updateCompletedHabits = (habits, checked) => {
    const completionState = {};
    
    habits.forEach(habit => {
      // Get all tasks for this habit
      const habitTasks = [];
      habit.steps.forEach(step => {
        habitTasks.push(`[${habit.name}] ${step}`);
      });
      
      // Check if all tasks exist and are completed
      const allTasksExist = habitTasks.every(task => checked.hasOwnProperty(task));
      const allCompleted = allTasksExist && habitTasks.every(task => checked[task] === true);
      
      // Store the completion status
      completionState[habit.id] = allCompleted;
    });
    
    setCompletedHabits(completionState);
  };
  
  // Check direct habit completion status in addition to task-based status
  const isHabitCompleted = (habit) => {
    // Check if completed via tasks
    if (completedHabits[habit.id]) {
      return true;
    }
    
    // Also check if directly marked as completed
    return habit.completions && habit.completions[date] === true;
  };
  
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
        {habits.map(habit => {
          const completed = isHabitCompleted(habit);
          
          return (
            <div 
              key={habit.id} 
              className={`${
                completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              } rounded-lg p-3 border transition-colors`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium flex items-center gap-2">
                  {completed ? (
                    <>
                      <CheckCircle2 size={18} className="text-green-500 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300">{habit.name}</span>
                    </>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-200">{habit.name}</span>
                  )}
                  
                  {habit.stats.streakCurrent > 0 && (
                    <div className="flex items-center gap-1 ml-2">
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
                <span>
                  {completed 
                    ? "You've completed all tasks for this habit today!" 
                    : "Complete these tasks in your checklist to build this habit."}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitTaskIntegration;