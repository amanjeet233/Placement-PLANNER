/**
 * DASHBOARD.JS — ULTRA-MODERN BENTO ANALYTICS ENGINE
 * Pure dynamic data: No mock data, no fake hardcoded numbers.
 * Integrates Chart.js, Lucide Icons, and real LocalStorage synchronization.
 */

const DashboardApp = (() => {
  const STORAGE_KEY = 'placement_tracker_v1';
  const TASKS_KEY = 'placement_plan_v2_tasks';
  const DSA_KEY = 'dsa_solved_problems';
  const APT_KEY = 'placement_aptitude_roadmap_v1';

  const PLAN_START_DATE = '2026-09-04';
  const PLAN_TOTAL_DAYS = 119; // 119-day master roadmap

  const startMs = new Date(PLAN_START_DATE + 'T00:00:00').getTime();
  const endMs = startMs + PLAN_TOTAL_DAYS * 24 * 60 * 60 * 1000;

  // Central State
  let state = {
    version: 2,
    planDays: PLAN_TOTAL_DAYS,
    startDate: PLAN_START_DATE,
    lastActiveDate: getTodayString(),
    currentStreak: 0,
    bestStreak: 0,
    daily: {},
    goals: {
      dsaTarget: 15,
      aptTarget: 3,
      engTarget: 7,
      gymTarget: 5,
      revTarget: 5
    },
    settings: {
      userName: 'Amanjeet'
    }
  };

  let selectedDate = getTodayString();
  let timerInterval = null;

  // Chart.js Instances
  let barChartInstance = null;
  let lineChartInstance = null;
  let sleepChartInstance = null;

  function getTodayString() {
    const d = new Date();
    return formatLocalDate(d);
  }

  function formatLocalDate(d) {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }

  function parseLocalDate(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDateHuman(dateStr) {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    loadState();
    checkMidnightRollover();
    ensureDayRecord(selectedDate);
    recalculateStreaks();

    startRealtimeClock();

    renderKPIs();
    renderTodayTracker();
    renderTodaySummary();
    renderWeeklyHeatmap();
    renderWeeklyGoals();

    // Ensure state is fully synced from PrepVault before creating charts
    syncFromVault();
    initCharts();

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Reactive Cross-Tab & Cross-Page Sync with PrepVault
    if (window.PrepVault) {
      window.PrepVault.onUpdate(() => {
        syncFromVault();
      });
      window.addEventListener('prep_vault_updated', () => {
        syncFromVault();
      });
    }

    window.addEventListener('resize', () => {
      if (barChartInstance) barChartInstance.resize();
      if (sleepChartInstance) sleepChartInstance.resize();
      if (lineChartInstance) lineChartInstance.resize();
    });

    // Multi-Tab & Cross-Page synchronization
    window.addEventListener('storage', (ev) => {
      if (!ev.key || ev.key === 'prep_vault_v1' || ev.key.includes('dsa') || ev.key.includes('apt') || ev.key.includes('task') || ev.key.includes('tracker')) {
        if (window.PrepVault) {
          window.PrepVault.init();
          syncFromVault();
        }
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkMidnightRollover();
        if (window.PrepVault) {
          window.PrepVault.init();
          syncFromVault();
        }
      }
    });
  }

  function syncFromVault() {
    if (!window.PrepVault) return;
    const vault = window.PrepVault.get();
    const today = getTodayString();

    if (vault.habits && vault.habits[selectedDate]) {
      const vHabits = vault.habits[selectedDate];
      ensureDayRecord(selectedDate);
      ['dsa', 'aptitude', 'english', 'gym', 'revision'].forEach(k => {
        if (vHabits[k] !== undefined) {
          if (typeof vHabits[k] === 'number') {
            state.daily[selectedDate][k].completed = Math.min(state.daily[selectedDate][k].target, vHabits[k]);
            state.daily[selectedDate][k].done = (state.daily[selectedDate][k].completed >= state.daily[selectedDate][k].target);
          } else {
            state.daily[selectedDate][k].done = !!vHabits[k];
            state.daily[selectedDate][k].completed = vHabits[k] ? state.daily[selectedDate][k].target : 0;
          }
        }
      });
    }

    if (vault.sleepLogs && typeof vault.sleepLogs === 'object') {
      Object.keys(vault.sleepLogs).forEach(dStr => {
        ensureDayRecord(dStr);
        state.daily[dStr].sleep.hours = Number(vault.sleepLogs[dStr]) || 0;
      });
    }

    if (vault.streak) {
      state.currentStreak = vault.streak.current || 0;
      state.bestStreak = vault.streak.best || 0;
    }

    renderKPIs();
    renderTodayTracker();
    renderTodaySummary();
    renderWeeklyHeatmap();
    renderWeeklyGoals();
    updateCharts();
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = Object.assign(state, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Dashboard state load error', e);
    }
    // Eagerly sync all historical sleep logs from prep_vault_v1
    try {
      const rawVault = localStorage.getItem('prep_vault_v1');
      if (rawVault) {
        const pVault = JSON.parse(rawVault);
        if (pVault && pVault.sleepLogs && typeof pVault.sleepLogs === 'object') {
          Object.keys(pVault.sleepLogs).forEach(dStr => {
            ensureDayRecord(dStr);
            state.daily[dStr].sleep.hours = Number(pVault.sleepLogs[dStr]) || 0;
          });
        }
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Dashboard state save error', e);
    }
  }

  function ensureDayRecord(dStr) {
    if (!state.daily[dStr]) {
      state.daily[dStr] = {
        dsa: { done: false, completed: 0, target: 3 },
        aptitude: { done: false, completed: 0, target: 2 },
        english: { done: false, completed: 0, target: 1 },
        gym: { done: false, completed: 0, target: 1 },
        revision: { done: false, completed: 0, target: 1 },
        sleep: { hours: 0, target: 8 }
      };
    } else if (!state.daily[dStr].sleep) {
      state.daily[dStr].sleep = { hours: 0, target: 8 };
    }
  }

  // ==========================================
  // REAL-TIME CLOCK & 119-DAY COUNTDOWN
  // ==========================================
  function startRealtimeClock() {
    if (timerInterval) clearInterval(timerInterval);

    function tick() {
      const now = new Date();

      // Live Date & Greeting
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      setElText('clock-date-str', dateStr);

      const hour = now.getHours();
      let greeting = 'Good Evening';
      if (hour < 12) greeting = 'Good Morning';
      else if (hour < 17) greeting = 'Good Afternoon';

      const grEl = document.getElementById('clock-greeting-sub');
      if (grEl) grEl.innerHTML = `${greeting}, <b>${state.settings.userName || 'Amanjeet'}!</b>`;

      // Countdown (Real dynamic calculation)
      const nowMs = now.getTime();
      const diff = endMs - nowMs;

      const daysPassed = Math.max(1, Math.min(PLAN_TOTAL_DAYS, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)) + 1));
      const daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

      const fillPct = Math.min(100, Math.round((daysPassed / PLAN_TOTAL_DAYS) * 100));
      const fillEl = document.getElementById('cd-progress-fill');
      if (fillEl) fillEl.style.width = `${fillPct}%`;

      if (diff > 0) {
        setElText('cd-days-gone', `${daysPassed} day${daysPassed > 1 ? 's' : ''} gone`);
        setElText('cd-days-left', `${daysRemaining} days left`);
        setElText('kpi-days-left', `${daysRemaining}`);

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const dStr = String(d).padStart(2, '0');
        const hStr = String(h).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        const sStr = String(s).padStart(2, '0');

        setElText('cd-days', dStr);
        setElText('cd-hours', hStr);
        setElText('cd-mins', mStr);
        setElText('cd-secs', sStr);

        setElText('count-days', dStr);
        setElText('count-hours', hStr);
        setElText('count-mins', mStr);
        setElText('count-secs', sStr);
      } else {
        setElText('cd-days-gone', `${PLAN_TOTAL_DAYS} days completed`);
        setElText('cd-days-left', 'Plan Completed');
        setElText('kpi-days-left', '0');

        setElText('cd-days', '00');
        setElText('cd-hours', '00');
        setElText('cd-mins', '00');
        setElText('cd-secs', '00');

        setElText('count-days', '00');
        setElText('count-hours', '00');
        setElText('count-mins', '00');
        setElText('count-secs', '00');
      }
    }

    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function checkMidnightRollover() {
    const today = getTodayString();
    if (state.lastActiveDate && state.lastActiveDate !== today) {
      state.lastActiveDate = today;
      ensureDayRecord(today);
      recalculateStreaks();
      saveState();
      renderTodayTracker();
      renderTodaySummary();
      renderKPIs();
      renderWeeklyHeatmap();
      renderWeeklyGoals();
      updateCharts();
    }
  }

  // ==========================================
  // REAL STREAK CALCULATION
  // ==========================================
  function recalculateStreaks() {
    const activeDates = new Set();
    const vaultHabits = (window.PrepVault && window.PrepVault.get().habits) || {};

    // Gather all dates with at least 1 completed habit from state.daily and vault
    Object.keys(state.daily).forEach(dStr => {
      const day = state.daily[dStr];
      if (!day) return;
      let hasDone = false;
      ['dsa', 'aptitude', 'english', 'gym', 'revision'].forEach(k => {
        if (day[k] && (day[k].done || day[k].completed > 0)) hasDone = true;
      });
      if (hasDone) activeDates.add(dStr);
    });

    Object.keys(vaultHabits).forEach(dStr => {
      const v = vaultHabits[dStr];
      if (!v) return;
      let hasDone = false;
      ['dsa', 'aptitude', 'english', 'gym', 'revision'].forEach(k => {
        if (v[k] === true || (typeof v[k] === 'number' && v[k] > 0)) hasDone = true;
      });
      if (hasDone) activeDates.add(dStr);
    });

    const sortedDates = Array.from(activeDates).sort();
    const today = getTodayString();

    if (sortedDates.length === 0) {
      state.currentStreak = 0;
      state.bestStreak = 0;
      return;
    }

    // 1. Calculate best streak across all history
    let best = 0;
    let currentRun = 0;
    let prevDate = null;

    sortedDates.forEach(dStr => {
      if (!prevDate) {
        currentRun = 1;
      } else {
        const dtA = parseLocalDate(prevDate);
        const dtB = parseLocalDate(dStr);
        const diffDays = Math.round(Math.abs(dtB.getTime() - dtA.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun++;
        } else if (diffDays > 1) {
          currentRun = 1;
        }
      }
      if (currentRun > best) best = currentRun;
      prevDate = dStr;
    });

    // 2. Calculate current active streak backwards from today or yesterday
    const now = parseLocalDate(today);
    let current = 0;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);

    let checkDate = null;
    if (activeDates.has(today)) {
      checkDate = new Date(now);
    } else if (activeDates.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
    }

    if (checkDate) {
      while (true) {
        const checkStr = formatLocalDate(checkDate);
        if (activeDates.has(checkStr)) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    state.currentStreak = current;
    state.bestStreak = Math.max(best, current);
  }

  // ==========================================
  // RENDER REAL KPIS
  // ==========================================
  function renderKPIs() {
    if (window.PrepVault) {
      const stats = window.PrepVault.getStats();
      setElText('kpi-cur-streak', `${stats.streak}`);
      setElText('kpi-best-streak', `${stats.bestStreak}`);
      setElText('kpi-dsa-count', `${stats.dsaSolved} / ${stats.dsaTotal}`);
      setElText('kpi-apt-count', `${stats.aptSolved} / ${stats.aptTotal}`);
      setElText('kpi-overall-progress', `${stats.overallProgress}%`);
      return;
    }

    setElText('kpi-cur-streak', `${state.currentStreak}`);
    setElText('kpi-best-streak', `${state.bestStreak}`);

    // Direct fallback (when PrepVault is not attached)
    let dsaSolvedCount = 0;
    try {
      const dsaMap = {};
      const dRaw1 = localStorage.getItem('dsa_solved_problems');
      const dRaw2 = localStorage.getItem('dsa_roadmap_solved_probs_v1');
      if (dRaw1) Object.assign(dsaMap, JSON.parse(dRaw1));
      if (dRaw2) Object.assign(dsaMap, JSON.parse(dRaw2));
      const legacyDsa = localStorage.getItem('placement_dsa_roadmap_v1');
      if (legacyDsa) {
        const pDsa = JSON.parse(legacyDsa);
        if (pDsa && pDsa.completedTopics) {
          pDsa.completedTopics.forEach(t => { dsaMap[typeof t === 'object' ? t.number : t] = true; });
        }
      }
      if (window.dsaRoadmapData) {
        let cnt = 0;
        window.dsaRoadmapData.forEach(t => {
          let sCount = 0;
          if (t.leetcodeProblems && t.leetcodeProblems.length > 0) {
            t.leetcodeProblems.forEach(p => { if (dsaMap[p.problemNumber]) sCount++; });
          }
          if (dsaMap['topic_' + t.topicId] || dsaMap[t.topicId] || (t.leetcodeProblems && t.leetcodeProblems.length > 0 && sCount > 0)) {
            cnt++;
          }
        });
        dsaSolvedCount = cnt;
      } else {
        const keys = Object.keys(dsaMap).filter(k => dsaMap[k]).map(k => String(k).replace('topic_', ''));
        dsaSolvedCount = Math.min(337, new Set(keys).size);
      }
    } catch (e) { }
    setElText('kpi-dsa-count', `${dsaSolvedCount} / 337`);

    // Read real Aptitude progress from LocalStorage
    let aptSolvedChapters = 0;
    try {
      const aptMap = {};
      const aptRaw1 = localStorage.getItem('placement_aptitude_roadmap_v1');
      const aptRaw2 = localStorage.getItem('aptitude_roadmap_v1');
      [aptRaw1, aptRaw2].forEach(raw => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.completedChapters) {
          Object.keys(parsed.completedChapters).forEach(k => { if (parsed.completedChapters[k]) aptMap[k] = true; });
        } else if (typeof parsed === 'object') {
          Object.keys(parsed).forEach(k => { if (parsed[k]) aptMap[k] = true; });
        }
      });
      aptSolvedChapters = Math.min(24, Object.keys(aptMap).length);
    } catch (e) { }
    setElText('kpi-apt-count', `${aptSolvedChapters} / 24`);

    // Overall Progress %
    const dsaPct = Math.min(100, Math.round((dsaSolvedCount / 337) * 100));
    const aptPct = Math.min(100, Math.round((aptSolvedChapters / 24) * 100));
    let habitDoneToday = 0;
    const todayStr = getTodayString();
    const todayRec = state.daily[todayStr];
    if (todayRec) {
      ['dsa', 'aptitude', 'english', 'gym', 'revision'].forEach(k => {
        if (todayRec[k] && (todayRec[k].done || todayRec[k].completed > 0)) {
          habitDoneToday += Math.min(1, (todayRec[k].completed || 1) / (todayRec[k].target || 1));
        }
      });
    }
    const habitDailyPct = Math.round((habitDoneToday / 5) * 100);
    let overallPct = Math.min(100, Math.round((dsaPct * 0.5) + (aptPct * 0.3) + (habitDailyPct * 0.2)));
    if (overallPct === 0 && (dsaSolvedCount > 0 || aptSolvedChapters > 0 || habitDoneToday > 0)) {
      overallPct = Math.max(1, Math.round((dsaSolvedCount / 337 * 50) + (aptSolvedChapters / 24 * 30) + (habitDailyPct * 0.2)));
    }
    setElText('kpi-overall-progress', `${overallPct}%`);
  }

  // ==========================================
  // RENDER TODAY'S TRACKER & SUMMARY
  // ==========================================
  // RENDER TODAY'S TRACKER & SUMMARY
  // ==========================================
  function renderTodayTracker() {
    ensureDayRecord(selectedDate);
    const day = state.daily[selectedDate];
    const today = getTodayString();

    const dateLabel = (selectedDate === today) ? `Today • ${formatDateHuman(selectedDate)}` : formatDateHuman(selectedDate);
    setElText('tracker-selected-date-text', dateLabel);

    updateHabitCardDOM('dsa', day.dsa, 'topics');
    updateHabitCardDOM('aptitude', day.aptitude, 'chapters');
    updateHabitCardDOM('english', day.english, 'session');
    updateHabitCardDOM('gym', day.gym, 'session');
    updateHabitCardDOM('revision', day.revision, 'session');
  }

  function updateHabitCardDOM(key, data, unit) {
    const cardEl = document.getElementById(`hcard-${key}`);
    const pct = Math.min(100, Math.round((data.completed / data.target) * 100));

    if (cardEl) {
      cardEl.classList.toggle('is-done', !!data.done);
      if (data.done) {
        cardEl.classList.add('ring-2', 'ring-indigo-500/25', 'bg-slate-50/80', 'border-indigo-300/80');
        cardEl.classList.remove('ring-1', 'ring-amber-400/50', 'bg-amber-50/20', 'border-amber-300/80');
      } else if (data.completed > 0) {
        cardEl.classList.add('ring-1', 'ring-amber-400/50', 'bg-amber-50/20', 'border-amber-300/80');
        cardEl.classList.remove('ring-2', 'ring-indigo-500/25', 'bg-slate-50/80', 'border-indigo-300/80');
      } else {
        cardEl.classList.remove('ring-2', 'ring-indigo-500/25', 'bg-slate-50/80', 'border-indigo-300/80', 'ring-1', 'ring-amber-400/50', 'bg-amber-50/20', 'border-amber-300/80');
      }
    }

    setElText(`htarget-${key}`, `${data.completed} / ${data.target} ${unit}`);
    setElText(`hpct-${key}`, `${pct}%`);

    const fillEl = document.getElementById(`hfill-${key}`);
    if (fillEl) fillEl.style.width = `${pct}%`;

    const statusEl = document.getElementById(`hstatus-${key}`);
    if (statusEl) {
      if (data.done) {
        statusEl.innerText = 'Done ✓';
        statusEl.className = 'text-[9.5px] font-black text-emerald-700';
      } else if (data.completed > 0) {
        statusEl.innerText = `In Progress (${data.completed}/${data.target})`;
        statusEl.className = 'text-[9.5px] font-black text-amber-800';
      } else {
        statusEl.innerText = 'Pending';
        statusEl.className = 'text-[9.5px] font-black text-slate-800';
      }
    }

    // Stepper buttons boundary styling
    const decBtn = document.getElementById(`hdec-${key}`);
    if (decBtn) {
      if (data.completed <= 0) {
        decBtn.classList.add('opacity-30', 'cursor-not-allowed');
      } else {
        decBtn.classList.remove('opacity-30', 'cursor-not-allowed');
      }
    }
    const incBtn = document.getElementById(`hinc-${key}`);
    if (incBtn) {
      if (data.completed >= data.target) {
        incBtn.classList.add('opacity-30', 'cursor-not-allowed');
      } else {
        incBtn.classList.remove('opacity-30', 'cursor-not-allowed');
      }
    }
  }

  function renderTodaySummary() {
    ensureDayRecord(selectedDate);
    const day = state.daily[selectedDate];
    const vaultHabits = (window.PrepVault && window.PrepVault.get().habits && window.PrepVault.get().habits[selectedDate]) || {};

    const habits = ['dsa', 'aptitude', 'english', 'gym', 'revision'];
    let totalScorePct = 0;

    habits.forEach(k => {
      const h = day[k];
      let isDone = !!h.done;
      let completedCount = h.completed || 0;

      if (vaultHabits[k] !== undefined) {
        if (typeof vaultHabits[k] === 'number') {
          completedCount = Math.min(h.target, vaultHabits[k]);
          isDone = (completedCount >= h.target);
        } else if (vaultHabits[k]) {
          isDone = true;
          completedCount = h.target;
        } else if (!h.done) {
          isDone = false;
          completedCount = 0;
        }
      }

      const pct = Math.min(100, Math.round((completedCount / h.target) * 100));
      totalScorePct += pct;

      const prefix = (k === 'aptitude' ? 'apt' : k === 'english' ? 'eng' : k === 'revision' ? 'rev' : k);
      setElText(`sum-row-${prefix}-cnt`, `${completedCount}/${h.target}`);
      setElText(`sum-row-${prefix}-pct`, `${pct}%`);

      const barEl = document.getElementById(`sum-row-${prefix}-bar`);
      if (barEl) barEl.style.width = `${pct}%`;
    });

    const avgDailyScore = Math.round(totalScorePct / habits.length);
    setElText('summary-score-pct', `${avgDailyScore}%`);
  }

  function adjustHabitCount(key, delta) {
    ensureDayRecord(selectedDate);
    const h = state.daily[selectedDate][key];
    const newCount = Math.max(0, Math.min(h.target, (h.completed || 0) + delta));
    h.completed = newCount;
    h.done = (newCount >= h.target);

    if (window.PrepVault) {
      window.PrepVault.setHabitCount(key, newCount, h.target, selectedDate);
    }

    recalculateStreaks();
    saveState();
    renderTodayTracker();
    renderTodaySummary();
    renderKPIs();
    renderWeeklyHeatmap();
    renderWeeklyGoals();
    updateCharts();
    if (window.lucide) window.lucide.createIcons();
    showToast(`${key.toUpperCase()}: ${newCount}/${h.target} logged 🎯`);
  }

  function toggleHabitDone(key) {
    ensureDayRecord(selectedDate);
    const h = state.daily[selectedDate][key];
    if (h.completed === h.target) {
      h.completed = 0;
      h.done = false;
    } else {
      h.completed = h.target;
      h.done = true;
    }

    if (window.PrepVault) {
      window.PrepVault.setHabitCount(key, h.completed, h.target, selectedDate);
    }

    recalculateStreaks();
    saveState();
    renderTodayTracker();
    renderTodaySummary();
    renderKPIs();
    renderWeeklyHeatmap();
    renderWeeklyGoals();
    updateCharts();
    if (window.lucide) window.lucide.createIcons();
    showToast(`${key.toUpperCase()} marked ${h.done ? 'Complete ✓' : 'Pending'}`);
  }

  function markAllDone() {
    ensureDayRecord(selectedDate);
    const day = state.daily[selectedDate];
    ['dsa', 'aptitude', 'english', 'gym', 'revision'].forEach(k => {
      day[k].done = true;
      day[k].completed = day[k].target;
      if (window.PrepVault) {
        window.PrepVault.setHabitCount(k, day[k].target, day[k].target, selectedDate);
      }
    });

    if (window.PrepVault) {
      window.PrepVault.save();
    }

    recalculateStreaks();
    saveState();
    renderTodayTracker();
    renderTodaySummary();
    renderKPIs();
    renderWeeklyHeatmap();
    renderWeeklyGoals();
    updateCharts();
    if (window.lucide) window.lucide.createIcons();
    showToast('All Daily Habits Marked Complete! 🚀');
  }

  function prevDay() {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() - 1);
    selectedDate = formatLocalDate(d);
    ensureDayRecord(selectedDate);
    renderTodayTracker();
    renderTodaySummary();
    renderKPIs();
    renderWeeklyHeatmap();
    renderWeeklyGoals();
    updateCharts();
    if (window.lucide) window.lucide.createIcons();
    showToast(`Viewing: ${formatDateHuman(selectedDate)} 📅`);
  }

  function nextDay() {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + 1);
    selectedDate = formatLocalDate(d);
    ensureDayRecord(selectedDate);
    renderTodayTracker();
    renderTodaySummary();
    renderKPIs();
    renderWeeklyHeatmap();
    renderWeeklyGoals();
    updateCharts();
    if (window.lucide) window.lucide.createIcons();
    showToast(`Viewing: ${formatDateHuman(selectedDate)} 📅`);
  }

  // ==========================================
  // RENDER REAL WEEKLY HEATMAP & GOALS
  // ==========================================
  function getCurrentWeekDates() {
    const todayStr = getTodayString();
    const now = parseLocalDate(todayStr);
    const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    // Calculate Monday as start of current week (Mon = 0, Sun = 6)
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(formatLocalDate(d));
    }
    return weekDates;
  }

  function renderWeeklyHeatmap() {
    const thead = document.getElementById('heatmap-head');
    const tbody = document.getElementById('heatmap-body');
    if (!tbody) return;

    const weekDays = getCurrentWeekDates();
    const todayStr = getTodayString();
    const todayMs = parseLocalDate(todayStr).getTime();
    const planStartMs = parseLocalDate(PLAN_START_DATE).getTime();

    // Render Dynamic Thead with matched Day Letters (M, T, W, T, F, S, S) and Date Numbers
    if (thead) {
      const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      let headHtml = `<tr><th class="text-left w-16 pl-1.5 py-1 text-[8.5px] uppercase tracking-wider font-extrabold text-slate-400">Habit</th>`;

      weekDays.forEach((dStr, idx) => {
        const isToday = (dStr === todayStr);
        const dayNum = parseInt(dStr.split('-')[2], 10);
        const letter = dayLetters[idx];

        if (isToday) {
          headHtml += `<th class="text-center py-1"><span class="inline-flex flex-col items-center justify-center w-6 py-0.5 rounded-md bg-indigo-600 text-white font-black shadow-xs ring-2 ring-indigo-200" title="Today: ${formatDateHuman(dStr)}">${letter}<span class="text-[8px] font-black leading-none">${dayNum}</span></span></th>`;
        } else {
          headHtml += `<th class="text-center py-1 text-slate-700 font-bold" title="${formatDateHuman(dStr)}">${letter}<span class="block text-[8px] font-semibold text-slate-400 leading-none mt-0.5">${dayNum}</span></th>`;
        }
      });
      headHtml += `</tr>`;
      thead.innerHTML = headHtml;
    }

    tbody.innerHTML = '';

    const habits = [
      { name: 'DSA', key: 'dsa', target: 3, dotBg: 'bg-indigo-500' },
      { name: 'Aptitude', key: 'aptitude', target: 2, dotBg: 'bg-sky-500' },
      { name: 'English', key: 'english', target: 1, dotBg: 'bg-purple-500' },
      { name: 'Gym', key: 'gym', target: 1, dotBg: 'bg-amber-500' },
      { name: 'Revision', key: 'revision', target: 1, dotBg: 'bg-emerald-500' }
    ];

    let totalPossibleHabits = 0;
    let completedHabits = 0;

    // Read real vault habits if available
    const vaultHabits = (window.PrepVault && window.PrepVault.get().habits) || {};

    habits.forEach(h => {
      const tr = document.createElement('tr');
      let rowHtml = `<td class="text-left py-1 pr-1.5"><div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full ${h.dotBg} flex-shrink-0"></span><span class="font-extrabold text-slate-800 text-[9.5px] truncate">${h.name}</span></div></td>`;

      weekDays.forEach(dStr => {
        const dMs = parseLocalDate(dStr).getTime();
        const isFuture = dMs > todayMs;
        const isBeforeStart = dMs < planStartMs;
        const isToday = (dStr === todayStr);

        // Check real habit state
        let isDone = false;
        let completedCount = 0;

        // Check state.daily
        if (state.daily[dStr] && state.daily[dStr][h.key]) {
          isDone = !!state.daily[dStr][h.key].done;
          completedCount = state.daily[dStr][h.key].completed || (isDone ? h.target : 0);
        }

        // Check vault habits
        if (vaultHabits[dStr] && vaultHabits[dStr][h.key] !== undefined) {
          const v = vaultHabits[dStr][h.key];
          if (typeof v === 'number') {
            completedCount = Math.max(completedCount, v);
            isDone = (completedCount >= h.target);
          } else if (v) {
            isDone = true;
            completedCount = h.target;
          }
        }

        let st = 'empty';
        let statusTitle = '';
        const dateFormatted = formatDateHuman(dStr);

        if (isDone) {
          st = 'done';
          statusTitle = `${dateFormatted} • ${h.name}: Done ✓`;
          completedHabits++;
          if (!isFuture && !isBeforeStart) totalPossibleHabits++;
        } else if (completedCount > 0) {
          st = 'partial';
          statusTitle = `${dateFormatted} • ${h.name}: Partial (${completedCount}/${h.target})`;
          completedHabits += (completedCount / h.target);
          if (!isFuture && !isBeforeStart) totalPossibleHabits++;
        } else {
          if (isFuture) {
            st = 'empty';
            statusTitle = `${dateFormatted} • ${h.name}: Upcoming`;
          } else if (isToday) {
            st = 'pending today-cell';
            statusTitle = `Today • ${h.name}: Pending`;
            totalPossibleHabits++;
          } else if (isBeforeStart) {
            st = 'empty';
            statusTitle = `${dateFormatted} • Prior to Plan Start`;
          } else {
            st = 'missed';
            statusTitle = `${dateFormatted} • ${h.name}: Missed`;
            totalPossibleHabits++;
          }
        }

        rowHtml += `<td class="p-0.5 text-center"><div class="heat-cell ${st}" title="${statusTitle}"></div></td>`;
      });

      tr.innerHTML = rowHtml;
      tbody.appendChild(tr);
    });

    // Update weekly summary badge
    const scorePct = totalPossibleHabits > 0 ? Math.min(100, Math.round((completedHabits / totalPossibleHabits) * 100)) : 0;
    setElText('heatmap-weekly-score', `${scorePct}% Done`);
  }

  function renderWeeklyGoals() {
    const recent7 = getLastNDates(7);
    let dsaTot = 0, aptTot = 0, engTot = 0, gymTot = 0, revTot = 0;

    recent7.forEach(dStr => {
      const rec = state.daily[dStr];
      if (rec) {
        if (rec.dsa && rec.dsa.done) dsaTot += rec.dsa.completed;
        if (rec.aptitude && rec.aptitude.done) aptTot += 1;
        if (rec.english && rec.english.done) engTot += 1;
        if (rec.gym && rec.gym.done) gymTot += 1;
        if (rec.revision && rec.revision.done) revTot += 1;
      }
    });

    setElText('wgoal-dsa-cnt', `${dsaTot}/${state.goals.dsaTarget}`);
    setElText('wgoal-apt-cnt', `${aptTot}/${state.goals.aptTarget}`);
    setElText('wgoal-eng-cnt', `${engTot}/${state.goals.engTarget}`);
    setElText('wgoal-gym-cnt', `${gymTot}/${state.goals.gymTarget}`);
    setElText('wgoal-rev-cnt', `${revTot}/${state.goals.revTarget}`);

    setBarWidth('wgoal-dsa-bar', dsaTot, state.goals.dsaTarget);
    setBarWidth('wgoal-apt-bar', aptTot, state.goals.aptTarget);
    setBarWidth('wgoal-eng-bar', engTot, state.goals.engTarget);
    setBarWidth('wgoal-gym-bar', gymTot, state.goals.gymTarget);
    setBarWidth('wgoal-rev-bar', revTot, state.goals.revTarget);
  }

  function setBarWidth(id, cur, max) {
    const fillEl = document.getElementById(id);
    if (fillEl) {
      const pct = Math.min(100, Math.round((cur / max) * 100));
      fillEl.style.width = `${pct}%`;
    }
  }

  function getLastNDates(n) {
    const list = [];
    const base = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      list.push(formatLocalDate(d));
    }
    return list;
  }

  // ==========================================
  // CHART.JS MODERN ANALYTICS SUITE
  // ==========================================
  // 5. VISUAL ANALYTICS (CHART.JS)
  // ==========================================
  function initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, deferring chart init.');
      return;
    }

    // Common Chart Defaults for Linear / Raycast feel
    Chart.defaults.font.family = '"Plus Jakarta Sans", system-ui, sans-serif';
    Chart.defaults.font.size = 9.5;
    Chart.defaults.color = '#334155';

    initWeeklyPieChart();
    initSleepChart();
    initDailyLineChart();
  }

  function updateCharts() {
    if (barChartInstance) {
      const pieData = getWeeklyPieData();
      barChartInstance.config._isEmpty = pieData.isEmpty;
      barChartInstance.config._totalTasks = pieData.totalTasks;
      barChartInstance.data.labels = pieData.labels;
      barChartInstance.data.datasets[0].data = pieData.data;
      barChartInstance.data.datasets[0].backgroundColor = pieData.backgroundColor;
      barChartInstance.data.datasets[0].hoverBackgroundColor = pieData.hoverBackgroundColor;
      barChartInstance.update();
    }
    if (sleepChartInstance) {
      const sleepData = getSleepData();
      sleepChartInstance.data.labels = sleepData.labels;
      sleepChartInstance.data.datasets[0].data = sleepData.hoursData;
      const sCtx = sleepChartInstance.ctx;
      if (sCtx) {
        const todaySleepGrad = sCtx.createLinearGradient(0, 0, 0, 110);
        todaySleepGrad.addColorStop(0, '#6366F1');
        todaySleepGrad.addColorStop(1, '#4F46E5');

        const pastLoggedSleepGrad = sCtx.createLinearGradient(0, 0, 0, 110);
        pastLoggedSleepGrad.addColorStop(0, '#C084FC');
        pastLoggedSleepGrad.addColorStop(1, '#7C3AED');

        const emptySleepGrad = sCtx.createLinearGradient(0, 0, 0, 110);
        emptySleepGrad.addColorStop(0, '#F1F5F9');
        emptySleepGrad.addColorStop(1, '#E2E8F0');

        sleepChartInstance.data.datasets[0].backgroundColor = sleepData.dates.map((dStr, idx) => {
          const val = sleepData.hoursData[idx] || 0;
          if (val === 0) return emptySleepGrad;
          return (idx === sleepData.todayIdx) ? todaySleepGrad : pastLoggedSleepGrad;
        });
      }
      sleepChartInstance.update();
    }
    if (lineChartInstance) {
      const lineData = getDailyLineData();
      lineChartInstance.data.labels = lineData.labels;
      lineData.datasets.forEach((ds, idx) => {
        if (lineChartInstance.data.datasets[idx]) {
          lineChartInstance.data.datasets[idx].data = ds.data;
          lineChartInstance.data.datasets[idx].rawValues = ds.rawValues;
        }
      });
      lineChartInstance.update();
    }
  }

  // Custom Plugin: Crisp In-Slice Percentage Labels for Solid 3D-Look Pie Chart
  const pieSlicePercentagesPlugin = {
    id: 'pieSlicePercentagesPlugin',
    afterDraw(chart) {
      if (chart.config.type !== 'pie') return;
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const dataset = chart.data.datasets[0];
      if (!dataset || !dataset.data) return;

      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data || meta.data.length === 0) return;

      const total = dataset.data.reduce((sum, v) => sum + (Number(v) || 0), 0);
      if (total === 0 || chart.config._isEmpty) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('0 Tasks Logged', cx, cy);
        ctx.restore();
        return;
      }

      ctx.save();
      meta.data.forEach((arc, idx) => {
        const val = Number(dataset.data[idx]) || 0;
        if (val <= 0) return;

        const pctNum = Math.round((val / total) * 100);
        if (pctNum <= 0) return;

        const startAngle = arc.startAngle;
        const endAngle = arc.endAngle;
        const angleSpan = endAngle - startAngle;
        const midAngle = startAngle + angleSpan / 2;

        const outerR = arc.outerRadius;
        const cx = arc.x;
        const cy = arc.y;

        // Draw In-Slice Percentage text (bold white with text shadow)
        if (angleSpan > 0.28) {
          const inRadius = outerR * 0.60;
          const px = cx + Math.cos(midAngle) * inRadius;
          const py = cy + Math.sin(midAngle) * inRadius;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '800 11px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
          ctx.shadowBlur = 3;
          ctx.fillText(`${pctNum}%`, px, py);
          ctx.shadowBlur = 0;
        }
      });
      ctx.restore();
    }
  };

  // 1. Weekly Breakdown Solid Pie Chart
  function getWeeklyPieData() {
    const weekDays = getCurrentWeekDates();
    let dsaDone = 0, aptDone = 0, engDone = 0, gymDone = 0, revDone = 0;

    // Check PrepVault
    const vaultHabits = (window.PrepVault && window.PrepVault.get().habits) || {};

    weekDays.forEach(dStr => {
      const rec = state.daily[dStr];
      const vHabit = vaultHabits[dStr];

      // DSA
      if ((vHabit && vHabit.dsa) || (rec && rec.dsa && rec.dsa.done)) {
        dsaDone += (rec && rec.dsa ? (rec.dsa.completed || 1) : 1);
      }
      // Aptitude
      if ((vHabit && vHabit.aptitude) || (rec && rec.aptitude && rec.aptitude.done)) {
        aptDone += 1;
      }
      // English
      if ((vHabit && vHabit.english) || (rec && rec.english && rec.english.done)) {
        engDone += 1;
      }
      // Gym
      if ((vHabit && vHabit.gym) || (rec && rec.gym && rec.gym.done)) {
        gymDone += 1;
      }
      // Revision
      if ((vHabit && vHabit.revision) || (rec && rec.revision && rec.revision.done)) {
        revDone += 1;
      }
    });

    const totalTasks = dsaDone + aptDone + engDone + gymDone + revDone;

    // Update DOM micro counts
    setElText('pie-cnt-dsa', `${dsaDone}`);
    setElText('pie-cnt-apt', `${aptDone}`);
    setElText('pie-cnt-eng', `${engDone}`);
    setElText('pie-cnt-gym', `${gymDone}`);
    setElText('pie-cnt-rev', `${revDone}`);
    setElText('pie-total-badge', `${totalTasks} Task${totalTasks !== 1 ? 's' : ''}`);

    // Vibrant Professional 3D Palette (Matching Reference Spec)
    // DSA (Royal Blue), Aptitude (Emerald Green), English (Purple), Gym (Coral Red), Revision (Amber Gold)
    const labels = ['DSA', 'Apti', 'Eng', 'Gym', 'Rev'];
    const colors = ['#2563EB', '#059669', '#7C3AED', '#E11D48', '#D97706'];
    const hoverColors = ['#1D4ED8', '#047857', '#6D28D9', '#BE123C', '#B45309'];

    // If no tasks done yet, show subtle empty placeholder
    if (totalTasks === 0) {
      return {
        labels: ['Pending Tasks'],
        data: [1],
        backgroundColor: ['#E2E8F0'],
        hoverBackgroundColor: ['#CBD5E1'],
        totalTasks: 0,
        isEmpty: true
      };
    }

    return {
      labels,
      data: [dsaDone, aptDone, engDone, gymDone, revDone],
      backgroundColor: colors,
      hoverBackgroundColor: hoverColors,
      totalTasks,
      isEmpty: false
    };
  }

  function initWeeklyPieChart() {
    const canvas = document.getElementById('weeklyProgressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pieData = getWeeklyPieData();

    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: pieData.labels,
        datasets: [{
          data: pieData.data,
          backgroundColor: pieData.backgroundColor,
          hoverBackgroundColor: pieData.hoverBackgroundColor,
          borderWidth: 1.5,
          borderColor: '#FFFFFF',
          hoverOffset: 4
        }]
      },
      plugins: [pieSlicePercentagesPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 2
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { size: 10, weight: 'bold', family: '"Plus Jakarta Sans", sans-serif' },
            bodyFont: { size: 9.5, family: '"JetBrains Mono", monospace' },
            padding: 8,
            cornerRadius: 8,
            callbacks: {
              label: (c) => {
                if (pieData.isEmpty) return ' No tasks completed this week yet';
                const val = c.raw;
                const pct = pieData.totalTasks > 0 ? Math.round((val / pieData.totalTasks) * 100) : 0;
                return ` ${c.label}: ${val} tasks (${pct}%)`;
              }
            }
          }
        }
      }
    });
    barChartInstance.config._isEmpty = pieData.isEmpty;
    barChartInstance.config._totalTasks = pieData.totalTasks;
  }

  // 2. Sleep Tracker Chart (100% Real Logs Sync Across All Past Days)
  function getSleepData() {
    const weekDays = getCurrentWeekDates();
    const todayStr = getTodayString();
    const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIdx = weekDays.indexOf(todayStr);

    const labels = weekDays.map((dStr, idx) => {
      const dayNum = parseInt(dStr.split('-')[2], 10);
      return `${dayLetters[idx]}`;
    });

    let vaultSleep = {};
    if (window.PrepVault && typeof window.PrepVault.get === 'function') {
      vaultSleep = window.PrepVault.get().sleepLogs || {};
    }
    if (Object.keys(vaultSleep).length === 0) {
      try {
        const raw = localStorage.getItem('prep_vault_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.sleepLogs) vaultSleep = parsed.sleepLogs;
        }
      } catch (e) {}
    }

    const hoursData = weekDays.map(dStr => {
      if (vaultSleep[dStr] !== undefined && Number(vaultSleep[dStr]) >= 0) {
        return Number(vaultSleep[dStr]);
      }
      const rec = state.daily[dStr];
      if (rec && rec.sleep && rec.sleep.hours !== undefined) {
        return Number(rec.sleep.hours);
      }
      return 0; // Real data: No fake numbers for unlogged days
    });

    ensureDayRecord(selectedDate);
    const todayRec = state.daily[selectedDate];
    const todayHrs = (vaultSleep[selectedDate] !== undefined)
      ? (Number(vaultSleep[selectedDate]) || 0)
      : ((todayRec && todayRec.sleep && todayRec.sleep.hours !== undefined) ? Number(todayRec.sleep.hours) : 0);
    const targetHrs = (todayRec && todayRec.sleep && todayRec.sleep.target) ? todayRec.sleep.target : 8;

    setElText('sleep-today-hrs', `${Number(todayHrs).toFixed(1)} hrs`);
    setElText('sleep-target-hrs', `${targetHrs} hrs`);

    return { dates: weekDays, labels, hoursData, todayHrs, targetHrs, todayStr, todayIdx };
  }

  // Value Labels on top of Sleep Bars (Pill-Styled Floating Badges)
  const sleepValuePlugin = {
    id: 'sleepValuePlugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const todayStr = getTodayString();
      const weekDays = getCurrentWeekDates();
      const todayIdx = weekDays.indexOf(todayStr);

      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        if (!meta || !meta.data) return;
        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          if (val !== undefined && val !== null && val > 0) {
            ctx.save();
            const isToday = (index === todayIdx);
            const txt = Number(val).toFixed(1);
            
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            const textWidth = ctx.measureText(txt).width;
            const pillW = Math.max(textWidth + 8, 22);
            const pillH = 13;
            const pillX = bar.x - pillW / 2;
            const pillY = bar.y - 17;

            // Draw floating pill background
            ctx.fillStyle = isToday ? '#EEF2FF' : '#FAF5FF';
            ctx.strokeStyle = isToday ? '#C7D2FE' : '#E9D5FF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(pillX, pillY, pillW, pillH, 4);
            } else {
              ctx.rect(pillX, pillY, pillW, pillH);
            }
            ctx.fill();
            ctx.stroke();

            // Draw pill text
            ctx.fillStyle = isToday ? '#4338CA' : '#7E22CE';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(txt, bar.x, pillY + pillH / 2 + 0.5);
            ctx.restore();
          }
        });
      });
    }
  };

  function initSleepChart() {
    const canvas = document.getElementById('sleepTrackerChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { labels, hoursData, dates, todayStr, todayIdx } = getSleepData();

    if (sleepChartInstance) sleepChartInstance.destroy();

    // Canvas Vertical Linear Gradients for Sleep Bars
    const todaySleepGrad = ctx.createLinearGradient(0, 0, 0, 110);
    todaySleepGrad.addColorStop(0, '#6366F1');
    todaySleepGrad.addColorStop(1, '#4F46E5');

    const pastLoggedSleepGrad = ctx.createLinearGradient(0, 0, 0, 110);
    pastLoggedSleepGrad.addColorStop(0, '#C084FC');
    pastLoggedSleepGrad.addColorStop(1, '#7C3AED');

    const emptySleepGrad = ctx.createLinearGradient(0, 0, 0, 110);
    emptySleepGrad.addColorStop(0, '#F1F5F9');
    emptySleepGrad.addColorStop(1, '#E2E8F0');

    const backgroundColors = dates.map((dStr, idx) => {
      const val = hoursData[idx] || 0;
      if (val === 0) return emptySleepGrad;
      return (idx === todayIdx) ? todaySleepGrad : pastLoggedSleepGrad;
    });

    sleepChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: hoursData,
          backgroundColor: backgroundColors,
          borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: 'bottom',
          barPercentage: 0.58,
          categoryPercentage: 0.8
        }]
      },
      plugins: [sleepValuePlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 16, bottom: 0, left: 0, right: 0 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { size: 10, weight: 'bold', family: '"Plus Jakarta Sans", sans-serif' },
            bodyFont: { size: 9, family: '"JetBrains Mono", monospace' },
            padding: 8,
            cornerRadius: 8,
            callbacks: {
              label: (c) => ` Sleep: ${c.raw > 0 ? c.raw + ' hrs' : 'Not logged'}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: (c) => (c.index === todayIdx ? '#6D28D9' : '#64748B'),
              font: (c) => ({
                weight: c.index === todayIdx ? '900' : '700',
                size: 9.5,
                family: '"Plus Jakarta Sans", sans-serif'
              })
            }
          },
          y: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 5,
              callback: (v) => `${v}`,
              color: '#64748B',
              font: { size: 9, family: '"JetBrains Mono", monospace', weight: '700' }
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.8)',
              borderDash: [3, 3]
            },
            border: { display: false }
          }
        }
      }
    });
  }

  // 3. 30-Day Consistency Trend (September 2026 • 100% Real Logs Sync)
  function getCurrentMonthDates() {
    const todayStr = getTodayString();
    const [yrStr, moStr] = todayStr.split('-');
    const yr = parseInt(yrStr, 10);
    const mo = parseInt(moStr, 10);
    const totalDaysInMonth = new Date(yr, mo, 0).getDate();
    const dates = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dFormatted = String(d).padStart(2, '0');
      dates.push(`${yrStr}-${moStr}-${dFormatted}`);
    }
    return dates;
  }

  function getDailyLineData() {
    const monthDates = getCurrentMonthDates();
    const todayStr = getTodayString();
    const todayMs = new Date(todayStr + 'T00:00:00').getTime();

    const labels = monthDates.map(dStr => {
      const dayNum = parseInt(dStr.split('-')[2], 10);
      return `Sep ${dayNum}`;
    });

    const vaultHabits = (window.PrepVault && window.PrepVault.get().habits) || {};
    const vaultSleep = (window.PrepVault && window.PrepVault.get().sleepLogs) || {};

    const rawDsa = [];
    const rawApt = [];
    const rawEng = [];
    const rawGym = [];
    const rawSleep = [];

    // Stagger baselines so even at 0% all 5 lines are visually separated
    // These are display-only offsets; raw data is preserved separately for tooltips
    const SERIES_BASE_OFFSET = [4, 2, 0, -2, -4]; // DSA, Apti, Eng, Gym, Sleep

    monthDates.forEach(dStr => {
      const dMs = new Date(dStr + 'T00:00:00').getTime();
      const isFuture = dMs > todayMs;
      const isBeforeStart = dMs < startMs; // before plan start date

      // Both future dates AND pre-plan dates → null so no line drawn
      if (isFuture || isBeforeStart) {
        rawDsa.push(null);
        rawApt.push(null);
        rawEng.push(null);
        rawGym.push(null);
        rawSleep.push(null);
        return;
      }

      const rec = state.daily[dStr];
      const vH = vaultHabits[dStr] || {};

      // DSA (Target 3 or done = 100%)
      const isDsaDone = (vH.dsa !== undefined) ? !!vH.dsa : (rec && rec.dsa && rec.dsa.done);
      const dsaCnt = (rec && rec.dsa && rec.dsa.completed !== undefined) ? rec.dsa.completed : (isDsaDone ? 3 : 0);
      rawDsa.push(isDsaDone ? 100 : Math.min(100, Math.round((dsaCnt / 3) * 100)));

      // Apti (Target 2 or done = 100%)
      const isAptDone = (vH.aptitude !== undefined) ? !!vH.aptitude : (rec && rec.aptitude && rec.aptitude.done);
      const aptCnt = (rec && rec.aptitude && rec.aptitude.completed !== undefined) ? rec.aptitude.completed : (isAptDone ? 2 : 0);
      rawApt.push(isAptDone ? 100 : Math.min(100, Math.round((aptCnt / 2) * 100)));

      // English (Target 1)
      const isEngDone = (vH.english !== undefined) ? !!vH.english : (rec && rec.english && rec.english.done);
      rawEng.push(isEngDone ? 100 : 0);

      // Gym (Target 1)
      const isGymDone = (vH.gym !== undefined) ? !!vH.gym : (rec && rec.gym && rec.gym.done);
      rawGym.push(isGymDone ? 100 : 0);

      // Sleep (Target 8 hrs)
      let sHrs = 0;
      if (vaultSleep[dStr] !== undefined) {
        sHrs = Number(vaultSleep[dStr]) || 0;
      } else if (rec && rec.sleep && rec.sleep.hours !== undefined) {
        sHrs = Number(rec.sleep.hours) || 0;
      }
      rawSleep.push(Math.min(100, Math.round((sHrs / 8.0) * 100)));
    });

    // Fixed per-series visual offset — always applied regardless of value
    // Guarantees separation at 0%, 100%, and any duplicate value
    // Tooltips use rawValues so user always sees true percentage
    const SERIES_VIS_OFFSET = [4, 2, 0, -2, -4]; // DSA, Apti, Eng, Gym, Sleep
    const visDsa = [], visApt = [], visEng = [], visGym = [], visSleep = [];

    for (let i = 0; i < monthDates.length; i++) {
      const raw = [rawDsa[i], rawApt[i], rawEng[i], rawGym[i], rawSleep[i]];

      if (raw[0] === null) {
        visDsa.push(null); visApt.push(null); visEng.push(null);
        visGym.push(null); visSleep.push(null);
        continue;
      }

      // Apply fixed offset per series — no clamping here so lines fan at both extremes
      visDsa.push(raw[0] + SERIES_VIS_OFFSET[0]);
      visApt.push(raw[1] + SERIES_VIS_OFFSET[1]);
      visEng.push(raw[2] + SERIES_VIS_OFFSET[2]);
      visGym.push(raw[3] + SERIES_VIS_OFFSET[3]);
      visSleep.push(raw[4] + SERIES_VIS_OFFSET[4]);
    }

    return {
      labels,
      dates: monthDates,
      datasets: [
        { label: 'DSA', data: visDsa, rawValues: rawDsa, color: '#4F46E5', fillGrad: 'rgba(79, 70, 229, 0.08)', borderWidth: 2.5, radius: 3.5 },
        { label: 'Apti', data: visApt, rawValues: rawApt, color: '#10B981', fillGrad: 'rgba(16, 185, 129, 0.07)', borderWidth: 2.5, radius: 3.5 },
        { label: 'Eng', data: visEng, rawValues: rawEng, color: '#06B6D4', fillGrad: 'rgba(6, 182, 212, 0.05)', borderWidth: 2.0, radius: 3 },
        { label: 'Gym', data: visGym, rawValues: rawGym, color: '#F43F5E', fillGrad: 'rgba(244, 63, 94, 0.05)', borderWidth: 2.0, radius: 3 },
        { label: 'Sleep', data: visSleep, rawValues: rawSleep, color: '#8B5CF6', fillGrad: 'rgba(139, 92, 246, 0.05)', borderWidth: 2.0, radius: 3 }
      ]
    };
  }

  function initDailyLineChart() {
    const canvas = document.getElementById('dailyConsistencyChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const lineData = getDailyLineData();

    if (lineChartInstance) lineChartInstance.destroy();

    const datasets = lineData.datasets.map(ds => {
      const grad = ctx.createLinearGradient(0, 0, 0, 340);
      grad.addColorStop(0, ds.fillGrad);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      return {
        label: ds.label,
        data: ds.data,
        rawValues: ds.rawValues,
        borderColor: ds.color,
        backgroundColor: grad,
        fill: true,
        tension: 0.38,
        spanGaps: false,
        borderWidth: ds.borderWidth,
        pointBackgroundColor: ds.color,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: (context) => (context.raw !== null ? ds.radius : 0),
        pointHoverRadius: ds.radius + 2.5
      };
    });

    lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: lineData.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 12, bottom: 5, left: 5, right: 15 }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleColor: '#F8FAFC',
            bodyColor: '#E2E8F0',
            titleFont: { size: 10.5, weight: 'bold', family: '"Plus Jakarta Sans", sans-serif' },
            bodyFont: { size: 9.5, family: '"JetBrains Mono", monospace' },
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            usePointStyle: true,
            filter: (item) => item.raw !== null,
            callbacks: {
              label: (c) => {
                const rawVal = (c.dataset.rawValues && c.dataset.rawValues[c.dataIndex] !== undefined)
                  ? c.dataset.rawValues[c.dataIndex]
                  : Math.round(c.raw);
                return ` ${c.dataset.label}: ${rawVal}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 15,
              color: '#475569',
              font: { size: 9.5, weight: '700', family: '"Plus Jakarta Sans", sans-serif' }
            }
          },
          y: {
            min: -6,
            max: 106,
            grid: {
              color: 'rgba(203, 213, 225, 0.7)',
              borderDash: [4, 4]
            },
            border: { display: false },
            ticks: {
              stepSize: 25,
              callback: (v) => {
                // Only label the true percentage marks, skip the offset zone
                if ([0, 25, 50, 75, 100].includes(Math.round(v))) return `${Math.round(v)}%`;
                return '';
              },
              color: '#475569',
              font: { size: 9.5, family: '"JetBrains Mono", monospace', weight: '700' }
            }
          }
        }
      }
    });
  }

  function toggleConsistencySeries(idx) {
    if (!lineChartInstance) return;
    const isVisible = lineChartInstance.isDatasetVisible(idx);
    lineChartInstance.setDatasetVisibility(idx, !isVisible);
    lineChartInstance.update();

    const btn = document.getElementById(`legend-btn-${idx}`);
    if (btn) {
      if (isVisible) {
        btn.classList.add('opacity-35', 'grayscale-[40%]');
      } else {
        btn.classList.remove('opacity-35', 'grayscale-[40%]');
      }
    }
  }

  function adjustSleep(delta) {
    ensureDayRecord(selectedDate);
    const vaultSleep = (window.PrepVault && window.PrepVault.get().sleepLogs) || {};
    const curr = (vaultSleep[selectedDate] !== undefined)
      ? Number(vaultSleep[selectedDate])
      : ((state.daily[selectedDate] && state.daily[selectedDate].sleep && state.daily[selectedDate].sleep.hours !== undefined)
        ? Number(state.daily[selectedDate].sleep.hours)
        : 0);
    const target = (state.daily[selectedDate] && state.daily[selectedDate].sleep && state.daily[selectedDate].sleep.target)
      ? state.daily[selectedDate].sleep.target
      : 8;
    const updated = Math.max(0, Math.min(24, Math.round((curr + delta) * 10) / 10));

    state.daily[selectedDate].sleep = { hours: updated, target: target };
    if (window.PrepVault) {
      window.PrepVault.logSleep(selectedDate, updated);
      window.PrepVault.save();
    }
    saveState();

    setElText('sleep-today-hrs', `${updated.toFixed(1)} hrs`);
    renderTodaySummary();
    renderWeeklyHeatmap();
    updateCharts();
    showToast(`Sleep updated: ${updated.toFixed(1)} hrs for ${formatDateHuman(selectedDate)} 🌙`);
  }

  function setElText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  }

  function showToast(msg) {
    const t = document.getElementById('dashboard-toast');
    const txt = document.getElementById('toast-text');
    if (t) {
      if (txt) txt.innerText = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2200);
    }
  }

  // ==========================================
  // REMINDER BACKUP / RESTORE HELPERS
  // ==========================================

  /**
   * Returns the current reminders array for inclusion in a backup export.
   * Safe to call even if ReminderEngine is not loaded (returns []).
   */
  function getRemindersBackup() {
    try {
      if (window.ReminderEngine && typeof ReminderEngine.getReminders === 'function') {
        return ReminderEngine.getReminders();
      }
      const raw = localStorage.getItem('placement_reminders_v1');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Restores reminders from a backup payload.
   * Backward-compatible: old backups without 'reminders' key = no-op.
   * @param {object} backupData - Parsed backup JSON object
   */
  function restoreRemindersFromBackup(backupData) {
    if (!backupData) return;
    if (!Array.isArray(backupData.reminders)) return; // backward compat: skip if missing
    try {
      if (window.ReminderEngine && typeof ReminderEngine.setRemindersFromBackup === 'function') {
        ReminderEngine.setRemindersFromBackup(backupData.reminders);
      } else {
        localStorage.setItem('placement_reminders_v1', JSON.stringify(backupData.reminders));
      }
      // Refresh the reminder UI if it is loaded
      if (window.ReminderUI && typeof ReminderUI.renderList === 'function') {
        ReminderUI.renderList();
      }
    } catch (e) {
      console.warn('[DashboardApp] restoreRemindersFromBackup error:', e);
    }
  }

  return {
    init,
    toggleHabitDone,
    adjustHabitCount,
    markAllDone,
    prevDay,
    nextDay,
    adjustSleep,
    toggleConsistencySeries,
    // Reminder backup/restore integration
    getRemindersBackup,
    restoreRemindersFromBackup,
    // Expose toast for ReminderUI
    _showToast: showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  DashboardApp.init();
});
