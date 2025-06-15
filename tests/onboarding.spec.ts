import { test, expect } from '@playwright/test';

test.describe('Passwordless Authentication Flow', () => {
  let testEmail: string;

  test.beforeEach(async () => {
    // 为每个测试生成唯一的测试邮箱
    const timestamp = Date.now();
    testEmail = `test-passwordless-${timestamp}@example.com`;
  });

  test('should successfully transition through two-stage passwordless authentication UI', async ({ page }) => {
    console.log('🚀 开始测试两阶段无密码认证UI成功流程');
    
    // ===============================
    // 第一步：访问账户页面
    // ===============================
    
    await page.goto('/account');
    console.log('✅ Step 1: 导航到 /account 页面');
    
    // 验证页面加载成功
    await expect(page).toHaveURL(/.*\/account/, { timeout: 10000 });
    console.log('✅ Step 1.1: 确认页面URL正确');

    // ===============================
    // 第二步：验证第一阶段UI（邮箱输入）
    // ===============================
    
    // 验证第一阶段的标题存在
    await expect(page.locator('text=Enter your email to sign in')).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 2.1: 确认第一阶段标题显示');
    
    // 验证邮箱输入框存在
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 2.2: 确认邮箱输入框存在');
    
    // 验证Continue按钮存在
    const continueButton = page.locator('button', { hasText: 'Continue' });
    await expect(continueButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 2.3: 确认Continue按钮存在');

    // ===============================
    // 第三步：输入邮箱并点击Continue
    // ===============================
    
    await emailInput.fill(testEmail);
    console.log(`✅ Step 3.1: 输入测试邮箱: ${testEmail}`);
    
    await continueButton.click();
    console.log('✅ Step 3.2: 点击Continue按钮');

    // ===============================
    // 第四步：验证第二阶段UI（验证码输入）
    // ===============================
    
    // 等待UI切换到第二阶段 - 验证码阶段的标题
    await expect(page.locator('text=Enter the 6-digit code sent to your email')).toBeVisible({ timeout: 15000 });
    console.log('✅ Step 4.1: 确认成功切换到第二阶段 - 验证码输入界面');
    
    // 验证验证码输入框存在
    const codeInput = page.locator('#code');
    await expect(codeInput).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 4.2: 确认验证码输入框存在');
    
    // 验证Verify按钮存在
    const verifyButton = page.locator('button', { hasText: 'Verify & Sign In' });
    await expect(verifyButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 4.3: 确认"Verify & Sign In"按钮存在');
    
    // 验证"Use Different Email"链接存在
    const differentEmailLink = page.locator('text=Use Different Email');
    await expect(differentEmailLink).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 4.4: 确认"Use Different Email"链接存在');

    console.log('🎉 两阶段无密码认证UI流程测试成功完成！');
  });

  test('should handle empty email validation', async ({ page }) => {
    await page.goto('/account');
    
    // 尝试点击Continue按钮而不输入邮箱
    const continueButton = page.locator('button', { hasText: 'Continue' });
    await continueButton.click();
    
    // 验证HTML5表单验证阻止了提交
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('required');
    
    // 确认我们仍在第一阶段
    await expect(page.locator('text=Enter your email to sign in')).toBeVisible();
    
    console.log('✅ 空邮箱验证测试通过');
  });

  test('should validate email input field behavior', async ({ page }) => {
    await page.goto('/account');
    
    const emailInput = page.locator('#email');
    
    // 验证输入字段类型
    await expect(emailInput).toHaveAttribute('type', 'email');
    
    // 测试邮箱输入
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // 验证required属性
    await expect(emailInput).toHaveAttribute('required');
    
    console.log('✅ 邮箱输入字段行为测试通过');
  });
}); 