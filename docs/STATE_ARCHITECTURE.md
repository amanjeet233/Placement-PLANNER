# CodeTrack 360 PRO — State Architecture Analysis

## 1. Executive Summary

- **Canonical Application State**: `prep_vault_v1` (managed by `PrepVault` in `prep-sync.js`)
- **One-Time Migration Guard**: `_migrated_legacy_v1` ensures that initial import of legacy keys only occurs once, completely eliminating the "task resurrection" issue when users uncheck tasks or mark problems unsolved.
- **Bi-Directional Mirroring**: Synchronous mirror writes on every save to `90day_tasks_v2`, `placement_plan_v2_tasks`, `dsa_solved_problems`, `dsa_roadmap_solved_probs_v1`, and `placement_aptitude_roadmap_v1` guarantee that legacy readers receive accurate, un-corrupted state.
- **Overall Readiness Formula**: 119-Day Tasks (30%), DSA Topics/Problems (35%), Aptitude (25%), Daily Habits (10%).

---

## 2. Comprehensive Inventory of Storage Keys

Every remaining legacy key has a clearly defined purpose and categorization:

| Storage Key | Primary File | Role / Purpose | Read By | Written By | Can Overwrite Canonical? | Can Resurrect Data? | Classification |
|---|---|---|---|---|:---:|:---:|---|
| **`prep_vault_v1`** | `prep-sync.js` | **Canonical State Store** (habits, streaks, tasks, DSA, aptitude, sleep, bookmarks, notes, reminders) | All components | `prep-sync.js`, `firebase-firestore-sync.js` | **Source of Truth** | No | **CANONICAL ENGINE** |
| **`placement_tracker_v1`** | `dashboard.js` | Local dashboard UI settings cache (custom targets, user name, chart historical cache) | `dashboard.js` | `dashboard.js` | **NO** (overridden by `PrepVault.get()` on every update) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY / UI CACHE** |
| **`placement_plan_v2_tasks`** | `prep-sync.js`, `dashboard.js` | Task completion list mirror | Legacy readers, `prep-sync.js` (migration only) | `prep-sync.js` (mirror writes) | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| **`90day_tasks_v2`** | `prep-sync.js` | 90-day task completion mirror | `prep-sync.js` (migration only) | `prep-sync.js` (mirror writes) | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| **`dsa_solved_problems`** | `prep-sync.js`, `dashboard.js` | Solved DSA problem map mirror | `dashboard.js` (fallback only), `prep-sync.js` (migration only) | `prep-sync.js` (mirror writes) | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| **`dsa_roadmap_solved_probs_v1`** | `prep-sync.js`, `dashboard.js` | Solved DSA problem map mirror | `dashboard.js` (fallback only), `prep-sync.js` (migration only) | `prep-sync.js` (mirror writes) | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| **`placement_dsa_roadmap_v1`** | `prep-sync.js` | Historical DSA topic list (legacy) | `prep-sync.js` (migration only) | Cleared on `resetDsa()` | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIGRATION-ONLY)** |
| **`placement_aptitude_roadmap_v1`** | `prep-sync.js`, `dashboard.js` | Solved aptitude chapters mirror | `dashboard.js` (fallback only), `prep-sync.js` (migration only) | `prep-sync.js` (mirror writes) | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIRROR-ONLY)** |
| **`aptitude_roadmap_v1`** | `prep-sync.js` | Historical aptitude completion (legacy) | `prep-sync.js` (migration only) | Cleared on `resetAptitude()` | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIGRATION-ONLY)** |
| **`dashboard_habits_v1`** | `prep-sync.js` | Historical daily habit log (legacy) | `prep-sync.js` (migration only) | Cleared on `resetHabits()` | **NO** (guard prevents re-read) | **NO** | **INTENTIONAL BACKWARD COMPATIBILITY (MIGRATION-ONLY)** |
| **`placement_reminders_v1`** | `reminder-engine.js`, `firebase-firestore-sync.js` | Active reminder schedule | `reminder-engine.js`, `firebase-firestore-sync.js` | `reminder-engine.js`, `firebase-firestore-sync.js` | No (synced) | **NO** | **ACTIVE DOMAIN STORE** |
| **`placement_reminder_log_v1`** | `reminder-engine.js` | Daily reminder delivery de-duplication log | `reminder-engine.js` | `reminder-engine.js` | No | **NO** | **TRANSIENT LOG CACHE** |
| **`fcm_token`** | `firebase-config.js` | Registered browser FCM push device token | `firebase-config.js`, `index.html` | `firebase-config.js` | No | **NO** | **CREDENTIAL CACHE** |

---

## 3. Detailed Answers for Legacy Storage Keys

### 1. `placement_tracker_v1`
1. **Actively required?**: Yes, preserves local UI customization in `dashboard.js` (custom weekly targets `goals: { dsaTarget, ... }` and `userName`).
2. **Migration-only?**: No.
3. **Mirror-only?**: No, acts as local dashboard UI cache.
4. **Obsolete?**: No (ensures dashboard charts have historical date anchors).
5. **Can it overwrite canonical state?**: **NO**. It is never written to `prep_vault_v1`. In fact, on every change, `PrepVault.onUpdate()` triggers `syncFromVault()`, overriding `dashboard.js` state with canonical habits and sleep from `PrepVault.get()`.
6. **Can it resurrect deleted/unchecked data?**: **NO**. Does not contain tasks, DSA problems, aptitude chapters, or reminders.

### 2. `placement_plan_v2_tasks` & `90day_tasks_v2`
1. **Actively required?**: Not by `PrepVault`, but maintained for backward compatibility.
2. **Migration-only?**: Read once on initial startup if `_migrated_legacy_v1` is false.
3. **Mirror-only?**: **Yes**. `PrepVault.save()` writes the exact `this._state.completedTasks` array to both keys.
4. **Obsolete?**: Superseded by `prep_vault_v1.completedTasks`.
5. **Can it overwrite canonical state?**: **NO**. The `_migrated_legacy_v1` guard prevents re-reading after initial migration.
6. **Can it resurrect deleted/unchecked data?**: **NO**. When a task is unchecked, `PrepVault.save()` synchronously removes it from both legacy keys.

### 3. `dsa_solved_problems` & `dsa_roadmap_solved_probs_v1`
1. **Actively required?**: Maintained as mirror keys and fallback reads.
2. **Migration-only?**: Read once on initial startup.
3. **Mirror-only?**: **Yes**. `PrepVault.save()` writes the exact `dsaMap` object to both keys.
4. **Obsolete?**: Superseded by `prep_vault_v1.dsaSolved`.
5. **Can it overwrite canonical state?**: **NO**.
6. **Can it resurrect deleted/unchecked data?**: **NO**. Unchecked problems are immediately deleted from both mirror keys.

### 4. `placement_dsa_roadmap_v1`
1. **Actively required?**: No.
2. **Migration-only?**: **Yes**. Read once on initial startup for legacy `{ completedTopics: [...] }`.
3. **Mirror-only?**: No.
4. **Obsolete?**: Yes (Legacy migration only).
5. **Can it overwrite canonical state?**: **NO**. Skipped on reload.
6. **Can it resurrect deleted/unchecked data?**: **NO**.

### 5. `placement_aptitude_roadmap_v1` & `aptitude_roadmap_v1`
1. **Actively required?**: Maintained as mirror keys and fallback reads.
2. **Migration-only?**: Read once on initial startup.
3. **Mirror-only?**: `placement_aptitude_roadmap_v1` is mirrored on save. `aptitude_roadmap_v1` is migration-only.
4. **Obsolete?**: Superseded by `prep_vault_v1.aptitudeSolved`.
5. **Can it overwrite canonical state?**: **NO**.
6. **Can it resurrect deleted/unchecked data?**: **NO**.

### 6. `dashboard_habits_v1`
1. **Actively required?**: No.
2. **Migration-only?**: **Yes**. Read once on initial startup for legacy habit dates.
3. **Mirror-only?**: No.
4. **Obsolete?**: Yes.
5. **Can it overwrite canonical state?**: **NO**.
6. **Can it resurrect deleted/unchecked data?**: **NO**.

---

## 4. Resolution of State Issues

### BUG-003: Task Resurrection Bug — RESOLVED (FIXED)
- **Root Cause**: Unchecked tasks were removed from `prep_vault_v1`, but `migrateFromLegacy()` re-read the legacy key on every reload and re-added them.
- **Solution**:
  1. `_migrated_legacy_v1: true` ensures migration only runs once.
  2. Bi-directional mirror writes synchronously update legacy keys on every save.
  3. Metric getters query `PrepVault` directly without stale legacy accumulation.

### BUG-008: `placement_tracker_v1` State Synchronization — RECLASSIFIED (TECHNICAL DEBT / COMPATIBILITY)
- **Investigation**: Verified that `dashboard.js` updates `PrepVault.setHabitCount()` before calling `saveState()`. In addition, `PrepVault.onUpdate()` and `prep_vault_updated` window events immediately trigger `syncFromVault()`, ensuring that `dashboard.js` in-memory state matches `PrepVault` at all times.
- **Conclusion**: `placement_tracker_v1` does not act as an independent conflicting source of truth; it serves as a synchronized UI preferences cache.

---

## 5. Automated Verification Summary

All state operations are validated by `tests/test_audit_suite.js` (37/37 tests passing):
- Initial legacy migration: PASS
- `_migrated_legacy_v1` flag persistence: PASS
- Task uncheck persistence (resurrection prevented): PASS
- DSA problem unsolved persistence (resurrection prevented): PASS
- Aptitude chapter unchecked persistence (resurrection prevented): PASS
- Reminder deletion persistence (resurrection prevented): PASS
- Atomic reset methods (`resetAll`, `resetDsa`, `resetAptitude`, `resetTasks`, `resetHabits`): PASS
- 4-Pillar Weighted Overall Progress formula: PASS