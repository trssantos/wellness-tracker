import { getStorage } from './storage';

class ReminderService {
  constructor() {
    this.reminders = [];
    this.taskReminders = [];
    this.timers = [];
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    console.log('Initializing reminder service');
    
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return;
    }
    
    // Log notification permission status
    console.log('Current notification permission:', Notification.permission);
    
    // Load saved reminders from storage
    this.loadReminders();
    this.loadTaskReminders();
    
    // ===== APPROACH 1: Check periodically =====
    // Schedule checking for reminders - more frequently for reliability
    setInterval(() => this.checkReminders(), 30000); // Check every 30 seconds
    
    // Do an immediate check on init
    this.checkReminders();
    
    // ===== APPROACH 2: Use direct timeouts =====
    // Schedule direct timers for each reminder
    this.scheduleReminderTimers();
    this.scheduleTaskReminderTimers();
    
    // Re-schedule at midnight for the next day
    this.scheduleForMidnight();
    
    // Setup visibility change handling - to catch up on reminders when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking reminders');
        this.checkReminders();
        
        // Re-schedule timers in case we've missed any
        this.scheduleReminderTimers();
        this.scheduleTaskReminderTimers();
      }
    });
    
    this.initialized = true;
    
    // Return permission status for debugging
    return Notification.permission;
  }
  
  scheduleForMidnight() {
    // Calculate milliseconds until midnight
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Next day
      0, 0, 0 // 00:00:00
    );
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    // Schedule task for midnight
    setTimeout(() => {
      console.log('Midnight reached, rescheduling reminders for the new day');
      
      // Reload reminders (in case settings changed)
      this.loadReminders();
      this.loadTaskReminders();
      
      // Schedule reminders for the new day
      this.scheduleReminderTimers();
      this.scheduleTaskReminderTimers();
      
      // Schedule again for the next midnight
      this.scheduleForMidnight();
    }, msUntilMidnight);
    
    console.log(`Scheduled midnight task in ${Math.round(msUntilMidnight/3600000)} hours`);
  }
  
  loadReminders() {
    const storage = getStorage();
    
    if (storage.reminderSettings && 
        storage.reminderSettings.enabled && 
        storage.reminderSettings.reminders) {
      
      this.reminders = storage.reminderSettings.reminders.filter(r => r.enabled);
      console.log('Loaded reminders:', this.reminders);
    } else {
      this.reminders = [];
    }
  }
  
  // New method to load task-specific reminders
  loadTaskReminders() {
    const storage = getStorage();
    const taskReminders = [];
    
    // Scan all dates for task reminders
    Object.entries(storage).forEach(([dateKey, dayData]) => {
      // Skip non-date entries (like settings)
      if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) return;
      
      // Check if this day has task reminders
      if (dayData.taskReminders) {
        // Add each task reminder to our array with the associated date
        Object.values(dayData.taskReminders).forEach(reminder => {
          if (reminder.enabled) {
            taskReminders.push({
              ...reminder,
              dateKey // Store the date this reminder belongs to
            });
          }
        });
      }
    });
    
    this.taskReminders = taskReminders;
    console.log('Loaded task reminders:', this.taskReminders);
  }
  
  checkReminders() {
    // Only proceed if notifications are granted
    if (Notification.permission !== 'granted') {
      console.log('Notifications not granted. Current permission:', Notification.permission);
      return;
    }
    
    // Check daily reminders
    this.checkDailyReminders();
    
    // Check task reminders
    this.checkTaskReminders();
  }
  
  checkDailyReminders() {
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Format as HH:MM
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Check each reminder
    this.reminders.forEach(reminder => {
      // For testing purposes, also check recent minutes to catch reminders
      // that might have been missed due to timing issues
      const reminderTime = reminder.time;
      const reminderHour = parseInt(reminderTime.split(':')[0]);
      const reminderMinute = parseInt(reminderTime.split(':')[1]);
      
      // Consider the reminder valid if it's within the current minute or the previous minute
      const isCurrentTime = reminderTime === currentTime;
      
      // For debugging
      if (Math.abs(reminderHour - currentHour) <= 1) {
        console.log(`Checking reminder ${reminder.label} set for ${reminderTime}, current: ${currentTime}`);
      }
      
      if (isCurrentTime) {
        console.log('MATCH! Showing notification for reminder:', reminder);
        this.showNotification(reminder);
      }
    });
  }
  
  // New method to check task reminders
  checkTaskReminders() {
    const now = new Date();
    
    // Filter for task reminders that are due
    this.taskReminders.forEach(reminder => {
      // Skip if no timestamp or already triggered
      if (!reminder.timestamp || reminder.triggered) return;
      
      const reminderTime = new Date(reminder.timestamp);
      
      // Check if the reminder is due (within the last minute)
      const timeDiff = now.getTime() - reminderTime.getTime();
      const isWithinLastMinute = timeDiff >= 0 && timeDiff < 60000;
      
      if (isWithinLastMinute) {
        console.log('MATCH! Showing notification for task reminder:', reminder);
        this.showTaskNotification(reminder);
        
        // Mark as triggered to avoid duplicate notifications
        reminder.triggered = true;
      }
    });
  }
  
  // New method to display task-specific notifications
  async showTaskNotification(reminder) {
    try {
      // Check if we've already shown this notification
      const now = new Date();
      const today = now.toDateString();
      const lastShownKey = `taskReminder_${reminder.id}_lastShown`;
      const lastShown = localStorage.getItem(lastShownKey);
      
      if (lastShown === today) {
        console.log(`Already showed notification for task reminder ${reminder.id}`);
        return;
      }
      
      // Ensure we have permission
      if (Notification.permission !== "granted") {
        console.log("Notification permission not granted, requesting...");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Notification permission denied");
          return;
        }
      }
      
      // Notification options
      const options = {
        body: `Task reminder: ${reminder.taskText}`,
        icon: '/favicon.ico',
        requireInteraction: true,
        tag: `task-reminder-${reminder.id}`, // Prevent duplicate notifications
        data: {
          reminderId: reminder.id,
          taskText: reminder.taskText,
          dateKey: reminder.dateKey,
          timestamp: Date.now(),
          isTaskReminder: true
        }
      };
      
      let notification;
      
      // Try to use service worker for notifications (for mobile support)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          console.log("Using ServiceWorker for task notification");
          // Get the active service worker registration
          const registration = await navigator.serviceWorker.ready;
          
          // Show notification via service worker
          await registration.showNotification('Task Reminder', options);
          console.log("Successfully showed task notification via ServiceWorker");
          
          // Since we can't get a direct reference to the notification object,
          // we just create a stub to return
          notification = { via: 'serviceWorker' };
        } catch (swError) {
          console.error("ServiceWorker notification failed:", swError);
          // Fall back to standard notification
        }
      }
      
      // If service worker notification failed or isn't available, try standard notification
      if (!notification) {
        try {
          console.log("Using standard Notification API for task");
          notification = new Notification('Task Reminder', options);
          
          // Handle click on notification
          notification.onclick = () => {
            // Focus on the window and close the notification
            window.focus();
            notification.close();
            
            // Open the day with this task
            if (window.openTaskReminderAction) {
              window.openTaskReminderAction(reminder.dateKey, reminder.taskText);
            } else if (window.openReminderAction) {
              // Fallback to regular reminder action
              window.openReminderAction();
            }
          };
          
          console.log("Successfully showed standard task notification");
        } catch (notifError) {
          console.error("Standard notification failed:", notifError);
          
          // Last resort: try to show an alert if all else fails
          if (reminder) {
            alert(`Task Reminder: ${reminder.taskText}`);
            console.log("Showed alert as last resort for task");
          }
          
          notification = { via: 'alert' };
        }
      }
      
      // Mark as shown
      localStorage.setItem(lastShownKey, today);
      
      // Log success
      console.log("Task notification handled:", notification);
      
      return notification;
    } catch (error) {
      console.error("Error showing task notification:", error);
    }
  }
  
  // New method to schedule a specific task reminder
  scheduleTaskReminder(reminderData, dateKey) {
    console.log('Scheduling task reminder:', reminderData, 'for date:', dateKey);
    
    // Add to our internal list
    this.taskReminders.push({
      ...reminderData,
      dateKey
    });
    
    // Schedule timer for this reminder
    this.scheduleTaskReminderTimers();
    
    return true;
  }
  
  // Schedule timers for task reminders
  scheduleTaskReminderTimers() {
    // Get current date/time
    const now = new Date();
    
    // Clear existing task reminder timers
    this.taskReminders.forEach(reminder => {
      if (reminder.timerId) {
        clearTimeout(reminder.timerId);
        delete reminder.timerId;
      }
    });
    
    // Schedule each task reminder that hasn't been triggered yet
    this.taskReminders.forEach(reminder => {
      // Skip if already triggered or no timestamp
      if (reminder.triggered || !reminder.timestamp) return;
      
      const reminderTime = new Date(reminder.timestamp);
      
      // If the time has already passed, mark as triggered
      if (reminderTime <= now) {
        reminder.triggered = true;
        return;
      }
      
      // Calculate milliseconds until the reminder time
      const msUntilReminder = reminderTime.getTime() - now.getTime();
      
      console.log(`Scheduling task reminder "${reminder.taskText}" for ${reminderTime.toLocaleString()}, which is in ${Math.round(msUntilReminder/60000)} minutes`);
      
      // Set timeout for this reminder
      const timerId = setTimeout(() => {
        console.log(`Timer triggered for task reminder ${reminder.id} at ${new Date().toLocaleTimeString()}`);
        this.showTaskNotification(reminder);
        reminder.triggered = true;
      }, msUntilReminder);
      
      // Store the timer ID for cleanup
      reminder.timerId = timerId;
    });
  }
  
  async showNotification(reminder) {
    try {
      // Check if we've already shown this notification today
      const now = new Date();
      const today = now.toDateString();
      const lastShownKey = `reminder_${reminder.id}_lastShown`;
      const lastShown = localStorage.getItem(lastShownKey);
      
      // Also check the hour to avoid showing it again in case user refreshes
      const hourMinuteStr = `${now.getHours()}:${now.getMinutes()}`;
      const lastShownTimeKey = `reminder_${reminder.id}_lastShownTime`;
      const lastShownTime = localStorage.getItem(lastShownTimeKey);
      
      if (lastShown === today && lastShownTime === hourMinuteStr) {
        console.log(`Already showed notification for reminder ${reminder.id} at ${hourMinuteStr}`);
        return;
      }
      
      // Ensure we have permission
      if (Notification.permission !== "granted") {
        console.log("Notification permission not granted, requesting...");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Notification permission denied");
          return;
        }
      }
      
      // Notification options
      const options = {
        body: reminder.label || 'Time to log your wellness data!',
        icon: '/favicon.ico',
        requireInteraction: true,
        tag: `reminder-${reminder.id}`, // Prevent duplicate notifications
        data: {
          reminderId: reminder.id,
          timestamp: Date.now()
        }
      };
      
      let notification;
      
      // Try to use service worker for notifications (for mobile support)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          console.log("Using ServiceWorker for notification");
          // Get the active service worker registration
          const registration = await navigator.serviceWorker.ready;
          
          // Show notification via service worker
          await registration.showNotification('Wellness Tracker', options);
          console.log("Successfully showed notification via ServiceWorker");
          
          // Since we can't get a direct reference to the notification object,
          // we just create a stub to return
          notification = { via: 'serviceWorker' };
        } catch (swError) {
          console.error("ServiceWorker notification failed:", swError);
          // Fall back to standard notification
        }
      }
      
      // If service worker notification failed or isn't available, try standard notification
      if (!notification) {
        try {
          console.log("Using standard Notification API");
          notification = new Notification('Wellness Tracker', options);
          
          // Handle click on notification
          notification.onclick = () => {
            // Focus on the window and close the notification
            window.focus();
            notification.close();
            
            // Trigger actions based on the reminder type
            if (window.openReminderAction) {
              window.openReminderAction();
            }
          };
          
          console.log("Successfully showed standard notification");
        } catch (notifError) {
          console.error("Standard notification failed:", notifError);
          
          // Last resort: try to show an alert if all else fails
          if (reminder) {
            alert(`Reminder: ${reminder.label || 'Time to log your wellness data!'}`);
            console.log("Showed alert as last resort");
          }
          
          notification = { via: 'alert' };
        }
      }
      
      // Mark as shown
      localStorage.setItem(lastShownKey, today);
      localStorage.setItem(lastShownTimeKey, hourMinuteStr);
      
      // Log success
      console.log("Notification handled:", notification);
      
      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }
  
  updateReminders(reminders) {
    this.reminders = reminders.filter(r => r.enabled);
    console.log('Updated reminders:', this.reminders);
    
    // Clear any existing timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
    
    // Schedule direct timers for each reminder for today
    this.scheduleReminderTimers();
  }
  
  scheduleReminderTimers() {
    // Get current date/time
    const now = new Date();
    
    // Schedule each reminder
    this.reminders.forEach(reminder => {
      // Parse the reminder time
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      // Create target time for today
      const targetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
      );
      
      // If the time has already passed today, don't schedule
      if (targetTime <= now) {
        console.log(`Reminder time ${reminder.time} already passed for today`);
        return;
      }
      
      // Calculate milliseconds until the reminder time
      const msUntilReminder = targetTime.getTime() - now.getTime();
      
      console.log(`Scheduling reminder "${reminder.label}" for ${reminder.time}, which is in ${Math.round(msUntilReminder/60000)} minutes`);
      
      // Set timeout for this reminder
      const timerId = setTimeout(() => {
        console.log(`Timer triggered for reminder ${reminder.id} at ${new Date().toLocaleTimeString()}`);
        this.showNotification(reminder);
      }, msUntilReminder);
      
      // Store the timer ID for cleanup
      this.timers.push(timerId);
    });
  }
}

// Create the service instance
const reminderService = new ReminderService();

// Add a test function that can be called from console for debugging
reminderService.testNotification = async () => {
  console.log('Testing notification...');
  
  // Current permission status
  console.log('Current notification permission:', Notification.permission);
  
  if (Notification.permission !== 'granted') {
    console.log('Requesting permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
    if (permission !== 'granted') {
      console.error('Permission denied');
      return false;
    }
  }
  
  try {
    const testReminder = {
      id: 'test-' + Date.now(),
      label: 'Test Notification ' + new Date().toLocaleTimeString()
    };
    
    const result = await reminderService.showNotification(testReminder);
    return result;
  } catch (error) {
    console.error('Test notification error:', error);
    return false;
  }
};

// Add a test function for task reminders
reminderService.testTaskNotification = async () => {
  console.log('Testing task notification...');
  
  // Current permission status
  console.log('Current notification permission:', Notification.permission);
  
  if (Notification.permission !== 'granted') {
    console.log('Requesting permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
    if (permission !== 'granted') {
      console.error('Permission denied');
      return false;
    }
  }
  
  try {
    const testReminder = {
      id: 'task-test-' + Date.now(),
      taskText: 'Test Task Reminder ' + new Date().toLocaleTimeString(),
      dateKey: new Date().toISOString().split('T')[0]
    };
    
    const result = await reminderService.showTaskNotification(testReminder);
    return result;
  } catch (error) {
    console.error('Test task notification error:', error);
    return false;
  }
};

// Make available in window for console testing
if (typeof window !== 'undefined') {
  window.testNotification = reminderService.testNotification;
  window.testTaskNotification = reminderService.testTaskNotification;
}

// Export the service
export default reminderService;