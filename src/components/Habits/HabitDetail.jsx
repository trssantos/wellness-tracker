import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, Calendar, BarChart2, CheckCircle, Trophy, Zap, Target, Award, Plus } from 'lucide-react';
import { trackHabitCompletion, generateCompletionHistory, updateHabitStats } from '../../utils/habitTrackerUtils';
import DeleteHabitConfirmation from './DeleteHabitConfirmation';

const HabitDetail = ({ habit, onEdit, onBack, onDelete, onUpdate }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [completionHistory, setCompletionHistory] = useState([]);

  // Update completion history when habit changes
  useEffect(() => {
    if (habit) {
      const history = generateCompletionHistory(habit, 28);
      setCompletionHistory(history);
    }
  }, [habit]);
  
  
  // Mark habit as completed for today
  const handleMarkCompleted = () => {
    const today = new Date().toISOString().split('T')[0];
    const wasPreviouslyCompleted = habit.completions && habit.completions[today];
    
    // Toggle completion status
    trackHabitCompletion(habit.id, today, !wasPreviouslyCompleted);
    
    // Update the habit list
    onUpdate();
    setCompletionHistory(generateCompletionHistory(habit, 28));
  };
  
  // Render completion history
  const renderCompletionHistory = (history) => {
    // Group by week (7 days)
    const weeks = [];
    for (let i = 0; i < history.length; i += 7) {
      weeks.push(history.slice(i, i + 7));
    }
    
    return (
      <div className="flex flex-col gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day, dayIndex) => (
              <div 
                key={dayIndex}
                className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-medium
                  ${day === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                    day === 0 ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}
              >
                {day === 1 ? '✓' : day === 0 ? '-' : '✗'}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  // Check if habit is scheduled for today
  const isScheduledForToday = () => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    return habit.frequency.includes(dayOfWeek);
  };
  
  // Check if habit is already completed today
  const isCompletedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completions && habit.completions[today] === true;
  };
  
  // Generate completion history for the habit
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{habit.name}</h2>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        {isScheduledForToday() && (
          <button
            onClick={handleMarkCompleted}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              isCompletedToday()
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            {isCompletedToday() ? (
              <>
                <CheckCircle size={20} />
                Completed Today!
              </>
            ) : (
              <>
                <Plus size={20} />
                Mark Completed Today
              </>
            )}
          </button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Streak</div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            {habit.stats.streakCurrent} days
            {habit.stats.streakCurrent > 0 && <Zap className="text-amber-500" size={16} />}
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Best Streak</div>
          <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
            {habit.stats.streakLongest} days
          </div>
        </div>
        
        <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Completion Rate</div>
          <div className="text-xl font-bold text-teal-700 dark:text-teal-300">
            {Math.round(habit.stats.completionRate * 100)}%
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total</div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
            {habit.stats.totalCompletions} times
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</div>
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{habit.stats.progress}%</div>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 dark:bg-blue-600"
            style={{ width: `${habit.stats.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-md font-medium mb-2 text-slate-700 dark:text-slate-200">Description</h3>
          <p className="text-slate-600 dark:text-slate-400">{habit.description}</p>
        </div>
      )}

      {/* Habit Frequency */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
          Schedule
        </h3>
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
            const isActive = habit.frequency.includes(day);
            return (
              <div
                key={day}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones */}
      {habit.milestones && habit.milestones.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            Milestones
          </h3>
          <div className="space-y-3">
            {habit.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${milestone.achieved ? 
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 
                    'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {milestone.achieved ? <Trophy size={16} /> : <Target size={16} />}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${milestone.achieved ? 
                    'text-amber-700 dark:text-amber-300' : 
                    'text-slate-700 dark:text-slate-300'
                  }`}>
                    {milestone.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {milestone.achieved ? (
                      `Achieved on ${new Date(milestone.achievedDate).toLocaleDateString()}`
                    ) : (
                      `Target: ${milestone.value}`
                    )}
                  </div>
                </div>
                {milestone.achieved && (
                  <Award size={18} className="text-amber-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit Steps */}
      {habit.steps && habit.steps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-teal-500" />
            Daily Steps
          </h3>
          <ul className="space-y-2">
            {habit.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <div className="w-6 h-6 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-slate-700 dark:text-slate-300">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion History */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          Completion History
        </h3>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          {renderCompletionHistory(completionHistory)}
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>4 weeks ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Edit / Delete buttons */}
      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Edit3 size={16} />
          Edit Habit
        </button>
        <button 
          onClick={() => setShowConfirmDelete(true)}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <DeleteHabitConfirmation 
          habit={habit}
          onConfirm={onDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
};

export default HabitDetail;