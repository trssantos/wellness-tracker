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
      requireInteraction: true
    };
    
    event.waitUntil(
      self.registration.showNotification('Wellness Tracker', options)
    );
  });
  
  // Handle notification clicks
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // This will focus any existing windows or open a new one
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if there is already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If no matching window/tab found, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  });