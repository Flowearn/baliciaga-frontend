# Test info

- Name: Create Listing Dark UI >> interactive elements test
- Location: /Users/troy/开发文档/Baliciaga/frontend/tests/createListing.visual.spec.ts:21:3

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh --inspector-pipe --headless --no-startup-window
<launched> pid=81116
[pid=81116][err] /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh: 第 7 行：81121 Bus error: 10           DYLD_FRAMEWORK_PATH="$DYLIB_PATH" DYLD_LIBRARY_PATH="$DYLIB_PATH" "$PLAYWRIGHT" "$@"
Call log:
  - <launching> /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh --inspector-pipe --headless --no-startup-window
  - <launched> pid=81116
  - [pid=81116][err] /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh: 第 7 行：81121 Bus error: 10           DYLD_FRAMEWORK_PATH="$DYLIB_PATH" DYLD_LIBRARY_PATH="$DYLIB_PATH" "$PLAYWRIGHT" "$@"

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
> 21 |   test('interactive elements test', async ({ page }) => {
     |   ^ Error: browserType.launch: Target page, context or browser has been closed
  22 |     await page.click('button:has-text("WiFi")');
  23 |     await page.click('button:has-text("Furnished")');
  24 |     expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('create-listing-with-selections.png');
  25 |   });
  26 | });
  27 |
```