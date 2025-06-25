import { chromium } from 'playwright';

async function debugHeaderStyles() {
  console.log('🔍 开始 GlobalHeader 法医取证...\n');
  
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口
    devtools: true,  // 自动打开开发者工具
  });

  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8085',
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    console.log('📱 导航到首页...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待一下确保页面完全加载
    await page.waitForTimeout(2000);

    console.log('🎯 查找可以触发沉浸式主题的详情页面...');
    
    // 查找第一个可点击的场所卡片
    const firstCard = await page.locator('[data-testid*="card"], .cursor-pointer, a[href*="/detail"], a[href*="/listing"]').first();
    
    if (await firstCard.count() > 0) {
      console.log('✅ 找到详情页链接，点击进入...');
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // 等待沉浸式主题生效
    } else {
      console.log('⚠️ 未找到详情页链接，尝试直接访问 create-listing 页面...');
      await page.goto('/create-listing');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }

    console.log('\n🔍 开始取证分析...\n');

    // 检查 Zustand 状态
    console.log('【D. Zustand 状态检查】');
    const themeState = await page.evaluate(() => {
      try {
        // 尝试从 window 对象访问 store
        if (window.useThemeStore) {
          return window.useThemeStore.getState().activeTheme;
        }
        // 如果直接访问不到，尝试通过 React DevTools 或其他方式
        return 'Store not accessible from window';
      } catch (error) {
        return `Error accessing store: ${error.message}`;
      }
    });
    console.log('activeTheme 当前值:', JSON.stringify(themeState, null, 2));

    // 获取所有相关元素的样式信息
    const styleAnalysis = await page.evaluate(() => {
      const results = {};

      // A. 一级导航容器 (最外层的导航容器)
      const navigationContainer = document.querySelector('div.relative > div.relative.z-10') || 
                                 document.querySelector('[class*="pt-1"][class*="pb-0"][class*="px-4"]') ||
                                 document.querySelector('div:has(h1:contains("Baliciaga"))');
      
      if (navigationContainer) {
        const computedStyle = window.getComputedStyle(navigationContainer);
        const parentComputedStyle = window.getComputedStyle(navigationContainer.parentElement);
        
        results.navigationContainer = {
          element: navigationContainer.outerHTML.slice(0, 200) + '...',
          backgroundColor: computedStyle.backgroundColor,
          parentBackgroundColor: parentComputedStyle.backgroundColor,
          color: computedStyle.color,
          className: navigationContainer.className,
          parentClassName: navigationContainer.parentElement?.className
        };
      }

      // B. 二级导航容器 (包含 Food/Bar/Cowork/Rental 按钮的容器)
      const secondaryNav = document.querySelector('div:has(a[data-testid*="-category-button"])') ||
                          document.querySelector('[class*="flex"][class*="gap-2"]');
      
      if (secondaryNav) {
        const computedStyle = window.getComputedStyle(secondaryNav);
        results.secondaryNav = {
          element: secondaryNav.outerHTML.slice(0, 200) + '...',
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          className: secondaryNav.className
        };
      }

      // C. Baliciaga 标题
      const title = document.querySelector('h1') || document.querySelector('[class*="font-bold"]:contains("Baliciaga")');
      
      if (title) {
        const computedStyle = window.getComputedStyle(title);
        results.title = {
          element: title.outerHTML,
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor,
          className: title.className,
          textContent: title.textContent
        };
      }

      // 额外检查：背景色层
      const backgroundLayers = Array.from(document.querySelectorAll('div.absolute.inset-0')).map(layer => {
        const computedStyle = window.getComputedStyle(layer);
        return {
          element: layer.outerHTML.slice(0, 150) + '...',
          backgroundColor: computedStyle.backgroundColor,
          opacity: computedStyle.opacity,
          className: layer.className
        };
      });

      results.backgroundLayers = backgroundLayers;

      return results;
    });

    console.log('\n【A. 一级导航容器】');
    if (styleAnalysis.navigationContainer) {
      console.log('最终背景色:', styleAnalysis.navigationContainer.backgroundColor);
      console.log('父元素背景色:', styleAnalysis.navigationContainer.parentBackgroundColor);
      console.log('最终文字颜色:', styleAnalysis.navigationContainer.color);
      console.log('类名:', styleAnalysis.navigationContainer.className);
      console.log('父元素类名:', styleAnalysis.navigationContainer.parentClassName);
    } else {
      console.log('❌ 未找到一级导航容器');
    }

    console.log('\n【B. 二级导航容器】');
    if (styleAnalysis.secondaryNav) {
      console.log('最终背景色:', styleAnalysis.secondaryNav.backgroundColor);
      console.log('最终文字颜色:', styleAnalysis.secondaryNav.color);
      console.log('类名:', styleAnalysis.secondaryNav.className);
    } else {
      console.log('❌ 未找到二级导航容器');
    }

    console.log('\n【C. Baliciaga 标题】');
    if (styleAnalysis.title) {
      console.log('最终文字颜色:', styleAnalysis.title.color);
      console.log('最终背景色:', styleAnalysis.title.backgroundColor);
      console.log('类名:', styleAnalysis.title.className);
      console.log('文本内容:', styleAnalysis.title.textContent);
    } else {
      console.log('❌ 未找到 Baliciaga 标题');
    }

    console.log('\n【额外信息：背景色层】');
    styleAnalysis.backgroundLayers.forEach((layer, index) => {
      console.log(`层 ${index + 1}:`);
      console.log('  背景色:', layer.backgroundColor);
      console.log('  透明度:', layer.opacity);
      console.log('  类名:', layer.className);
    });

    // 获取详细的样式来源信息
    console.log('\n🔬 正在分析样式来源...');
    
    // 创建一个检查函数来获取样式规则
    const getStyleSources = await page.evaluate(() => {
      const getEffectiveStyles = (element, property) => {
        if (!element) return [];
        
        const styles = [];
        const computedStyle = window.getComputedStyle(element);
        const value = computedStyle.getPropertyValue(property);
        
        // 尝试通过 CSSOM 获取样式来源（这在生产环境中可能有限制）
        try {
          for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            if (sheet.href) {
              styles.push({
                source: sheet.href,
                property: property,
                value: value,
                computed: true
              });
            }
          }
        } catch (e) {
          styles.push({
            source: 'Unable to access stylesheet details due to CORS',
            property: property,
            value: value,
            computed: true
          });
        }
        
        return styles;
      };

      const results = {};
      
      const navContainer = document.querySelector('div.relative > div.relative.z-10') || 
                          document.querySelector('[class*="pt-1"][class*="pb-0"][class*="px-4"]');
      if (navContainer) {
        results.navContainerBgStyles = getEffectiveStyles(navContainer, 'background-color');
      }

      const title = document.querySelector('h1');
      if (title) {
        results.titleColorStyles = getEffectiveStyles(title, 'color');
      }

      return results;
    });

    console.log('\n【样式来源分析】');
    console.log('导航容器背景色来源:', JSON.stringify(getStyleSources.navContainerBgStyles, null, 2));
    console.log('标题颜色来源:', JSON.stringify(getStyleSources.titleColorStyles, null, 2));

    console.log('\n✅ 法医取证完成! 浏览器将保持打开状态以供进一步检查。');
    console.log('💡 你可以在开发者工具中手动检查元素的 Styles 面板来查看具体的CSS规则来源。');

    // 保持浏览器打开
    await page.waitForTimeout(300000); // 等待5分钟

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  } finally {
    await browser.close();
  }
}

debugHeaderStyles().catch(console.error); 