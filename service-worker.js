/**
 * ===================================================================
 * SERVICE WORKER — CodeTrack 360 Placement Prep Portal
 * Version: 2.0
 *
 * Changes from v1:
 *   - Bumped CACHE_NAME to 'placement-dashboard-v2' (triggers old cache cleanup)
 *   - dashboard.css confirmed present — kept in precache list
 *   - Removed unused fetchPromise variable (was declared but not awaited)
 *   - Hardened fetch handler: graceful fallback for non-HTML offline failures
 *   - Added SW version constant for easier future bumps
 *
 * Responsibilities:
 *   1. Cache essential assets for offline use (stale-while-revalidate)
 *   2. Handle FCM push events → show notification
 *   3. Handle notificationclick → focus/open dashboard
 *   4. Lifecycle: install (skipWaiting), activate (claim + clean old caches), fetch
 * ===================================================================
 */

const SW_VERSION  = '3.1';
const CACHE_NAME  = 'placement-dashboard-v3.1'; // bump this whenever you deploy new code

// Assets to precache — must all exist at the given paths
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './dashboard.js',
  './dashboard.css',
  './prep-sync.js',
  './firebase-config.js',
  './firebase-firestore-sync.js',
  './firebase-messaging-sw.js',
  './reminder-engine.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ==========================================
// INSTALL — Precache core assets
// ==========================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use allSettled so a single missing asset doesn't abort the whole install
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW v${SW_VERSION}] Could not precache: ${url}`, err.message);
          })
        )
      );
    }).then(() => {
      // Activate immediately — don't wait for existing tabs to close
      return self.skipWaiting();
    })
  );
});

// ==========================================
// ACTIVATE — Clean old caches, claim clients
// ==========================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW v${SW_VERSION}] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Take control of all open clients immediately
      return self.clients.claim();
    })
  );
});

// ==========================================
// FETCH — Stale-while-revalidate for same-origin assets
// ==========================================
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip cross-origin (CDNs, Google Fonts, Firebase, etc.)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Stale-while-revalidate: return cache immediately, update in background
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.ok && networkResponse.type !== 'opaque') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed — return cached fallback for HTML, undefined for others
        if (cachedResponse) return cachedResponse;
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./dashboard.html');
        }
        return undefined;
      });

      // If we have a cached version, return it immediately
      // The background fetch above will update the cache for next time
      return cachedResponse || networkFetch;
    })
  );
});

// ==========================================
// PUSH — FCM / Server Push Handler
// ==========================================
self.addEventListener('push', (event) => {
  let notifTitle = 'CodeTrack 360';
  let notifBody  = 'Time to check your placement prep dashboard!';
  let notifData  = { url: './dashboard.html' };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.notification) {
        notifTitle = payload.notification.title || notifTitle;
        notifBody  = payload.notification.body  || notifBody;
      }
      if (payload.data) {
        notifData = { ...notifData, ...payload.data };
      }
    } catch (e) {
      try {
        notifBody = event.data.text() || notifBody;
      } catch (e2) { /* ignore parse errors */ }
    }
  }

  event.waitUntil(
    self.registration.showNotification(notifTitle, {
      body:               notifBody,
      icon:               './icons/icon-192.png',
      badge:              './icons/icon-192.png',
      tag:                'codetrack360-push',
      data:               notifData,
      requireInteraction: false,
      silent:             false,
      vibrate:            [200, 100, 200]
    })
  );
});

// ==========================================
// NOTIFICATIONCLICK — Focus or open dashboard
// ==========================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : './dashboard.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a dashboard window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('dashboard.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ==========================================
// MESSAGE — Handle control messages from the page
// ==========================================
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'SHOW_NOTIFICATION': {
      const { title, body, tag } = event.data;
      event.waitUntil(
        self.registration.showNotification(title || 'CodeTrack 360', {
          body:    body || 'Time to work on your placement prep!',
          icon:    './icons/icon-192.png',
          badge:   './icons/icon-192.png',
          tag:     tag  || 'codetrack360-message',
          data:    { url: './dashboard.html' },
          vibrate: [200, 100, 200]
        })
      );
      break;
    }

    default:
      break;
  }
});
