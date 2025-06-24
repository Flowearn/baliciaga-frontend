const { chromium } = require('playwright');

async function diagnoseListingError() {
  console.log('🔍 Starting diagnosis of listing page network errors...\n');
  
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口以便查看
    devtools: true,  // 自动打开开发者工具
  });

  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8085',
      // 忽略HTTPS错误（如果有的话）
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // 监听控制台消息
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location(),
        });
      }
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.toString());
    });

    // 监听网络请求和响应
    const networkRequests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('api') || url.includes('listing')) {
        networkRequests.push({
          url: url,
          method: request.method(),
          headers: request.headers(),
          resourceType: request.resourceType(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('api') || url.includes('listing')) {
        const request = networkRequests.find(r => r.url === url && !r.response);
        if (request) {
          request.response = {
            status: response.status(),
            statusText: response.statusText(),
            headers: response.headers(),
            timestamp: new Date().toISOString(),
          };
        }
      }
    });

    // 监听请求失败
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure(),
        resourceType: request.resourceType(),
      });
    });

    console.log('📱 Step 1: Navigating to login page...');
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    console.log('🔐 Step 2: Logging in...');
    // 假设登录表单有email和password字段
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'test@example.com');
    await page.fill('input[type="password"], input[name="password"], input[placeholder*="password" i]', 'password123');
    
    // 点击登录按钮
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    
    // 等待登录完成（可能需要等待重定向或某个元素出现）
    await page.waitForTimeout(2000);
    
    console.log('🏠 Step 3: Navigating to listings page...');
    
    // 清除之前的请求记录
    networkRequests.length = 0;
    consoleErrors.length = 0;
    
    // 尝试通过菜单导航
    try {
      // 点击Rental菜单
      await page.click('text=Rental', { timeout: 5000 });
      await page.waitForTimeout(500);
      
      // 点击All Listings
      await page.click('text=All Listings', { timeout: 5000 });
    } catch (e) {
      console.log('⚠️  Could not navigate via menu, trying direct URL...');
      await page.goto('/listings', { waitUntil: 'networkidle' });
    }
    
    // 等待页面加载和网络请求完成
    await page.waitForTimeout(3000);
    
    console.log('\n📊 === DIAGNOSIS RESULTS ===\n');
    
    // 报告控制台错误
    console.log('🔴 Console Errors:');
    if (consoleErrors.length === 0) {
      console.log('  No console errors detected');
    } else {
      consoleErrors.forEach((error, index) => {
        console.log(`\n  Error ${index + 1}:`);
        console.log(`    Message: ${error.text}`);
        if (error.location.url) {
          console.log(`    Location: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
    }
    
    // 报告页面错误
    console.log('\n🔴 Page Errors:');
    if (pageErrors.length === 0) {
      console.log('  No page errors detected');
    } else {
      pageErrors.forEach((error, index) => {
        console.log(`\n  Error ${index + 1}: ${error}`);
      });
    }
    
    // 报告失败的请求
    console.log('\n🔴 Failed Requests:');
    if (failedRequests.length === 0) {
      console.log('  No failed requests');
    } else {
      failedRequests.forEach((request, index) => {
        console.log(`\n  Failed Request ${index + 1}:`);
        console.log(`    URL: ${request.url}`);
        console.log(`    Method: ${request.method}`);
        console.log(`    Failure: ${request.failure()?.errorText || 'Unknown'}`);
      });
    }
    
    // 报告API请求详情
    console.log('\n📡 API Requests Analysis:');
    const apiRequests = networkRequests.filter(r => r.url.includes('api'));
    
    if (apiRequests.length === 0) {
      console.log('  No API requests detected');
    } else {
      apiRequests.forEach((request, index) => {
        console.log(`\n  Request ${index + 1}:`);
        console.log(`    URL: ${request.url}`);
        console.log(`    Method: ${request.method}`);
        console.log(`    Request Headers:`);
        Object.entries(request.headers).forEach(([key, value]) => {
          if (key.toLowerCase().includes('origin') || 
              key.toLowerCase().includes('cors') || 
              key.toLowerCase().includes('access-control')) {
            console.log(`      ${key}: ${value}`);
          }
        });
        
        if (request.response) {
          console.log(`    Response Status: ${request.response.status} ${request.response.statusText}`);
          console.log(`    Response Headers:`);
          Object.entries(request.response.headers).forEach(([key, value]) => {
            if (key.toLowerCase().includes('access-control') || 
                key.toLowerCase().includes('cors')) {
              console.log(`      ${key}: ${value}`);
            }
          });
        } else {
          console.log('    ⚠️  No response received');
        }
      });
    }
    
    // 检查OPTIONS预检请求
    console.log('\n🔍 OPTIONS Preflight Requests:');
    const optionsRequests = networkRequests.filter(r => r.method === 'OPTIONS');
    
    if (optionsRequests.length === 0) {
      console.log('  No OPTIONS requests detected');
    } else {
      optionsRequests.forEach((request, index) => {
        console.log(`\n  OPTIONS Request ${index + 1}:`);
        console.log(`    URL: ${request.url}`);
        if (request.response) {
          console.log(`    Status: ${request.response.status}`);
          console.log(`    CORS Headers:`);
          const headers = request.response.headers;
          console.log(`      Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || 'NOT SET'}`);
          console.log(`      Access-Control-Allow-Methods: ${headers['access-control-allow-methods'] || 'NOT SET'}`);
          console.log(`      Access-Control-Allow-Headers: ${headers['access-control-allow-headers'] || 'NOT SET'}`);
          console.log(`      Access-Control-Allow-Credentials: ${headers['access-control-allow-credentials'] || 'NOT SET'}`);
        }
      });
    }
    
    // 获取页面当前URL
    console.log(`\n📍 Current Page URL: ${page.url()}`);
    
    // 截图保存当前页面状态
    await page.screenshot({ path: 'listing-page-diagnosis.png', fullPage: true });
    console.log('\n📸 Screenshot saved as listing-page-diagnosis.png');
    
    console.log('\n✅ Diagnosis complete. Press Ctrl+C to close the browser.');
    
    // 保持浏览器打开以便进一步检查
    await page.pause();
    
  } catch (error) {
    console.error('\n❌ Error during diagnosis:', error);
  } finally {
    await browser.close();
  }
}

// 运行诊断
diagnoseListingError().catch(console.error);