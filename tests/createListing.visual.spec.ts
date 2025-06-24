import { test, expect } from '@playwright/test';

test.describe('Create Listing Dark UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8085/login');
    await page.fill('input[name="username"]', 'troyaxjl@gmail.com');
    await page.fill('input[name="password"]', 'Zhehkd.12351');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.goto('http://localhost:8085/create-listing');
    await page.waitForLoadState('networkidle');
  });

  test('basic dark theme test', async ({ page }) => {
    const cards = page.locator('.backdrop-blur-sm');
    
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('create-listing-dark.png');
  });

  test('interactive elements test', async ({ page }) => {
    await page.click('button:has-text("WiFi")');
    await page.click('button:has-text("Furnished")');
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('create-listing-with-selections.png');
  });
});
