# Test info

- Name: Dark UI Pages >> Profile page renders with dark theme
- Location: /Users/troy/开发文档/Baliciaga/frontend/tests/darkUI.visual.spec.ts:1:1259

# Error details

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:8087/login", waiting until "load"

    at /Users/troy/开发文档/Baliciaga/frontend/tests/darkUI.visual.spec.ts:1:1394
```

# Page snapshot

```yaml
- text: "[plugin:vite:react-swc] × Unexpected token `ColoredPageWrapper`. Expected jsx identifier ╭─[/Users/troy/开发文档/Baliciaga/frontend/src/features/profile/pages/UserProfilePage.tsx:379:1] 376 │ }; 377 │ 378 │ return ( 379 │ <ColoredPageWrapper seed=\"profile\"> · ────────────────── 380 │ {/* Sticky Header */} 381 │ <div className=\"sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4 border-b border-white/10\"> 382 │ <div className=\"flex items-center justify-between\"> ╰──── Caused by: Syntax Error /Users/troy/开发文档/Baliciaga/frontend/src/features/profile/pages/UserProfilePage.tsx Click outside, press Esc key, or fix the code to dismiss. You can also disable this overlay by setting"
- code: server.hmr.overlay
- text: to
- code: "false"
- text: in
- code: vite.config.ts
- text: .
```

# Test source

```ts
> 1 | import { test, expect } from '@playwright/test'; test.describe('Dark UI Pages', () => { test('MyListings page renders with dark theme', async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:8087/login'); await page.fill('input[name="username"]', 'troyaxjl@gmail.com'); await page.fill('input[name="password"]', 'Zhehkd.12351'); await page.click('button[type="submit"]'); await page.waitForLoadState('networkidle'); await page.goto('http://localhost:8087/my-listings'); await page.waitForLoadState('networkidle'); expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('my-listings-dark.png'); }); test('MyApplications page renders with dark theme', async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:8087/login'); await page.fill('input[name="username"]', 'troyaxjl@gmail.com'); await page.fill('input[name="password"]', 'Zhehkd.12351'); await page.click('button[type="submit"]'); await page.waitForLoadState('networkidle'); await page.goto('http://localhost:8087/my-applications'); await page.waitForLoadState('networkidle'); expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('my-applications-dark.png'); }); test('Profile page renders with dark theme', async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await page.goto('http://localhost:8087/login'); await page.fill('input[name="username"]', 'troyaxjl@gmail.com'); await page.fill('input[name="password"]', 'Zhehkd.12351'); await page.click('button[type="submit"]'); await page.waitForLoadState('networkidle'); await page.goto('http://localhost:8087/profile'); await page.waitForLoadState('networkidle'); expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('profile-dark.png'); }); });
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  2 |
```