import { test, expect } from '@playwright/test';

test.describe('Debug Onboarding', () => {
  test('should debug page content and elements', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    console.log('✅ Navigated to homepage');

    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 截图看看页面显示什么
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    console.log('✅ Screenshot taken: debug-homepage.png');

    // 获取页面标题
    const title = await page.title();
    console.log('📄 Page title:', title);

    // 获取页面URL
    const url = page.url();
    console.log('🔗 Current URL:', url);

    // 查看页面的主要文本内容
    const bodyText = await page.locator('body').textContent();
    console.log('📝 Body text preview:', bodyText?.substring(0, 500));

    // 查找所有按钮并打印其文本、位置和属性
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found buttons count: ${buttons.length}`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const buttonText = await buttons[i].textContent();
      const buttonClasses = await buttons[i].getAttribute('class') || '';
      const hasIcon = await buttons[i].locator('svg').count() > 0;
      console.log(`  Button ${i + 1}: "${buttonText}" (classes: ${buttonClasses.slice(0, 50)}...) hasIcon: ${hasIcon}`);
    }

    // 查找所有链接
    const links = await page.locator('a').all();
    console.log('🔗 Found links count:', links.length);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const linkText = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      console.log(`  Link ${i + 1}: "${linkText}" (href: ${href})`);
    }

    // 查找AWS Amplify相关元素
    const amplifyElements = await page.locator('[data-amplify]').all();
    console.log('🔐 Amplify authenticator elements count:', amplifyElements.length);

    // 查找表单元素
    const forms = await page.locator('form').all();
    console.log('📝 Found forms count:', forms.length);

    // 查找输入框
    const inputs = await page.locator('input').all();
    console.log('📝 Found inputs count:', inputs.length);
    
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const inputType = await inputs[i].getAttribute('type');
      const inputName = await inputs[i].getAttribute('name');
      const placeholder = await inputs[i].getAttribute('placeholder');
      console.log(`  Input ${i + 1}: type="${inputType}" name="${inputName}" placeholder="${placeholder}"`);
    }

    // 现在测试菜单点击 - 用多种策略
    console.log('\n🔍 Testing menu interaction...');
    
    // 策略1: 查找所有包含MenuIcon的按钮
    const iconButtons = await page.locator('button').filter({ has: page.locator('svg') }).all();
    console.log(`📱 Found ${iconButtons.length} buttons with SVG icons`);
    
    for (let i = 0; i < iconButtons.length; i++) {
      const classes = await iconButtons[i].getAttribute('class') || '';
      const text = await iconButtons[i].textContent() || '';
      console.log(`  Icon Button ${i + 1}: "${text}" (classes: ${classes.slice(0, 50)}...)`);
    }
    
    // 策略2: 尝试多种方式找到菜单按钮
    const menuSelectors = [
      'button:has(svg):last-child',  // 最后一个带svg的按钮
      '[data-radix-collection-item]', // Radix UI的下拉菜单触发器
      'button[aria-haspopup="menu"]', // 带有菜单弹出的按钮
      'button:nth-child(3)', // 第三个按钮（根据header结构）
    ];
    
    for (const selector of menuSelectors) {
      const elements = await page.locator(selector).count();
      console.log(`📍 Selector "${selector}" found ${elements} elements`);
    }
    
    // 策略3: 直接查找最右侧的按钮
    const headerButtons = await page.locator('.sticky .flex button').all();
    console.log(`📱 Found ${headerButtons.length} buttons in header`);
    
    if (headerButtons.length > 0) {
      const lastButton = headerButtons[headerButtons.length - 1];
      console.log('📱 Clicking the last button in header...');
      await lastButton.click();
      
      // 等待菜单出现
      await page.waitForTimeout(1000);
      
      // 截图菜单状态
      await page.screenshot({ path: 'debug-menu-open.png' });
      console.log('✅ Screenshot taken after menu click: debug-menu-open.png');
      
      // 检查是否有下拉菜单出现
      const menuItems = await page.locator('[role="menuitem"]').all();
      console.log(`📋 Found ${menuItems.length} menu items after click`);
      
      if (menuItems.length > 0) {
        for (let i = 0; i < menuItems.length; i++) {
          const itemText = await menuItems[i].textContent();
          console.log(`  Menu Item ${i + 1}: "${itemText}"`);
        }
      } else {
        // 如果没有找到标准菜单项，检查其他可能的下拉内容
        const dropdownContent = await page.locator('[data-radix-popper-content-wrapper]').count();
        console.log(`📋 Found ${dropdownContent} Radix dropdown content wrappers`);
        
        const allText = await page.textContent('body');
        console.log(`📝 Page content after click: \n    ${allText?.slice(0, 500)}...`);
      }
    }

    // 检查菜单内容
    const allText = await page.textContent('body');
    console.log(`📝 Page content after menu click: \n    ${allText?.slice(0, 500)}...`);
    
    // 查找所有可见的菜单项
    const visibleElements = await page.locator('*:visible').allTextContents();
    console.log(`📋 All visible elements containing text:`);
    const profileElements = visibleElements.filter(text => text.toLowerCase().includes('profile'));
    console.log(`  Profile-related: ${JSON.stringify(profileElements)}`);
    
    const contactElements = visibleElements.filter(text => text.toLowerCase().includes('contact'));
    console.log(`  Contact-related: ${JSON.stringify(contactElements)}`);
    
    const shareElements = visibleElements.filter(text => text.toLowerCase().includes('share'));
    console.log(`  Share-related: ${JSON.stringify(shareElements)}`);

    // 等待5秒以便观察
    await page.waitForTimeout(5000);
  });
}); 