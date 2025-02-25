import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Clock, Save, Trash2 } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

export const ReminderSettings = ({ onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
  
  // Time picker state for new reminder
  const [newReminderTime, setNewReminderTime] = useState('09:00');
  const [newReminderLabel, setNewReminderLabel] = useState('Log your day');
  
  useEffect(() => {
    // Load saved reminder settings
    const storage = getStorage();
    
    if (storage.reminderSettings) {
      setReminders(storage.reminderSettings.reminders || []);
      setEnabled(storage.reminderSettings.enabled || false);
    }
    
    // Check notification permission
    checkNotificationPermission();
  }, []);
  
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
        new Notification("Wellness Tracker", {
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
  
  const handleToggleEnabled = () => {
    const newState = !enabled;
    setEnabled(newState);
    saveSettings(reminders, newState);
  };
  
  const handleAddReminder = () => {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newReminderTime)) {
      alert("Please enter a valid time in 24-hour format (HH:MM)");
      return;
    }
    
    // Create new reminder
    const newReminder = {
      id: Date.now(),
      time: newReminderTime,
      label: newReminderLabel || "Log your day",
      enabled: true
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    saveSettings(updatedReminders, enabled);
    
    // Reset form
    setNewReminderTime('09:00');
    setNewReminderLabel('Log your day');
  };
  
  const handleDeleteReminder = (id) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    saveSettings(updatedReminders, enabled);
  };
  
  const handleToggleReminder = (id) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === id) {
        return { ...reminder, enabled: !reminder.enabled };
      }
      return reminder;
    });
    
    setReminders(updatedReminders);
    saveSettings(updatedReminders, enabled);
  };
  
  const saveSettings = (remindersList, isEnabled) => {
    const storage = getStorage();
    
    storage.reminderSettings = {
      reminders: remindersList,
      enabled: isEnabled,
      lastUpdated: new Date().toISOString()
    };
    
    setStorage(storage);
    
    // Register the service worker if reminders are enabled
    if (isEnabled && remindersList.length > 0) {
      registerReminders(remindersList);
    }
  };
  
  const registerReminders = (remindersList) => {
    // This function would register the reminders with the reminder service
    // We'll implement this in the reminder service
    if (window.reminderService) {
      window.reminderService.updateReminders(remindersList);
    }
  };
  
  const sendTestNotification = async () => {
    // First check permission
    if (Notification.permission !== "granted") {
      // Request permission first
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission denied. Please enable notifications in your browser settings.");
        setNotificationsBlocked(true);
        return;
      }
      setNotificationsBlocked(false);
    }
    
    try {
      // Show test notification
      const notification = new Notification("Wellness Tracker Reminder", {
        body: "This is a test notification. Your daily reminders will look like this.",
        icon: "/favicon.ico"
      });
      
      // Log for debugging
      console.log("Test notification sent:", notification);
      
      // Force notification to show for at least 4 seconds
      setTimeout(() => notification.close(), 4000);
    } catch (error) {
      console.error("Error showing test notification:", error);
      alert("Failed to show test notification. Error: " + error.message);
    }
  };
  
  return (
    <dialog 
      id="reminder-settings-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'reminder-settings-modal' && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Daily Reminders</h3>
            <p className="text-sm text-slate-600">
              Get notified to log your wellness data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Master toggle for all reminders */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            {enabled ? 
              <Bell size={24} className="text-blue-600" /> : 
              <BellOff size={24} className="text-slate-400" />
            }
            <div>
              <p className="font-medium text-slate-800">Daily Reminders</p>
              <p className="text-sm text-slate-600">
                {enabled ? "Notifications enabled" : "Notifications disabled"}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={enabled}
              onChange={handleToggleEnabled}
              disabled={notificationsBlocked} 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
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
        
        {/* Test notification button if enabled */}
        {enabled && !notificationsBlocked && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={sendTestNotification}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Send test notification
            </button>
          </div>
        )}
        
        {/* Existing reminders list */}
        {reminders.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-slate-700 mb-3">Your Reminders</h4>
            <div className="space-y-3">
              {reminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    reminder.enabled && enabled 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock size={18} className={reminder.enabled && enabled ? "text-blue-500" : "text-slate-400"} />
                    <div>
                      <p className="font-medium">{reminder.label}</p>
                      <p className="text-sm text-slate-600">{reminder.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReminder(reminder.id)}
                      className={`p-1.5 rounded-lg ${
                        reminder.enabled 
                          ? 'text-blue-600 hover:bg-blue-100' 
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={reminder.enabled ? "Disable reminder" : "Enable reminder"}
                    >
                      {reminder.enabled ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete reminder"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Add new reminder form */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="font-medium text-slate-700 mb-3">Add New Reminder</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Reminder Time</label>
              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Reminder Label</label>
              <input
                type="text"
                value={newReminderLabel}
                onChange={(e) => setNewReminderLabel(e.target.value)}
                placeholder="Log your day"
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <button
              onClick={handleAddReminder}
              disabled={!newReminderTime || notificationsBlocked}
              className={`
                flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium
                ${!newReminderTime || notificationsBlocked 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'}
              `}
            >
              <Bell size={18} />
              Add Reminder
            </button>
          </div>
        </div>
        
        {/* Footer with info */}
        <div className="mt-6 text-xs text-slate-500">
          <p>Reminders will only show when your browser is open. For best results, keep this website open or create a shortcut on your home screen.</p>
        </div>
      </div>
    </dialog>
  );
};

export default ReminderSettings;