/**
 * ===================================================================
 * CodeTrack 360 / Placement Preparation Portal — Unified State Engine
 * Storage Key: "prep_vault_v1"
 * Provides bi-directional sync, real streak logic, auto-migration,
 * and reactive events across index.html and dashboard.html.
 * ===================================================================
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'prep_vault_v1';

  // Helper: Get local date in "YYYY-MM-DD" format
  function getLocalDateStr(d) {
    d = d || new Date();
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  // Helper: Calculate day difference between two "YYYY-MM-DD" strings
  function getDayDiff(dateStrA, dateStrB) {
    if (!dateStrA || !dateStrB) return 9999;
    var dtA = new Date(dateStrA + 'T00:00:00');
    var dtB = new Date(dateStrB + 'T00:00:00');
    var diffMs = Math.abs(dtB.getTime() - dtA.getTime());
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  // Initial Default State Schema
  function getDefaultState() {
    var today = getLocalDateStr();
    return {
      version: 1,
      planStartDate: '2026-09-07',
      planTotalDays: 119,
      _fresh_reset_sep7_clean: true,
      _migrated_legacy_v1: false,
      streak: {
        current: 0,
        best: 0,
        lastActiveDate: ''
      },
      habits: {
        // [today]: { dsa: false, aptitude: false, english: false, gym: false, revision: false }
      },
      completedTasks: [], // Array of task-row IDs from index.html (e.g. "task-d1-1")
      dsaSolved: [],      // Array of topic numbers / problem IDs (e.g. [1, 2, 45])
      aptCompleted: [],   // Array of completed chapter IDs (e.g. ["ch-01", "ch-02"])
      solvedQuestions: {},// Map of solved MCQ question IDs (e.g. { "q-1-1": true })
      userAnswers: {},    // Map of user chosen MCQ option indices (e.g. { "apt_1_1": 1 })
      sleepLogs: {
        // [today]: 7.0
      },
      notes: {},
      bookmarks: []
    };
  }

  // Auto-migration from legacy storage keys (strictly executes once per user profile)
  function migrateLegacyData(state) {
    try {
      if (!state) return;
      if (!state.completedTasks) state.completedTasks = [];
      if (!state.dsaSolved) state.dsaSolved = [];
      if (!state.aptCompleted) state.aptCompleted = [];
      if (!state.solvedQuestions) state.solvedQuestions = {};
      if (!state.habits) state.habits = {};
      if (!state.streak) state.streak = { current: 0, best: 0, lastActiveDate: '' };

      // Guard: If legacy migration already performed, do NOT re-accumulate old deleted/unchecked items
      if (state._migrated_legacy_v1) {
        return;
      }

      // 1. Migrate curriculum task checkboxes (support both Array and Object map format)
      ['placement_plan_v2_tasks', '90day_tasks_v2'].forEach(function (storageKey) {
        var legacyTasks = localStorage.getItem(storageKey);
        if (legacyTasks) {
          try {
            var parsedTasks = JSON.parse(legacyTasks);
            if (Array.isArray(parsedTasks)) {
              parsedTasks.forEach(function (id) {
                if (id && !state.completedTasks.includes(id)) state.completedTasks.push(id);
              });
            } else if (parsedTasks && typeof parsedTasks === 'object') {
              Object.keys(parsedTasks).forEach(function (id) {
                if (parsedTasks[id] && !state.completedTasks.includes(id)) {
                  state.completedTasks.push(id);
                }
              });
            }
          } catch (e) { }
        }
      });

      // 2. Migrate DSA solved topics & problems
      var legacyDsa = localStorage.getItem('placement_dsa_roadmap_v1');
      if (legacyDsa) {
        try {
          var parsedDsa = JSON.parse(legacyDsa);
          if (parsedDsa && parsedDsa.completedTopics && Array.isArray(parsedDsa.completedTopics)) {
            parsedDsa.completedTopics.forEach(function (t) {
              var num = typeof t === 'object' ? t.number : t;
              if (num && !state.dsaSolved.includes(num)) state.dsaSolved.push(num);
            });
          }
        } catch (e) { }
      }

      var dsaMapRaw = localStorage.getItem('dsa_solved_problems') || localStorage.getItem('dsa_roadmap_solved_probs_v1');
      if (dsaMapRaw) {
        try {
          var parsedMap = JSON.parse(dsaMapRaw);
          if (parsedMap && typeof parsedMap === 'object') {
            Object.keys(parsedMap).forEach(function (k) {
              if (parsedMap[k]) {
                var n = parseInt(k, 10);
                var topicId = isNaN(n) ? k : n;
                if (!state.dsaSolved.includes(topicId)) state.dsaSolved.push(topicId);
              }
            });
          }
        } catch (e) { }
      }

      // 3. Migrate Aptitude state
      var legacyApt = localStorage.getItem('placement_aptitude_roadmap_v1') || localStorage.getItem('aptitude_roadmap_v1');
      if (legacyApt) {
        try {
          var parsedApt = JSON.parse(legacyApt);
          if (parsedApt) {
            if (parsedApt.completedChapters && typeof parsedApt.completedChapters === 'object') {
              Object.keys(parsedApt.completedChapters).forEach(function (cId) {
                if (parsedApt.completedChapters[cId] && !state.aptCompleted.includes(cId)) {
                  state.aptCompleted.push(cId);
                }
              });
            } else if (typeof parsedApt === 'object' && !parsedApt.completedChapters) {
              Object.keys(parsedApt).forEach(function (k) {
                if (parsedApt[k] && !state.aptCompleted.includes(k)) {
                  state.aptCompleted.push(k);
                }
              });
            }
            if (parsedApt.solvedQuestions && typeof parsedApt.solvedQuestions === 'object') {
              Object.assign(state.solvedQuestions, parsedApt.solvedQuestions);
            }
            if (parsedApt.userAnswers && typeof parsedApt.userAnswers === 'object') {
              if (!state.userAnswers) state.userAnswers = {};
              Object.assign(state.userAnswers, parsedApt.userAnswers);
            }
          }
        } catch (e) { }
      }

      // 4. Migrate Habit / Dashboard tracking
      var legacyHabits = localStorage.getItem('dashboard_habits_v1');
      if (legacyHabits) {
        try {
          var parsedHabits = JSON.parse(legacyHabits);
          if (parsedHabits && typeof parsedHabits === 'object') {
            Object.keys(parsedHabits).forEach(function (k) {
              if (state.habits[k] === undefined) {
                state.habits[k] = parsedHabits[k];
              }
            });
          }
        } catch (e) { }
      }

      // Clean up streak if zero real activity exists
      var hasAnyActivity = state.completedTasks.length > 0 || state.dsaSolved.length > 0 || state.aptCompleted.length > 0;
      if (!hasAnyActivity && !state.streak.lastActiveDate) {
        state.streak.current = 0;
        state.streak.best = 0;
      }

      // Mark migration as completed so legacy keys are not repeatedly re-accumulated
      state._migrated_legacy_v1 = true;
    } catch (err) {
      console.warn('PrepVault: Sync non-critical error:', err);
    }
  }

  // Core Vault Manager
  var PrepVault = {
    _state: null,
    _listeners: [],

    // Initialize state
    init: function () {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          this._state = JSON.parse(raw);
        } catch (e) {
          console.error('PrepVault: Corrupt state in localStorage, resetting...', e);
          this._state = getDefaultState();
        }
      } else {
        this._state = getDefaultState();
      }

      // Check if state is from an older plan or if the September 7 clean reset hasn't been executed
      var resetMarker = 'prep_plan_sep7_2026_v3';
      var resetDone = false;
      try { resetDone = (localStorage.getItem(resetMarker) === 'done'); } catch (e) {}

      var needsReset = false;
      if (raw) {
        if (!this._state.planStartDate || this._state.planStartDate !== '2026-09-07' || !this._state._fresh_reset_sep7_clean) {
          needsReset = true;
        }
      } else {
        try {
          var rawTr = localStorage.getItem('placement_tracker_v1');
          if (rawTr) {
            var tr = JSON.parse(rawTr);
            if (tr && tr.startDate && tr.startDate !== '2026-09-07') {
              needsReset = true;
            }
          }
        } catch (e) {}
      }

      if (needsReset) {
        console.log('[PrepVault] Initializing fresh preparation plan for 07 September 2026...');
        this.resetForNewPlan('2026-09-07');
        return this;
      }

      // Perform one-time migration from legacy storage keys if not already done
      migrateLegacyData(this._state);

      // Ensure all schema fields exist
      var defaults = getDefaultState();
      Object.keys(defaults).forEach(function (key) {
        if (PrepVault._state[key] === undefined) {
          PrepVault._state[key] = defaults[key];
        }
      });

      this.save();

      // Listen for cross-window / tab changes to canonical vault
      window.addEventListener('storage', function (ev) {
        if (ev.key === STORAGE_KEY && ev.newValue) {
          try {
            PrepVault._state = JSON.parse(ev.newValue);
            PrepVault._notify('storage_sync');
          } catch (e) {
            console.error('PrepVault: Cross-tab sync parse error', e);
          }
        }
      });

      return this;
    },

    // Get current state copy
    get: function () {
      if (!this._state) this.init();
      return this._state;
    },

    // Save and notify with bi-directional mirror writes to legacy keys
    save: function () {
      try {
        if (this._state) this._state._clientTimestamp = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));

        // Bi-directional mirror writes to legacy keys for backward compatibility
        try {
          if (this._state && Array.isArray(this._state.completedTasks)) {
            localStorage.setItem('90day_tasks_v2', JSON.stringify(this._state.completedTasks));
            localStorage.setItem('placement_plan_v2_tasks', JSON.stringify(this._state.completedTasks));
          }
          if (this._state && Array.isArray(this._state.dsaSolved)) {
            var dsaMap = {};
            this._state.dsaSolved.forEach(function (id) { dsaMap[id] = true; });
            localStorage.setItem('dsa_solved_problems', JSON.stringify(dsaMap));
            localStorage.setItem('dsa_roadmap_solved_probs_v1', JSON.stringify(dsaMap));
          }
          if (this._state && Array.isArray(this._state.aptCompleted)) {
            var aptMap = {};
            this._state.aptCompleted.forEach(function (id) { aptMap[id] = true; });
            var existingApt = localStorage.getItem('placement_aptitude_roadmap_v1');
            var existingUserAnswers = (this._state && this._state.userAnswers) || {};
            try {
              if (existingApt) {
                var pApt = JSON.parse(existingApt);
                if (pApt && pApt.userAnswers) {
                  existingUserAnswers = Object.assign({}, pApt.userAnswers, existingUserAnswers);
                }
              }
            } catch (e) { }
            var aptPayload = {
              completedChapters: aptMap,
              userAnswers: existingUserAnswers,
              solvedQuestions: this._state.solvedQuestions || {}
            };
            localStorage.setItem('placement_aptitude_roadmap_v1', JSON.stringify(aptPayload));
          }
        } catch (mirrorErr) {
          /* ignore non-critical mirror error */
        }

        this._notify('local_save');
        if (typeof window !== 'undefined' && window.CloudSync && typeof window.CloudSync.save === 'function') {
          window.CloudSync.save();
        }
      } catch (e) {
        console.error('PrepVault: Failed to write to localStorage', e);
      }
    },

    // Subscribe to changes
    onUpdate: function (fn) {
      if (typeof fn === 'function') {
        this._listeners.push(fn);
      }
      return function unsubscribe() {
        var idx = PrepVault._listeners.indexOf(fn);
        if (idx !== -1) PrepVault._listeners.splice(idx, 1);
      };
    },

    _notify: function (source) {
      var state = this.get();
      // Dispatch browser custom event
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('prep_vault_updated', {
            detail: { state: state, source: source }
          }));
        } catch (e) {}
      }
      // Call registered callbacks
      this._listeners.forEach(function (fn) {
        try {
          fn(state, source);
        } catch (err) {
          console.error('PrepVault listener error:', err);
        }
      });
    },

    // ==========================================
    // ACCURATE STREAK & HABIT ENGINE
    // ==========================================
    _recalcStreakOnActivity: function () {
      var habits = this._state.habits || {};
      var activeDates = new Set();

      // Check all dates with at least 1 completed or non-zero habit
      Object.keys(habits).forEach(function (dStr) {
        var day = habits[dStr];
        if (!day) return;
        var hasActive = false;
        ['dsa', 'aptitude', 'english', 'gym', 'revision'].forEach(function (k) {
          if (day[k] === true || (typeof day[k] === 'number' && day[k] > 0)) {
            hasActive = true;
          }
        });
        if (hasActive) activeDates.add(dStr);
      });

      var sortedDates = Array.from(activeDates).sort();
      var today = getLocalDateStr();

      if (sortedDates.length === 0) {
        this._state.streak = { current: 0, best: 0, lastActiveDate: '' };
        return;
      }

      // 1. Calculate best streak across all history
      var best = 0;
      var currentRun = 0;
      var prevDate = null;

      sortedDates.forEach(function (dStr) {
        if (!prevDate) {
          currentRun = 1;
        } else {
          var diff = getDayDiff(prevDate, dStr);
          if (diff === 1) {
            currentRun++;
          } else if (diff > 1) {
            currentRun = 1;
          }
        }
        if (currentRun > best) best = currentRun;
        prevDate = dStr;
      });

      // 2. Calculate current active streak backwards from today or yesterday
      var now = new Date(today + 'T00:00:00');
      var current = 0;
      
      var yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      var yesterdayStr = getLocalDateStr(yesterday);

      var checkDate = null;
      if (activeDates.has(today)) {
        checkDate = new Date(now);
      } else if (activeDates.has(yesterdayStr)) {
        checkDate = new Date(yesterday);
      }

      if (checkDate) {
        while (true) {
          var checkStr = getLocalDateStr(checkDate);
          if (activeDates.has(checkStr)) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      this._state.streak = {
        current: current,
        best: Math.max(best, current),
        lastActiveDate: activeDates.has(today) ? today : (activeDates.has(yesterdayStr) ? yesterdayStr : '')
      };
    },

    // Toggle a Daily Habit
    toggleHabit: function (habitKey, dateStr) {
      var date = dateStr || getLocalDateStr();
      if (!this._state.habits[date]) {
        this._state.habits[date] = { dsa: false, aptitude: false, english: false, gym: false, revision: false };
      }
      var curVal = !!this._state.habits[date][habitKey];
      var newVal = !curVal;
      this._state.habits[date][habitKey] = newVal;

      // Recalculate streak dynamically based on actual habit completion state
      this._recalcStreakOnActivity();

      this.save();
      return newVal;
    },

    setHabit: function (habitKey, value, dateStr) {
      var date = dateStr || getLocalDateStr();
      if (!this._state.habits[date]) {
        this._state.habits[date] = { dsa: false, aptitude: false, english: false, gym: false, revision: false };
      }
      this._state.habits[date][habitKey] = value;
      this._recalcStreakOnActivity();
      this.save();
      return value;
    },

    setHabitCount: function (habitKey, count, maxTarget, dateStr) {
      var date = dateStr || getLocalDateStr();
      if (!this._state.habits[date]) {
        this._state.habits[date] = { dsa: false, aptitude: false, english: false, gym: false, revision: false };
      }
      var isDone = (count >= maxTarget);
      this._state.habits[date][habitKey] = isDone ? true : (count > 0 ? count : false);
      this._recalcStreakOnActivity();
      this.save();
      return this._state.habits[date][habitKey];
    },

    getHabitsForDate: function (dateStr) {
      var date = dateStr || getLocalDateStr();
      return this._state.habits[date] || { dsa: false, aptitude: false, english: false, gym: false, revision: false };
    },

    // ==========================================
    // TASK CHECKBOXES (Curriculum Hub / index.html)
    // ==========================================
    toggleTask: function (taskId) {
      if (!taskId) return false;
      var arr = this._state.completedTasks;
      var idx = arr.indexOf(taskId);
      var isDone = false;
      if (idx !== -1) {
        arr.splice(idx, 1);
        isDone = false;
      } else {
        arr.push(taskId);
        isDone = true;
        this._recalcStreakOnActivity();
      }
      this.save();
      return isDone;
    },

    isTaskDone: function (taskId) {
      return this._state.completedTasks.indexOf(taskId) !== -1;
    },

    getCompletedTasksCount: function () {
      if (this._state && Array.isArray(this._state.completedTasks)) {
        return this._state.completedTasks.length;
      }
      return 0;
    },

    // ==========================================
    // 337 DSA TOPICS TRACKING
    // ==========================================
    toggleDsa: function (topicNum) {
      topicNum = Number(topicNum);
      if (!topicNum) return false;
      var arr = this._state.dsaSolved;
      var idx = arr.indexOf(topicNum);
      var isDone = false;
      if (idx !== -1) {
        arr.splice(idx, 1);
        isDone = false;
      } else {
        arr.push(topicNum);
        isDone = true;
        // Auto-check today's DSA habit
        var today = getLocalDateStr();
        if (!this._state.habits[today]) {
          this._state.habits[today] = { dsa: true, aptitude: false, english: false, gym: false, revision: false };
        } else {
          this._state.habits[today].dsa = true;
        }
        this._recalcStreakOnActivity();
      }
      this.save();
      return isDone;
    },

    isDsaDone: function (topicNum) {
      return this._state.dsaSolved.indexOf(Number(topicNum)) !== -1;
    },

    getDsaSolvedCount: function () {
      if (!this._state || !Array.isArray(this._state.dsaSolved)) return 0;
      var dsaMap = {};
      this._state.dsaSolved.forEach(function (k) {
        dsaMap[k] = true;
        dsaMap[String(k)] = true;
      });

      var solvedTopicsSet = new Set();

      if (window.dsaRoadmapData && Array.isArray(window.dsaRoadmapData)) {
        window.dsaRoadmapData.forEach(function (t) {
          var totalProbs = t.leetcodeProblems ? t.leetcodeProblems.length : 0;
          var solvedCount = 0;
          if (totalProbs > 0) {
            t.leetcodeProblems.forEach(function (p) {
              if (dsaMap[p.problemNumber] || dsaMap[String(p.problemNumber)]) solvedCount++;
            });
          }
          var isTopicMarked = !!(dsaMap['topic_' + t.topicId] || dsaMap[t.topicId] || dsaMap[String(t.topicId)]);
          var isAllDone = (totalProbs > 0 && solvedCount === totalProbs) || (totalProbs === 0 && isTopicMarked) || isTopicMarked;
          if (isAllDone || (totalProbs > 0 && solvedCount > 0)) {
            solvedTopicsSet.add(t.topicId);
          }
        });
      } else {
        Object.keys(dsaMap).forEach(function (k) {
          if (dsaMap[k]) {
            var cleanKey = String(k).replace(/^topic_/, '');
            var num = parseInt(cleanKey, 10);
            if (!isNaN(num) && num >= 1 && num <= 337) {
              solvedTopicsSet.add(num);
            } else if (cleanKey) {
              solvedTopicsSet.add(cleanKey);
            }
          }
        });
      }

      return Math.min(337, solvedTopicsSet.size);
    },

    getDsaProblemStats: function () {
      var dsaMap = {};
      if (this._state && Array.isArray(this._state.dsaSolved)) {
        this._state.dsaSolved.forEach(function (k) { dsaMap[String(k)] = true; });
      }
      var uniqueProbs = {};
      if (window.dsaRoadmapData && Array.isArray(window.dsaRoadmapData)) {
        window.dsaRoadmapData.forEach(function (t) {
          if (t.leetcodeProblems) {
            t.leetcodeProblems.forEach(function (p) {
              if (p.problemNumber) uniqueProbs[String(p.problemNumber)] = true;
            });
          }
        });
      }
      var totalUnique = Object.keys(uniqueProbs).length;
      var solvedCount = 0;
      Object.keys(dsaMap).forEach(function (k) {
        if (dsaMap[k] && uniqueProbs[String(k)]) {
          solvedCount++;
        }
      });
      return {
        solvedProblems: solvedCount,
        totalProblems: totalUnique > 0 ? totalUnique : 337,
        problemsPct: totalUnique > 0 ? Math.round((solvedCount / totalUnique) * 100) : 0
      };
    },

    // ==========================================
    // 24 APTITUDE CHAPTERS TRACKING
    // ==========================================
    toggleAptChapter: function (chapterId) {
      if (!chapterId) return false;
      var arr = this._state.aptCompleted;
      var idx = arr.indexOf(chapterId);
      var isDone = false;
      if (idx !== -1) {
        arr.splice(idx, 1);
        isDone = false;
      } else {
        arr.push(chapterId);
        isDone = true;
        // Auto-check today's Aptitude habit
        var today = getLocalDateStr();
        if (!this._state.habits[today]) {
          this._state.habits[today] = { dsa: false, aptitude: true, english: false, gym: false, revision: false };
        } else {
          this._state.habits[today].aptitude = true;
        }
        this._recalcStreakOnActivity();
      }
      this.save();
      return isDone;
    },

    isAptChapterDone: function (chapterId) {
      return this._state.aptCompleted.indexOf(chapterId) !== -1;
    },

    setAptQuestionSolved: function (qId, isSolved) {
      if (!qId) return;
      if (isSolved) {
        this._state.solvedQuestions[qId] = true;
        this._recalcStreakOnActivity();
      } else {
        delete this._state.solvedQuestions[qId];
      }
      this.save();
    },

    isAptQuestionSolved: function (qId) {
      return !!this._state.solvedQuestions[qId];
    },

    getAptSolvedCount: function () {
      if (this._state && Array.isArray(this._state.aptCompleted)) {
        return Math.min(24, this._state.aptCompleted.length);
      }
      return 0;
    },

    getAptQuestionsSolvedCount: function () {
      return Object.keys(this._state.solvedQuestions).length;
    },

    // ==========================================
    // SLEEP TRACKING
    // ==========================================
    setSleep: function (hours, dateStr) {
      var date = dateStr || getLocalDateStr();
      var num = parseFloat(hours);
      if (isNaN(num)) num = 0;
      this._state.sleepLogs[date] = Math.max(0, Math.min(24, Math.round(num * 10) / 10));
      this.save();
      return this._state.sleepLogs[date];
    },

    logSleep: function (dateOrHours, hoursOrDate) {
      var date, hours;
      if (typeof dateOrHours === 'string' && dateOrHours.indexOf('-') !== -1) {
        date = dateOrHours;
        hours = hoursOrDate;
      } else if (typeof hoursOrDate === 'string' && hoursOrDate.indexOf('-') !== -1) {
        date = hoursOrDate;
        hours = dateOrHours;
      } else {
        date = getLocalDateStr();
        hours = dateOrHours;
      }
      return this.setSleep(hours, date);
    },

    getSleep: function (dateStr) {
      var date = dateStr || getLocalDateStr();
      return this._state.sleepLogs[date] !== undefined ? this._state.sleepLogs[date] : 0;
    },

    // ==========================================
    // OVERALL STATS SUMMARY & WEIGHTED FORMULA
    // ==========================================
    getStats: function () {
      var dsaTopicsCount = this.getDsaSolvedCount();
      var dsaProbStats = this.getDsaProblemStats();
      var aptCount = this.getAptSolvedCount();
      var tasksCount = this.getCompletedTasksCount();
      var today = getLocalDateStr();
      var todayHabits = this.getHabitsForDate(today);

      var habitsDoneToday = 0;
      Object.keys(todayHabits).forEach(function (k) {
        var v = todayHabits[k];
        if (typeof v === 'number') {
          var tgt = (k === 'dsa' ? 3 : k === 'aptitude' ? 2 : 1);
          habitsDoneToday += Math.min(1, v / tgt);
        } else if (v) {
          habitsDoneToday += 1;
        }
      });

      var totalExpectedTopics = (window.dsaRoadmapData && window.dsaRoadmapData.length) || 337;
      var totalExpectedApt = (window.aptitudeRoadmapData && window.aptitudeRoadmapData.length) || 24;
      var totalTasksExpected = 532; // Master curriculum tasks across 5 phases

      var dsaPct = Math.min(100, Math.round((dsaTopicsCount / totalExpectedTopics) * 100));
      var aptPct = Math.min(100, Math.round((aptCount / totalExpectedApt) * 100));
      var tasksPct = Math.min(100, Math.round((tasksCount / totalTasksExpected) * 100));
      var habitDailyPct = Math.round((habitsDoneToday / 5) * 100);

      /**
       * Weighted Overall Placement Progress Formula:
       * - Roadmap Tasks: 30%
       * - DSA Practice: 35%
       * - Aptitude Preparation: 25%
       * - Daily Habits: 10%
       * Total: 100%
       */
      var overallProgress = Math.min(100, Math.round((tasksPct * 0.30) + (dsaPct * 0.35) + (aptPct * 0.25) + (habitDailyPct * 0.10)));

      // If user has any raw solved items, ensure at least proportional progress is reflected
      if (overallProgress === 0 && (dsaTopicsCount > 0 || aptCount > 0 || tasksCount > 0 || habitsDoneToday > 0)) {
        var rawSum = (tasksPct * 0.30) + (dsaPct * 0.35) + (aptPct * 0.25) + (habitDailyPct * 0.10);
        overallProgress = Math.min(100, Math.max(1, Math.round(rawSum)));
      }

      this._recalcStreakOnActivity();
      var streakVal = (this._state && this._state.streak && this._state.streak.current) || 0;
      var bestStreakVal = (this._state && this._state.streak && this._state.streak.best) || 0;

      return {
        dsaSolved: dsaTopicsCount,
        dsaTotal: totalExpectedTopics,
        dsaPct: dsaPct,
        dsaProblemsSolved: dsaProbStats.solvedProblems,
        dsaTotalProblems: dsaProbStats.totalProblems,
        dsaProblemsPct: dsaProbStats.problemsPct,
        aptSolved: aptCount,
        aptTotal: totalExpectedApt,
        aptPct: aptPct,
        mcqSolved: this.getAptQuestionsSolvedCount(),
        tasksCompleted: tasksCount,
        tasksTotal: totalTasksExpected,
        tasksPct: tasksPct,
        habitsDoneToday: habitsDoneToday,
        habitDailyPct: habitDailyPct,
        streak: streakVal,
        bestStreak: bestStreakVal,
        overallProgress: overallProgress,
        sleepToday: this.getSleep(today)
      };
    },

    // Alias for get()
    getState: function () {
      return this.get();
    },

    setCompletedTasks: function (taskIds) {
      if (!Array.isArray(taskIds)) return;
      var hadTasksBefore = this._state.completedTasks.length;
      this._state.completedTasks = taskIds.slice();
      if (taskIds.length > hadTasksBefore) {
        this._recalcStreakOnActivity();
      }
      this.save();
    },

    setDsaSolved: function (dsaIds) {
      if (!Array.isArray(dsaIds)) return;
      this._state.dsaSolved = dsaIds.map(function (x) {
        var num = parseInt(x, 10);
        return isNaN(num) ? x : num;
      });
      if (dsaIds.length > 0) {
        var today = getLocalDateStr();
        if (!this._state.habits[today]) {
          this._state.habits[today] = { dsa: true, aptitude: false, english: false, gym: false, revision: false };
        } else {
          this._state.habits[today].dsa = true;
        }
        this._recalcStreakOnActivity();
      }
      this.save();
    },

    setAptCompleted: function (completedChapterIds, solvedQuestionsListOrMap, userAnswersMap) {
      if (Array.isArray(completedChapterIds)) {
        this._state.aptCompleted = completedChapterIds.slice();
      }
      if (Array.isArray(solvedQuestionsListOrMap)) {
        var map = {};
        solvedQuestionsListOrMap.forEach(function (qId) { map[qId] = true; });
        this._state.solvedQuestions = map;
      } else if (solvedQuestionsListOrMap && typeof solvedQuestionsListOrMap === 'object') {
        this._state.solvedQuestions = Object.assign({}, solvedQuestionsListOrMap);
      }
      if (userAnswersMap && typeof userAnswersMap === 'object') {
        this._state.userAnswers = Object.assign({}, userAnswersMap);
      }
      if ((completedChapterIds && completedChapterIds.length > 0) || (solvedQuestionsListOrMap && Object.keys(this._state.solvedQuestions).length > 0)) {
        var today = getLocalDateStr();
        if (!this._state.habits[today]) {
          this._state.habits[today] = { dsa: false, aptitude: true, english: false, gym: false, revision: false };
        } else {
          this._state.habits[today].aptitude = true;
        }
        this._recalcStreakOnActivity();
      }
      this.save();
    },

    // Reset all progress across canonical vault and legacy keys
    resetAll: function () {
      this._state = getDefaultState();
      this._state._migrated_legacy_v1 = true;
      this._state._fresh_reset_sep7_clean = true;
      this._state._resetTimestamp = Date.now();
      this._state._clientTimestamp = Date.now();
      var legacyKeys = [
        'placement_dsa_roadmap_v1', 'dsa_solved_problems', 'dsa_roadmap_solved_probs_v1',
        'placement_aptitude_roadmap_v1', 'aptitude_roadmap_v1',
        'placement_plan_v2_tasks', '90day_tasks_v2', 'dashboard_habits_v1'
      ];
      legacyKeys.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) { }
      });
      this.save();
      this._notify('reset_all');
    },

    resetDsa: function () {
      if (!this._state) this.init();
      this._state.dsaSolved = [];
      try {
        localStorage.removeItem('placement_dsa_roadmap_v1');
        localStorage.removeItem('dsa_solved_problems');
        localStorage.removeItem('dsa_roadmap_solved_probs_v1');
      } catch (e) { }
      this.save();
      this._notify('reset_dsa');
    },

    resetAptitude: function () {
      if (!this._state) this.init();
      this._state.aptCompleted = [];
      this._state.solvedQuestions = {};
      try {
        localStorage.removeItem('placement_aptitude_roadmap_v1');
        localStorage.removeItem('aptitude_roadmap_v1');
      } catch (e) { }
      this.save();
      this._notify('reset_apt');
    },

    resetTasks: function () {
      if (!this._state) this.init();
      this._state.completedTasks = [];
      try {
        localStorage.removeItem('placement_plan_v2_tasks');
        localStorage.removeItem('90day_tasks_v2');
      } catch (e) { }
      this.save();
      this._notify('reset_tasks');
    },

    resetHabits: function () {
      if (!this._state) this.init();
      this._state.habits = {};
      this._state.streak = { current: 0, best: 0, lastActiveDate: '' };
      try {
        localStorage.removeItem('dashboard_habits_v1');
      } catch (e) { }
      this.save();
      this._notify('reset_habits');
    },

    // Clean reset for the new 07 September 2026 plan
    resetForNewPlan: function (newStartDate) {
      newStartDate = newStartDate || '2026-09-07';
      this._state = getDefaultState();
      this._state.planStartDate = newStartDate;
      this._state._migrated_legacy_v1 = true;
      this._state.completedTasks = [];
      this._state.dsaSolved = [];
      this._state.aptCompleted = [];
      this._state.solvedQuestions = {};
      this._state.habits = {};
      this._state.sleepLogs = {};
      this._state.streak = { current: 0, best: 0, lastActiveDate: '' };
      this._state.lastUpdated = new Date().toISOString();

      // Clear legacy storage mirrors and old plan caches
      [
        'placement_plan_v2_tasks',
        '90day_tasks_v2',
        'dsa_solved_problems',
        'dsa_roadmap_solved_probs_v1',
        'placement_dsa_roadmap_v1',
        'placement_aptitude_roadmap_v1',
        'aptitude_roadmap_v1',
        'dashboard_habits_v1',
        'placement_reminders_v1',
        'placement_reminder_log_v1'
      ].forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      // Clear plan-specific progress in placement_tracker_v1 while preserving user preferences
      try {
        var rawTracker = localStorage.getItem('placement_tracker_v1');
        if (rawTracker) {
          var tracker = JSON.parse(rawTracker);
          tracker.startDate = newStartDate;
          tracker.lastActiveDate = newStartDate;
          tracker.currentStreak = 0;
          tracker.bestStreak = 0;
          tracker.daily = {};
          localStorage.setItem('placement_tracker_v1', JSON.stringify(tracker));
        }
      } catch (e) {}

      this._state._plan_20260907_reset = true;
      this._state._fresh_reset_sep7_clean = true;
      this._state._resetTimestamp = Date.now();
      this._state._clientTimestamp = Date.now();
      try {
        localStorage.setItem('prep_plan_reset_2026_09_07', 'done');
        localStorage.setItem('prep_plan_sep7_2026_v3', 'done');
      } catch (e) {}

      this.save();
      this._notify('plan_reset');
      return this;
    }
  };

  // Initialize immediately and attach globally
  PrepVault.init();
  PrepVault.notifyListeners = function () {
    PrepVault.init();
    PrepVault._notify('cloud_sync');
  };
  window.PrepVault = PrepVault;
  window.PrepState = PrepVault;

})();
