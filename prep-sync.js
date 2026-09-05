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
      sleepLogs: {
        // [today]: 7.0
      },
      notes: {},
      bookmarks: []
    };
  }

  // Auto-migration & real-time sync from all storage keys
  function migrateLegacyData(state) {
    try {
      if (!state) return;
      if (!state.completedTasks) state.completedTasks = [];
      if (!state.dsaSolved) state.dsaSolved = [];
      if (!state.aptCompleted) state.aptCompleted = [];
      if (!state.solvedQuestions) state.solvedQuestions = {};
      if (!state.habits) state.habits = {};
      if (!state.streak) state.streak = { current: 0, best: 0, lastActiveDate: '' };

      // 1. Migrate & sync curriculum task checkboxes (support both Array and Object map format)
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

      // 2. Migrate & sync DSA solved topics & problems
      var legacyDsa = localStorage.getItem('placement_dsa_roadmap_v1');
      if (legacyDsa) {
        var parsedDsa = JSON.parse(legacyDsa);
        if (parsedDsa && parsedDsa.completedTopics && Array.isArray(parsedDsa.completedTopics)) {
          parsedDsa.completedTopics.forEach(function (t) {
            var num = typeof t === 'object' ? t.number : t;
            if (num && !state.dsaSolved.includes(num)) state.dsaSolved.push(num);
          });
        }
      }

      var dsaMapRaw = localStorage.getItem('dsa_solved_problems') || localStorage.getItem('dsa_roadmap_solved_probs_v1');
      if (dsaMapRaw) {
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
      }

      // 3. Migrate & sync Aptitude state
      var legacyApt = localStorage.getItem('placement_aptitude_roadmap_v1') || localStorage.getItem('aptitude_roadmap_v1');
      if (legacyApt) {
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
        }
      }

      // 4. Migrate & sync Habit / Dashboard tracking
      var legacyHabits = localStorage.getItem('dashboard_habits_v1');
      if (legacyHabits) {
        var parsedHabits = JSON.parse(legacyHabits);
        if (parsedHabits && typeof parsedHabits === 'object') {
          Object.keys(parsedHabits).forEach(function (k) {
            if (state.habits[k] === undefined) {
              state.habits[k] = parsedHabits[k];
            }
          });
        }
      }

      // Clean up streak if zero real activity exists
      var hasAnyActivity = state.completedTasks.length > 0 || state.dsaSolved.length > 0 || state.aptCompleted.length > 0;
      if (!hasAnyActivity && !state.streak.lastActiveDate) {
        state.streak.current = 0;
        state.streak.best = 0;
      }
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

      // Always merge latest real-time activity from all storage keys
      migrateLegacyData(this._state);

      // Ensure all fields exist
      var defaults = getDefaultState();
      Object.keys(defaults).forEach(function (key) {
        if (PrepVault._state[key] === undefined) {
          PrepVault._state[key] = defaults[key];
        }
      });

      this.save();

      // Listen for cross-window / tab changes
      window.addEventListener('storage', function (ev) {
        if (ev.key === STORAGE_KEY && ev.newValue) {
          try {
            PrepVault._state = JSON.parse(ev.newValue);
            migrateLegacyData(PrepVault._state);
            PrepVault._notify('storage_sync');
          } catch (e) {
            console.error('PrepVault: Cross-tab sync parse error', e);
          }
        } else if (ev.key && (ev.key.indexOf('dsa') !== -1 || ev.key.indexOf('apt') !== -1 || ev.key.indexOf('task') !== -1)) {
          migrateLegacyData(PrepVault._state);
          PrepVault._notify('storage_sync');
        }
      });

      return this;
    },

    // Get current state copy
    get: function () {
      if (!this._state) this.init();
      return this._state;
    },

    // Save and notify
    save: function () {
      try {
        if (this._state) this._state._clientTimestamp = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
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
      window.dispatchEvent(new CustomEvent('prep_vault_updated', {
        detail: { state: state, source: source }
      }));
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
      var tasksMap = {};
      var legacyTasks = localStorage.getItem('90day_tasks_v2') || localStorage.getItem('placement_plan_v2_tasks');
      if (legacyTasks) {
        try {
          var pTasks = JSON.parse(legacyTasks);
          if (Array.isArray(pTasks)) {
            pTasks.forEach(function (id) { tasksMap[id] = true; });
          }
        } catch (e) { }
      }
      var vaultArr = (this._state && this._state.completedTasks) || [];
      vaultArr.forEach(function (id) { tasksMap[id] = true; });
      return Object.keys(tasksMap).length;
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
      var dsaMapRaw = localStorage.getItem('dsa_solved_problems') || localStorage.getItem('dsa_roadmap_solved_probs_v1');
      var dsaMap = {};
      if (dsaMapRaw) {
        try { dsaMap = JSON.parse(dsaMapRaw) || {}; } catch (e) { }
      }
      var legacyDsa = localStorage.getItem('placement_dsa_roadmap_v1');
      if (legacyDsa) {
        try {
          var pDsa = JSON.parse(legacyDsa);
          if (pDsa && pDsa.completedTopics && Array.isArray(pDsa.completedTopics)) {
            pDsa.completedTopics.forEach(function (t) {
              var num = typeof t === 'object' ? t.number : t;
              if (num) dsaMap[num] = true;
            });
          }
        } catch (e) { }
      }

      // Merge vault array
      var vaultArr = (this._state && this._state.dsaSolved) || [];
      vaultArr.forEach(function (k) { dsaMap[k] = true; });

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
      var dsaMapRaw = localStorage.getItem('dsa_solved_problems') || localStorage.getItem('dsa_roadmap_solved_probs_v1');
      var dsaMap = {};
      if (dsaMapRaw) {
        try { dsaMap = JSON.parse(dsaMapRaw) || {}; } catch (e) { }
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
      var aptMap = {};
      var legacyApt = localStorage.getItem('placement_aptitude_roadmap_v1') || localStorage.getItem('aptitude_roadmap_v1');
      if (legacyApt) {
        try {
          var pApt = JSON.parse(legacyApt);
          if (pApt) {
            if (pApt.completedChapters && typeof pApt.completedChapters === 'object') {
              Object.keys(pApt.completedChapters).forEach(function (cId) {
                if (pApt.completedChapters[cId]) aptMap[cId] = true;
              });
            } else if (typeof pApt === 'object') {
              Object.keys(pApt).forEach(function (k) {
                if (pApt[k]) aptMap[k] = true;
              });
            }
          }
        } catch (e) { }
      }

      var vaultArr = (this._state && this._state.aptCompleted) || [];
      vaultArr.forEach(function (cId) { aptMap[cId] = true; });

      var count = Object.keys(aptMap).filter(function (k) { return aptMap[k]; }).length;
      return Math.min(24, count);
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

    setAptCompleted: function (completedChapterIds, solvedQuestionsListOrMap) {
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

    // Reset all progress
    resetAll: function () {
      this._state = getDefaultState();
      this.save();
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
