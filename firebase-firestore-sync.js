/**
 * ===================================================================
 * FIREBASE FIRESTORE REAL-TIME AUTO-SYNC ENGINE — CodeTrack 360
 * ===================================================================
 * 
 * Provides automatic, seamless, zero-cost (₹0) bi-directional real-time
 * cloud synchronization for all placement data (Habits, Streaks, DSA,
 * Aptitude, Reminders) across all devices and domains (Localhost,
 * GitHub Pages, Phone, Laptop).
 * ===================================================================
 */

(function () {
  'use strict';

  var SYNC_DOC_ID = 'user_vault';
  var COLLECTION_NAME = 'placement_prep_sync';
  var DEBOUNCE_MS = 1200; // Debounce cloud writes to save bandwidth and quota

  var _db = null;
  var _isSyncing = false;
  var _lastSyncTime = null;
  var _debounceTimer = null;
  var _isListening = false;
  var _cloudStatusListeners = [];
  var _isApplyingCloud = false;

  function getLocalDataPayload() {
    var vaultData = null;
    try {
      vaultData = JSON.parse(localStorage.getItem('prep_vault_v1') || '{}');
    } catch (e) {
      vaultData = {};
    }

    var remindersData = [];
    try {
      remindersData = JSON.parse(localStorage.getItem('placement_reminders_v1') || '[]');
    } catch (e) {
      remindersData = [];
    }

    return {
      prep_vault_v1: vaultData,
      placement_reminders_v1: remindersData,
      lastUpdated: Date.now(),
      clientInfo: {
        userAgent: navigator.userAgent,
        origin: window.location.origin
      }
    };
  }

  function notifyStatus(status, detail) {
    _cloudStatusListeners.forEach(function (fn) {
      try { fn(status, detail); } catch (e) { console.error(e); }
    });

    // Update DOM indicators if present
    var statusEl = document.getElementById('cloudSyncStatus');
    var badgeEl = document.getElementById('cloudSyncBadge');
    if (statusEl) {
      if (status === 'synced') {
        statusEl.innerHTML = '☁️ <span class="text-emerald-600 font-bold">Cloud Synced</span>';
      } else if (status === 'syncing') {
        statusEl.innerHTML = '🔄 <span class="text-indigo-600 font-bold animate-pulse">Syncing...</span>';
      } else if (status === 'offline') {
        statusEl.innerHTML = '⚡ <span class="text-amber-600 font-bold">Offline (Local Saved)</span>';
      } else if (status === 'error') {
        statusEl.innerHTML = '⚠️ <span class="text-rose-500 font-bold">Sync Warning</span>';
      }
    }
    if (badgeEl) {
      badgeEl.title = 'Cloud Auto-Sync: ' + status + (detail ? ' (' + detail + ')' : '');
    }
  }

  function initFirestore() {
    if (_db) return _db;
    if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
      console.warn('[CloudSync] Firebase Firestore SDK not loaded yet.');
      return null;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        if (window.FIREBASE_CONFIG) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }
      }
      _db = firebase.firestore();
      
      // Enable offline persistence if supported
      try {
        _db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
          // Ignore multiple tabs error or unimplemented
        });
      } catch (pe) { /* continue */ }

      console.log('[CloudSync] Firebase Firestore initialized successfully.');
      return _db;
    } catch (err) {
      console.warn('[CloudSync] Firestore initialization failed:', err.message);
      return null;
    }
  }

  /**
   * Save local data to Firestore Cloud (Debounced)
   */
  function scheduleCloudSave() {
    if (_isApplyingCloud) return; // Avoid write loop when applying remote updates
    if (_debounceTimer) clearTimeout(_debounceTimer);

    notifyStatus('syncing', 'Saving to Cloud...');

    _debounceTimer = setTimeout(function () {
      executeCloudSave();
    }, DEBOUNCE_MS);
  }

  function executeCloudSave() {
    var db = initFirestore();
    if (!db) {
      notifyStatus('offline', 'Firestore SDK not ready');
      return;
    }

    var payload = getLocalDataPayload();
    _isSyncing = true;

    db.collection(COLLECTION_NAME).doc(SYNC_DOC_ID).set(payload, { merge: true })
      .then(function () {
        _isSyncing = false;
        _lastSyncTime = new Date();
        notifyStatus('synced', 'All progress saved to Cloud');
        console.log('[CloudSync] ✅ Data successfully synchronized to Firebase Firestore.');
      })
      .catch(function (err) {
        _isSyncing = false;
        console.warn('[CloudSync] Cloud save warning:', err.message);
        notifyStatus('error', err.message);
      });
  }

  /**
   * Listen to real-time updates from Firestore
   */
  function startRealtimeSync() {
    var db = initFirestore();
    if (!db || _isListening) return;

    _isListening = true;
    notifyStatus('syncing', 'Connecting to Cloud...');

    db.collection(COLLECTION_NAME).doc(SYNC_DOC_ID).onSnapshot(function (doc) {
      if (!doc.exists) {
        console.log('[CloudSync] No existing cloud record found. Seeding initial cloud backup...');
        executeCloudSave();
        return;
      }

      var cloudData = doc.data();
      if (!cloudData) return;

      var localPayload = getLocalDataPayload();
      var localTimestamp = (localPayload.prep_vault_v1 && localPayload.prep_vault_v1._clientTimestamp) || 0;
      var cloudTimestamp = cloudData.lastUpdated || 0;

      // Check if local has real data and cloud is fresh vs local
      var localVault = localStorage.getItem('prep_vault_v1');
      var isLocalEmpty = !localVault || localVault === '{}' || localVault.length < 50;

      if (isLocalEmpty || cloudTimestamp > localTimestamp) {
        console.log('[CloudSync] 📥 Ingesting newer cloud update from Firebase Firestore...');
        _isApplyingCloud = true;

        if (cloudData.prep_vault_v1) {
          localStorage.setItem('prep_vault_v1', JSON.stringify(cloudData.prep_vault_v1));
        }
        if (Array.isArray(cloudData.placement_reminders_v1) && cloudData.placement_reminders_v1.length > 0) {
          localStorage.setItem('placement_reminders_v1', JSON.stringify(cloudData.placement_reminders_v1));
          if (window.ReminderEngine && typeof ReminderEngine.setRemindersFromBackup === 'function') {
            ReminderEngine.setRemindersFromBackup(cloudData.placement_reminders_v1);
          }
        }

        // Notify state engine to refresh UI
        if (window.PrepState && typeof PrepState.notifyListeners === 'function') {
          PrepState.notifyListeners();
        }

        // Refresh Dashboard UI components if loaded
        if (window.DashboardApp) {
          try {
            if (typeof DashboardApp.renderTodayHabits === 'function') DashboardApp.renderTodayHabits();
            if (typeof DashboardApp.renderStreak === 'function') DashboardApp.renderStreak();
            if (typeof DashboardApp.renderHeroStats === 'function') DashboardApp.renderHeroStats();
            if (typeof DashboardApp.renderRemindersList === 'function') DashboardApp.renderRemindersList();
            if (typeof DashboardApp.renderCurriculumTracker === 'function') DashboardApp.renderCurriculumTracker();
          } catch (uiErr) { /* ignore */ }
        }

        setTimeout(function () {
          _isApplyingCloud = false;
        }, 500);
      } else if (localPayload.prep_vault_v1 && Object.keys(localPayload.prep_vault_v1.habits || {}).length > 0) {
        // Local is newer: update cloud
        executeCloudSave();
      }

      notifyStatus('synced', 'Synced with Cloud');
    }, function (err) {
      console.warn('[CloudSync] Real-time listener warning:', err.message);
      notifyStatus('offline', err.message);
    });
  }

  // Hook into storage & local state change events
  window.addEventListener('storage', function (e) {
    if (e.key === 'prep_vault_v1' || e.key === 'placement_reminders_v1') {
      scheduleCloudSave();
    }
  });

  // Auto-init on page load
  window.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      initFirestore();
      startRealtimeSync();
    }, 600);
  });

  // Expose CloudSync global API
  window.CloudSync = {
    init: initFirestore,
    save: scheduleCloudSave,
    forceSave: executeCloudSave,
    startRealtimeSync: startRealtimeSync,
    onStatusChange: function (cb) {
      if (typeof cb === 'function') _cloudStatusListeners.push(cb);
    },
    getStatus: function () {
      return {
        isSyncing: _isSyncing,
        lastSyncTime: _lastSyncTime,
        isListening: _isListening
      };
    }
  };

})();
