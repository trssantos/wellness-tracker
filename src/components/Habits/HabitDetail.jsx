import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowLeft, Edit3, Trash2, Calendar, BarChart2, CheckCircle, Trophy, Zap, Target, Award, Plus, Bell,CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import { trackHabitCompletion, generateCompletionHistory, updateHabitStats, toggleMilestoneStatus } from '../../utils/habitTrackerUtils';
import DeleteHabitConfirmation from './DeleteHabitConfirmation';
import HabitReminderSettings from './HabitReminderSettings';
import StreakMilestoneCelebration from './StreakMilestoneCelebration';
import { formatDateForStorage } from '../../utils/dateUtils';

const HabitDetail = ({ habit, onEdit, onBack, onDelete, onUpdate, onStreakMilestone }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [habitState, setHabit] = useState(habit);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showMilestoneConfirm, setShowMilestoneConfirm] = useState(false);
  const [milestoneToToggle, setMilestoneToToggle] = useState(null);
  const [toggleAction, setToggleAction] = useState('complete'); // 'complete' or 'uncomplete'
const [celebrationData, setCelebrationData] = useState({ streak: 0, habitName: '', message: '' });


  // Update completion history when habit changes
  useEffect(() => {
    setHabit(habit);
    const history = generateCompletionHistory(habit, 28);
    setCompletionHistory(history);
  }, [habit]);
  
  // Mark habit as completed for today
  const handleMarkCompleted = () => {
    const today = formatDateForStorage(new Date());
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

  const handleToggleMilestone = (milestoneIndex) => {
    const milestone = habitState.milestones[milestoneIndex];
    
    // Store which milestone we're working with and what action we're taking
    setMilestoneToToggle(milestoneIndex);
    setToggleAction(milestone.achieved ? 'uncomplete' : 'complete');
    
    // Show confirmation for both completing and uncompleting automatic milestones
    if (milestone.type !== 'manual') {
      setShowMilestoneConfirm(true);
      return;
    }
    
    // For manual milestones, toggle directly
    performMilestoneToggle(milestoneIndex);
  };

  const performMilestoneToggle = (milestoneIndex) => {
    const milestone = habitState.milestones[milestoneIndex];
    const wasAchieved = milestone.achieved;
    
    // Create a deep copy of the habit for immediate UI update
    const habitCopy = JSON.parse(JSON.stringify(habitState));
    
    // Immediately update the UI by modifying our copy first
    habitCopy.milestones[milestoneIndex] = {
      ...habitCopy.milestones[milestoneIndex],
      achieved: !wasAchieved,
      achievedDate: !wasAchieved ? new Date().toISOString() : undefined
    };
    
    // Immediately update local state to refresh UI
    setHabit(habitCopy);
    
    // Now call the API to update storage
    const updatedHabit = toggleMilestoneStatus(habitState.id, milestoneIndex);
    
    if (updatedHabit) {
      // Only show celebration when newly completing a milestone, not when uncompleting
      if (!wasAchieved) {
        setCelebrationData({
          streak: updatedHabit.stats.streakCurrent,
          habitName: updatedHabit.name,
          milestoneName: milestone.name,
          milestoneType: milestone.type
        });
        setShowMilestoneCelebration(true);
      }
      
      // Update parent component to reflect changes
      onUpdate();
    }
  };
  
  // Render completion history
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
      
      const dateStr = formatDateForStorage(date);
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
      const dateStr = formatDateForStorage(currentDate);
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
    const today = formatDateForStorage(new Date());
    return habitState.completions && habitState.completions[today] === true;
  };

  return (
    <div className="px-2 sm:px-0 w-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{habit.name}</h2>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 sm:mb-6">
        {isScheduledForToday() && (
          <button
            onClick={handleMarkCompleted}
            className={`w-full py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${
              isCompletedToday()
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            {isCompletedToday() ? (
              <>
                <CheckCircle size={18} />
                Completed Today!
              </>
            ) : (
              <>
                <Plus size={18} />
                Mark Completed Today
              </>
            )}
          </button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Current Streak</div>
          <div className="text-base sm:text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 sm:gap-2">
            {habit.stats.streakCurrent} days
            {habit.stats.streakCurrent > 0 && <Zap className="text-amber-500" size={14} />}
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Best Streak</div>
          <div className="text-base sm:text-xl font-bold text-purple-700 dark:text-purple-300">
            {habit.stats.streakLongest} days
          </div>
        </div>
        
        <div className="bg-teal-50 dark:bg-teal-900/30 p-2 sm:p-3 rounded-lg">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Completion</div>
          <div className="text-base sm:text-xl font-bold text-teal-700 dark:text-teal-300">
            {Math.round(habit.stats.completionRate * 100)}%
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/30 p-2 sm:p-3 rounded-lg">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Total</div>
          <div className="text-base sm:text-xl font-bold text-amber-700 dark:text-amber-300">
            {habit.stats.totalCompletions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</div>
          <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">{habit.stats.progress}%</div>
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
        <div className="mb-4 sm:mb-6 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm sm:text-md font-medium mb-2 text-slate-700 dark:text-slate-200">Description</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{habit.description}</p>
        </div>
      )}

      {/* Habit Frequency */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-md font-medium mb-2 sm:mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
          Schedule
        </h3>
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
            const isActive = habit.frequency.includes(day);
            return (
              <div
                key={day}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
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
        <div className="mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-md font-medium mb-2 sm:mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          Milestones
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {habitState.milestones.map((milestone, index) => {
            // Determine icon and colors based on milestone type
            const getMilestoneIcon = () => {
              switch(milestone.type) {
                case 'streak':
                  return <Flame size={14} />;
                case 'completion':
                  return <CheckCircle2 size={14} />;
                case 'time':
                  return <Calendar size={14} />;
                case 'consistency':
                  return <TrendingUp size={14} />;
                case 'manual':
                  return <Target size={14} />;
                default:
                  return <Target size={14} />;
              }
            };
            
            // Determine background and text colors based on type
            const getTypeColors = () => {
              if (milestone.type === 'streak') 
                return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
              if (milestone.type === 'completion') 
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
              if (milestone.type === 'time') 
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
              if (milestone.type === 'consistency') 
                return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300';
              if (milestone.type === 'manual') 
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
              return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
            };
            
            const getButtonColors = () => {
              if (!milestone.achieved) {
                return 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600';
              }
              
              if (milestone.type === 'streak') 
                return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
              if (milestone.type === 'completion') 
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
              if (milestone.type === 'time') 
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
              if (milestone.type === 'consistency') 
                return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300';
              if (milestone.type === 'manual') 
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
              return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
            };
            
            return (
              <div key={index} className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-3">
                {/* Clickable milestone status icon for toggling */}
                <button
                  onClick={() => handleToggleMilestone(index)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${getButtonColors()}`}
                  title={milestone.achieved ? "Mark as incomplete" : "Mark as complete"}
                >
                  {milestone.achieved ? <Trophy size={14} /> : getMilestoneIcon()}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-xs sm:text-sm truncate ${milestone.achieved ? 
                    'text-amber-700 dark:text-amber-300' : 
                    'text-slate-700 dark:text-slate-300'
                  }`}>
                    {milestone.name}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {/* Type badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getTypeColors()}`}>
                      {milestone.type || "streak"}
                    </span>
                    
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {milestone.achieved ? (
                        `Achieved on ${new Date(milestone.achievedDate).toLocaleDateString()}`
                      ) : (
                        `Target: ${milestone.value}${milestone.type === 'consistency' ? '%' : ''}`
                      )}
                    </span>
                  </div>
                </div>
                
                {milestone.achieved && (
                  <Award size={16} className="text-amber-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Habit Steps */}
      {habit.steps && habit.steps.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-md font-medium mb-2 sm:mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <CheckCircle size={16} className="text-teal-500" />
            Daily Steps
          </h3>
          <ul className="space-y-2">
            {habit.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion History - Mobile friendly version */}
      <div className="mb-4 sm:mb-6 overflow-x-auto">
        <h3 className="text-sm sm:text-md font-medium mb-2 sm:mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          Completion History
        </h3>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-4 w-full min-w-[300px] overflow-x-auto">
          {renderCompletionHistory(completionHistory)}
        </div>
      </div>

      {/* Edit / Delete buttons */}
      <div className="flex flex-wrap justify-between gap-2 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowReminderSettings(true)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 text-xs sm:text-sm"
          >
            <Bell size={14} />
            Reminders
          </button>
          <button 
            onClick={onEdit}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm"
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>
        <button 
          onClick={() => setShowConfirmDelete(true)}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm"
        >
          <Trash2 size={14} />
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
    streak={celebrationData.streak}
    habitName={celebrationData.habitName}
    milestoneName={celebrationData.milestoneName}
    milestoneType={celebrationData.milestoneType}
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
      {showMilestoneConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
      <div className="flex items-start mb-4">
        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
            {toggleAction === 'complete' ? 'Complete Milestone' : 'Reset Milestone'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {toggleAction === 'complete'
              ? `This ${habitState.milestones[milestoneToToggle]?.type} milestone is set to track automatically. Are you sure you want to manually mark it as complete?`
              : `This will reset the milestone "${habitState.milestones[milestoneToToggle]?.name}" back to incomplete status. Are you sure?`
            }
          </p>
        </div>
        <button
          onClick={() => setShowMilestoneConfirm(false)}
          className="p-1 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex space-x-3 justify-end">
        <button
          onClick={() => setShowMilestoneConfirm(false)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setShowMilestoneConfirm(false);
            performMilestoneToggle(milestoneToToggle);
          }}
          className={`px-4 py-2 text-white rounded hover:bg-opacity-90 ${
            toggleAction === 'complete'
              ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800'
              : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
          }`}
        >
          {toggleAction === 'complete' ? 'Mark Complete' : 'Reset Milestone'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default HabitDetail;