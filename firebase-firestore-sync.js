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

  var _clientId = (function () {
    try {
      var id = sessionStorage.getItem('_prep_sync_client_id');
      if (!id) {
        id = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('_prep_sync_client_id', id);
      }
      return id;
    } catch (e) {
      return 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }
  })();

  var _db = null;
  var _isSyncing = false;
  var _lastSyncTime = null;
  var _lastSavedTimestamp = 0;
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

    var localTime = (vaultData && vaultData._clientTimestamp) || Date.now();
    var resetTime = (vaultData && vaultData._resetTimestamp) || 0;

    return {
      prep_vault_v1: vaultData,
      placement_reminders_v1: remindersData,
      lastUpdated: localTime,
      resetTimestamp: resetTime,
      planStartDate: (vaultData && vaultData.planStartDate) || '2026-09-07',
      _fresh_reset_sep7_clean: !!(vaultData && vaultData._fresh_reset_sep7_clean),
      clientId: _clientId,
      clientInfo: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        origin: typeof window !== 'undefined' && window.location ? window.location.origin : ''
      }
    };
  }

  function notifyStatus(status, detail) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      status = 'offline';
      if (!detail) detail = 'Offline (Local Vault Active)';
    }
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
      badgeEl.title = 'Cloud Auto-Sync: ' + status + (detail ? ' (' + detail + ')' : '') + ' · Click to sync';
    }
    attachSyncHandlers();
  }

  function attachSyncHandlers() {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;
    var badges = document.querySelectorAll('#cloudSyncBadge, .cloud-sync-btn, [data-action="sync"]');
    badges.forEach(function (badge) {
      if (badge && !badge._hasSyncClick) {
        badge._hasSyncClick = true;
        badge.style.cursor = 'pointer';
        badge.setAttribute('role', 'button');
        badge.setAttribute('tabindex', '0');
        badge.addEventListener('click', function () {
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            notifyStatus('offline', 'Offline (Local Vault Active)');
            return;
          }
          notifyStatus('syncing', 'Syncing with Firestore...');
          executeCloudSave();
        });
        badge.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            badge.click();
          }
        });
      }
    });
  }

  function initFirestore() {
    if (_db) return _db;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      notifyStatus('offline', 'Offline (Local Vault Active)');
      return null;
    }
    if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
      console.warn('[CloudSync] Firebase Firestore SDK not loaded. Operating in Local Vault mode.');
      notifyStatus('offline', 'Local Vault Mode (Offline)');
      return null;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        var cfg = (typeof window !== 'undefined' && window.FIREBASE_CONFIG) || (typeof firebaseConfig !== 'undefined' && firebaseConfig);
        if (cfg && cfg.apiKey && cfg.projectId) {
          firebase.initializeApp(cfg);
        } else {
          console.warn('[CloudSync] Firebase config not properly configured. Operating in Local Vault mode.');
          notifyStatus('offline', 'Local Vault Mode');
          return null;
        }
      }
      _db = firebase.firestore();
      
      // Enable offline persistence if supported
      try {
        _db.enablePersistence({ synchronizeTabs: true }).catch(function () {
          // Ignore multiple tabs error or unimplemented
        });
      } catch (pe) { /* continue */ }

      console.log('[CloudSync] Firebase Firestore initialized successfully.');
      return _db;
    } catch (err) {
      console.warn('[CloudSync] Firestore initialization failed:', err.message);
      notifyStatus('offline', 'Local Vault Mode');
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
    if (_isApplyingCloud) return;
    var db = initFirestore();
    if (!db) {
      notifyStatus('offline', 'Local Vault Mode (Offline)');
      return;
    }

    var payload = getLocalDataPayload();
    _isSyncing = true;
    _lastSavedTimestamp = payload.lastUpdated;

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
        notifyStatus('offline', 'Saved Locally (Cloud sync queued)');
      });
  }

  /**
   * Listen to real-time updates from Firestore
   */
  function startRealtimeSync() {
    var db = initFirestore();
    if (!db) {
      notifyStatus('offline', 'Local Vault Active');
      return;
    }
    if (_isListening) return;

    _isListening = true;
    notifyStatus('syncing', 'Connecting to Cloud...');

    db.collection(COLLECTION_NAME).doc(SYNC_DOC_ID).onSnapshot(function (doc) {
      // 1. Ignore our own pending local optimistic writes to prevent loops
      if (doc.metadata && doc.metadata.hasPendingWrites) {
        return;
      }

      if (!doc.exists) {
        console.log('[CloudSync] No existing cloud record found. Seeding initial cloud backup...');
        executeCloudSave();
        return;
      }

      var cloudData = doc.data();
      if (!cloudData) return;

      // 2. Ignore echoes of our own acknowledged writes
      if (cloudData.clientId === _clientId && (cloudData.lastUpdated || 0) <= _lastSavedTimestamp) {
        notifyStatus('synced', 'All progress saved to Cloud');
        return;
      }

      var localPayload = getLocalDataPayload();
      var localVault = localPayload.prep_vault_v1 || {};

      // 3. Plan Integrity Check:
      // If cloud record does not have the fresh 2026-09-07 plan or clean reset flag, overwrite cloud!
      var isCloudStalePlan = !cloudData.prep_vault_v1 ||
        cloudData.prep_vault_v1.planStartDate !== '2026-09-07' ||
        cloudData.prep_vault_v1._fresh_reset_sep7_clean !== true;

      if (isCloudStalePlan) {
        console.log('[CloudSync] 🔄 Stale cloud plan data detected. Overwriting cloud with fresh 2026-09-07 plan...');
        executeCloudSave();
        return;
      }

      // 4. Reset Timestamps Check:
      var localResetTime = localVault._resetTimestamp || 0;
      var cloudResetTime = (cloudData.prep_vault_v1 && cloudData.prep_vault_v1._resetTimestamp) || cloudData.resetTimestamp || 0;

      if (localResetTime > cloudResetTime) {
        console.log('[CloudSync] 🔄 Local reset is newer than cloud. Syncing fresh reset state to Cloud...');
        executeCloudSave();
        return;
      }

      // 5. Version / Update Timestamps Check:
      var localTime = localVault._clientTimestamp || 0;
      var cloudTime = cloudData.lastUpdated || (cloudData.prep_vault_v1 && cloudData.prep_vault_v1._clientTimestamp) || 0;

      var isLocalEmpty = !localVault.planStartDate || (!localVault.completedTasks?.length && !localVault.dsaSolved?.length && !localVault.aptCompleted?.length && !Object.keys(localVault.habits || {}).length);

      if (cloudResetTime > localResetTime || isLocalEmpty || cloudTime > localTime) {
        console.log('[CloudSync] 📥 Ingesting newer cloud update from Firebase Firestore...');
        _isApplyingCloud = true;

        if (cloudData.prep_vault_v1) {
          localStorage.setItem('prep_vault_v1', JSON.stringify(cloudData.prep_vault_v1));
        }

        // CRITICAL: Empty cloud reminders MUST sync and clear local deleted reminders
        if (Array.isArray(cloudData.placement_reminders_v1)) {
          localStorage.setItem('placement_reminders_v1', JSON.stringify(cloudData.placement_reminders_v1));
          if (window.ReminderEngine && typeof ReminderEngine.setRemindersFromBackup === 'function') {
            ReminderEngine.setRemindersFromBackup(cloudData.placement_reminders_v1);
          }
        }

        // Refresh PrepVault canonical in-memory state and mirror legacy storage keys
        if (window.PrepVault && typeof window.PrepVault.init === 'function') {
          window.PrepVault.init();
        } else if (window.PrepState && typeof PrepState.notifyListeners === 'function') {
          PrepState.notifyListeners();
        }

        // Dispatch global sync event
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          try { window.dispatchEvent(new CustomEvent('prep_vault_updated')); } catch (evE) {}
        }

        // Refresh UI views if active
        if (typeof initTasks === 'function') initTasks();
        if (typeof window.dsaRefreshAll === 'function') window.dsaRefreshAll();
        if (typeof window.aptRefreshAll === 'function') window.aptRefreshAll();
        if (typeof window.renderMcqPage === 'function') window.renderMcqPage();

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
      } else if (localTime > cloudTime) {
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

  // Network connectivity status listeners
  window.addEventListener('online', function () {
    console.log('[CloudSync] Network reconnected. Synchronizing with Cloud...');
    notifyStatus('syncing', 'Network Restored. Syncing...');
    initFirestore();
    startRealtimeSync();
    scheduleCloudSave();
  });

  window.addEventListener('offline', function () {
    console.warn('[CloudSync] Network disconnected. Switched to offline Local Vault mode.');
    notifyStatus('offline', 'Offline (Local Vault Active)');
  });

  // Auto-init on page load
  window.addEventListener('DOMContentLoaded', function () {
    attachSyncHandlers();
    setTimeout(function () {
      initFirestore();
      startRealtimeSync();
      attachSyncHandlers();
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
