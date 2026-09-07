# CodeTrack 360 PRO — Full Forensic Audit Report

## 1. Executive Summary

**Audit Date**: 2026-09-06  
**Auditor**: Senior Full-Stack Engineer / CodeTrack Engineering  
**Repository**: https://github.com/amanjeet233/Placement-PLANNER  
**Live Application**: https://amanjeet233.github.io/Placement-PLANNER/  
**Final Status**: 🟢 **PASS (All Critical Defects Resolved; 37/37 Automated Tests Passed)**

This forensic audit and stabilization pass examined the entire CodeTrack 360 PRO codebase. All confirmed functional and critical bugs have been resolved in source code and thoroughly verified with automated tests. Legacy storage keys have been analyzed, classified, and protected against data resurrection and stale state overwrites.

---

## 2. Audit Scope & Verified Files

- `index.html` — Primary Single Page Application entrypoint.
- `dashboard.html` — Lightweight client-side redirect shim to `index.html` preserving URL parameters and hashes.
- `dashboard.js` — Dashboard rendering, habit steppers, event delegation, and unified 4-pillar fallback progress calculation.
- `prep-sync.js` — Canonical `prep_vault_v1` state engine, one-time migration guard (`_migrated_legacy_v1`), bi-directional mirror writes, and atomic reset methods.
- `roadmap.html` — 119-Day Static Blueprint curriculum.
- `dsa_roadmap_337_data.js` — 337 DSA topics, 388 LeetCode references, 244 unique problem URLs.
- `aptitude_roadmap_24_data.js` — 24 quantitative aptitude chapters, 96 curated MCQs, zero revision videos.
- `reminder-engine.js` — Local browser timers, modal management, notification dispatch, and dedicated store (`placement_reminders_v1`).
- `service-worker.js` — PWA Cache Storage v3.1, offline assets, and notification routing to `./index.html`.
- `manifest.webmanifest` — PWA installation metadata pointing to `./index.html`.
- `firebase-config.js` — Browser-safe Firebase Web App configuration.
- `firebase-messaging-sw.js` — FCM background push handler pointing notification clicks to `./index.html`.
- `firebase-firestore-sync.js` — Bi-directional real-time cloud sync with graceful offline fallback and dynamic reconnect listeners.
- `.github/workflows/deploy-pages.yml` — GitHub Pages continuous deployment.
- `.github/workflows/reminder-push.yml` — 15-minute cron push dispatcher.
- `scripts/send-fcm-reminders.js` — Pure Node.js RFC 7523 RS256 JWT auth & FCM HTTP v1 sender.
- `package.json` — Project metadata and automated test harness (`tests/test_audit_suite.js`).

---

## 3. Project Architecture & State Management

```
User Interface
├── index.html (Main Canonical SPA)
├── dashboard.html (Client-side redirect shim -> index.html)
└── roadmap.html (Static 119-Day Reference Blueprint)

Unified State Engine (PrepVault):
└── prep-sync.js (Canonical key: prep_vault_v1)
    ├── Sections: completedTasks, dsaSolved, aptitudeSolved, habits, streaks, sleepLogs, reminders, preferences
    ├── Safe helpers: load(), save(), update(), migrate(), resetAll()
    ├── One-time legacy migration guard (_migrated_legacy_v1) preventing task/data resurrection
    └── Bi-directional mirror writes to legacy keys on every save

Data Storage:
├── localStorage (Canonical: prep_vault_v1; synchronized legacy mirrors)
└── Firebase Firestore (Real-time cloud backup via firebase-firestore-sync.js)

Notification Hierarchy:
├── Layer 1: Local browser timers (reminder-engine.js for open tabs)
├── Layer 2: Service Worker Push (firebase-messaging-sw.js & service-worker.js)
└── Layer 3: Background Push (send-fcm-reminders.js via GitHub Actions cron */15 * * * *)
```

---

## 4. Final Categorization of Legacy Storage Keys

| Key | File(s) | Purpose | Can Overwrite Canonical? | Can Resurrect Data? | Final Classification |
|---|---|---|:---:|:---:|---|
| `prep_vault_v1` | `prep-sync.js` | Canonical State Store | **Source of Truth** | No | **CANONICAL ENGINE** |
| `placement_tracker_v1` | `dashboard.js` | UI settings cache (custom targets, userName) | **NO** (overridden by `PrepVault.get()`) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY / UI CACHE** |
| `placement_plan_v2_tasks` | `prep-sync.js` | Task completion list mirror | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| `90day_tasks_v2` | `prep-sync.js` | 90-day task completion mirror | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| `dsa_solved_problems` | `prep-sync.js`, `dashboard.js` | Solved DSA problem map mirror | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| `dsa_roadmap_solved_probs_v1` | `prep-sync.js`, `dashboard.js` | Solved DSA problem map mirror | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| `placement_dsa_roadmap_v1` | `prep-sync.js` | Historical DSA topic list | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIGRATION-ONLY)** |
| `placement_aptitude_roadmap_v1` | `prep-sync.js`, `dashboard.js` | Solved aptitude chapters mirror | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| `aptitude_roadmap_v1` | `prep-sync.js` | Historical aptitude completion | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIGRATION-ONLY)** |
| `dashboard_habits_v1` | `prep-sync.js` | Historical habit dates | **NO** (migration guard) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIGRATION-ONLY)** |
| `placement_reminders_v1` | `reminder-engine.js` | Active reminder schedule | No (synced) | **NO** | **ACTIVE DOMAIN STORE** |
| `placement_reminder_log_v1` | `reminder-engine.js` | Delivery de-duplication log | No | **NO** | **TRANSIENT LOG CACHE** |
| `fcm_token` | `firebase-config.js` | Browser push token | No | **NO** | **CREDENTIAL CACHE** |

---

## 5. Comprehensive Bug Resolution Matrix

| Bug ID | Title | Severity | Classification | Status | Fix Applied |
|---|---|---|---|---|---|
| **BUG-001** | Duplicate HTML Files | P0 | REAL BUG | **FIXED** | Replaced `dashboard.html` with client-side redirect shim preserving parameters and hash. |
| **BUG-002** | Service Worker Version Inconsistency | P1 | REAL BUG | **FIXED** | Updated comments and constants across `service-worker.js` to `v3.1`. |
| **BUG-003** | State Management Fragmentation & Resurrection | P0 | REAL BUG | **FIXED** | Added `_migrated_legacy_v1` guard; added bi-directional mirror writes in `PrepVault.save()`; direct queries on canonical state; atomic reset methods. |
| **BUG-004** | Firebase Credentials Classification | P0 | INFORMATIONAL FINDING | **RECLASSIFIED** | Confirmed `firebase-config.js` contains standard public web app identifiers. Private RSA keys and service account emails remain strictly in GitHub Secrets. |
| **BUG-005** | Non-Existent Test References | P2 | REAL BUG | **FIXED** | Built 37-assertion automated test suite in `tests/test_audit_suite.js`; bound to `npm test`. |
| **BUG-006** | Incorrect DSA Count in Documentation | P3 | INFORMATIONAL FINDING | **FIXED** | Corrected documentation across `README.md`, `AUDIT_REPORT.md`, and `TEST_RESULTS.md` to 244 unique LeetCode problems. |
| **BUG-007** | Incomplete Firebase Failure Fallback | P1 | REAL BUG | **FIXED** | Dispatches `'offline'` (`"Local Vault Mode (Offline)"`) immediately on offline/SDK error; added dynamic `online`/`offline` listeners; non-blocking local storage operations. |
| **BUG-008** | `placement_tracker_v1` UI Storage Divergence | P2 | TECHNICAL DEBT | **STABILIZED** | Verified `PrepVault` is updated first on changes; `syncFromVault()` overrides dashboard state with canonical values on every update; unified fallback overall progress formula with PrepVault 4-pillar weighting. |
| **BUG-009** | Entrypoint Realignment & Worker Links | P1 | REAL BUG | **FIXED** | Pointed `START_DASHBOARD.bat`, `manifest.webmanifest`, `service-worker.js`, and `firebase-messaging-sw.js` to `./index.html`. |

---

## 6. Formula Verification & Alignment

All components and documentation use the exact same 4-pillar weighted placement readiness formula:

$$\text{Overall Progress} = \min\left(100, \text{round}\left(\text{tasksPct} \times 0.30 + \text{dsaPct} \times 0.35 + \text{aptPct} \times 0.25 + \text{habitDailyPct} \times 0.10\right)\right)$$

- **Curriculum Tasks**: 30% weight
- **DSA Topics / Problems**: 35% weight
- **Quantitative Aptitude**: 25% weight
- **Daily Habits Steppers**: 10% weight

---

## 7. Automated Test Suite Results (`npm test`)

```
====================================================
 RUNNING AUDIT TEST SUITE: CodeTrack 360 PRO
====================================================

--- [1/6] DATASET INTEGRITY & CONSTRAINTS ---
  ✅ PASS: DSA Topics count must equal exactly 337 (found: 337)
  ✅ PASS: DSA Topic IDs are contiguous 1 through 337
  ✅ PASS: Total DSA problem references must equal 388 (found: 388)
  ✅ PASS: Unique LeetCode problems must equal 244 (found: 244)
  ✅ PASS: Aptitude chapters must equal exactly 24 (found: 24)
  ✅ PASS: Total Aptitude MCQs must equal exactly 96 (found: 96)
  ✅ PASS: Every Aptitude chapter contains exactly 4 curated MCQs
  ✅ PASS: Aptitude dataset adheres to Zero Revision policy (violations: 0)

--- [2/6] STATE MANAGEMENT & RESURRECTION BUG FIX ---
  ✅ PASS: Initial legacy migration imported 3 tasks
  ✅ PASS: Migration completion flag set to true
  ✅ PASS: task-d1-1 removed from canonical PrepVault
  ✅ PASS: Legacy storage key 90day_tasks_v2 synchronized with unchecked task removed
  ✅ PASS: RESURRECTION PREVENTED: task-d1-1 remained unchecked after full reload
  ✅ PASS: getCompletedTasksCount correctly returns 2
  ✅ PASS: DSA problem 88 toggled to unsolved
  ✅ PASS: RESURRECTION PREVENTED: DSA problem 88 remained unsolved after full reload
  ✅ PASS: Aptitude chapter 1 solved
  ✅ PASS: Aptitude chapter 1 unchecked
  ✅ PASS: RESURRECTION PREVENTED: Aptitude chapter 1 remained unchecked after full reload
  ✅ PASS: RESURRECTION PREVENTED: Deleted reminder rem-1 remained deleted after reload
  ✅ PASS: Remaining reminder rem-2 correctly preserved
  ✅ PASS: resetAll cleared canonical completedTasks
  ✅ PASS: resetAll cleared canonical dsaSolved
  ✅ PASS: resetAll wiped legacy storage mirror

--- [3/6] STREAK ENGINE & HABIT ACTIVITY ---
  ✅ PASS: Consecutive 3-day active habit yields current streak of 3 (got: 3)
  ✅ PASS: Best streak records at least 3 (got: 3)
  ✅ PASS: Grace period preserves streak of 2 when active yesterday (got: 2)

--- [4/6] WEIGHTED OVERALL PROGRESS FORMULA ---
  ✅ PASS: DSA problem percentage calculation is exactly 50% (got: 50%)
  ✅ PASS: Aptitude percentage calculation is exactly 50% (got: 50%)
  ✅ PASS: Weighted overall progress matches formula: 39% === 39%

--- [5/6] FIREBASE OFFLINE FALLBACK & RESILIENCE ---
  ✅ PASS: initFirestore returns null when offline
  ✅ PASS: CloudSync immediately dispatches offline status instead of hanging
  ✅ PASS: CloudSync.save executes non-blockingly without throwing when offline

--- [6/6] RFC 7523 RS256 JWT GENERATION ---
  ✅ PASS: RS256 JWT generated with valid 3-part structure (Header.Payload.Signature)
  ✅ PASS: JWT Header matches base64url encoded RS256 declaration
  ✅ PASS: JWT Payload matches RFC 7523 assertion claim set
  ✅ PASS: Cryptographic RS256 signature generated successfully

====================================================
 AUDIT TEST SUITE COMPLETE: 37 / 37 TESTS PASSED (100%)
====================================================
```

---

## 8. Technical Realities & Documented Limitations

1. **Local Timers Require Active Tab**: Browser JavaScript intervals (`reminder-engine.js`) run only while a tab/process is open. Closed-browser notifications depend on FCM background push via the GitHub Actions runner.
2. **Best-Effort Scheduled Push**: GitHub Actions cron runners execute on a shared best-effort queue every 15 minutes. The script uses a ±15-minute evaluation window to prevent missed reminders.
3. **Public Client Configuration**: The `firebaseConfig` object in `firebase-config.js` is public client config for browser communication. Security is enforced by Firestore security rules and backend private key isolation in GitHub Secrets.
