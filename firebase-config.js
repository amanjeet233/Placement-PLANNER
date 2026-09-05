/**
 * ===================================================================
 * FIREBASE CONFIGURATION & FCM CLIENT — CodeTrack 360 Placement Prep Portal
 * ===================================================================
 *
 * SETUP INSTRUCTIONS (One-time, 100% Free — Firebase Spark Plan):
 *
 * 1. Go to: https://console.firebase.google.com
 * 2. Click "Add Project" → Name it "codetrack-360" → Continue
 * 3. Disable Google Analytics (optional) → Click "Create Project"
 * 4. In Project Overview, click the "</>" Web icon to register your Web App
 * 5. App nickname: "codetrack-web" → Click "Register app"
 * 6. Copy the values inside `const firebaseConfig = { ... }` and paste into FIREBASE_CONFIG below
 * 7. Click the Gear Icon ⚙️ (Project Settings) → Go to the "Cloud Messaging" tab
 * 8. Scroll to "Web Push certificates" → Click "Generate key pair"
 * 9. Copy the long public key string and paste it into VAPID_KEY below
 * 10. Reload the dashboard → Click "Enable Notifications" → Copy your FCM Token!
 *
 * COST: Firebase Spark Plan = ₹0 / $0. No credit card required.
 * ===================================================================
 */

// ↓↓↓ PASTE YOUR FIREBASE WEB APP CONFIG HERE ↓↓↓
const firebaseConfig = {
  apiKey: "AIzaSyCIxbBSoUx7UBcYQaxfi2G0PpBHZDneGRs",
  authDomain: "codetrack-360.firebaseapp.com",
  projectId: "codetrack-360",
  storageBucket: "codetrack-360.firebasestorage.app",
  messagingSenderId: "753006489945",
  appId: "1:753006489945:web:07694b71cd0ab3c2ca9c48",
  measurementId: "G-WBYXQS3H5G"
};

// Aliased to ensure 100% compatibility across both conventions
const FIREBASE_CONFIG = firebaseConfig;

// ↓↓↓ PASTE YOUR VAPID PUBLIC KEY HERE ↓↓↓
// (From Firebase Console: Project Settings → Cloud Messaging → Web configuration → Key pair)
const RAW_VAPID_KEY = "BB0KrRS_QdYqa0POO0CtCP25yhPWQ1j0z7oeJxbdmFzVYJRNh5L2mMSM6jazraXgyxUNu3-yBaU-C1183Ydz-l0";
const VAPID_KEY = RAW_VAPID_KEY.replace(/YOUR_VAPID_PUBLIC_KEY_HERE$/, '').trim();

// ===================================================================
// FCM CLIENT ENGINE & DIAGNOSTICS (DO NOT EDIT BELOW)
// ===================================================================

const FCMClient = (() => {
  'use strict';

  let _app = null;
  let _messaging = null;
  let _token = localStorage.getItem('fcm_token') || null;
  let _isInitialized = false;
  let _lastPushReceived = null;
  let _lastError = null;
  let _pushListeners = [];

  /**
   * Check if Firebase credentials are fully filled out with real values
   */
  function isFirebaseConfigured() {
    return (
      FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" &&
      FIREBASE_CONFIG.projectId &&
      FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID" &&
      FIREBASE_CONFIG.messagingSenderId &&
      FIREBASE_CONFIG.messagingSenderId !== "YOUR_SENDER_ID" &&
      FIREBASE_CONFIG.appId &&
      FIREBASE_CONFIG.appId !== "YOUR_APP_ID" &&
      VAPID_KEY &&
      VAPID_KEY !== "YOUR_VAPID_PUBLIC_KEY_HERE"
    );
  }

  /**
   * Return a list of missing configuration parameters
   */
  function getMissingFields() {
    const missing = [];
    if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") missing.push("apiKey");
    if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.projectId === "YOUR_PROJECT_ID") missing.push("projectId");
    if (!FIREBASE_CONFIG.messagingSenderId || FIREBASE_CONFIG.messagingSenderId === "YOUR_SENDER_ID") missing.push("messagingSenderId");
    if (!FIREBASE_CONFIG.appId || FIREBASE_CONFIG.appId === "YOUR_APP_ID") missing.push("appId");
    if (!VAPID_KEY || VAPID_KEY === "YOUR_VAPID_PUBLIC_KEY_HERE") missing.push("VAPID_KEY (Web Push Certificate)");
    return missing;
  }

  /**
   * Check if the browser supports Push Notifications and Service Workers
   */
  function isPushSupported() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Initialize Firebase App & Cloud Messaging SDK
   * @param {ServiceWorkerRegistration} [swReg]
   */
  async function init(swReg = null) {
    if (_isInitialized) return { ok: true, token: _token };

    if (!isPushSupported()) {
      _lastError = 'Browser does not support PushManager / ServiceWorker';
      return { ok: false, error: _lastError };
    }

    if (!isFirebaseConfigured()) {
      _lastError = 'Firebase config placeholders not replaced yet';
      return { ok: false, error: _lastError, missing: getMissingFields() };
    }

    if (typeof window.firebase === 'undefined') {
      _lastError = 'Firebase SDK scripts not loaded from CDN';
      return { ok: false, error: _lastError };
    }

    try {
      // Initialize Firebase App if not already initialized
      if (!firebase.apps || !firebase.apps.length) {
        _app = firebase.initializeApp(FIREBASE_CONFIG);
      } else {
        _app = firebase.app();
      }

      // Initialize Firebase Messaging
      if (typeof firebase.messaging === 'function') {
        _messaging = firebase.messaging();

        // Listen for foreground push messages
        _messaging.onMessage((payload) => {
          console.log('[FCM] Foreground message received:', payload);
          _lastPushReceived = new Date().toLocaleTimeString();

          // Notify registered callbacks
          _pushListeners.forEach((cb) => {
            try { cb(payload); } catch (e) { console.error(e); }
          });

          // Show system notification or alert
          const title = (payload.notification && payload.notification.title) || 'CodeTrack 360 Push';
          const body = (payload.notification && payload.notification.body) || 'New reminder from placement tracker!';

          if (window.ReminderEngine && typeof window.ReminderEngine.showNotification === 'function') {
            window.ReminderEngine.showNotification(title, body, 'fcm-foreground-' + Date.now());
          }
        });

        _isInitialized = true;
        _lastError = null;

        // Auto-request token if notification permission is already granted
        if (Notification.permission === 'granted') {
          await requestToken(swReg);
        }

        return { ok: true, token: _token };
      } else {
        _lastError = 'Firebase messaging module not available';
        return { ok: false, error: _lastError };
      }
    } catch (err) {
      console.warn('[FCM] Initialization failed:', err);
      _lastError = err.message;
      return { ok: false, error: err.message };
    }
  }

  /**
   * Request FCM Device Registration Token
   * @param {ServiceWorkerRegistration} [swReg]
   */
  async function requestToken(swReg = null) {
    if (!isFirebaseConfigured()) {
      _lastError = 'Firebase config required for FCM Token';
      return { ok: false, error: _lastError, missing: getMissingFields() };
    }

    if (!_messaging) {
      const initRes = await init(swReg);
      if (!initRes.ok) return initRes;
    }

    try {
      let registration = swReg;
      if (!registration && 'serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', { scope: './' });
        } catch (e) {
          registration = await navigator.serviceWorker.ready.catch(() => null);
        }
      }

      const tokenOptions = { vapidKey: VAPID_KEY };
      if (registration) {
        tokenOptions.serviceWorkerRegistration = registration;
      }

      const currentToken = await _messaging.getToken(tokenOptions);

      if (currentToken) {
        _token = currentToken;
        localStorage.setItem('fcm_token', currentToken);
        _lastError = null;
        console.log('[FCM] Registration Token obtained:', currentToken);
        return { ok: true, token: currentToken };
      } else {
        _lastError = 'No registration token available. Allow notification permission first.';
        return { ok: false, error: _lastError };
      }
    } catch (err) {
      console.warn('[FCM] Error retrieving registration token:', err);
      let errMsg = err.message || 'Push service registration failed';
      if (errMsg.includes('push service error') || errMsg.includes('Registration failed')) {
        errMsg = 'Push service blocked by browser. In Brave: Go to brave://settings/privacy -> Enable "Use Google services for push messaging" and restart browser.';
      }
      _lastError = errMsg;
      return { ok: false, error: errMsg };
    }
  }

  /**
   * Register a listener for foreground push notifications
   */
  function onMessage(callback) {
    if (typeof callback === 'function') {
      _pushListeners.push(callback);
    }
  }

  /**
   * Telemetry Diagnostics for UI
   */
  function getDiagnostics() {
    return {
      isConfigured: isFirebaseConfigured(),
      missingFields: getMissingFields(),
      firebaseInitialized: !!_app,
      fcmInitialized: !!_messaging,
      fcmToken: _token || localStorage.getItem('fcm_token') || 'Not Generated',
      pushSupported: isPushSupported(),
      lastPushReceived: _lastPushReceived || 'None',
      lastError: _lastError || 'None'
    };
  }

  return {
    init,
    requestToken,
    onMessage,
    isFirebaseConfigured,
    getMissingFields,
    isPushSupported,
    getDiagnostics,
    get token() { return _token || localStorage.getItem('fcm_token'); },
    get isInitialized() { return _isInitialized; }
  };
})();

// Expose globally to window (DOM) or self (Service Worker)
const globalScope = (typeof window !== 'undefined') ? window : (typeof self !== 'undefined' ? self : globalThis);
globalScope.FIREBASE_CONFIG = FIREBASE_CONFIG;
globalScope.firebaseConfig = firebaseConfig;
globalScope.VAPID_KEY = VAPID_KEY;
globalScope.isFirebaseConfigured = FCMClient.isFirebaseConfigured;
globalScope.FCMClient = FCMClient;
globalScope.getFcmToken = () => FCMClient.token;
