import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Clock, Save, Trash2, Calendar, CheckSquare, AlertCircle, Plus } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

export const ReminderSettings = ({ onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
  const [activeTaskReminders, setActiveTaskReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
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
    
    // Load active task reminders
    loadActiveTaskReminders();
    
    // Check notification permission
    checkNotificationPermission();

    // Add event listener for custom events from task reminders
    window.addEventListener('taskReminderUpdated', handleTaskReminderUpdated);
    
    return () => {
      // Clean up event listener
      window.removeEventListener('taskReminderUpdated', handleTaskReminderUpdated);
    };
  }, []);
  
  // Handler for the custom event
  const handleTaskReminderUpdated = () => {
    console.log('Task reminder update event received');
    loadActiveTaskReminders();
  };
  
  const loadActiveTaskReminders = () => {
    const storage = getStorage();
    const active = [];
    
    // Get current date/time
    const now = new Date();
    
    // Process all stored dates for task reminders
    Object.entries(storage).forEach(([dateKey, dayData]) => {
      // Skip non-date entries like settings
      if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) return;
      
      // Check if this day has task reminders
      if (dayData.taskReminders) {
        // Get task details for display
        Object.entries(dayData.taskReminders).forEach(([taskText, reminder]) => {
          // Only include future reminders
          const reminderTime = new Date(`${reminder.date}T${reminder.time}`);
          if (reminderTime > now) {
            active.push({
              ...reminder,
              dateKey,
              taskText,
              dateStr: new Date(dateKey).toLocaleDateString('default', {
                month: 'short',
                day: 'numeric'
              })
            });
          }
        });
      }
    });
    
    // Sort by date/time
    active.sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time}`);
      const timeB = new Date(`${b.date}T${b.time}`);
      return timeA - timeB;
    });
    
    setActiveTaskReminders(active);
  };
  
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
    setShowAddForm(false); // Hide the form after adding
  };
  
  const handleDeleteReminder = (id) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    saveSettings(updatedReminders, enabled);
  };
  
  const handleDeleteTaskReminder = (dateKey, taskText) => {
    if (window.confirm('Are you sure you want to delete this task reminder?')) {
      const storage = getStorage();
      
      if (storage[dateKey]?.taskReminders?.[taskText]) {
        // Remove the task reminder
        delete storage[dateKey].taskReminders[taskText];
        
        // Clean up empty objects
        if (Object.keys(storage[dateKey].taskReminders).length === 0) {
          delete storage[dateKey].taskReminders;
        }
        
        // Save back to storage
        setStorage(storage);
        
        // Refresh the list
        loadActiveTaskReminders();
        
        // Force reminder service to reload as well
        if (window.reminderService && window.reminderService.loadTaskReminders) {
          window.reminderService.loadTaskReminders();
        }
      }
    }
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
    
    // Use our reminder service to show the notification if available
    if (window.reminderService && window.reminderService.showNotification) {
      const testReminder = {
        id: 'test-' + Date.now(),
        label: 'This is a test notification. Your daily reminders will look like this.'
      };
      
      try {
        await window.reminderService.showNotification(testReminder);
        console.log("Test notification sent using reminder service");
      } catch (error) {
        console.error("Error showing test notification:", error);
        alert("Failed to show test notification. Error: " + error.message);
      }
    } else {
      // Fallback for when reminder service isn't available
      try {
        // Try service worker notification first
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          try {
            // Get the active service worker registration
            const registration = await navigator.serviceWorker.ready;
            
            // Show notification via service worker
            await registration.showNotification('Wellness Tracker Reminder', {
              body: "This is a test notification. Your daily reminders will look like this.",
              icon: "/favicon.ico"
            });
            
            console.log("Test notification sent via service worker");
            return;
          } catch (swError) {
            console.error("Service worker notification failed:", swError);
            // Fall back to standard notification
          }
        }
        
        // Standard notification as fallback
        const notification = new Notification("Wellness Tracker Reminder", {
          body: "This is a test notification. Your daily reminders will look like this.",
          icon: "/favicon.ico"
        });
        
        console.log("Test notification sent via standard API");
        
        // Force notification to show for at least 4 seconds
        setTimeout(() => notification.close(), 4000);
      } catch (error) {
        console.error("Error showing test notification:", error);
        alert("Failed to show test notification. Error: " + error.message + "\n\nYour browser may not support notifications in this context.");
      }
    }
  };
  
  // Filter out past reminders from the regular reminders list
  const getActiveRegularReminders = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    return reminders.filter(reminder => {
      if (!reminder.enabled) return false;
      
      const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
      
      // If reminder is for today, check if the time has passed
      if (reminderHour < currentHour || (reminderHour === currentHour && reminderMinute < currentMinute)) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get active regular reminders
  const activeRegularReminders = getActiveRegularReminders();
  
  return (
    <dialog 
      id="reminder-settings-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'reminder-settings-modal' && onClose()}
    >
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title flex items-center gap-2">
              <Bell className="text-blue-500 dark:text-blue-400" size={20} />
              Reminders
            </h3>
            <p className="modal-subtitle">
              Daily and task-specific reminders
            </p>
          </div>
          <div className="flex items-center gap-2">
            {enabled && !notificationsBlocked && (
              <button
                onClick={sendTestNotification}
                className="p-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                title="Send test notification"
              >
                <Bell size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="modal-close-button"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Master toggle for all reminders */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-6 transition-colors">
          <div className="flex items-center gap-3">
            {enabled ? 
              <Bell size={24} className="text-blue-600 dark:text-blue-400" /> : 
              <BellOff size={24} className="text-slate-400 dark:text-slate-500" />
            }
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">Notifications</p>
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
              onChange={handleToggleEnabled}
              disabled={notificationsBlocked} 
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600 transition-colors"></div>
          </label>
        </div>
        
        {/* Notification permission request if blocked */}
        {notificationsBlocked && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 transition-colors">
            <p className="text-amber-800 dark:text-amber-300 mb-2 transition-colors">
              Notifications are blocked or not supported by your browser.
            </p>
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-amber-500 dark:bg-amber-600 text-white rounded-lg hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors"
            >
              Allow Notifications
            </button>
          </div>
        )}
        
        {/* Active Reminders Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">
              Active Reminders
            </h4>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              title={showAddForm ? "Hide add form" : "Add new reminder"}
              aria-label={showAddForm ? "Hide add form" : "Add new reminder"}
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Show message if no active reminders */}
          {activeRegularReminders.length === 0 && activeTaskReminders.length === 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center transition-colors">
              <p className="text-slate-500 dark:text-slate-400 transition-colors">
                No active reminders found. Add new reminders using the + button.
              </p>
            </div>
          )}
          
          {/* Daily regular reminders */}
          {activeRegularReminders.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors">Daily Reminders</h5>
              <div className="space-y-2">
                {activeRegularReminders.map(reminder => (
                  <div 
                    key={reminder.id} 
                    className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-blue-500 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200 transition-colors">{reminder.label}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">{reminder.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleReminder(reminder.id)}
                          className="p-1.5 rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                          title={reminder.enabled ? "Disable reminder" : "Enable reminder"}
                        >
                          {reminder.enabled ? <Bell size={18} /> : <BellOff size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete reminder"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Task-specific reminders */}
          {activeTaskReminders.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors">Task Reminders</h5>
              <div className="space-y-2">
                {activeTaskReminders.map((reminder, index) => (
                  <div 
                    key={index} 
                    className="border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/30 rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={16} className="text-teal-500 dark:text-teal-400" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
                          {reminder.taskText.length > 40 
                            ? reminder.taskText.substring(0, 40) + '...' 
                            : reminder.taskText}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteTaskReminder(reminder.dateKey, reminder.taskText)}
                        className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{reminder.dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{reminder.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Add new reminder form - only shown when "Add" button is clicked */}
        {showAddForm && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-4 transition-colors">
            <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-3 transition-colors flex items-center gap-2">
              <Plus size={16} className="text-blue-500 dark:text-blue-400" />
              Add Daily Reminder
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 transition-colors">Time (24h)</label>
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 transition-colors">Label</label>
                <input
                  type="text"
                  value={newReminderLabel}
                  onChange={(e) => setNewReminderLabel(e.target.value)}
                  placeholder="Log your day"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReminder}
                  disabled={!newReminderTime || notificationsBlocked}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors
                    ${!newReminderTime || notificationsBlocked 
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-600' 
                      : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}
                  `}
                >
                  <Bell size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer with info (mobile only) */}
        {(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs transition-colors">
            <p className="font-medium mb-1">Mobile Device Tips</p>
            <ul className="list-disc pl-4">
              <li>Keep browser tabs open for reliable notifications</li>
              <li>Add to home screen for better notification support</li>
            </ul>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default ReminderSettings;