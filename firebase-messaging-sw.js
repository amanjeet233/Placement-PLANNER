/**
 * ===================================================================
 * FIREBASE MESSAGING SERVICE WORKER — CodeTrack 360
 * ===================================================================
 * This file serves as the default background worker for Firebase Cloud
 * Messaging (FCM). It handles incoming background push notifications
 * when the app tab is not focused or running in background.
 * ===================================================================
 */

// Import Firebase scripts for Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
importScripts('./firebase-config.js');

// Initialize Firebase inside the Service Worker if configured
if (typeof isFirebaseConfigured === 'function' && isFirebaseConfigured()) {
  try {
    firebase.initializeApp(self.FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[FCM-SW] Received background message:', payload);
      const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'CodeTrack 360 Reminder';
      const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || 'Time for your scheduled placement preparation!';
      const targetUrl = (payload.data && payload.data.url) || './dashboard.html';

      const options = {
        body: body,
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        tag: (payload.data && payload.data.tag) || 'codetrack360-fcm-push',
        data: { url: targetUrl, ...payload.data },
        requireInteraction: true,
        vibrate: [200, 100, 200]
      };

      return self.registration.showNotification(title, options);
    });
  } catch (err) {
    console.warn('[FCM-SW] Firebase init in SW skipped or failed:', err);
  }
}

// Fallback direct Push event listener for standard Web Push payloads
self.addEventListener('push', (event) => {
  let notifTitle = 'CodeTrack 360 Reminder';
  let notifBody = 'Time to check your placement prep dashboard!';
  let notifData = { url: './dashboard.html' };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.notification) {
        notifTitle = payload.notification.title || notifTitle;
        notifBody = payload.notification.body || notifBody;
      }
      if (payload.data) {
        notifData = { ...notifData, ...payload.data };
      }
    } catch (e) {
      try {
        notifBody = event.data.text() || notifBody;
      } catch (e2) { /* ignore parse error */ }
    }
  }

  event.waitUntil(
    self.registration.showNotification(notifTitle, {
      body: notifBody,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'codetrack360-push',
      data: notifData,
      requireInteraction: true,
      vibrate: [200, 100, 200]
    })
  );
});

// Handle notification click: Focus existing dashboard tab or open new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : './dashboard.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('dashboard.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
