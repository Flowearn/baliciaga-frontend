import { test, expect } from '@playwright/test';

// 专门测试单次验证码流程的E2E测试
test.describe('单次验证码流程验证', () => {
  test('用户注册时应该只需要输入一次验证码', async ({ page }) => {
    // 生成唯一的测试邮箱
    const timestamp = Date.now();
    const testEmail = `test-single-verification-${timestamp}@example.com`;
    const testPassword = 'TestPassword123';

    console.log(`🧪 开始测试单次验证码流程，邮箱: ${testEmail}`);

    // 1. 访问首页
    await page.goto('http://localhost:8082');
    console.log('✅ 成功访问首页');

    // 2. 点击菜单按钮
    await page.click('button[aria-haspopup="menu"]');
    console.log('✅ 成功点击菜单按钮');

    // 3. 点击 Profile 菜单项
    await page.click('[role="menuitem"]:has-text("Profile")');
    console.log('✅ 成功点击 Profile 菜单项');

    // 4. 等待导航到 /account 页面
    await page.waitForURL('**/account');
    console.log('✅ 成功导航到 /account 页面');

    // 5. 等待AWS Amplify Authenticator组件加载
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    console.log('✅ AWS Amplify Authenticator加载完成');

    // 6. 填写注册表单
    await page.fill('input[name="username"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    console.log('✅ 填写注册表单完成');

    // 7. 提交注册表单
    await page.click('button[type="submit"]');
    console.log('✅ 提交注册表单');

    // 8. 等待确认验证码阶段
    await page.waitForSelector('input[name="confirmation_code"]', { timeout: 15000 });
    console.log('✅ 到达验证码确认阶段');

    // 9. 验证验证码输入次数
    // 检查是否只有一个验证码输入框
    const verificationInputs = await page.locator('input[name="confirmation_code"]').count();
    expect(verificationInputs).toBe(1);
    console.log(`✅ 验证码输入框数量正确: ${verificationInputs}个`);

    // 10. 检查页面上是否没有额外的MFA相关元素
    const mfaElements = await page.locator('text=/MFA|Multi.*Factor|二次验证|再次验证/i').count();
    expect(mfaElements).toBe(0);
    console.log(`✅ 没有发现MFA相关元素: ${mfaElements}个`);

    // 11. 验证只有一个"确认"或"验证"按钮
    const confirmButtons = await page.locator('button:has-text("确认"), button:has-text("验证"), button:has-text("Confirm"), button:has-text("Verify")').count();
    expect(confirmButtons).toBeLessThanOrEqual(1);
    console.log(`✅ 确认按钮数量正确: ${confirmButtons}个`);

    console.log('🎉 单次验证码流程测试通过！用户只需要输入一次验证码');
  });

  test('验证MFA配置已正确禁用', async ({ page }) => {
    console.log('🧪 开始验证MFA配置测试');

    // 访问首页
    await page.goto('http://localhost:8082');
    
    // 进入注册流程
    await page.click('button[aria-haspopup="menu"]');
    await page.click('[role="menuitem"]:has-text("Profile")');
    await page.waitForURL('**/account');

    // 检查页面源码中是否没有MFA相关的配置
    const pageContent = await page.content();
    
    // 验证页面内容中没有MFA启用的迹象
    const hasMfaEnabled = pageContent.includes('MfaConfiguration":"ON"') || 
                         pageContent.includes('mfa":"enabled"') ||
                         pageContent.includes('OPTIONAL_MFA');
    
    expect(hasMfaEnabled).toBe(false);
    console.log('✅ 确认页面中没有MFA启用的配置');

    console.log('🎉 MFA配置验证测试通过！');
  });
}); 