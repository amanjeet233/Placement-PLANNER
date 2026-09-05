/**
 * ===================================================================
 * REMINDER ENGINE — CodeTrack 360 Placement Prep Portal
 * Version: 2.0 | Completely Free — No Server Required
 *
 * Architecture:
 *   - Scheduling: Browser-native setInterval (every 30s) — works when
 *     the dashboard tab is open. Does NOT rely on paid cloud services.
 *   - Storage: localStorage (placement_reminders_v1, placement_reminder_log_v1)
 *   - Delivery: Web Notification API + Service Worker relay
 *   - FCM: Configured for future server push (optional, not required)
 *
 * Honest Limitations (displayed in UI):
 *   - Reminders fire reliably when the dashboard tab/window is open.
 *   - When the browser is fully closed, background delivery depends on
 *     OS/browser (Chrome Desktop may keep SW alive; Android varies).
 *   - No fake notifications are generated.
 *
 * BUGS FIXED in v2.0:
 *   - Added _initialized guard: prevents duplicate setInterval + listeners
 *   - Fixed time-window matching: uses 2-minute window with date+id delivery key
 *   - Added full backup validation before writing to localStorage
 *   - Fixed midnight rollover to preserve log history correctly
 *   - Made Firebase completely optional (non-crashing placeholder handling)
 *   - Delivery key format: "YYYY-MM-DD_reminderid" (never duplicates across days)
 * ===================================================================
 */

const ReminderEngine = (() => {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================
  const REMINDERS_KEY     = 'placement_reminders_v1';
  const LOG_KEY           = 'placement_reminder_log_v1';
  const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds

  // ============================================================
  // STATE & DIAGNOSTICS
  // ============================================================
  let _checkTimer       = null;
  let _exactTimer       = null;    // Precision timer for exact-second firing
  let _lastCheckedDate  = null;
  let _swRegistration   = null;
  let _initialized      = false;   // Guard: prevents duplicate init
  let _visChangeHandler = null;    // Keep reference so we can remove if needed

  const _diagnostics = {
    lastAttemptTime: null,
    lastSuccessTime: null,
    lastStatus: 'Idle',
    lastError: null
  };

  // Day names for display (local device days: 0=Sun … 6=Sat)
  const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_NAMES_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // ============================================================
  // STORAGE HELPERS — Safe JSON read/write
  // ============================================================

  function getReminders() {
    try {
      const raw = localStorage.getItem(REMINDERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[ReminderEngine] Corrupted reminders data, returning empty list.', e);
      return [];
    }
  }

  function saveReminders(list) {
    if (!Array.isArray(list)) return;
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[ReminderEngine] Failed to save reminders (localStorage full?):', e);
    }
  }

  function getLog() {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
      console.warn('[ReminderEngine] Corrupted log data, resetting log.', e);
      return {};
    }
  }

  function saveLog(log) {
    try {
      if (log && typeof log === 'object') {
        localStorage.setItem(LOG_KEY, JSON.stringify(log));
      }
    } catch (e) { /* ignore — non-critical */ }
  }

  // ============================================================
  // DATE / TIME HELPERS — Always use device's local timezone
  // ============================================================

  /** Returns "YYYY-MM-DD" in local time */
  function getTodayString() {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }

  /** Returns "HH:MM" in local time */
  function getCurrentTimeHHMM() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /** Returns 0-6 (0=Sunday) in local time */
  function getCurrentDayOfWeek() {
    return new Date().getDay();
  }

  // ============================================================
  // DELIVERY KEY — date + reminderid prevents cross-day duplicates
  // ============================================================

  function deliveryKey(dateStr, reminderId) {
    return `${dateStr}_${reminderId}`;
  }

  function isDelivered(log, dateStr, reminderId) {
    const dayLog = log[dateStr];
    if (!Array.isArray(dayLog)) return false;
    return dayLog.includes(deliveryKey(dateStr, reminderId));
  }

  function markDelivered(log, dateStr, reminderId) {
    if (!Array.isArray(log[dateStr])) log[dateStr] = [];
    const key = deliveryKey(dateStr, reminderId);
    if (!log[dateStr].includes(key)) {
      log[dateStr].push(key);
    }
  }

  // ============================================================
  // MIDNIGHT ROLLOVER
  // ============================================================

  function handleDayChange() {
    const today = getTodayString();
    if (_lastCheckedDate && _lastCheckedDate !== today) {
      const log = getLog();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.getFullYear() + '-'
        + String(cutoff.getMonth() + 1).padStart(2, '0') + '-'
        + String(cutoff.getDate()).padStart(2, '0');

      Object.keys(log).forEach(k => {
        if (k < cutoffStr) delete log[k];
      });
      saveLog(log);
    }
    _lastCheckedDate = today;
  }

  // ============================================================
  // NOTIFICATION PERMISSION
  // ============================================================

  function getPermissionStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'granted' | 'denied' | 'default'
  }

  async function requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') {
      if (window.FCMClient && typeof window.FCMClient.requestToken === 'function') {
        window.FCMClient.requestToken(_swRegistration).catch(() => {});
      }
      return 'granted';
    }
    if (Notification.permission === 'denied') return 'denied';
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted' && window.FCMClient && typeof window.FCMClient.requestToken === 'function') {
        window.FCMClient.requestToken(_swRegistration).catch(() => {});
      }
      return result;
    } catch (e) {
      console.warn('[ReminderEngine] Permission request failed:', e);
      return 'error';
    }
  }

  // ============================================================
  // SHOW NOTIFICATION — REAL SYSTEM NOTIFICATION
  // ============================================================

  async function showNotification(title, body, tag) {
    _diagnostics.lastAttemptTime = new Date().toLocaleTimeString();

    if (!('Notification' in window)) {
      _diagnostics.lastStatus = 'Unsupported';
      _diagnostics.lastError = 'Browser does not support the Web Notification API.';
      console.warn('[ReminderEngine]', _diagnostics.lastError);
      return false;
    }
    if (Notification.permission !== 'granted') {
      _diagnostics.lastStatus = 'Permission Denied';
      _diagnostics.lastError = 'Notification permission is not granted (current status: ' + Notification.permission + ').';
      console.warn('[ReminderEngine]', _diagnostics.lastError);
      return false;
    }

    const notifTag  = tag || ('reminder-' + Date.now());
    const iconPath  = './icons/icon-192.png';

    try {
      // Preferred path: Service Worker showNotification
      const sw = _swRegistration || (navigator.serviceWorker && await navigator.serviceWorker.ready.catch(() => null));
      if (sw && sw.showNotification) {
        await sw.showNotification(title, {
          body:               body || '',
          icon:               iconPath,
          badge:              iconPath,
          tag:                notifTag,
          data:               { url: './dashboard.html', reminderId: notifTag },
          requireInteraction: true,
          renotify:           true,
          vibrate:            [200, 100, 200]
        });
        _diagnostics.lastSuccessTime = new Date().toLocaleTimeString();
        _diagnostics.lastStatus = 'Delivered ✓ (Service Worker)';
        _diagnostics.lastError = null;
        return true;
      }

      // Fallback: Direct Notification API
      const n = new Notification(title, {
        body:               body || '',
        icon:               iconPath,
        tag:                notifTag,
        requireInteraction: true
      });
      n.onclick = () => { window.focus(); n.close(); };

      _diagnostics.lastSuccessTime = new Date().toLocaleTimeString();
      _diagnostics.lastStatus = 'Delivered ✓ (Direct API)';
      _diagnostics.lastError = null;
      return true;

    } catch (e) {
      console.warn('[ReminderEngine] showNotification failed, trying fallback constructor:', e);
      try {
        new Notification(title, { body: body || '', tag: notifTag });
        _diagnostics.lastSuccessTime = new Date().toLocaleTimeString();
        _diagnostics.lastStatus = 'Delivered ✓ (Fallback)';
        _diagnostics.lastError = null;
        return true;
      } catch (e2) {
        _diagnostics.lastStatus = 'Delivery Failed';
        _diagnostics.lastError = e2.message || 'Unknown error occurred while creating notification';
        console.warn('[ReminderEngine] All notification paths failed:', e2);
        return false;
      }
    }
  }

  // ============================================================
  // EXACT TIMER SCHEDULING (fires right on the second)
  // ============================================================

  function scheduleExactTimer() {
    if (_exactTimer) {
      clearTimeout(_exactTimer);
      _exactTimer = null;
    }

    const next = getNextReminder();
    if (!next || !next.diffMs || next.diffMs <= 0) return;

    // Cap setTimeout to 24 hours max for JS timer safety
    const timeoutMs = Math.min(next.diffMs, 24 * 60 * 60 * 1000);
    _exactTimer = setTimeout(() => {
      checkReminders();
      scheduleExactTimer();
    }, timeoutMs);
  }

  // ============================================================
  // REMINDER CHECK LOOP
  // ============================================================

  function checkReminders() {
    handleDayChange();

    if (getPermissionStatus() !== 'granted') return;

    const reminders = getReminders();
    if (!reminders.length) return;

    const today         = getTodayString();
    const nowHHMM       = getCurrentTimeHHMM();
    const todayWeekday  = getCurrentDayOfWeek();

    const [nowH, nowM]  = nowHHMM.split(':').map(Number);
    const nowMinutes    = nowH * 60 + nowM;

    const log = getLog();
    let logChanged = false;
    let remindersChanged = false;

    reminders.forEach(reminder => {
      if (!reminder.enabled) return;
      if (isDelivered(log, today, reminder.id)) return;

      if (!reminder.time || !reminder.time.includes(':')) return;
      const [rH, rM]    = reminder.time.split(':').map(Number);
      const reminderMinutes = rH * 60 + rM;

      // 2-minute precision window [reminderTime, reminderTime + 1 min]
      const diff = nowMinutes - reminderMinutes;
      if (diff < 0 || diff > 1) return;

      // Repeat eligibility check
      let eligible = false;
      if (reminder.repeat === 'daily' || reminder.repeat === 'once') {
        eligible = true;
      } else if (reminder.repeat === 'weekdays' && Array.isArray(reminder.days) && reminder.days.length > 0) {
        eligible = reminder.days.includes(todayWeekday);
      }
      if (!eligible) return;

      // Fire notification
      const notifTitle = (reminder.title || 'Placement Reminder').trim();
      const notifBody  = (reminder.message || 'Time to work on your placement prep!').trim();
      const notifTag   = `codetrack360-${reminder.id}`;

      showNotification(notifTitle, notifBody, notifTag);

      // Mark delivered
      markDelivered(log, today, reminder.id);
      logChanged = true;

      // If 'once', disable automatically after firing
      if (reminder.repeat === 'once') {
        reminder.enabled = false;
        remindersChanged = true;
      }
    });

    if (logChanged) saveLog(log);
    if (remindersChanged) saveReminders(reminders);

    // Re-schedule exact timer for the next upcoming reminder
    scheduleExactTimer();
  }

  // ============================================================
  // SERVICE WORKER REGISTRATION
  // ============================================================

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return { ok: false, message: 'Service Worker not supported in this browser.' };
    }
    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
      _swRegistration = reg;

      if (!_swRegistration.active) {
        await navigator.serviceWorker.ready.then(r => {
          _swRegistration = r;
          if (window.FCMClient && typeof window.FCMClient.init === 'function') {
            window.FCMClient.init(_swRegistration).catch(() => {});
          }
        }).catch(() => {});
      } else {
        if (window.FCMClient && typeof window.FCMClient.init === 'function') {
          window.FCMClient.init(_swRegistration).catch(() => {});
        }
      }

      return { ok: true, registration: reg };
    } catch (e) {
      console.warn('[ReminderEngine] Service Worker registration failed:', e);
      return { ok: false, message: e.message };
    }
  }

  // ============================================================
  // PUBLIC API — CRUD FOR REMINDERS
  // ============================================================

  function addReminder(data) {
    const reminders = getReminders();
    const repeatMode = (data.repeat === 'weekdays') ? 'weekdays' : (data.repeat === 'once') ? 'once' : 'daily';
    const newReminder = {
      id:      'reminder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title:   (data.title   || 'Reminder').trim(),
      message: (data.message || '').trim(),
      time:    _validateTime(data.time) || '08:00',
      repeat:  repeatMode,
      days:    Array.isArray(data.days) ? data.days.filter(d => typeof d === 'number' && d >= 0 && d <= 6) : [],
      enabled: data.enabled !== undefined ? !!data.enabled : true
    };
    reminders.push(newReminder);
    saveReminders(reminders);
    scheduleExactTimer();
    return newReminder;
  }

  function updateReminder(id, updates) {
    if (!id) return null;
    const reminders = getReminders();
    const idx = reminders.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const merged = { ...reminders[idx], ...updates };
    merged.title   = (merged.title   || 'Reminder').trim();
    merged.message = (merged.message || '').trim();
    merged.time    = _validateTime(merged.time) || reminders[idx].time || '08:00';
    merged.repeat  = (merged.repeat === 'weekdays') ? 'weekdays' : (merged.repeat === 'once') ? 'once' : 'daily';
    merged.days    = Array.isArray(merged.days) ? merged.days.filter(d => typeof d === 'number' && d >= 0 && d <= 6) : [];
    merged.enabled = !!merged.enabled;

    reminders[idx] = merged;
    saveReminders(reminders);
    scheduleExactTimer();
    return reminders[idx];
  }

  function deleteReminder(id) {
    if (!id) return;
    const reminders = getReminders().filter(r => r.id !== id);
    saveReminders(reminders);

    const today = getTodayString();
    const log = getLog();
    if (Array.isArray(log[today])) {
      const key = deliveryKey(today, id);
      log[today] = log[today].filter(k => k !== key);
      saveLog(log);
    }
    scheduleExactTimer();
  }

  function toggleReminderEnabled(id) {
    const reminders = getReminders();
    const r = reminders.find(r => r.id === id);
    if (!r) return null;
    r.enabled = !r.enabled;
    saveReminders(reminders);
    scheduleExactTimer();
    return r;
  }

  /**
   * Restore reminders from backup — with full schema validation.
   * Rejects malformed entries. Non-crashing.
   * @param {Array} remindersList
   */
  function setRemindersFromBackup(remindersList) {
    if (!Array.isArray(remindersList)) return;

    const validated = [];
    remindersList.forEach((r, idx) => {
      // 1. Must be a non-null plain object
      if (!r || typeof r !== 'object' || Array.isArray(r)) {
        console.warn(`[ReminderEngine] Backup reminder[${idx}] skipped: not an object.`);
        return;
      }
      // 2. Title must be a non-empty string
      if (typeof r.title !== 'string' || !r.title.trim()) {
        console.warn(`[ReminderEngine] Backup reminder[${idx}] skipped: invalid or empty title.`);
        return;
      }
      // 3. Must have a valid time (HH:MM within 00:00 - 23:59)
      const validTime = _validateTime(r.time);
      if (!validTime) {
        console.warn(`[ReminderEngine] Backup reminder[${idx}] skipped: invalid time "${r.time}".`);
        return;
      }
      // 4. Enabled must be a boolean (reject strings like "yes", null, etc.)
      if (r.enabled !== undefined && typeof r.enabled !== 'boolean') {
        console.warn(`[ReminderEngine] Backup reminder[${idx}] skipped: enabled must be boolean.`);
        return;
      }
      // 5. Validate days array (each day must be an integer between 0 and 6)
      let validDays = [];
      if (r.repeat === 'weekdays' || Array.isArray(r.days)) {
        if (!Array.isArray(r.days) || r.days.length === 0) {
          if (r.repeat === 'weekdays') {
            console.warn(`[ReminderEngine] Backup reminder[${idx}] skipped: weekdays repeat requires non-empty days array.`);
            return;
          }
        } else {
          const hasInvalidDay = r.days.some(d => typeof d !== 'number' || !Number.isInteger(d) || d < 0 || d > 6);
          if (hasInvalidDay) {
            console.warn(`[ReminderEngine] Backup reminder[${idx}] skipped: days contains invalid numbers (must be 0-6).`);
            return;
          }
          validDays = [...new Set(r.days)].sort((a, b) => a - b);
        }
      }

      const validId = (typeof r.id === 'string' && r.id.trim())
        ? r.id.trim()
        : ('reminder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));

      validated.push({
        id:      validId,
        title:   r.title.trim(),
        message: (typeof r.message === 'string' ? r.message : '').trim(),
        time:    validTime,
        repeat:  (r.repeat === 'weekdays') ? 'weekdays' : 'daily',
        days:    validDays,
        enabled: r.enabled !== undefined ? r.enabled : true
      });
    });

    saveReminders(validated);
  }

  /**
   * Calculates the next upcoming reminder occurrence dynamically.
   * Returns { reminder, time12, relativeTime, targetDate, diffMs } or null if none.
   */
  function getNextReminder(referenceDate = new Date()) {
    const reminders = getReminders().filter(r => r.enabled);
    if (!reminders.length) return null;

    let nearest = null;
    let minDiff = Infinity;

    reminders.forEach(r => {
      if (!r.time || !r.time.includes(':')) return;
      const [rH, rM] = r.time.split(':').map(Number);
      if (isNaN(rH) || isNaN(rM)) return;

      let candidate = null;

      if (r.repeat === 'daily') {
        const todayCandidate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), rH, rM, 0, 0);
        if (todayCandidate.getTime() > referenceDate.getTime()) {
          candidate = todayCandidate;
        } else {
          const tomorrowCandidate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 1, rH, rM, 0, 0);
          candidate = tomorrowCandidate;
        }
      } else if (r.repeat === 'once') {
        const todayCandidate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), rH, rM, 0, 0);
        if (todayCandidate.getTime() > referenceDate.getTime()) {
          candidate = todayCandidate;
        }
      } else if (r.repeat === 'weekdays' && Array.isArray(r.days) && r.days.length > 0) {
        for (let offset = 0; offset <= 7; offset++) {
          const testDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + offset, rH, rM, 0, 0);
          if (r.days.includes(testDate.getDay())) {
            if (testDate.getTime() > referenceDate.getTime()) {
              candidate = testDate;
              break;
            }
          }
        }
      }

      if (candidate) {
        const diff = candidate.getTime() - referenceDate.getTime();
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          nearest = {
            reminder: r,
            targetDate: candidate,
            diffMs: diff
          };
        }
      }
    });

    if (!nearest) return null;

    const diffMinutes = Math.round(nearest.diffMs / (60 * 1000));
    let relativeStr = '';
    if (diffMinutes < 1) {
      relativeStr = 'in < 1m';
    } else if (diffMinutes < 60) {
      relativeStr = `in ${diffMinutes}m`;
    } else if (diffMinutes < 1440) {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      relativeStr = m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
    } else {
      const d = Math.floor(diffMinutes / 1440);
      const h = Math.floor((diffMinutes % 1440) / 60);
      relativeStr = h > 0 ? `in ${d}d ${h}h` : `in ${d}d`;
    }

    return {
      reminder: nearest.reminder,
      time12: formatTime12h(nearest.reminder.time),
      relativeTime: relativeStr,
      targetDate: nearest.targetDate,
      diffMs: nearest.diffMs
    };
  }

  /**
   * Calculates the next upcoming occurrence and relative time for a specific reminder.
   * If the reminder is already delivered/passed today, accurately targets tomorrow's/next scheduled time (e.g. in 23h 40m).
   */
  function getNextOccurrenceForReminder(r, referenceDate = new Date()) {
    if (!r || !r.time || !r.time.includes(':')) return null;
    const [rH, rM] = r.time.split(':').map(Number);
    if (isNaN(rH) || isNaN(rM)) return null;

    let candidate = null;
    const todayStr = getTodayString();
    const log = getLog();
    const deliveredToday = isDelivered(log, todayStr, r.id);

    if (r.repeat === 'daily') {
      const todayCandidate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), rH, rM, 0, 0);
      if (todayCandidate.getTime() > referenceDate.getTime() && !deliveredToday) {
        candidate = todayCandidate;
      } else {
        const tomorrowCandidate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 1, rH, rM, 0, 0);
        candidate = tomorrowCandidate;
      }
    } else if (r.repeat === 'once') {
      const todayCandidate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), rH, rM, 0, 0);
      if (todayCandidate.getTime() > referenceDate.getTime() && !deliveredToday) {
        candidate = todayCandidate;
      }
    } else if (r.repeat === 'weekdays' && Array.isArray(r.days) && r.days.length > 0) {
      for (let offset = 0; offset <= 7; offset++) {
        const testDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + offset, rH, rM, 0, 0);
        if (r.days.includes(testDate.getDay())) {
          if (offset === 0) {
            if (testDate.getTime() > referenceDate.getTime() && !deliveredToday) {
              candidate = testDate;
              break;
            }
          } else if (testDate.getTime() > referenceDate.getTime()) {
            candidate = testDate;
            break;
          }
        }
      }
    }

    if (!candidate) return null;

    const diff = candidate.getTime() - referenceDate.getTime();
    const diffMinutes = Math.round(diff / (60 * 1000));
    let relativeStr = '';
    if (diffMinutes < 1) {
      relativeStr = 'in < 1m';
    } else if (diffMinutes < 60) {
      relativeStr = `in ${diffMinutes}m`;
    } else if (diffMinutes < 1440) {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      relativeStr = m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
    } else {
      const d = Math.floor(diffMinutes / 1440);
      const h = Math.floor((diffMinutes % 1440) / 60);
      relativeStr = h > 0 ? `in ${d}d ${h}h` : `in ${d}d`;
    }

    const isToday = candidate.getDate() === referenceDate.getDate() && candidate.getMonth() === referenceDate.getMonth() && candidate.getFullYear() === referenceDate.getFullYear();

    return {
      targetDate: candidate,
      diffMs: diff,
      relativeTime: relativeStr,
      isToday,
      deliveredToday,
      time12: formatTime12h(r.time)
    };
  }

  /** Validate and normalise a "HH:MM" time string. Returns null if invalid. */
  function _validateTime(time) {
    if (!time || typeof time !== 'string') return null;
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  // ============================================================
  // TEST NOTIFICATION — Accurate diagnostic (no fake results)
  // ============================================================

  async function testNotification() {
    const results = { steps: [], success: false };

    // Step 1: Notification API
    if (!('Notification' in window)) {
      results.steps.push({ ok: false, label: 'Notification API', detail: 'Not supported in this browser. Try Chrome or Edge.' });
      return results;
    }
    results.steps.push({ ok: true, label: 'Notification API', detail: 'Available ✓' });

    // Step 2: Permission
    const perm = Notification.permission;
    if (perm === 'denied') {
      results.steps.push({ ok: false, label: 'Notification Permission', detail: 'DENIED — Go to browser Site Settings → Notifications to unblock.' });
      return results;
    }
    if (perm === 'default') {
      results.steps.push({ ok: false, label: 'Notification Permission', detail: 'Not granted yet — click "Enable Notifications" first.' });
      return results;
    }
    results.steps.push({ ok: true, label: 'Notification Permission', detail: 'GRANTED ✓' });

    // Step 3: Service Worker
    if (!('serviceWorker' in navigator)) {
      results.steps.push({ ok: false, label: 'Service Worker', detail: 'Not supported — notifications use direct API fallback (still works).' });
    } else {
      try {
        const reg = await navigator.serviceWorker.getRegistration('./');
        if (reg) {
          _swRegistration = reg;
          results.steps.push({ ok: true, label: 'Service Worker', detail: `Registered ✓ (scope: ${reg.scope})` });
        } else {
          results.steps.push({ ok: false, label: 'Service Worker', detail: 'Not yet registered — refresh may help. Direct API fallback active.' });
        }
      } catch (e) {
        results.steps.push({ ok: false, label: 'Service Worker', detail: 'Check failed: ' + e.message });
      }
    }

    // Step 4: Local scheduler
    results.steps.push({
      ok: !!_initialized,
      label: 'Local Reminder Scheduler',
      detail: _initialized ? `Active ✓ — checks every 30 seconds` : 'Not started — init() not yet called.'
    });

    // Step 5: Firebase (optional — honest)
    const fbConfigured = (typeof window.isFirebaseConfigured === 'function') && window.isFirebaseConfigured();
    results.steps.push({
      ok: fbConfigured,
      label: 'FCM Server Push',
      detail: fbConfigured
        ? 'Firebase configured ✓ (server push ready)'
        : '⚠ Not configured — paste your config in firebase-config.js. Local reminders work without FCM.'
    });

    // Step 6: Send actual test notification
    const sent = await showNotification(
      '🔔 CodeTrack 360 Test',
      'Reminder pipeline working! You will see notifications at your scheduled times.',
      'codetrack360-test-' + Date.now()
    );

    if (sent) {
      results.steps.push({ ok: true, label: 'Test Notification Delivered', detail: 'Notification sent via ' + (_swRegistration ? 'Service Worker ✓' : 'Direct Notification API ✓') });
      results.success = true;
    } else {
      results.steps.push({ ok: false, label: 'Test Notification', detail: 'Failed to deliver — check browser console for details.' });
    }

    return results;
  }

  // ============================================================
  // INIT — Start the scheduler (with initialization guard)
  // ============================================================

  async function init() {
    // *** FIX: Guard against multiple init() calls ***
    if (_initialized) {
      console.log('[ReminderEngine] Already initialized — skipping duplicate init.');
      return;
    }
    _initialized = true;

    // Register service worker (gracefully ignore errors)
    try {
      await registerServiceWorker();
    } catch (e) {
      console.warn('[ReminderEngine] SW registration failed (non-fatal):', e);
    }

    // Set initial date
    _lastCheckedDate = getTodayString();

    // Clear any existing timer (safety)
    if (_checkTimer) {
      clearInterval(_checkTimer);
      _checkTimer = null;
    }

    // Start ONE scheduler loop
    _checkTimer = setInterval(checkReminders, CHECK_INTERVAL_MS);

    // Schedule exact precision timer for the next reminder
    scheduleExactTimer();

    // Run once immediately on startup
    checkReminders();

    // *** FIX: Store reference so we don't add duplicate listeners ***
    if (_visChangeHandler) {
      document.removeEventListener('visibilitychange', _visChangeHandler);
    }
    _visChangeHandler = () => {
      if (!document.hidden) {
        handleDayChange();
        checkReminders();
        scheduleExactTimer();
      }
    };
    document.addEventListener('visibilitychange', _visChangeHandler);
  }

  // ============================================================
  // DIAGNOSTICS HELPER
  // ============================================================

  function getDiagnostics() {
    const list = getReminders();
    const activeList = list.filter(r => r.enabled);
    const fcmDiag = (window.FCMClient && typeof window.FCMClient.getDiagnostics === 'function')
      ? window.FCMClient.getDiagnostics()
      : {
          isConfigured: false,
          missingFields: [],
          firebaseInitialized: false,
          fcmInitialized: false,
          fcmToken: localStorage.getItem('fcm_token') || 'Not Generated',
          pushSupported: ('serviceWorker' in navigator && 'PushManager' in window),
          lastPushReceived: 'None',
          lastError: 'None'
        };

    return {
      permission: getPermissionStatus(),
      serviceWorker: _swRegistration ? (_swRegistration.active ? 'Active ✓' : 'Registering...') : ('serviceWorker' in navigator ? 'Ready / Active' : 'Unsupported'),
      fcm: fcmDiag.isConfigured ? 'Configured ✓' : (fcmDiag.missingFields.length > 0 ? `Missing ${fcmDiag.missingFields.length} values` : 'Not Configured (Optional)'),
      firebaseInitialized: fcmDiag.firebaseInitialized,
      fcmInitialized: fcmDiag.fcmInitialized,
      fcmToken: fcmDiag.fcmToken,
      pushSupported: fcmDiag.pushSupported ? 'Supported ✓' : 'Unsupported ✗',
      scheduler: _initialized ? 'Active ✓ (Exact + 30s Loop)' : 'Inactive',
      activeCount: activeList.length,
      totalCount: list.length,
      lastAttempt: _diagnostics.lastAttemptTime || 'Never',
      lastSuccess: _diagnostics.lastSuccessTime || 'None',
      lastStatus: _diagnostics.lastStatus || 'Idle',
      lastPushReceived: fcmDiag.lastPushReceived || 'None',
      lastError: (_diagnostics.lastError && _diagnostics.lastError !== 'None') ? _diagnostics.lastError : fcmDiag.lastError
    };
  }

  // ============================================================
  // UTILITY — Format helpers used by the UI
  // ============================================================

  function formatTime12h(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  }

  function getDayLabel(dayNumbers) {
    if (!Array.isArray(dayNumbers) || dayNumbers.length === 0) return 'No days selected';
    if (dayNumbers.length === 7) return 'Every Day';
    // Sort to canonical order: Sun Mon Tue...
    const sorted = [...dayNumbers].sort((a, b) => a - b);
    return sorted.map(d => DAY_NAMES_SHORT[d]).join(', ');
  }

  // ============================================================
  // PUBLIC INTERFACE
  // ============================================================
  return {
    init,
    getReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderEnabled,
    setRemindersFromBackup,
    testNotification,
    getPermissionStatus,
    requestPermission,
    showNotification,
    formatTime12h,
    getDayLabel,
    getNextReminder,
    getNextOccurrenceForReminder,
    scheduleExactTimer,
    checkReminders,
    getDiagnostics,
    DAY_NAMES_SHORT,
    DAY_NAMES_FULL,
    // Exposed for diagnostics
    get isInitialized() { return _initialized; }
  };
})();

// Expose globally
window.ReminderEngine = ReminderEngine;
