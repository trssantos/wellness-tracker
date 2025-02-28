import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, Save, Trash2, AlertCircle } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

export const TaskReminder = ({ date, taskText, onClose, onReminderSet }) => {
  const [enabled, setEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes() + 5).padStart(2, '0')}`;

  useEffect(() => {
    // Set default date to today
    setReminderDate(today);
    setReminderTime(defaultTime);
    
    // Check if there's an existing reminder for this task
    const storage = getStorage();
    const dayData = storage[date] || {};
    const taskReminders = dayData.taskReminders || {};
    
    if (taskReminders[taskText]) {
      const reminder = taskReminders[taskText];
      setEnabled(true);
      setReminderDate(reminder.date);
      setReminderTime(reminder.time);
    }
    
    // Check notification permission
    checkNotificationPermission();
  }, [date, taskText, today, defaultTime]);
  
  const checkNotificationPermission = async () => {
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
        // Show a test notification
        new Notification("Task Reminder", {
          body: "Notifications are now enabled!",
          icon: "/favicon.ico"
        });
      } else {
        setNotificationsBlocked(true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setNotificationsBlocked(true);
    }
  };
  
  const isValidDateTime = () => {
    if (!reminderDate || !reminderTime) return false;
    
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    const now = new Date();
    
    // Reminder must be in the future
    return reminderDateTime > now;
  };
  
  const saveReminder = async () => {
    if (!isValidDateTime()) {
      setError("Please set a valid future date and time for the reminder.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure we have notification permission
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setError("Notification permission is required for reminders.");
          setIsLoading(false);
          return;
        }
      }
      
      // Save the reminder to storage
      const storage = getStorage();
      const dayData = storage[date] || {};
      
      // Initialize taskReminders if it doesn't exist
      if (!dayData.taskReminders) {
        dayData.taskReminders = {};
      }
      
      // Convert date/time to a timestamp for scheduling
      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
      
      // Create the reminder object
      dayData.taskReminders[taskText] = {
        id: `task-reminder-${Date.now()}`,
        taskText,
        date: reminderDate,
        time: reminderTime,
        timestamp: reminderDateTime.getTime(),
        enabled: true,
        created: Date.now()
      };
      
      // Save back to storage
      storage[date] = dayData;
      setStorage(storage);

      // Dispatch a custom event to notify other components of the change
const reminderUpdatedEvent = new CustomEvent('taskReminderUpdated', {
    detail: {
      dateKey: date,
      taskText: taskText
    }
  });
  window.dispatchEvent(reminderUpdatedEvent);
      
      // Schedule the reminder
      if (window.reminderService) {
        await window.reminderService.scheduleTaskReminder(dayData.taskReminders[taskText], date);
      }
      
      // Notify parent component
      if (onReminderSet) {
        onReminderSet(dayData.taskReminders[taskText]);
      }
      
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error setting reminder:', error);
      setError(`Failed to set reminder: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  const deleteReminder = () => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    
    if (dayData.taskReminders && dayData.taskReminders[taskText]) {
      // Remove the reminder
      delete dayData.taskReminders[taskText];
      
      // Save back to storage
      storage[date] = dayData;
      setStorage(storage);
      
      // Clean up empty objects
      if (Object.keys(dayData.taskReminders).length === 0) {
        delete dayData.taskReminders;
      }
      
      // Notify parent component
      if (onReminderSet) {
        onReminderSet(null);
      }
    }
    
    onClose();
  };
  
  const handleTimeChange = (e) => {
    setReminderTime(e.target.value);
    // Reset error when input changes
    setError(null);
  };
  
  const handleDateChange = (e) => {
    setReminderDate(e.target.value);
    // Reset error when input changes
    setError(null);
  };

  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <dialog 
      id="task-reminder-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'task-reminder-modal' && onClose()}
    >
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title flex items-center gap-2">
              <Bell className="text-blue-500 dark:text-blue-400" size={20} />
              Set Task Reminder
            </h3>
            <p className="modal-subtitle">
              {getFormattedDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 transition-colors">
          <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2 transition-colors">Task</h4>
          <p className="text-slate-600 dark:text-slate-300 transition-colors">
            {taskText}
          </p>
        </div>

        {/* Notification permission request if blocked */}
        {notificationsBlocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 mb-2">
              Notifications are blocked or not supported by your browser.
            </p>
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Allow Notifications
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1 transition-colors">
              <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
              Reminder Date
            </label>
            <input
              type="date"
              value={reminderDate}
              onChange={handleDateChange}
              min={today}
              className="input-field"
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1 transition-colors">
              <Clock size={16} className="text-slate-500 dark:text-slate-400" />
              Reminder Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={handleTimeChange}
              className="input-field"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg transition-colors">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors">
            {enabled ? (
              <button
                onClick={deleteReminder}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete Reminder
              </button>
            ) : (
              <div></div> // Empty div to maintain spacing with flex justify-between
            )}
            
            <button
              onClick={saveReminder}
              disabled={!isValidDateTime() || isLoading || notificationsBlocked}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                ${!isValidDateTime() || isLoading || notificationsBlocked
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                  : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                  Processing...
                </span>
              ) : (
                <>
                  <Save size={18} />
                  {enabled ? 'Update Reminder' : 'Set Reminder'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default TaskReminder;