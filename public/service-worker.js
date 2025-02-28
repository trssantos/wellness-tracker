/* 
 * Wellness Tracker Service Worker
 * This helps with background notifications when the browser supports it
 */

self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Time to check in with your wellness tracker!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true,
    data: data.data || {}
  };
  
  const title = data.isTaskReminder ? 'Task Reminder' : 'Wellness Tracker';
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received', event.notification);
  
  // Close the notification
  event.notification.close();
  
  // Data associated with the notification
  const notificationData = event.notification.data || {};
  
  // This will focus any existing windows or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log('[Service Worker] Found clients:', clientList.length);
      
      // Check if there is already a window/tab open with the target URL
      for (const client of clientList) {
        console.log('[Service Worker] Client URL:', client.url);
        
        // Check if this is a client for our app
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus the client
          console.log('[Service Worker] Focusing existing client');
          client.focus();
          
          // Check if this is a task reminder 
          if (notificationData.isTaskReminder) {
            console.log('[Service Worker] Sending open-task-reminder message to client');
            client.postMessage({
              type: 'open-task-reminder',
              dateKey: notificationData.dateKey,
              taskText: notificationData.taskText,
              reminderId: notificationData.reminderId,
              timestamp: notificationData.timestamp || Date.now()
            });
          }
          // Check if this is a regular reminder
          else if (notificationData.reminderId) {
            console.log('[Service Worker] Sending open-reminder message to client');
            client.postMessage({
              type: 'open-reminder',
              reminderId: notificationData.reminderId,
              timestamp: notificationData.timestamp || Date.now()
            });
          }
          
          return client;
        }
      }
      
      // If no matching window/tab found, open a new one
      if (clients.openWindow) {
        console.log('[Service Worker] Opening new window');
        return clients.openWindow('/');
      }
    })
  );
});