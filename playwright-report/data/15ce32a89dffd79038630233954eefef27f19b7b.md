# Test info

- Name: Create Listing Dark UI >> interactive elements test
- Location: /Users/troy/开发文档/Baliciaga/frontend/tests/createListing.visual.spec.ts:21:3

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("WiFi")')

    at /Users/troy/开发文档/Baliciaga/frontend/tests/createListing.visual.spec.ts:22:16
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- button:
  - img
- heading "Baliciaga" [level=1]
- button:
  - img
- link "Cafe":
  - /url: /?type=cafe
  - img
  - text: Cafe
- link "Bar":
  - /url: /?type=bar
  - img
  - text: Bar
- link "Rental":
  - /url: /listings
  - img
  - text: Rental
- tablist:
  - tab "Sign In" [selected]
  - tab "Create Account"
- tabpanel "Sign In":
  - group:
    - text: Sign in Username
    - textbox "Username"
    - text: Password
    - textbox "Password"
    - switch "Show password": Password is hidden
  - button "Sign in"
  - button "Forgot your password?"
- navigation:
  - link "My Listing":
    - /url: /my-listings
    - img
    - text: My Listing
  - link "My Application":
    - /url: /my-applications
    - img
    - text: My Application
  - link "Profile":
    - /url: /profile
    - img
    - text: Profile
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Create Listing Dark UI', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.setViewportSize({ width: 390, height: 844 });
   6 |     await page.goto('http://localhost:8082/login');
   7 |     await page.fill('input[name="username"]', 'troyaxjl@gmail.com');
   8 |     await page.fill('input[name="password"]', 'Zhehkd.12351');
   9 |     await page.click('button[type="submit"]');
  10 |     await page.waitForLoadState('networkidle');
  11 |     await page.goto('http://localhost:8082/create-listing');
  12 |     await page.waitForLoadState('networkidle');
  13 |   });
  14 |
  15 |   test('basic dark theme test', async ({ page }) => {
  16 |     const cards = page.locator('.backdrop-blur-sm');
  17 |     
  18 |     expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('create-listing-dark.png');
  19 |   });
  20 |
  21 |   test('interactive elements test', async ({ page }) => {
> 22 |     await page.click('button:has-text("WiFi")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  23 |     await page.click('button:has-text("Furnished")');
  24 |     expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('create-listing-with-selections.png');
  25 |   });
  26 | });
  27 |
```