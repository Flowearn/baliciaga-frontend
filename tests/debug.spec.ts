import { test, expect } from '@playwright/test';

test.describe('Debug Page Structure', () => {
  test('should take screenshot and output page content for debugging', async ({ page }) => {
    // 1. 访问首页
    await page.goto('/');
    
    // 2. 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 3. 截取屏幕截图
    await page.screenshot({ path: 'debug-page.png', fullPage: true });
    
    // 4. 输出页面标题
    const title = await page.title();
    console.log('Page Title:', title);
    
    // 5. 输出页面URL
    console.log('Page URL:', page.url());
    
    // 6. 查找所有按钮并输出其文本
    const buttons = await page.locator('button').all();
    console.log('Found buttons:');
    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await buttons[i].textContent();
      const buttonVisible = await buttons[i].isVisible();
      console.log(`  Button ${i}: "${buttonText}" (visible: ${buttonVisible})`);
    }
    
    // 7. 查找所有链接并输出其文本
    const links = await page.locator('a').all();
    console.log('Found links:');
    for (let i = 0; i < Math.min(links.length, 10); i++) { // 限制到前10个
      const linkText = await links[i].textContent();
      const linkVisible = await links[i].isVisible();
      console.log(`  Link ${i}: "${linkText}" (visible: ${linkVisible})`);
    }
    
    // 8. 查找包含"create"或"account"的元素
    const createElements = await page.locator('text=/create|account/i').all();
    console.log('Elements containing "create" or "account":');
    for (let i = 0; i < createElements.length; i++) {
      const elementText = await createElements[i].textContent();
      const elementVisible = await createElements[i].isVisible();
      const tagName = await createElements[i].evaluate(el => el.tagName);
      console.log(`  ${tagName}: "${elementText}" (visible: ${elementVisible})`);
    }
    
    // 9. 输出页面的基本HTML结构
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Page body HTML (first 1000 chars):', bodyHTML.substring(0, 1000));
    
    // 10. 检查是否有表单
    const forms = await page.locator('form').all();
    console.log(`Found ${forms.length} forms on the page`);
    
    // 这个测试总是通过，因为它只是用于调试
    expect(true).toBe(true);
  });
}); 
 