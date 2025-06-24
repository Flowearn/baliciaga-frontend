import { chromium } from 'playwright';

async function diagnoseListingError() {
  console.log('🔍 Starting automated diagnosis of listing page network errors...\n');
  
  const browser = await chromium.launch({
    headless: true, // 无头模式以便自动运行
  });

  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8085',
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // 收集数据的容器
    const consoleErrors = [];
    const pageErrors = [];
    const networkRequests = [];
    const failedRequests = [];

    // 设置监听器
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location(),
        });
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.toString());
    });

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
          
          // 如果是错误响应，尝试获取响应体
          if (response.status() >= 400) {
            response.text().then(text => {
              request.response.body = text;
            }).catch(() => {
              // 忽略获取响应体的错误
            });
          }
        }
      }
    });

    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure(),
        resourceType: request.resourceType(),
      });
    });

    // Step 1: 访问登录页面
    console.log('📱 Step 1: Navigating to login page...');
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Step 2: 尝试登录
    console.log('🔐 Step 2: Attempting to login...');
    
    // 查找并填写登录表单
    try {
      // 尝试不同的选择器
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="Email" i]',
        '#email',
        'input[id*="email" i]'
      ];
      
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="password" i]',
        'input[placeholder*="Password" i]',
        '#password',
        'input[id*="password" i]'
      ];
      
      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          await page.fill(selector, 'test@example.com', { timeout: 1000 });
          emailFilled = true;
          console.log(`  ✓ Email filled using selector: ${selector}`);
          break;
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }
      
      let passwordFilled = false;
      for (const selector of passwordSelectors) {
        try {
          await page.fill(selector, 'password123', { timeout: 1000 });
          passwordFilled = true;
          console.log(`  ✓ Password filled using selector: ${selector}`);
          break;
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }
      
      if (!emailFilled || !passwordFilled) {
        console.log('  ⚠️  Could not fill login form, trying direct navigation to listings...');
      } else {
        // 尝试点击登录按钮
        const loginButtonSelectors = [
          'button[type="submit"]',
          'button:has-text("Login")',
          'button:has-text("Sign in")',
          'button:has-text("Sign In")',
          'button:has-text("Log in")',
          'button:has-text("Log In")',
          'input[type="submit"]'
        ];
        
        let loginClicked = false;
        for (const selector of loginButtonSelectors) {
          try {
            await page.click(selector, { timeout: 1000 });
            loginClicked = true;
            console.log(`  ✓ Login button clicked using selector: ${selector}`);
            break;
          } catch (e) {
            // 继续尝试下一个选择器
          }
        }
        
        if (loginClicked) {
          await page.waitForTimeout(2000);
        }
      }
    } catch (error) {
      console.log('  ⚠️  Error during login:', error.message);
    }
    
    // Step 3: 导航到listings页面
    console.log('\n🏠 Step 3: Navigating to listings page...');
    
    // 清除之前的记录
    networkRequests.length = 0;
    consoleErrors.length = 0;
    
    // 直接导航到listings页面
    try {
      await page.goto('/listings', { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      console.log('  ⚠️  Error navigating to listings:', error.message);
    }
    
    // 等待额外的网络请求
    await page.waitForTimeout(3000);
    
    // 生成报告
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNOSIS REPORT');
    console.log('='.repeat(50) + '\n');
    
    // 1. 控制台错误
    console.log('🔴 CONSOLE ERRORS:');
    if (consoleErrors.length === 0) {
      console.log('  ✓ No console errors detected');
    } else {
      consoleErrors.forEach((error, index) => {
        console.log(`\n  Error ${index + 1}:`);
        console.log(`    Message: ${error.text}`);
        if (error.location.url) {
          console.log(`    Location: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
    }
    
    // 2. 页面错误
    console.log('\n🔴 PAGE ERRORS:');
    if (pageErrors.length === 0) {
      console.log('  ✓ No page errors detected');
    } else {
      pageErrors.forEach((error, index) => {
        console.log(`\n  Error ${index + 1}: ${error}`);
      });
    }
    
    // 3. 失败的请求
    console.log('\n🔴 FAILED REQUESTS:');
    if (failedRequests.length === 0) {
      console.log('  ✓ No failed requests');
    } else {
      failedRequests.forEach((request, index) => {
        console.log(`\n  Failed Request ${index + 1}:`);
        console.log(`    URL: ${request.url}`);
        console.log(`    Method: ${request.method}`);
        console.log(`    Failure: ${request.failure()?.errorText || 'Unknown'}`);
      });
    }
    
    // 4. CORS分析
    console.log('\n🔍 CORS ANALYSIS:');
    
    // OPTIONS请求
    const optionsRequests = networkRequests.filter(r => r.method === 'OPTIONS');
    console.log(`\n  OPTIONS Preflight Requests: ${optionsRequests.length}`);
    
    optionsRequests.forEach((request, index) => {
      console.log(`\n  OPTIONS Request ${index + 1}:`);
      console.log(`    URL: ${request.url}`);
      if (request.response) {
        console.log(`    Status: ${request.response.status} ${request.response.statusText}`);
        const headers = request.response.headers;
        console.log(`    CORS Response Headers:`);
        console.log(`      Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || '❌ NOT SET'}`);
        console.log(`      Access-Control-Allow-Methods: ${headers['access-control-allow-methods'] || '❌ NOT SET'}`);
        console.log(`      Access-Control-Allow-Headers: ${headers['access-control-allow-headers'] || '❌ NOT SET'}`);
        console.log(`      Access-Control-Allow-Credentials: ${headers['access-control-allow-credentials'] || '❌ NOT SET'}`);
      } else {
        console.log('    ❌ No response received');
      }
    });
    
    // 5. API请求详情
    console.log('\n📡 API REQUESTS DETAILS:');
    const apiRequests = networkRequests.filter(r => r.url.includes('api') && r.method !== 'OPTIONS');
    
    if (apiRequests.length === 0) {
      console.log('  ⚠️  No API requests detected');
    } else {
      apiRequests.forEach((request, index) => {
        console.log(`\n  API Request ${index + 1}:`);
        console.log(`    URL: ${request.url}`);
        console.log(`    Method: ${request.method}`);
        console.log(`    Request Headers (CORS-related):`);
        const reqHeaders = request.headers;
        console.log(`      Origin: ${reqHeaders['origin'] || 'Not set'}`);
        console.log(`      Referer: ${reqHeaders['referer'] || 'Not set'}`);
        
        if (request.response) {
          console.log(`    Response Status: ${request.response.status} ${request.response.statusText}`);
          const respHeaders = request.response.headers;
          console.log(`    Response CORS Headers:`);
          console.log(`      Access-Control-Allow-Origin: ${respHeaders['access-control-allow-origin'] || '❌ NOT SET'}`);
          console.log(`      Access-Control-Allow-Credentials: ${respHeaders['access-control-allow-credentials'] || '❌ NOT SET'}`);
          
          if (request.response.status >= 400 && request.response.body) {
            console.log(`    Error Response Body:`);
            console.log(`      ${request.response.body.substring(0, 500)}...`);
          }
        } else {
          console.log('    ❌ No response received');
        }
      });
    }
    
    // 6. 总结
    console.log('\n' + '='.repeat(50));
    console.log('📋 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`  Current Page URL: ${page.url()}`);
    console.log(`  Total Console Errors: ${consoleErrors.length}`);
    console.log(`  Total Failed Requests: ${failedRequests.length}`);
    console.log(`  Total API Requests: ${apiRequests.length}`);
    console.log(`  Total OPTIONS Requests: ${optionsRequests.length}`);
    
    // 识别CORS问题
    const corsIssues = [];
    apiRequests.forEach(req => {
      if (req.response) {
        const headers = req.response.headers;
        if (!headers['access-control-allow-origin']) {
          corsIssues.push(`Missing Access-Control-Allow-Origin header for ${req.url}`);
        }
        if (req.response.status === 0) {
          corsIssues.push(`CORS blocked request to ${req.url}`);
        }
      }
    });
    
    if (corsIssues.length > 0) {
      console.log('\n⚠️  DETECTED CORS ISSUES:');
      corsIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // 保存截图
    await page.screenshot({ path: 'listing-diagnosis.png', fullPage: true });
    console.log('\n📸 Screenshot saved as listing-diagnosis.png');
    
  } catch (error) {
    console.error('\n❌ Fatal error during diagnosis:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Diagnosis complete.');
  }
}

// 运行诊断
diagnoseListingError().catch(console.error);