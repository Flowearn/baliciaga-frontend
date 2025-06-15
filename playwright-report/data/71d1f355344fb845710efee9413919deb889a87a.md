# Test info

- Name: Dark UI Pages >> Profile page renders with dark theme
- Location: /Users/troy/开发文档/Baliciaga/frontend/tests/darkUI.visual.spec.ts:1:1259

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh --inspector-pipe --headless --no-startup-window
<launched> pid=37583
[pid=37583][err] /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh: 第 7 行：37589 Bus error: 10           DYLD_FRAMEWORK_PATH="$DYLIB_PATH" DYLD_LIBRARY_PATH="$DYLIB_PATH" "$PLAYWRIGHT" "$@"
Call log:
  - <launching> /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh --inspector-pipe --headless --no-startup-window
  - <launched> pid=37583
  - [pid=37583][err] /Users/troy/Library/Caches/ms-playwright/webkit-2158/pw_run.sh: 第 7 行：37589 Bus error: 10           DYLD_FRAMEWORK_PATH="$DYLIB_PATH" DYLD_LIBRARY_PATH="$DYLIB_PATH" "$PLAYWRIGHT" "$@"

```

# Test source

```ts
> 1 | import { test, expect } from '@playwright/test'; test.describe('Dark UI Pages', () => { test('MyListings page renders with dark theme', async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:8087/login'); await page.fill('input[name="username"]', 'troyaxjl@gmail.com'); await page.fill('input[name="password"]', 'Zhehkd.12351'); await page.click('button[type="submit"]'); await page.waitForLoadState('networkidle'); await page.goto('http://localhost:8087/my-listings'); await page.waitForLoadState('networkidle'); expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('my-listings-dark.png'); }); test('MyApplications page renders with dark theme', async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:8087/login'); await page.fill('input[name="username"]', 'troyaxjl@gmail.com'); await page.fill('input[name="password"]', 'Zhehkd.12351'); await page.click('button[type="submit"]'); await page.waitForLoadState('networkidle'); await page.goto('http://localhost:8087/my-applications'); await page.waitForLoadState('networkidle'); expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('my-applications-dark.png'); }); test('Profile page renders with dark theme', async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:8087/login'); await page.fill('input[name="username"]', 'troyaxjl@gmail.com'); await page.fill('input[name="password"]', 'Zhehkd.12351'); await page.click('button[type="submit"]'); await page.waitForLoadState('networkidle'); await page.goto('http://localhost:8087/profile'); await page.waitForLoadState('networkidle'); expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('profile-dark.png'); }); });
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           ^ Error: browserType.launch: Target page, context or browser has been closed
  2 |
```