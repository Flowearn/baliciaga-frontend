import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:8082';

export default defineConfig({
  // 指定测试文件所在的目录
  testDir: './tests',

  // 是否并行运行测试文件
  fullyParallel: true,

  // 在CI环境中，如果标记了.only，则构建失败
  forbidOnly: !!process.env.CI,

  // 在CI环境中重试2次，本地不重试
  retries: process.env.CI ? 2 : 0,

  // 并发工作线程数
  workers: process.env.CI ? 1 : undefined,

  // 测试报告格式
  reporter: 'html',

  // 共享给所有测试的设置
  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
  },

  // 自动启动开发服务器的核心配置
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120 * 1000, // 120秒超时
    reuseExistingServer: !process.env.CI,
  },

  // 配置不同的浏览器项目
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // 移动端测试项目 - iPhone 13 Pro
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['iPhone 13 Pro'],
        // 明确设置视口大小
        viewport: { width: 390, height: 844 }
      },
    },

    // WebKit 仍然保持禁用
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
}); 