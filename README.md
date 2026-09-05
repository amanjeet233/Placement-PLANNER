# 🎯 119-Day Placement & Government Exam Preparation Portal

A production-grade, single-page web application (`index.html`) engineered for comprehensive Tier-1 engineering placements (119 Days / 17 Weeks) and Government Exam quantitative aptitude (SSC CGL / CHSL / CPO / Bank PO / Clerical / Railways).

---

## 📁 Project Structure

```
90DAY/
├── index.html                     # Master Single Page Application (11 distinct views, styles & engines)
├── dsa_roadmap_337_data.js        # 337 DSA Topics Dataset (CTO Bhaiya + Striver SDE Sheet mappings)
├── aptitude_roadmap_24_data.js    # 24 Aptitude Chapters Dataset (Abhinay Sharma full batches)
├── AGENTS.md / GEMINI.md          # Workspace guidelines for AI agents
├── README.md                      # Complete documentation & usage guide
├── scratch/                       # Verification scripts and test harnesses
└── .agents/
    ├── rules/
    │   └── placement-project-rules.md      # Zero-revision policy, dataset separation & SPA integrity
    └── skills/
        ├── placement-roadmap-manager/SKILL.md  # Domain architecture, data schemas & workflow rules
        └── ui-ux-pro-max/SKILL.md              # 60-30-10 light theme SaaS tokens & UI intelligence
```

---

## 🧭 The 11 Views in `index.html`

1. **`page-overview` (Roadmap Overview)** — 119-day master timeline, weekly time map, quick phase jump cards, and global progress tracker.
2. **`page-foundation` (Zero Foundation)** — Week 1–2 zero-to-basics modules for absolute beginners.
3. **`page-phase-1` (Phase 1: Foundations)** — Days 1–21: Basic Java syntax, arrays, strings, arithmetic aptitude, and basic SQL.
4. **`page-phase-2` (Phase 2: Core Build)** — Days 22–42: Big-O analysis, sorting algorithms, binary search, TSD, SQL Joins & Aggregates, daily SSC/Bank speed drills.
5. **`page-phase-3` (Phase 3: Level Up)** — Days 43–63: Linked List, Stacks, Queues, Binary Trees, Love Babbar sheet patterns, subqueries, and project milestones.
6. **`page-phase-4` (Phase 4: Sprint & AI)** — Days 64–91: Graphs, Dynamic Programming, GenAI / RAG fundamentals, database normalization, and mock interviews.
7. **`page-phase-5` (Phase 5: Dec Sprint & Mocks)** — Days 92–119: CS fundamentals (OS, DBMS, CN, System Design), full-length timed mock tests, and Govt exam previous-year paper solving.
8. **`page-leetcode` (DSA Placement Roadmap — 337 Topics)** — Complete 337-topic curriculum with direct LeetCode problem links, exact video/search labeling, and real-time solved-state syncing.
9. **`page-aptitude` (Placement & Govt Exam Aptitude — 24 Chapters)** — 24 topic-by-topic quantitative aptitude chapters mapped to Abhinay Sharma conceptual batches (zero revision shortcuts) with SSC/Bank alignment.
10. **`page-guides` (Strategy Vault & Guides)** — Curated guides for ATS resume building, HR behavioral answers (STAR method), cold outreach, and interview psychology.
11. **`page-tracker` (Weekly Progress & Habit Tracker)** — Accountability checklist, weekly habit tracker, and milestone reflection notes.

---

## 💾 How Progress Saving & Unified Backup Works

- **Automatic Instant Persistence**: Every task check, DSA solved problem, and Aptitude chapter toggle persists in the browser's `localStorage` immediately upon interaction.
- **LocalStorage Keys**:
  - `placement_plan_v2_tasks`: Overview and Phase 1–5 daily task completion map.
  - `dsa_solved_problems`: Solved state for unique LeetCode problems across all 337 topics.
  - `placement_aptitude_roadmap_v1`: Completed chapter state across 24 quantitative chapters.
- **Unified Master Backup (`placement_master_backup_v1`)**:
  - **Export (`📥 Backup`)**: Generates a single `.json` file containing progress across **all 3 systems**:
    ```json
    {
      "version": "placement_master_backup_v1",
      "exportDate": "2026-09-04T...",
      "completedTasks": { ... },
      "dsaProgress": { ... },
      "aptitudeProgress": { "completedChapters": { ... } }
    }
    ```
  - **Restore (`📤 Restore`)**: Validates backup JSON, restores all 3 systems simultaneously, and updates all progress bars, counters, and card badges **in place without requiring a page reload**.
  - **Backward Compatibility**: Safely imports older backups containing only `completedTasks` without errors.
- **Local vs Deployment**: No web server or deployment is required to save progress—it lives locally in your browser. Deployment (e.g. GitHub Pages or Netlify) only provides a shareable URL.

---

## 🌐 Browser History & Navigation Architecture

- **Separated Rendering & History**:
  - `renderPage(pageId)`: Handles page visibility, tab active states, hero card highlights, and page-specific refreshes without adding history entries.
  - `navigateTo(pageId)`: Calls `renderPage(pageId)` and pushes a new URL hash state (`#page-...`) only when navigating forward.
- **Single-Click Back & Forward**: The `popstate` listener calls `renderPage(pageId)` directly, completely eliminating duplicate history entries and ensuring instant, intuitive browser navigation.

---

## 🎨 UI/UX Design System (UI/UX Pro Max)

- **60-30-10 Light Theme**: Clean white surfaces (`#FFFFFF`), subtle slate borders (`#E2E8F0`), deep ink typography (`#0F172A`), and intentional category accents.
- **Category Design Tokens**:
  - 🟦 **Arithmetic / Arrays**: Vibrant Blue (`#2563EB`)
  - 🟪 **Algebra / Strings**: Deep Purple (`#7C3AED`)
  - 🟩 **Geometry / Trees / Queues**: Emerald Green / Teal (`#059669` / `#0D9488`)
  - 🟧 **Data-Based / Heaps**: Rich Orange / Amber (`#EA580C` / `#D97706`)
  - 🔴 **Phase 5 Sprint / Hard / Sorting**: Crimson Red / Rose (`#DC2626` / `#E11D48`)
- **Responsive 4-Column Grid**: Dynamic CSS grid layout that adapts seamlessly across Ultra-Wide, Desktop (4 cols), Tablet (2 cols), and Mobile (1 col).

---

---

## 📊 Executive Life & Placement Habit Dashboard Architecture (Plan & Blueprint)

### 🎯 1. Concept: The "Zero-Miss" Command Center
An executive-level habit and placement performance dashboard that tracks **both technical preparation and personal discipline (DSA, Aptitude, Sleep, English, Gym, 1-3-7 Revision)** with automated day-progression, weekly rollups, interactive Canvas/SVG charts, and an accountability penalty engine.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        🚀 EXECUTIVE PLACEMENT & LIFE DASHBOARD                         │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 📅 TODAY: Monday, 07 Sep 2026  │ 🔥 Active Streak: 4 Days  │ 📈 Consistency Score: 92% │
├────────────────────────────────┴───────────────────────────────────────────────────────┤
│ 📊 PERFORMANCE VISUALIZATIONS                                                          │
│  [📈 14-Day Trajectory Line Chart]          [📊 Weekly Habit Stacked Bar Chart]        │
│  (Shows daily score & dips if missed)        (DSA, Aptitude, English, Gym, Sleep, Rev) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 📋 DAILY HABIT MATRIX (6 Core Pillars)                                                 │
│  1. 💻 DSA (Target: 2 Problems / 3 hrs) ─── [2/2 Solved] ───────── ✅ Done             │
│  2. 🧮 Aptitude (Target: 20 MCQs / 1.5 hr) ── [20/20 Qs] ───────── ✅ Done             │
│  3. 😴 Sleep & Recovery (Target: 7–8 hrs) ── [7.5 hrs logged] ──── ✅ Done             │
│  4. 🗣️ English / Mock (1-min video recorded) ────────────────────── ⏳ In Progress      │
│  5. 💪 Gym & Health (45 min workout / yoga) ────────────────────── ⏳ Pending          │
│  6. 🔂 1-3-7 Spaced Revision (Day 1 / Day 3 / Day 7 due topics) ── ⏳ Pending          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔗 QUICK LAUNCH CARD: [🚀 Jump into 119-Day Placement Blueprint (index.html)]          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🕒 2. Automated Midnight (12:00 AM) Rollover & Penalty Engine
- **How it Works**:
  1. On each app load / interval check, the system checks `lastActiveDate` stored in `localStorage`.
  2. If the current date is after 12:00 AM of the previous logged date:
     - **Success Case**: If daily target score was $\ge 70\%$, the daily record is archived into the historical timeline, and streak increases $+1$.
     - **Miss / Penalty Case**: If core habits were uncompleted, the day is marked as **"Missed" (Incomplete)**.
     - **Graph Trajectory Impact**: The daily performance score drops to the actual achieved percentage (or $0\%$), causing the **Line Graph to visibly dip**, holding the user accountable.
     - **Streak Decay**: If 2 consecutive days are missed, the streak counter resets to 0 with a high-visibility re-ignition badge.

---

### 📈 3. Data Visualization & Charts Engine
- **📈 Consistency & Momentum Line Graph**:
  - Displays a continuous 14-day / 30-day moving average curve ($0–100\%$).
  - Smooth Bézier curve rendering with gradient fill under the line.
  - Highlights peak performance days with green glowing markers and missed days with red dip indicators.
- **📊 7-Day Category Breakdown Bar Graph**:
  - Stacked or grouped bar chart displaying daily time/quota distribution across **DSA, Aptitude, Gym, English, Sleep, and Revision**.
- **🎯 Habit Completion Donut / Radar**:
  - Real-time circular metric showing today's overall completion percentage ($0–100\%$).

---

### 💾 4. Unified Dashboard LocalStorage Schema
```json
{
  "dashboard_version": "v1_executive",
  "currentStreak": 4,
  "bestStreak": 14,
  "overallConsistencyPct": 92.4,
  "lastRolloverTimestamp": 1788739200000,
  "dailyLogs": {
    "2026-09-04": {
      "dsa": { "target": 2, "completed": 2, "hours": 3.0, "status": true },
      "aptitude": { "target": 20, "completed": 20, "hours": 1.5, "status": true },
      "sleep": { "hours": 7.5, "quality": "good", "status": true },
      "english": { "recorded": true, "fillerCount": 2, "status": true },
      "gym": { "workoutDone": true, "type": "Strength", "status": true },
      "revision137": { "topicsReviewed": ["Arrays-26", "LCM-HCF"], "status": true },
      "score": 100,
      "isMissed": false
    },
    "2026-09-05": {
      "dsa": { "target": 2, "completed": 1, "hours": 1.5, "status": false },
      "aptitude": { "target": 20, "completed": 0, "hours": 0.0, "status": false },
      "sleep": { "hours": 5.0, "quality": "poor", "status": false },
      "english": { "recorded": false, "fillerCount": 0, "status": false },
      "gym": { "workoutDone": false, "type": "None", "status": false },
      "revision137": { "topicsReviewed": [], "status": false },
      "score": 25,
      "isMissed": true
    }
  }
}
```

---

### 💡 5. Innovative Features To Supercharge Prep
1. **🚀 1-Click Portal Switcher Card**: A hero launchpad card to seamlessly open and navigate between the habit dashboard and the 119-Day Placement Portal (`index.html`).
2. **⏱️ Deep Work / Pomodoro Clock**: 45m Study + 10m Break cycle counter with sound chimes.
3. **⚡ Daily Energy & Mood Selector**: Log daily mood (🔥 High Energy, ⚡ Focused, 😴 Fatigued) to analyze how sleep correlates with coding velocity.
4. **🛡️ 1-Day Grace Freeze Token**: Allows 1 emergency freeze per month (e.g. college exams or travel) so genuine emergencies don't destroy long-term streaks.
5. **🔂 Spaced 1-3-7 Today's Due Queue**: Automatically suggests which topics are scheduled for Day 1, Day 3, or Day 7 revision today.

---

## ▶️ Running Locally

This is a zero-dependency static application. You can run it directly:

```bash
# Option 1: Open directly in any browser
start index.html

# Option 2: Using Node.js serve
npx serve .

# Option 3: Using Python HTTP server
python -m http.server 8000
```

