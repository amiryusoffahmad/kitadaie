// Web Push Service Worker
// This service worker handles Web Push notifications when the app is closed or in background

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[sw-push.js] Service worker installed');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[sw-push.js] Service worker activated');
  event.waitUntil(clients.claim());
});

// Handle push events (when notification is received)
self.addEventListener('push', (event) => {
  console.log('[sw-push.js] Push event received:', event);

  let notificationData = {
    title: 'New Notification',
    body: '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: {},
  };

  // Parse notification data from push payload
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[sw-push.js] Push payload:', payload);

      notificationData = {
        title: payload.title || 'New Notification',
        body: payload.body || '',
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-96x96.png',
        tag: payload.data?.tag || `notification-${Date.now()}`,
        data: payload.data || {},
        requireInteraction: payload.requireInteraction || false,
        vibrate: payload.vibrate || [200, 100, 200],
      };
    } catch (error) {
      console.error('[sw-push.js] Error parsing push data:', error);
    }
  }

  // Show notification
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[sw-push.js] Notification clicked:', event.notification);

  event.notification.close();

  // Get the click action URL from the notification data
  const clickAction = event.notification.data?.clickAction || '/user/notifications';

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(clickAction) && 'focus' in client) {
            return client.focus();
          }
        }

        // If no matching window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[sw-push.js] Notification closed:', event.notification);
});
