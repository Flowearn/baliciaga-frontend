import { test, expect } from '@playwright/test';

test.describe('Pricing Details Grid - Computed Styles Diagnosis', () => {
  test.beforeEach(async ({ page }) => {
    // 登录逻辑
    const email = process.env.E2E_TEST_EMAIL || 'troy@example.com';
    const password = process.env.E2E_TEST_PASSWORD || 'TestPass123!';

    await page.goto('/');

    // 检查是否已经登录
    try {
      await expect(page.locator('text=Baliciaga')).toBeVisible({ timeout: 3000 });
      console.log('Already logged in');
      return;
    } catch (error) {
      console.log('Need to authenticate');
    }

    // 如果没有登录，导航到登录页面
    await page.goto('/login');
    
    try {
      await expect(page.getByText('Sign in to Baliciaga')).toBeVisible({ timeout: 5000 });
      
      await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 5000 });
      await page.fill('input[name="username"]', email);
      await page.fill('input[name="password"]', password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.locator('text=Baliciaga')).toBeVisible({ timeout: 10000 });
      console.log('Successfully authenticated');
    } catch (error) {
      console.log('Authentication failed, continuing test...', error);
    }
  });

  test('should diagnose pricing-details-grid computed styles on listing detail page', async ({ page }) => {
    console.log('🔍 Starting Pricing Details Grid Computed Styles Diagnosis');
    
    // 1. 首先导航到列表页面找到一个房源
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    
    // 如果仍然在登录页面，跳过测试
    if (page.url().includes('/login')) {
      test.skip(true, 'Authentication required - test skipped');
      return;
    }
    
    console.log('✅ Successfully loaded listings page');
    
    // 2. 等待房源卡片加载并点击第一个房源
    const firstListingCard = page.locator('[data-testid="listing-card"]').first();
    const genericListingCard = page.locator('.cursor-pointer').first();
    
    try {
      // 尝试使用具体的测试ID
      await expect(firstListingCard).toBeVisible({ timeout: 5000 });
      await firstListingCard.click();
      console.log('✅ Clicked first listing card (with test ID)');
    } catch (error) {
      try {
        // 退回到使用通用选择器
        await expect(genericListingCard).toBeVisible({ timeout: 5000 });
        await genericListingCard.click();
        console.log('✅ Clicked first listing card (generic selector)');
      } catch (error2) {
        console.log('❌ Failed to find any listing cards');
        // 截图用于调试
        await page.screenshot({ path: 'debug-no-listings.png' });
        throw new Error('No listing cards found on the page');
      }
    }
    
    // 3. 等待房源详情页加载
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to listing detail page');
    console.log('Current URL:', page.url());
    
    // 4. 等待页面完全加载，特别是Pricing Details部分
    try {
      await expect(page.getByText('Pricing Details')).toBeVisible({ timeout: 10000 });
      console.log('✅ Found "Pricing Details" section');
    } catch (error) {
      console.log('❌ Could not find "Pricing Details" section');
      await page.screenshot({ path: 'debug-no-pricing-section.png' });
      // 继续测试，可能标题不同
    }
    
    // 5. 寻找 pricing-details-grid 元素
    const pricingGridElement = page.locator('.pricing-details-grid');
    
    try {
      await expect(pricingGridElement).toBeVisible({ timeout: 5000 });
      console.log('✅ Found pricing-details-grid element');
    } catch (error) {
      console.log('❌ Could not find pricing-details-grid element');
      await page.screenshot({ path: 'debug-no-pricing-grid.png' });
      
      // 尝试查找其他可能的选择器
      const possibleSelectors = [
        '[class*="pricing"]',
        '[class*="grid"]',
        '[class*="details"]',
        '.grid',
        '.gap-4'
      ];
      
      for (const selector of possibleSelectors) {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          console.log(`Found ${elements} elements with selector: ${selector}`);
        }
      }
      
      throw new Error('pricing-details-grid element not found');
    }
    
    // 6. 获取父容器的计算样式
    console.log('🔍 Getting computed styles for pricing-details-grid container...');
    
    const computedStyles = await pricingGridElement.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns,
        gridTemplateRows: styles.gridTemplateRows,
        gap: styles.gap,
        gridGap: styles.gridGap,
        width: styles.width,
        height: styles.height,
        overflow: styles.overflow,
        position: styles.position,
        visibility: styles.visibility,
        className: element.className,
        tagName: element.tagName
      };
    });
    
    console.log('📊 COMPUTED STYLES FOR PRICING-DETAILS-GRID CONTAINER:');
    console.log('  display:', computedStyles.display);
    console.log('  grid-template-columns:', computedStyles.gridTemplateColumns);
    console.log('  grid-template-rows:', computedStyles.gridTemplateRows);
    console.log('  gap:', computedStyles.gap);
    console.log('  grid-gap:', computedStyles.gridGap);
    console.log('  width:', computedStyles.width);
    console.log('  height:', computedStyles.height);
    console.log('  overflow:', computedStyles.overflow);
    console.log('  position:', computedStyles.position);
    console.log('  visibility:', computedStyles.visibility);
    console.log('  className:', computedStyles.className);
    console.log('  tagName:', computedStyles.tagName);
    
    // 7. 获取直接子元素的信息
    console.log('🔍 Getting information about direct children...');
    
    const childrenInfo = await pricingGridElement.evaluate((element) => {
      const children = Array.from(element.children);
      return children.map((child, index) => {
        const styles = window.getComputedStyle(child);
        return {
          index,
          tagName: child.tagName,
          className: child.className,
          textContent: child.textContent?.trim().substring(0, 50) + '...',
          display: styles.display,
          gridColumn: styles.gridColumn,
          gridRow: styles.gridRow,
          width: styles.width,
          height: styles.height,
          visibility: styles.visibility
        };
      });
    });
    
    console.log('📊 DIRECT CHILDREN OF PRICING-DETAILS-GRID:');
    childrenInfo.forEach((child, i) => {
      console.log(`  Child ${i}:`);
      console.log(`    tagName: ${child.tagName}`);
      console.log(`    className: ${child.className}`);
      console.log(`    textContent: ${child.textContent}`);
      console.log(`    display: ${child.display}`);
      console.log(`    grid-column: ${child.gridColumn}`);
      console.log(`    grid-row: ${child.gridRow}`);
      console.log(`    width: ${child.width}`);
      console.log(`    height: ${child.height}`);
      console.log(`    visibility: ${child.visibility}`);
      console.log('    ---');
    });
    
    // 8. 获取应用的CSS规则
    console.log('🔍 Getting applied CSS rules...');
    
    const appliedRules = await pricingGridElement.evaluate((element) => {
      const rules = [];
      const sheets = Array.from(document.styleSheets);
      
      for (const sheet of sheets) {
        try {
          const cssRules = Array.from(sheet.cssRules || []);
          for (const rule of cssRules) {
            if (rule instanceof CSSStyleRule) {
              try {
                if (element.matches(rule.selectorText)) {
                  rules.push({
                    selector: rule.selectorText,
                    cssText: rule.style.cssText,
                    href: sheet.href
                  });
                }
              } catch (e) {
                // 忽略无效的选择器
              }
            }
          }
        } catch (e) {
          // 忽略跨域样式表
        }
      }
      
      return rules;
    });
    
    console.log('📊 APPLIED CSS RULES:');
    appliedRules.forEach((rule, i) => {
      console.log(`  Rule ${i}:`);
      console.log(`    selector: ${rule.selector}`);
      console.log(`    cssText: ${rule.cssText}`);
      console.log(`    href: ${rule.href}`);
      console.log('    ---');
    });
    
    // 9. 截图用于视觉验证
    await page.screenshot({ path: 'pricing-grid-diagnosis.png', fullPage: true });
    console.log('📸 Screenshot saved as pricing-grid-diagnosis.png');
    
    // 10. 验证关键样式值
    expect(computedStyles.display).toBeDefined();
    expect(computedStyles.gridTemplateColumns).toBeDefined();
    
    console.log('🎉 Pricing Details Grid Computed Styles Diagnosis completed!');
    
    // 将结果作为测试数据返回
    return {
      containerStyles: computedStyles,
      childrenInfo,
      appliedRules
    };
  });
});