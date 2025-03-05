import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, Calendar, BarChart2, CheckCircle, Trophy, Zap, Target, Award, Plus, Bell } from 'lucide-react';
import { trackHabitCompletion, generateCompletionHistory, updateHabitStats } from '../../utils/habitTrackerUtils';
import DeleteHabitConfirmation from './DeleteHabitConfirmation';
import HabitReminderSettings from './HabitReminderSettings';
import StreakMilestoneCelebration from './StreakMilestoneCelebration';

const HabitDetail = ({ habit, onEdit, onBack, onDelete, onUpdate }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [habitState, setHabit] = useState(habit);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  // Update completion history when habit changes
  useEffect(() => {
    setHabit(habit);
    const history = generateCompletionHistory(habit, 28);
    setCompletionHistory(history);
  }, [habit]);
  
  
  
  // Mark habit as completed for today
  const handleMarkCompleted = () => {
    const today = new Date().toISOString().split('T')[0];
    const wasPreviouslyCompleted = habit.completions && habit.completions[today];
    
    // Toggle completion status
    const updatedHabit = trackHabitCompletion(habit.id, today, !wasPreviouslyCompleted);
    
    if (updatedHabit) {
      // Store previous streak for comparison
      const previousStreak = habit.stats.streakCurrent;
      const newStreak = updatedHabit.stats.streakCurrent;
      
      // Update the local state
      setHabit(updatedHabit);
      setCompletionHistory(generateCompletionHistory(updatedHabit, 28));
      
      // Check if streak increased and reached a milestone
      if (!wasPreviouslyCompleted && newStreak > previousStreak) {
        // Check for milestone streaks (7, 21, 30, 50, 100, etc.)
        const milestoneStreaks = [7, 21, 30, 50, 66, 100, 365];
        
        if (milestoneStreaks.includes(newStreak) || newStreak % 100 === 0) {
          setShowMilestoneCelebration(true);
        } else if (newStreak % 10 === 0 && newStreak >= 10) {
          // Also celebrate every 10 days after the first 10
          setShowMilestoneCelebration(true);
        }
      }
    }
    
    // Call the existing onUpdate to refresh the parent component
    onUpdate();
  };
  
  // Render completion history
  // Replace the renderCompletionHistory function with this corrected version:

  const renderCompletionHistory = (history) => {
    // Handle empty history case
    if (!history || history.length === 0) {
      return (
        <div className="text-center py-4 text-slate-500 dark:text-slate-400">
          No completion history available yet.
        </div>
      );
    }
    
    // Calculate today and dates for the calendar
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time portion
    
    // Create a map for status lookup
    const statusMap = {};
    
    // First, figure out which dates are in our history data
    // Assuming history represents the last 28 days in order
    const historyDates = [];
    for (let i = 0; i < history.length; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (history.length - 1) + i);
      
      const dateStr = date.toISOString().split('T')[0];
      historyDates.push(dateStr);
      statusMap[dateStr] = history[i];
    }
    
    // Generate calendar grid
    // First, calculate what day TODAY is (0=Sun, 1=Mon, etc)
    const todayDayOfWeek = today.getDay();
    
    // Then find the Sunday of the current week (back up to Sunday)
    const currentWeekSunday = new Date(today);
    currentWeekSunday.setDate(today.getDate() - todayDayOfWeek);
    
    // Now go back 3 more weeks to start our calendar (4 weeks total)
    const calendarStart = new Date(currentWeekSunday);
    calendarStart.setDate(calendarStart.getDate() - 21); // 3 weeks before this week's Sunday
    
    // Generate 4 weeks of data
    const weeks = [];
    let currentWeek = [];
    const currentDate = new Date(calendarStart);
    
    for (let i = 0; i < 28; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const inRange = statusMap[dateStr] !== undefined;
      
      // Add day to current week
      currentWeek.push({
        date: new Date(currentDate),
        status: inRange ? statusMap[dateStr] : 0,
        inRange: inRange,
        dateStr: dateStr
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Start a new week if we've filled 7 days
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return (
      <div className="flex flex-col gap-2">
        {/* Day of week headers */}
        <div className="flex">
          <div className="w-16 flex-shrink-0"></div> {/* Empty cell for offset */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
                {day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Calendar weeks */}
        {weeks.map((week, weekIndex) => {
          // Calculate the week label
          const weekLabel = weekIndex === 3 ? 'This week' : 
                           weekIndex === 2 ? 'Last week' : 
                           weekIndex === 1 ? '2 weeks ago' : 
                           '3 weeks ago';
          
          return (
            <div key={weekIndex} className="flex items-center">
              <div className="w-16 text-xs text-slate-500 dark:text-slate-400 text-right pr-2">
                {weekLabel}
              </div>
              <div className="grid grid-cols-7 gap-1 flex-1">
                {week.map((day, dayIndex) => {
                  const dayDate = day.date;
                  const isToday = dayDate && today && 
                    dayDate.getDate() === today.getDate() &&
                    dayDate.getMonth() === today.getMonth() &&
                    dayDate.getFullYear() === today.getFullYear();
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        aspect-square rounded-md flex flex-col items-center justify-center relative
                        ${!day.inRange 
                          ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600' 
                          : day.status === 1 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                            : day.status === 0 
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }
                        ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                        hover:opacity-80 transition-opacity
                      `}
                      title={dayDate ? dayDate.toLocaleDateString() : 'Unknown date'}
                    >
                      <span className={`text-xs ${isToday ? 'font-bold' : 'opacity-70'}`}>
                        {dayDate ? dayDate.getDate() : '?'}
                      </span>
                      {day.inRange && (
                        <span className="text-xs font-bold">
                          {day.status === 1 ? '✓' : day.status === 0 ? '·' : '✗'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 px-16">
          <span>4 weeks ago</span>
          <span>Today</span>
        </div>
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
    return habitState.completions && habitState.completions[today] === true;
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
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{habitState.name}</h2>
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
          <h3 className="text-md font-medium mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
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
          <h3 className="text-md font-medium mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
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
      <h3 className="text-md font-medium mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          Completion History
        </h3>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
    {renderCompletionHistory(completionHistory)}
  </div>
      </div>

      {/* Edit / Delete buttons */}
      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
  <div className="flex gap-2">
    <button 
      onClick={() => setShowReminderSettings(true)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40"
    >
      <Bell size={16} />
      Reminders
    </button>
    <button 
      onClick={onEdit}
      className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <Edit3 size={16} />
      Edit Habit
    </button>
  </div>
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

{showMilestoneCelebration && (
  <StreakMilestoneCelebration 
    streak={habitState.stats.streakCurrent}
    habitName={habitState.name}
    onClose={() => setShowMilestoneCelebration(false)}
  />
)}

{showReminderSettings && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <HabitReminderSettings 
      habit={habitState}
      onClose={() => setShowReminderSettings(false)}
    />
  </div>
)}
    </div>
  );
};

export default HabitDetail;