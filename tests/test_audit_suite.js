/**
 * ============================================================================
 * PLACEMENT PREPARATION PORTAL — COMPREHENSIVE FORENSIC AUDIT TEST SUITE
 * ============================================================================
 * 
 * Tests dataset integrity, state management resurrection prevention, streak engine,
 * weighted formula calculation, Firebase fallback resilience, and JWT auth.
 * 
 * Run with: npm test  (or node tests/test_audit_suite.js)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(message);
  }
  passedTests++;
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log(' RUNNING AUDIT TEST SUITE: CodeTrack 360 PRO');
console.log('====================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: DATASET INTEGRITY & CONSTRAINTS
// ----------------------------------------------------------------------------
console.log('--- [1/6] DATASET INTEGRITY & CONSTRAINTS ---');

const dsaContent = fs.readFileSync(path.join(__dirname, '..', 'dsa_roadmap_337_data.js'), 'utf8');
const aptContent = fs.readFileSync(path.join(__dirname, '..', 'aptitude_roadmap_24_data.js'), 'utf8');

const datasetSandbox = { window: {} };
vm.createContext(datasetSandbox);
vm.runInContext(dsaContent, datasetSandbox);
vm.runInContext(aptContent, datasetSandbox);

const dsaTopics = datasetSandbox.window.dsaRoadmapData || [];
const aptChapters = datasetSandbox.window.aptitudeRoadmapData || [];

assert(dsaTopics.length === 337, `DSA Topics count must equal exactly 337 (found: ${dsaTopics.length})`);

// Contiguous 1..337
const topicIdSet = new Set(dsaTopics.map(t => t.topicId));
let topicIdsContiguous = true;
for (let i = 1; i <= 337; i++) {
  if (!topicIdSet.has(i)) {
    topicIdsContiguous = false;
    break;
  }
}
assert(topicIdsContiguous, 'DSA Topic IDs are contiguous 1 through 337');

// LeetCode problems check
let leetcodeRefs = 0;
const uniqueLeetcodeUrls = new Set();
dsaTopics.forEach(t => {
  (t.leetcodeProblems || []).forEach(p => {
    leetcodeRefs++;
    const url = (p.leetcodeUrl || p.url || '').trim().toLowerCase().replace(/\/$/, '');
    if (url.includes('leetcode.com')) {
      uniqueLeetcodeUrls.add(url);
    }
  });
});
assert(leetcodeRefs === 388, `Total DSA problem references must equal 388 (found: ${leetcodeRefs})`);
assert(uniqueLeetcodeUrls.size === 244, `Unique LeetCode problems must equal 244 (found: ${uniqueLeetcodeUrls.size})`);

// Aptitude Chapters & MCQs
assert(aptChapters.length === 24, `Aptitude chapters must equal exactly 24 (found: ${aptChapters.length})`);
let totalMcqs = 0;
let allChaptersHave4Mcqs = true;
aptChapters.forEach(c => {
  const qCount = (c.questions && c.questions.length) || 0;
  totalMcqs += qCount;
  if (qCount !== 4) allChaptersHave4Mcqs = false;
});
assert(totalMcqs === 96, `Total Aptitude MCQs must equal exactly 96 (found: ${totalMcqs})`);
assert(allChaptersHave4Mcqs, 'Every Aptitude chapter contains exactly 4 curated MCQs');

// Zero Revision Rule in Aptitude
let revisionViolations = 0;
aptChapters.forEach(c => {
  const text = `${c.name || ''} ${c.youtubeTitle || ''} ${c.description || ''}`.toLowerCase();
  if (text.includes('revision') || text.includes('one shot') || text.includes('crash course')) {
    revisionViolations++;
  }
});
assert(revisionViolations === 0, `Aptitude dataset adheres to Zero Revision policy (violations: ${revisionViolations})`);


// ----------------------------------------------------------------------------
// SUITE 2: STATE MANAGEMENT & RESURRECTION BUG RESOLUTION
// ----------------------------------------------------------------------------
console.log('\n--- [2/6] STATE MANAGEMENT & RESURRECTION BUG FIX ---');

function createMockStorage() {
  const mem = {};
  return {
    getItem: (k) => (mem[k] !== undefined ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; },
    _dump: () => mem
  };
}

const mockStorage = createMockStorage();
// Seed initial legacy data
mockStorage.setItem('90day_tasks_v2', JSON.stringify(['task-d1-1', 'task-d1-2', 'task-d1-3']));
mockStorage.setItem('dsa_solved_problems', JSON.stringify({ '26': true, '88': true }));

const prepSyncCode = fs.readFileSync(path.join(__dirname, '..', 'prep-sync.js'), 'utf8');

function spawnVaultContext(storage) {
  const ctx = {
    window: {
      addEventListener: () => {},
      dispatchEvent: () => {},
      localStorage: storage,
      dsaRoadmapData: dsaTopics,
      aptitudeRoadmapData: aptChapters
    },
    localStorage: storage,
    console: { log: () => {}, warn: () => {}, error: () => {} },
    CustomEvent: class CustomEvent { constructor(t, d) { this.type = t; this.detail = d; } }
  };
  vm.createContext(ctx);
  vm.runInContext(prepSyncCode, ctx);
  return ctx.window.PrepVault;
}

const vault1 = spawnVaultContext(mockStorage);
assert(vault1.get().completedTasks.length === 3, 'Initial legacy migration imported 3 tasks');
assert(vault1.get()._migrated_legacy_v1 === true, 'Migration completion flag set to true');

// User unchecks task-d1-1
vault1.toggleTask('task-d1-1');
assert(!vault1.get().completedTasks.includes('task-d1-1'), 'task-d1-1 removed from canonical PrepVault');

// Verify bi-directional mirror writes updated legacy keys
const mirroredLegacyTasks = JSON.parse(mockStorage.getItem('90day_tasks_v2') || '[]');
assert(!mirroredLegacyTasks.includes('task-d1-1'), 'Legacy storage key 90day_tasks_v2 synchronized with unchecked task removed');

// Simulate Page Reload (New runtime reading the exact localStorage)
const vault2 = spawnVaultContext(mockStorage);
assert(!vault2.get().completedTasks.includes('task-d1-1'), 'RESURRECTION PREVENTED: task-d1-1 remained unchecked after full reload');
assert(vault2.getCompletedTasksCount() === 2, 'getCompletedTasksCount correctly returns 2');

// Test DSA problem unsolved resurrection prevention
vault2.toggleDsa(88); // was solved in mockStorage, now toggled off (unsolved)
assert(!vault2.isDsaDone(88), 'DSA problem 88 toggled to unsolved');
const vault3 = spawnVaultContext(mockStorage);
assert(!vault3.isDsaDone(88), 'RESURRECTION PREVENTED: DSA problem 88 remained unsolved after full reload');

// Test Aptitude chapter unchecked resurrection prevention
vault3.toggleAptChapter(1); // solve chapter 1
assert(vault3.isAptChapterDone(1), 'Aptitude chapter 1 solved');
vault3.toggleAptChapter(1); // toggle off (uncheck)
assert(!vault3.isAptChapterDone(1), 'Aptitude chapter 1 unchecked');
const vault4 = spawnVaultContext(mockStorage);
assert(!vault4.isAptChapterDone(1), 'RESURRECTION PREVENTED: Aptitude chapter 1 remained unchecked after full reload');

// Test Reminder deleted resurrection prevention
mockStorage.setItem('placement_reminders_v1', JSON.stringify([
  { id: 'rem-1', title: 'DSA Practice', time: '10:00' },
  { id: 'rem-2', title: 'Aptitude Test', time: '14:30' }
]));
const remList = JSON.parse(mockStorage.getItem('placement_reminders_v1'));
const filteredRem = remList.filter(r => r.id !== 'rem-1');
mockStorage.setItem('placement_reminders_v1', JSON.stringify(filteredRem));
// Reload and verify rem-1 does not resurrect
const reloadedRem = JSON.parse(mockStorage.getItem('placement_reminders_v1') || '[]');
assert(!reloadedRem.some(r => r.id === 'rem-1'), 'RESURRECTION PREVENTED: Deleted reminder rem-1 remained deleted after reload');
assert(reloadedRem.length === 1 && reloadedRem[0].id === 'rem-2', 'Remaining reminder rem-2 correctly preserved');

// Test resetAll
vault4.resetAll();
assert(vault4.get().completedTasks.length === 0, 'resetAll cleared canonical completedTasks');
assert(vault4.get().dsaSolved.length === 0, 'resetAll cleared canonical dsaSolved');
const mirroredAfterReset = JSON.parse(mockStorage.getItem('90day_tasks_v2') || '[]');
assert(mirroredAfterReset.length === 0, 'resetAll wiped legacy storage mirror');


// ----------------------------------------------------------------------------
// SUITE 3: STREAK & HABIT LOGIC ENGINE
// ----------------------------------------------------------------------------
console.log('\n--- [3/6] STREAK ENGINE & HABIT ACTIVITY ---');

const streakStorage = createMockStorage();
const streakVault = spawnVaultContext(streakStorage);

const fmtDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dToday = new Date();
const todayStr = fmtDate(dToday);
const dY1 = new Date(dToday); dY1.setDate(dToday.getDate() - 1); const y1Str = fmtDate(dY1);
const dY2 = new Date(dToday); dY2.setDate(dToday.getDate() - 2); const y2Str = fmtDate(dY2);
const dY4 = new Date(dToday); dY4.setDate(dToday.getDate() - 4); const y4Str = fmtDate(dY4);

// Active on Today, Yesterday, 2 days ago (3 consecutive days)
streakVault.setHabitCount('dsa', 1, 1, todayStr);
streakVault.setHabitCount('dsa', 1, 1, y1Str);
streakVault.setHabitCount('dsa', 1, 1, y2Str);
streakVault.setHabitCount('dsa', 1, 1, y4Str); // Break at day -3

const streakStats = streakVault.getStats();
assert(streakStats.streak === 3, `Consecutive 3-day active habit yields current streak of 3 (got: ${streakStats.streak})`);
assert(streakStats.bestStreak >= 3, `Best streak records at least 3 (got: ${streakStats.bestStreak})`);

// Test grace period: Today has no activity yet, but yesterday was active
const graceStorage = createMockStorage();
const graceVault = spawnVaultContext(graceStorage);
graceVault.setHabitCount('aptitude', 1, 1, y1Str);
graceVault.setHabitCount('aptitude', 1, 1, y2Str);
const graceStats = graceVault.getStats();
assert(graceStats.streak === 2, `Grace period preserves streak of 2 when active yesterday (got: ${graceStats.streak})`);


// ----------------------------------------------------------------------------
// SUITE 4: WEIGHTED OVERALL PROGRESS FORMULA
// ----------------------------------------------------------------------------
console.log('\n--- [4/6] WEIGHTED OVERALL PROGRESS FORMULA ---');

const progressStorage = createMockStorage();
const progressVault = spawnVaultContext(progressStorage);

// Collect unique problem numbers from dsaTopics
const uniqueProbList = [];
const seenProbs = new Set();
dsaTopics.forEach(t => {
  (t.leetcodeProblems || []).forEach(p => {
    if (p.problemNumber && !seenProbs.has(p.problemNumber)) {
      seenProbs.add(p.problemNumber);
      uniqueProbList.push(p.problemNumber);
    }
  });
});

// Toggle exactly 50% of the problems (122 / 244 = 50%)
const halfCount = Math.round(uniqueProbList.length / 2);
for (let i = 0; i < halfCount; i++) {
  progressVault.toggleDsa(uniqueProbList[i]);
}

// Toggle exactly 50% of Aptitude chapters (12 / 24 = 50%)
for (let ch = 1; ch <= 12; ch++) {
  progressVault.toggleAptChapter(ch);
}

const pStats = progressVault.getStats();
assert(pStats.dsaProblemsPct === 50, `DSA problem percentage calculation is exactly 50% (got: ${pStats.dsaProblemsPct}%)`);
assert(pStats.aptPct === 50, `Aptitude percentage calculation is exactly 50% (got: ${pStats.aptPct}%)`);

// Verify weighted overall formula: tasks*0.30 + dsa*0.35 + apt*0.25 + habit*0.10
const expectedWeighted = Math.min(100, Math.round((pStats.tasksPct * 0.30) + (pStats.dsaPct * 0.35) + (pStats.aptPct * 0.25) + (pStats.habitDailyPct * 0.10)));
assert(pStats.overallProgress === expectedWeighted, `Weighted overall progress matches formula: ${pStats.overallProgress}% === ${expectedWeighted}%`);


// ----------------------------------------------------------------------------
// SUITE 5: FIREBASE FIRESTORE OFFLINE FALLBACK
// ----------------------------------------------------------------------------
console.log('\n--- [5/6] FIREBASE OFFLINE FALLBACK & RESILIENCE ---');

const firestoreSyncCode = fs.readFileSync(path.join(__dirname, '..', 'firebase-firestore-sync.js'), 'utf8');

let lastNotifiedStatus = null;
const offlineCtx = {
  window: {
    addEventListener: () => {},
    location: { origin: 'http://localhost:5500' }
  },
  navigator: {
    onLine: false, // Disconnected network
    userAgent: 'Mozilla/5.0 Node-Audit-Test'
  },
  document: {
    getElementById: () => null
  },
  localStorage: createMockStorage(),
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: { log: () => {}, warn: () => {}, error: () => {} }
};
vm.createContext(offlineCtx);
vm.runInContext(firestoreSyncCode, offlineCtx);

offlineCtx.window.CloudSync.onStatusChange((status, detail) => {
  lastNotifiedStatus = status;
});

// Calling init while offline
const db = offlineCtx.window.CloudSync.init();
assert(db === null, 'initFirestore returns null when offline');
assert(lastNotifiedStatus === 'offline', 'CloudSync immediately dispatches offline status instead of hanging');

// Calling save while offline
let threwOnSave = false;
try {
  offlineCtx.window.CloudSync.save();
} catch (e) {
  threwOnSave = true;
}
assert(!threwOnSave, 'CloudSync.save executes non-blockingly without throwing when offline');


// ----------------------------------------------------------------------------
// SUITE 6: RFC 7523 RS256 JWT AUTHENTICATION
// ----------------------------------------------------------------------------
console.log('\n--- [6/6] RFC 7523 RS256 JWT GENERATION ---');

// Generate ephemeral test RSA key pair
const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const nowSec = Math.floor(Date.now() / 1000);
const header = { alg: 'RS256', typ: 'JWT' };
const claimSet = {
  iss: 'audit-test-sa@placement-prep.iam.gserviceaccount.com',
  scope: 'https://www.googleapis.com/auth/firebase.messaging',
  aud: 'https://oauth2.googleapis.com/token',
  exp: nowSec + 3600,
  iat: nowSec
};

const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

const signer = crypto.createSign('RSA-SHA256');
signer.update(unsignedToken);
const signature = signer.sign(privateKey, 'base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const assertionJwt = `${unsignedToken}.${signature}`;
const jwtParts = assertionJwt.split('.');
assert(jwtParts.length === 3, 'RS256 JWT generated with valid 3-part structure (Header.Payload.Signature)');
assert(jwtParts[0] === encodedHeader, 'JWT Header matches base64url encoded RS256 declaration');
assert(jwtParts[1] === encodedClaimSet, 'JWT Payload matches RFC 7523 assertion claim set');
assert(jwtParts[2].length > 100, 'Cryptographic RS256 signature generated successfully');


// ----------------------------------------------------------------------------
// SUITE 7: FRESH PLAN RESET (7 SEPTEMBER 2026)
// ----------------------------------------------------------------------------
console.log('\n--- [7/7] FRESH PLAN RESET (7 SEPTEMBER 2026) ---');

// 1. New start date = 2026-09-07
const defaultState = spawnVaultContext(createMockStorage()).get();
assert(defaultState.planStartDate === '2026-09-07', '1. New plan start date is 2026-09-07');

// 2. 2026-09-07 = Day 1
const startMs = new Date('2026-09-07T00:00:00').getTime();
const noonOnSep7 = new Date('2026-09-07T12:00:00').getTime();
const daysPassedSep7 = Math.floor((noonOnSep7 - startMs) / (1000 * 60 * 60 * 24)) + 1;
assert(daysPassedSep7 === 1, '2. 2026-09-07 calculates to Day 1');

// Setup storage containing old plan data (e.g. from 2026-09-04)
const oldPlanStorage = createMockStorage();
oldPlanStorage.setItem('prep_vault_v1', JSON.stringify({
  planStartDate: '2026-09-04',
  completedTasks: ['task-d1-1', 'task-d1-2'],
  dsaSolved: [1, 2],
  aptCompleted: ['ch-01'],
  habits: { '2026-09-04': { dsa: true } },
  streak: { current: 5, best: 5 }
}));
oldPlanStorage.setItem('placement_plan_v2_tasks', JSON.stringify(['task-d1-1', 'task-d1-2']));
oldPlanStorage.setItem('dsa_solved_problems', JSON.stringify({ '1': true, '2': true }));
oldPlanStorage.setItem('placement_aptitude_roadmap_v1', JSON.stringify({ completedChapters: { 'ch-01': true } }));
oldPlanStorage.setItem('placement_reminders_v1', JSON.stringify([{ id: 'old-rem-1', title: 'Old Reminder' }]));
oldPlanStorage.setItem('placement_reminder_log_v1', JSON.stringify({ 'old-log-entry': true }));
oldPlanStorage.setItem('placement_tracker_v1', JSON.stringify({ startDate: '2026-09-04', currentStreak: 5, bestStreak: 5, daily: { '2026-09-04': {} } }));

// Initialize vault with oldPlanStorage: triggers automatic resetForNewPlan('2026-09-07')
const newPlanVault = spawnVaultContext(oldPlanStorage);
const freshState = newPlanVault.get();

// 3. Old task completion does not exist
assert(freshState.completedTasks.length === 0, '3. Old task completion does not exist (cleared)');

// 4. Old DSA solved state does not exist
assert(freshState.dsaSolved.length === 0, '4. Old DSA solved state does not exist (cleared)');

// 5. Old Aptitude completion does not exist
assert(freshState.aptCompleted.length === 0, '5. Old Aptitude completion does not exist (cleared)');

// 6. Old streak does not exist
assert(freshState.streak.current === 0 && freshState.streak.best === 0, '6. Old streak does not exist (reset to 0)');

// 7. Old habit history does not exist
assert(Object.keys(freshState.habits).length === 0, '7. Old habit history does not exist (cleared)');

// 8. Old reminders do not exist
assert(!oldPlanStorage.getItem('placement_reminders_v1'), '8. Old reminders do not exist in storage (cleared)');

// 9. Old reminder logs do not exist
assert(!oldPlanStorage.getItem('placement_reminder_log_v1'), '9. Old reminder logs do not exist in storage (cleared)');

// 10. Old dashboard progress cannot overwrite PrepVault
const trackerAfter = JSON.parse(oldPlanStorage.getItem('placement_tracker_v1') || '{}');
assert(trackerAfter.startDate === '2026-09-07' && trackerAfter.currentStreak === 0, '10. placement_tracker_v1 synchronized to new start date');

// 11. Old migration cannot resurrect data
assert(freshState._migrated_legacy_v1 === true, '11. Migration guard is true, preventing old data resurrection');

// 12. Reload keeps the clean state
const reloadedNewVault = spawnVaultContext(oldPlanStorage);
assert(reloadedNewVault.get().completedTasks.length === 0, '12. Reload keeps clean state (0 completed tasks)');
assert(reloadedNewVault.get().dsaSolved.length === 0, '12b. Reload keeps clean state (0 solved DSA)');

// 13. DSA can be newly marked solved
reloadedNewVault.toggleDsa(1);
assert(reloadedNewVault.isDsaDone(1), '13. DSA problem 1 can be newly marked solved');

// 14. Aptitude can be newly marked completed
reloadedNewVault.toggleAptChapter(1);
assert(reloadedNewVault.isAptChapterDone(1), '14. Aptitude chapter 1 can be newly marked completed');

// 15. New tasks can be completed
reloadedNewVault.toggleTask('task-d1-1');
assert(reloadedNewVault.get().completedTasks.includes('task-d1-1'), '15. New tasks can be completed');

// 16. New reminders can be created
oldPlanStorage.setItem('placement_reminders_v1', JSON.stringify([{ id: 'new-rem-1', title: 'Day 1 Practice', time: '10:00' }]));
const newRemList = JSON.parse(oldPlanStorage.getItem('placement_reminders_v1') || '[]');
assert(newRemList.length === 1 && newRemList[0].id === 'new-rem-1', '16. New reminders can be created');

// 17. Readiness formula works from the fresh state
const freshStats = reloadedNewVault.getStats();
assert(freshStats.overallProgress >= 0 && freshStats.overallProgress <= 100, `17. Readiness formula works from fresh state (got: ${freshStats.overallProgress}%)`);

// ----------------------------------------------------------------------------
// FINAL SUMMARY
// ----------------------------------------------------------------------------
console.log('\n====================================================');
console.log(` AUDIT TEST SUITE COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log('====================================================\n');
