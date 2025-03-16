import React from 'react';
import { Plus, Zap, TrendingUp, ChevronRight, BarChart, Sparkles, BarChart2 } from 'lucide-react';
import { generateCompletionHistory } from '../../utils/habitTrackerUtils';

const HabitList = ({ habits, onSelectHabit, onCreateHabit, onCreateWithAI, onViewAnalytics }) => {
  // Render streak bubbles
  const renderStreakBubbles = (streak) => {
    const bubbles = [];
    const max = Math.min(streak, 7); // Show max 7 bubbles
    
    for (let i = 0; i < max; i++) {
      bubbles.push(
        <div 
          key={i}
          className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-amber-500 ${i < 3 ? 'animate-pulse' : ''}`}
        />
      );
    }
    
    return (
      <div className="flex gap-1">
        {bubbles}
        {streak > 7 && <span className="text-xs text-amber-500">+{streak - 7}</span>}
      </div>
    );
  };

  const truncateDescription = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="px-2 sm:px-0 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Habits</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {habits.length > 0 && (
            <button 
              onClick={onViewAnalytics}
              className="text-sm sm:text-base bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
            >
              <BarChart2 size={16} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          )}
          <button 
            onClick={onCreateWithAI}
            className="text-sm sm:text-base bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">AI Suggest</span>
          </button>
          <button 
            onClick={onCreateHabit}
            className="text-sm sm:text-base bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Habit</span>
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No habits yet</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Habits help you build consistent routines and reach your goals. Start by creating your first habit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={onCreateWithAI}
              className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              <Sparkles size={16} />
              AI Suggestions
            </button>
            <button 
              onClick={onCreateHabit}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              <Plus size={16} />
              Create Habit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 overflow-x-hidden">
          {habits.map(habit => {
            // Generate completion history for display
            const completionHistory = generateCompletionHistory(habit, 7); // Last 7 days
            
            return (
              <div 
  key={habit.id}
  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
  onClick={() => onSelectHabit(habit.id)}
>
  <div className="flex items-center justify-between mb-2 sm:mb-3">
    <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate pr-2 max-w-[75%]">{habit.name}</h3>
    <div className="flex items-center flex-shrink-0">
      {renderStreakBubbles(habit.stats.streakCurrent)}
      <ChevronRight size={16} className="text-slate-400 ml-1 sm:ml-2" />
    </div>
  </div>
  
  {/* Fix the description container */}
  <div className="flex items-center justify-between mb-2 sm:mb-3">
  <div className="max-w-[50%] sm:max-w-[60%]"> {/* Significantly reduced max width */}
    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate overflow-hidden">
    {truncateDescription(habit.description)}
    </p>
  </div>
  <div className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
    {habit.stats.progress}% complete
  </div>
</div>
  
  {/* Rest of the habit card remains the same */}
  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
    <div 
      className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
      style={{ width: `${habit.stats.progress}%` }}
    ></div>
  </div>
  
  <div className="flex flex-wrap items-center justify-between mt-3 text-xs">
    <div className="flex flex-wrap gap-2 sm:gap-6 mb-2 sm:mb-0">
      <div className="flex items-center gap-1">
        <Zap size={14} className="text-amber-500" />
        <span className="text-slate-600 dark:text-slate-400">
          {habit.stats.streakCurrent} day{habit.stats.streakCurrent !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <TrendingUp size={14} className="text-green-500" />
        <span className="text-slate-600 dark:text-slate-400">
          {Math.round(habit.stats.completionRate * 100)}% completed
        </span>
      </div>
    </div>
    <div className="flex flex-wrap gap-1">
      {habit.frequency.map(day => (
        <span 
          key={day}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium"
        >
          {day[0].toUpperCase()}
        </span>
      ))}
    </div>
  </div>
  
  {/* Completion history dots */}
  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 overflow-x-auto pb-1">
    <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Last 7 days:</div>
    <div className="flex gap-1">
      {completionHistory.map((status, index) => (
        <div 
          key={index}
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm flex items-center justify-center text-xs font-medium flex-shrink-0
            ${status === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
              status === 0 ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' :
              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}
        >
          {status === 1 ? '✓' : status === 0 ? '-' : '✗'}
        </div>
      ))}
    </div>
  </div>
</div>
            );
          })}
        </div>
      )}

      {/* Stats summary - only show if habits exist */}
      {habits.length > 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-100 dark:border-blue-800">
          <h3 className="text-sm sm:text-md font-medium mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <BarChart size={16} className="text-blue-500" />
            Habit Summary
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{habits.length}</div>
                <div className="text-xxs sm:text-xs text-slate-500 dark:text-slate-400">Active Habits</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {habits.reduce((sum, h) => sum + h.stats.streakCurrent, 0)}
                </div>
                <div className="text-xxs sm:text-xs text-slate-500 dark:text-slate-400">Days Streak</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {habits.reduce((count, h) => {
                    return count + (h.milestones ? h.milestones.filter(m => m.achieved).length : 0);
                  }, 0)}
                </div>
                <div className="text-xxs sm:text-xs text-slate-500 dark:text-slate-400">Milestones</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitList;