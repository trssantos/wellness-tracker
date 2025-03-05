import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, X, Calendar, Save, AlertTriangle } from 'lucide-react';
import { scheduleHabitReminders, getHabitReminders, removeHabitReminders } from '../../utils/habitTrackerUtils';

const HabitReminderSettings = ({ habit, onClose }) => {
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [customTimes, setCustomTimes] = useState({});
  const [useSingleTime, setUseSingleTime] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);

  // Load existing reminders
  useEffect(() => {
    if (habit) {
      const existingReminders = getHabitReminders(habit.id);
      setReminders(existingReminders);
      
      if (existingReminders.length > 0) {
        setEnabled(true);
        
        // Check if all reminders have the same time
        const firstTime = existingReminders[0].time;
        const allSameTime = existingReminders.every(r => r.time === firstTime);
        
        if (allSameTime) {
          setReminderTime(firstTime);
          setUseSingleTime(true);
        } else {
          // Build custom times object
          const times = {};
          existingReminders.forEach(r => {
            times[r.day] = r.time;
          });
          setCustomTimes(times);
          setUseSingleTime(false);
        }
      }
    }
    
    // Check if notifications are blocked
    checkNotificationPermission();
  }, [habit]);

  const checkNotificationPermission = () => {
    if (!("Notification" in window)) {
      setNotificationsBlocked(true);
      return;
    }
    
    if (Notification.permission === "denied") {
      setNotificationsBlocked(true);
    }
  };
  
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        setNotificationsBlocked(false);
      } else {
        setNotificationsBlocked(true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setNotificationsBlocked(true);
    }
  };

  const handleSaveReminders = () => {
    if (!habit) return;
    
    if (enabled) {
      if (useSingleTime) {
        // Schedule using single time for all days
        scheduleHabitReminders(habit, reminderTime);
      } else {
        // Schedule using custom times for each day
        habit.frequency.forEach(day => {
          if (customTimes[day]) {
            // Create a modified habit object with just this day's frequency
            const dayScopedHabit = {
              ...habit,
              frequency: [day]
            };
            scheduleHabitReminders(dayScopedHabit, customTimes[day]);
          }
        });
      }
    } else {
      // If disabled, remove all reminders for this habit
      removeHabitReminders(habit.id);
    }
    
    onClose();
  };
  
  const getTimeForDay = (day) => {
    return customTimes[day] || reminderTime;
  };
  
  const handleCustomTimeChange = (day, time) => {
    setCustomTimes({
      ...customTimes,
      [day]: time
    });
  };
  
  const getDayLabel = (day) => {
    const labels = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday'
    };
    return labels[day] || day;
  };
  
  if (!habit) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Bell className="text-blue-500 dark:text-blue-400" size={20} />
          Habit Reminders
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Set up reminders for "{habit.name}" to help you stay consistent.
      </p>
      
      {/* Master toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-6 transition-colors">
        <div className="flex items-center gap-3">
          {enabled ? 
            <Bell size={24} className="text-blue-600 dark:text-blue-400" /> : 
            <BellOff size={24} className="text-slate-400 dark:text-slate-500" />
          }
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">Reminders</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              {enabled ? "Reminders enabled" : "Reminders disabled"}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
            disabled={notificationsBlocked} 
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600 transition-colors"></div>
        </label>
      </div>
      
      {/* Notification permission request if blocked */}
      {notificationsBlocked && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 transition-colors">
          <div className="flex items-start gap-2">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-300 mb-2 transition-colors">
                Notifications are blocked by your browser.
              </p>
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-amber-500 dark:bg-amber-600 text-white rounded-lg hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors"
              >
                Allow Notifications
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reminder Settings - Only show if enabled */}
      {enabled && !notificationsBlocked && (
        <div className="space-y-6">
          {/* Time selector mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Reminder Time
            </label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600 dark:text-blue-400"
                  checked={useSingleTime}
                  onChange={() => setUseSingleTime(true)}
                />
                <span className="ml-2 text-slate-700 dark:text-slate-300 transition-colors">
                  Same time every day
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600 dark:text-blue-400"
                  checked={!useSingleTime}
                  onChange={() => setUseSingleTime(false)}
                />
                <span className="ml-2 text-slate-700 dark:text-slate-300 transition-colors">
                  Custom time per day
                </span>
              </label>
            </div>
            
            {useSingleTime ? (
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400 dark:text-slate-500">
                  <Clock size={16} />
                </div>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg transition-colors">
                <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                  Set specific times for each day of your habit:
                </p>
                
                {habit.frequency.map(day => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors min-w-24">
                      {getDayLabel(day)}
                    </span>
                    <input 
                      type="time" 
                      value={getTimeForDay(day)}
                      onChange={(e) => handleCustomTimeChange(day, e.target.value)}
                      className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors flex items-center gap-1">
              <Calendar size={14} className="text-blue-500" />
              Reminder Preview
            </h4>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3 shadow-sm transition-colors">
              <Bell size={18} className="text-blue-500" />
              <div>
                <p className="text-slate-800 dark:text-slate-100 font-medium transition-colors">
                  Time for your habit: {habit.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                  {useSingleTime 
                    ? `Daily at ${reminderTime}` 
                    : `Custom times for each day`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 mr-3 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveReminders}
          className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default HabitReminderSettings;