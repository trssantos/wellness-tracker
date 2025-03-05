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
          className={`w-3 h-3 rounded-full bg-amber-500 ${i < 3 ? 'animate-pulse' : ''}`}
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Habits</h2>
        <div className="flex gap-2">
        {habits.length > 0 && (
            <button 
              onClick={onViewAnalytics}
              className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <BarChart2 size={18} />
              Analytics
            </button>
          )}
          <button 
            onClick={onCreateWithAI}
            className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <Sparkles size={18} />
            AI Suggest
          </button>
          <button 
            onClick={onCreateHabit}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <Plus size={18} />
            New Habit
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No habits yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Habits help you build consistent routines and reach your goals. Start by creating your first habit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={onCreateWithAI}
              className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 justify-center"
            >
              <Sparkles size={18} />
              AI Habit Suggestions
            </button>
            <button 
              onClick={onCreateHabit}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 justify-center"
            >
              <Plus size={18} />
              Create Custom Habit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map(habit => {
            // Generate completion history for display
            const completionHistory = generateCompletionHistory(habit, 7); // Last 7 days
            
            return (
              <div 
                key={habit.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectHabit(habit.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">{habit.name}</h3>
                  <div className="flex items-center">
                    {renderStreakBubbles(habit.stats.streakCurrent)}
                    <ChevronRight size={18} className="text-slate-400 ml-2" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400">{habit.description}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {habit.stats.progress}% complete
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                    style={{ width: `${habit.stats.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs">
                  <div className="flex gap-6">
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
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Last 7 days:</div>
                  <div className="flex gap-1">
                    {completionHistory.map((status, index) => (
                      <div 
                        key={index}
                        className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-medium
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
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <BarChart size={18} className="text-blue-500" />
            Habit Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{habits.length}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Active Habits</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {habits.reduce((sum, h) => sum + h.stats.streakCurrent, 0)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Days Streak Total</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {habits.reduce((count, h) => {
                    return count + (h.milestones ? h.milestones.filter(m => m.achieved).length : 0);
                  }, 0)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Milestones Reached</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitList;