import { test, expect } from '@playwright/test';

test.describe('New User Profile Creation Flow', () => {
  let testEmail: string;
  let testPhoneNumber: string;

  test.beforeEach(async ({ page }) => {
    // 生成唯一的测试数据
    const timestamp = Date.now();
    testEmail = `test-profile-user-${timestamp}@example.com`;
    testPhoneNumber = `+86 138 ${String(timestamp).slice(-8)}`;

    // 1. 导航到根路径，这将触发 withAuthenticator
    await page.goto('/');

    // 2. 期望看到登录表单
    // 检查登录按钮是否存在（AWS Amplify UI）
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // 3. 填充登录凭据
    // 从环境变量中获取用户名和密码
    const username = process.env.E2E_TEST_USERNAME;
    const password = process.env.E2E_TEST_PASSWORD;

    if (!username || !password) {
      throw new Error('测试环境变量 E2E_TEST_USERNAME 或 E2E_TEST_PASSWORD 未设置。');
    }
    
    // 使用实际的AWS Amplify输入框选择器
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    // 4. 点击登录按钮
    await page.getByRole('button', { name: 'Sign in' }).click();

    // 5. 处理可能的账户验证步骤
    // 检查是否出现验证页面，如果有则跳过
    try {
      await page.getByRole('button', { name: 'Skip' }).click({ timeout: 5000 });
      console.log('Skipped account verification step');
    } catch (error) {
      console.log('No verification step required');
    }

    // 6. 验证登录成功 - 检查是否有个人资料表单或主应用界面
    // 如果用户已有个人资料，会显示主应用；如果没有，会显示个人资料创建表单
    try {
      await expect(page.getByRole('heading', { name: 'Complete Your Profile' })).toBeVisible({ timeout: 10000 });
      console.log('New user - profile creation form displayed');
    } catch (error) {
      // 用户已有个人资料，检查是否显示主应用
      await expect(page.locator('text=Baliciaga')).toBeVisible({ timeout: 5000 });
      console.log('Existing user - main app displayed. Skipping profile creation tests.');
      test.skip();
    }
  });

  test('should allow a new user to fill out and submit their profile', async ({ page }) => {
    // 填充表单字段 - 基于UserProfileForm.tsx中的实际字段

    // 1. 填写全名
    await page.getByLabel('Full Name').fill('Troy Tester');
    
    // 2. 选择性别
    await page.getByLabel('Gender').click();
    await page.getByRole('option', { name: 'Male' }).click();
    
    // 3. 填写国籍
    await page.getByLabel('Nationality').fill('American');
    
    // 4. 填写年龄
    await page.getByLabel('Age').fill('28');
    
    // 5. 填写WhatsApp号码
    await page.getByLabel('WhatsApp Number').fill(testPhoneNumber);
    
    // 6. 提交表单
    const submitButton = page.getByRole('button', { name: 'Create Profile' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // 7. 验证提交过程
    // 首先检查按钮状态变化（显示"Creating..."）
    await expect(page.getByRole('button', { name: 'Creating...' })).toBeVisible({ timeout: 5000 });
    
    // 8. 验证成功后的跳转
    // 根据App.tsx的handleProfileCreated函数，成功创建profile后会重新渲染主应用
    // 根据路由配置，默认会显示Index页面
    await expect(page).toHaveURL('/', { timeout: 15000 });
    
    // 9. 验证主应用界面的加载
    // 应该看到主应用的导航或内容，不再是profile创建表单
    await expect(page.getByRole('heading', { name: 'Complete Your Profile' })).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Profile creation flow completed successfully');
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // 测试表单验证：尝试提交空表单
    
    // 清空所有字段（某些可能有默认值）
    await page.getByLabel('Full Name').clear();
    await page.getByLabel('Nationality').clear();
    await page.getByLabel('WhatsApp Number').clear();
    
    // 尝试提交
    await page.getByRole('button', { name: 'Create Profile' }).click();
    
    // 验证错误提示显示
    // 基于UserProfileForm.tsx中的toast.error消息
    await expect(page.locator('text=Please enter your full name')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for invalid age', async ({ page }) => {
    // 填写其他必填字段
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Nationality').fill('Test Country');
    await page.getByLabel('WhatsApp Number').fill(testPhoneNumber);
    
    // 输入无效年龄
    await page.getByLabel('Age').fill('250');
    
    // 提交表单
    await page.getByRole('button', { name: 'Create Profile' }).click();
    
    // 验证年龄验证错误
    await expect(page.locator('text=Age must be between 0 and 200')).toBeVisible({ timeout: 5000 });
  });

  test('should handle gender selection correctly', async ({ page }) => {
    // 测试性别选择功能
    
    // 点击性别下拉框
    await page.getByLabel('Gender').click();
    
    // 验证所有选项都可见
    await expect(page.getByRole('option', { name: 'Male' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Female' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Other' })).toBeVisible();
    
    // 选择Female
    await page.getByRole('option', { name: 'Female' }).click();
    
    // 验证选择是否正确应用
    await expect(page.getByLabel('Gender')).toHaveValue('female');
  });

  test('should have accessible form labels and proper structure', async ({ page }) => {
    // 验证表单的可访问性
    
    // 检查所有表单字段都有对应的标签
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Gender')).toBeVisible();
    await expect(page.getByLabel('Nationality')).toBeVisible();
    await expect(page.getByLabel('Age')).toBeVisible();
    await expect(page.getByLabel('WhatsApp Number')).toBeVisible();
    
    // 检查提交按钮
    await expect(page.getByRole('button', { name: 'Create Profile' })).toBeVisible();
    
    // 检查表单描述文本
    await expect(page.getByText('Welcome to Baliciaga! Please fill in your personal information')).toBeVisible();
  });
});
  });}); 
