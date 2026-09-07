const { test, expect } = require('@playwright/test');

test.describe('Placement Preparation Portal — Full E2E Test Suite', () => {

  // 1. INDEX.HTML: Load, Console Errors, Day 1 Display
  test('1. index.html loads cleanly with zero console errors and correct Day 1 calculation', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('ERR_CONNECTION_REFUSED')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    expect(consoleErrors).toHaveLength(0);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Verify Day 1 / 119 countdown display
    const dayBadge = page.locator('#cd-days-gone, #cd-days-left, #count-days').first();
    await expect(dayBadge).toBeVisible();
    const badgeText = await dayBadge.textContent();
    expect(badgeText).toMatch(/Day\s*1|119/i);
  });

  // 2. DASHBOARD: Load, Bento Analytics, & Zero Errors
  test('2. dashboard.html loads cleanly with Bento analytics and no runtime exceptions', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/dashboard.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    expect(consoleErrors).toHaveLength(0);
    await expect(page.locator('body')).toBeVisible();

    // Verify dashboard content loads (either redirected index.html or dashboard grid)
    const keyElement = page.locator('#cd-days-gone, #cd-days-left, #cloudSyncBadge, .grid').first();
    await expect(keyElement).toBeVisible();
  });

  // 3. ROADMAP: Load, Phase Navigation, Zero Errors
  test('3. roadmap.html loads with phase tabs and clean navigation', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/roadmap.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    expect(consoleErrors).toHaveLength(0);

    // Navigate to Phase 2
    await page.click('#tab-page-phase-2');
    await expect(page.locator('#page-phase-2')).toHaveClass(/active/);

    // Navigate to LeetCode Hub
    await page.click('#tab-page-leetcode');
    await expect(page.locator('#page-leetcode')).toHaveClass(/active/);

    // Navigate to Aptitude Hub
    await page.click('#tab-page-aptitude');
    await expect(page.locator('#page-aptitude')).toHaveClass(/active/);

    // Navigate to MCQs Hub
    await page.click('#tab-page-mcqs');
    await expect(page.locator('#page-mcqs')).toHaveClass(/active/);
  });

  // 4. TASK CHECKBOX: Toggle & Persistence
  test('4. Task checkbox toggles completed state and persists across reload', async ({ page }) => {
    await page.goto('/roadmap.html#page-overview');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    // Click first task in overview
    const firstTask = page.locator('.task-row-card').first();
    await expect(firstTask).toBeVisible();
    const taskId = await firstTask.getAttribute('data-task-id');
    expect(taskId).toBeTruthy();

    // Toggle task ON
    await firstTask.click();
    await expect(firstTask).toHaveClass(/completed/);

    // Reload page and check persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    const reloadedTask = page.locator(`.task-row-card[data-task-id="${taskId}"]`);
    await expect(reloadedTask).toHaveClass(/completed/);

    // Toggle task OFF (uncheck)
    await reloadedTask.click();
    await expect(reloadedTask).not.toHaveClass(/completed/);

    // Reload and verify task remains unchecked (no resurrection)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    const uncheckedTask = page.locator(`.task-row-card[data-task-id="${taskId}"]`);
    await expect(uncheckedTask).not.toHaveClass(/completed/);
  });

  // 5. DSA SOLVE / UNSOLVE & FILTERING
  test('5. DSA solve/unsolve updates counter and category filter removes non-matching cards', async ({ page }) => {
    await page.goto('/roadmap.html#page-leetcode');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    // Verify Default Filter is 'Arrays': #01 is hidden and #03 is visible immediately on load
    const card1 = page.locator('#dsa-card-1');
    await expect(card1).toBeHidden();

    const card3 = page.locator('#dsa-card-3');
    await expect(card3).toBeVisible();

    // Verify Card Layout controls exist and function
    const layoutControls = page.locator('#dsa-size-control-group');
    await expect(layoutControls).toBeVisible();
    const decBtn = page.locator('#dsa-btn-col-dec');
    await decBtn.click();
    const badge = page.locator('#dsa-grid-cols-badge');
    await expect(badge).toHaveText('3 Cols');

    // Toggle solve on topic #3
    const markDoneBtn = page.locator('#dsa-top-mark-3');
    await markDoneBtn.click();
    await expect(markDoneBtn).toHaveClass(/done/);

    // Reload and verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    await page.evaluate(() => window.dsaSelectCategory('Arrays'));
    const reloadedMarkDone = page.locator('#dsa-top-mark-3');
    await expect(reloadedMarkDone).toHaveClass(/done/);

    // Unsolve and verify persistence
    await reloadedMarkDone.click();
    await expect(reloadedMarkDone).not.toHaveClass(/done/);
  });

  // 6. APTITUDE SOLVE & PRACTICE MCQS
  test('6. Practice MCQs renders 96 questions, validates options and shows formula explanation', async ({ page }) => {
    await page.goto('/roadmap.html#page-mcqs');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    // Verify 96 question cards
    const qCount = await page.locator('.apt-q-card').count();
    expect(qCount).toBe(96);

    // Verify horizontal stat strip
    const statTotal = page.locator('#mcq-stat-total');
    await expect(statTotal).toHaveText('96');

    // Ensure clean state for question test
    await page.evaluate(() => {
      if (window.aptSavedState) {
        window.aptSavedState.userAnswers = {};
        window.aptSavedState.solvedQuestions = {};
        if (typeof window.saveAptState === 'function') window.saveAptState();
      }
      if (typeof window.renderMcqPage === 'function') window.renderMcqPage();
    });
    await page.waitForTimeout(200);

    // Click first enabled option of question 1
    const firstOpt = page.locator('.apt-opt-btn:not([disabled])').first();
    await firstOpt.click();

    // Verify question gets answered state
    const firstQCard = page.locator('.apt-q-card').first();
    const hasAnsweredClass = await firstQCard.evaluate(el => el.classList.contains('is-correct') || el.classList.contains('is-incorrect'));
    expect(hasAnsweredClass).toBe(true);

    // Verify explanation box is visible
    const firstExp = page.locator('.apt-explanation-box').first();
    await expect(firstExp).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    const reloadedQCard = page.locator('.apt-q-card').first();
    const stillAnswered = await reloadedQCard.evaluate(el => el.classList.contains('is-correct') || el.classList.contains('is-incorrect'));
    expect(stillAnswered).toBe(true);
  });

  // 7. REMINDER CREATE & DELETE
  test('7. Reminders can be created, deleted and persist without resurrection', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    // Create a reminder via ReminderEngine
    const createdId = await page.evaluate(() => {
      if (window.ReminderEngine && typeof ReminderEngine.addReminder === 'function') {
        const rem = ReminderEngine.addReminder({
          title: 'Playwright Test Reminder',
          category: 'DSA',
          time: '18:00',
          days: [1, 2, 3],
          notes: 'Automated test note'
        });
        return rem ? rem.id : null;
      }
      return null;
    });

    expect(createdId).toBeTruthy();

    // Verify reminder exists in storage
    const storedCount = await page.evaluate(() => {
      const list = JSON.parse(localStorage.getItem('placement_reminders_v1') || '[]');
      return list.length;
    });
    expect(storedCount).toBeGreaterThan(0);

    // Delete reminder
    await page.evaluate((id) => {
      if (window.ReminderEngine && typeof ReminderEngine.deleteReminder === 'function') {
        ReminderEngine.deleteReminder(id);
      }
    }, createdId);

    // Reload page and verify reminder remains deleted
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const afterReloadCount = await page.evaluate(() => {
      const list = JSON.parse(localStorage.getItem('placement_reminders_v1') || '[]');
      return list.length;
    });
    expect(afterReloadCount).toBe(0);
  });

  // 8. CLOUDSYNC STATUS & OFFLINE / ONLINE RECOVERY
  test('8. CloudSync handles status indicators and offline / online recovery gracefully', async ({ page, context }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    // Verify CloudSync API exists
    const cloudSyncAvailable = await page.evaluate(() => typeof window.CloudSync !== 'undefined');
    expect(cloudSyncAvailable).toBe(true);

    // Verify initial status badge
    const badge = page.locator('#cloudSyncBadge, #cloudSyncStatus').first();
    await expect(badge).toBeVisible();

    // Simulate Offline Mode
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForTimeout(300);

    // Check offline status text
    const offlineStatus = await page.evaluate(() => {
      return document.getElementById('cloudSyncStatus')?.textContent || '';
    });
    expect(offlineStatus).toMatch(/offline/i);

    // Trigger save while offline (must not throw or crash)
    await page.evaluate(() => {
      window.CloudSync.save();
    });
    await page.waitForTimeout(300);

    // Restore Online Mode
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await page.waitForTimeout(800);

    const onlineStatus = await page.evaluate(() => {
      return document.getElementById('cloudSyncStatus')?.textContent || '';
    });
    expect(onlineStatus).toBeTruthy();
  });

  // 9. PHASE DAY CARD HIERARCHY (WEEKS 4–13 CHECK)
  test('9. Day-by-day cards in all weeks have correct parent hierarchy with zero nested cards', async ({ page }) => {
    await page.goto('/roadmap.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const badWeeks = await page.evaluate(() => {
      const accordions = Array.from(document.querySelectorAll('.week-accordion'));
      return accordions.map(w => {
        const days = Array.from(w.querySelectorAll('.day-card'));
        const badDays = days.filter(d => d.parentElement.className !== 'days-grid');
        return {
          id: w.id,
          badCount: badDays.length
        };
      }).filter(r => r.badCount > 0);
    });

    expect(badWeeks).toHaveLength(0);
  });

  // 10. APTITUDE CATEGORY + SEARCH FILTERS
  test('10. Aptitude filters correctly hide non-matching chapters without CSS leakage', async ({ page }) => {
    await page.goto('/roadmap.html#page-aptitude');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    // Select Arithmetic
    await page.evaluate(() => window.aptSelectCategory('Arithmetic'));
    await page.waitForTimeout(300);

    const visibleCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.apt-chapter-card')).filter(c => c.offsetParent !== null).length;
    });
    expect(visibleCount).toBe(12);

    // Reset and search
    await page.evaluate(() => {
      window.aptSelectCategory('all');
      const input = document.getElementById('apt-search-input');
      input.value = 'profit';
      window.aptApplyFilters();
    });
    await page.waitForTimeout(300);

    const searchCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.apt-chapter-card')).filter(c => c.offsetParent !== null).length;
    });
    expect(searchCount).toBe(2);
  });

  // 11. INTERACTIVE SYNC BUTTON CLICK
  test('11. Clicking CloudSync badge triggers active synchronization and reflects status', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const badge = page.locator('#cloudSyncBadge').first();
    await expect(badge).toBeVisible();

    // Click the badge to trigger manual sync
    await badge.click();
    await page.waitForTimeout(500);

    // Status text should be active
    const statusText = await page.locator('#cloudSyncStatus').textContent();
    expect(statusText).toMatch(/synced|syncing|connecting|offline/i);
  });

  // 12. PWA MANIFEST VALIDATION
  test('12. PWA Manifest exists and contains required placement planner properties', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
  });

});
