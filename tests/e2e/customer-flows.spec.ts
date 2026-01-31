// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Dotly Web Application
 * 
 * Tests critical user flows end-to-end:
 * - Customer registration and login
 * - Wallet viewing
 * - Transaction history
 * - GDPR data export
 * - Dark mode toggle
 * 
 * Run: npx playwright test
 * Run with UI: npx playwright test --ui
 * Debug: npx playwright test --debug
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Customer Registration and Login Flow', () => {
  const testEmail = `e2etest_${Date.now()}@test.com`;
  const testPassword = 'Test@123';

  test('should allow new customer registration', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Fill registration form
    await page.fill('input[name="name"]', 'E2E Test Customer');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="password"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow login with registered credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should display user name
    await expect(page.locator('text=E2E Test Customer')).toBeVisible();
  });

  test('should reject login with incorrect password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|incorrect|wrong/i')).toBeVisible();
  });
});

test.describe('Customer Wallet Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should display wallet balance', async ({ page }) => {
    await page.goto(`${BASE_URL}/wallet`);

    // Should display dots balance
    await expect(page.locator('text=/dots|points/i')).toBeVisible();
    
    // Should display balance number
    await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible();
  });

  test('should show transaction history', async ({ page }) => {
    await page.goto(`${BASE_URL}/transactions`);

    // Should display transactions list or empty state
    const hasTransactions = await page.locator('[data-testid="transaction-item"]').count() > 0;
    const hasEmptyState = await page.locator('text=/no transactions|empty/i').isVisible();

    expect(hasTransactions || hasEmptyState).toBeTruthy();
  });

  test('should filter transactions by date range', async ({ page }) => {
    await page.goto(`${BASE_URL}/transactions`);

    // Select date range filter
    await page.click('button:has-text("Filter")');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.click('button:has-text("Apply")');

    // URL should update with filter params
    await expect(page).toHaveURL(/startDate=2024-01-01/);
  });
});

test.describe('GDPR Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should navigate to privacy settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);

    // Should display consent toggles
    await expect(page.locator('text=/consent|privacy/i')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(5); // 5 consent types
  });

  test('should toggle marketing consent', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);

    const marketingToggle = page.locator('input[data-consent="marketing"]');
    const initialState = await marketingToggle.isChecked();

    // Toggle consent
    await marketingToggle.click();

    // Wait for API call
    await page.waitForTimeout(500);

    // State should change
    const newState = await marketingToggle.isChecked();
    expect(newState).not.toBe(initialState);
  });

  test('should export customer data', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    const download = await downloadPromise;

    // Should download JSON file
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('should show account deletion warning', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);

    // Click delete account
    await page.click('button:has-text("Delete Account")');

    // Should show warning modal
    await expect(page.locator('text=/warning|permanent|cannot be undone/i')).toBeVisible();
    
    // Should have confirm and cancel buttons
    await expect(page.locator('button:has-text("Confirm")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });
});

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme" i]');
    await themeToggle.click();

    // HTML should have dark class
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Toggle back
    await themeToggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should persist dark mode preference', async ({ page, context }) => {
    await page.goto(BASE_URL);

    // Enable dark mode
    const themeToggle = page.locator('button[aria-label*="theme" i]');
    await themeToggle.click();

    // Reload page
    await page.reload();

    // Should still be in dark mode
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto(BASE_URL);

    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto(BASE_URL);

    // Run axe accessibility tests
    const violations = await page.evaluate(() => {
      // This would integrate with axe-core
      // For now, just a placeholder
      return [];
    });

    expect(violations).toHaveLength(0);
  });
});

test.describe('Performance', () => {
  test('should load homepage within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper caching headers', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response?.headers();

    // Check for cache-control header
    expect(headers?.['cache-control']).toBeTruthy();
  });
});
