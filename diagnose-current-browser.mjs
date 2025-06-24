import { chromium } from 'playwright';

async function diagnoseBrowserState() {
  console.log('🔍 Starting diagnosis of current browser state...\n');
  
  const browser = await chromium.launch({
    headless: false, // Run with UI to see what's happening
    devtools: true,  // Open developer tools automatically
  });

  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8082',
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // Collect data containers
    const consoleMessages = [];
    const pageErrors = [];
    const networkRequests = [];
    const failedRequests = [];

    // Set up listeners
    page.on('console', msg => {
      const entry = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      };
      consoleMessages.push(entry);
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      pageErrors.push({
        error: error.toString(),
        timestamp: new Date().toISOString()
      });
      console.log(`[PAGE ERROR] ${error.toString()}`);
    });

    page.on('request', request => {
      const entry = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        resourceType: request.resourceType(),
        timestamp: new Date().toISOString(),
        postData: request.postData()
      };
      networkRequests.push(entry);
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      const url = response.url();
      const request = networkRequests.find(r => r.url === url && !r.response);
      if (request) {
        request.response = {
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          timestamp: new Date().toISOString(),
        };
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
        
        // Get response body for errors
        if (response.status() >= 400 || url.includes('/api/')) {
          response.text().then(text => {
            request.response.body = text;
            if (response.status() >= 400) {
              console.log(`[ERROR BODY] ${text}`);
            }
          }).catch(() => {});
        }
      }
    });

    page.on('requestfailed', request => {
      const entry = {
        url: request.url(),
        method: request.method(),
        failure: request.failure(),
        resourceType: request.resourceType(),
        timestamp: new Date().toISOString()
      };
      failedRequests.push(entry);
      console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Step 1: Try to login with the test account
    console.log('\n📱 Step 1: Navigating to login page...');
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Check localStorage and sessionStorage
    console.log('\n🔍 Checking storage before login:');
    const storageBeforeLogin = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie
      };
    });
    console.log('Storage:', JSON.stringify(storageBeforeLogin, null, 2));

    // Step 2: Login with the test account
    console.log('\n🔐 Step 2: Logging in with finaltest78@test.com...');
    
    try {
      await page.fill('input[type="email"], input[name="email"], #email', 'finaltest78@test.com');
      await page.fill('input[type="password"], input[name="password"], #password', 'test123');
      
      // Wait a moment to ensure form is ready
      await page.waitForTimeout(500);
      
      // Try to submit the form
      await Promise.race([
        page.click('button[type="submit"]'),
        page.press('input[type="password"]', 'Enter'),
      ]);
      
      // Wait for navigation or API response
      await page.waitForTimeout(3000);
      
    } catch (error) {
      console.log('⚠️ Error during login:', error.message);
    }
    
    // Check storage after login
    console.log('\n🔍 Checking storage after login:');
    const storageAfterLogin = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie,
        currentUrl: window.location.href
      };
    });
    console.log('Storage:', JSON.stringify(storageAfterLogin, null, 2));
    
    // Step 3: Navigate to listings page
    console.log('\n🏠 Step 3: Navigating to listings page...');
    
    // Clear previous logs
    networkRequests.length = 0;
    consoleMessages.length = 0;
    
    try {
      await page.goto('/listings', { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      console.log('⚠️ Error navigating to listings:', error.message);
    }
    
    // Wait for any additional requests
    await page.waitForTimeout(3000);
    
    // Get the current page content
    console.log('\n📄 Current page content:');
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.innerText.substring(0, 500),
        errorElements: Array.from(document.querySelectorAll('[class*="error"], [class*="Error"], .error-message, .alert')).map(el => ({
          className: el.className,
          text: el.innerText
        }))
      };
    });
    console.log('Page info:', JSON.stringify(pageContent, null, 2));
    
    // Take screenshots
    await page.screenshot({ path: 'listing-page-current.png', fullPage: true });
    console.log('\n📸 Screenshot saved as listing-page-current.png');
    
    // Generate detailed report
    console.log('\n' + '='.repeat(60));
    console.log('📊 DETAILED DIAGNOSIS REPORT');
    console.log('='.repeat(60) + '\n');
    
    // API Requests Analysis
    console.log('📡 API REQUESTS TO /listings ENDPOINT:');
    const listingApiRequests = networkRequests.filter(r => r.url.includes('/api/') && r.url.includes('listing'));
    
    if (listingApiRequests.length === 0) {
      console.log('  ⚠️ No API requests to listings endpoint detected');
    } else {
      listingApiRequests.forEach((req, index) => {
        console.log(`\n  Request ${index + 1}:`);
        console.log(`    URL: ${req.url}`);
        console.log(`    Method: ${req.method}`);
        console.log(`    Headers:`);
        Object.entries(req.headers).forEach(([key, value]) => {
          if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('cookie') || key.toLowerCase().includes('origin')) {
            console.log(`      ${key}: ${value}`);
          }
        });
        
        if (req.response) {
          console.log(`    Response Status: ${req.response.status} ${req.response.statusText}`);
          if (req.response.body) {
            console.log(`    Response Body: ${req.response.body}`);
          }
        }
      });
    }
    
    // Console errors specific to listings
    console.log('\n🔴 CONSOLE ERRORS/WARNINGS:');
    const relevantMessages = consoleMessages.filter(m => m.type === 'error' || m.type === 'warning');
    if (relevantMessages.length === 0) {
      console.log('  ✓ No console errors or warnings');
    } else {
      relevantMessages.forEach((msg, index) => {
        console.log(`\n  ${msg.type.toUpperCase()} ${index + 1}:`);
        console.log(`    Message: ${msg.text}`);
        console.log(`    Time: ${msg.timestamp}`);
      });
    }
    
    // Failed requests
    console.log('\n🔴 FAILED NETWORK REQUESTS:');
    if (failedRequests.length === 0) {
      console.log('  ✓ No failed requests');
    } else {
      failedRequests.forEach((req, index) => {
        console.log(`\n  Failed Request ${index + 1}:`);
        console.log(`    URL: ${req.url}`);
        console.log(`    Error: ${req.failure?.errorText}`);
      });
    }
    
    // Check authentication state
    console.log('\n🔐 AUTHENTICATION STATE:');
    const authState = await page.evaluate(() => {
      const checkAuth = () => {
        const possibleTokenKeys = ['token', 'authToken', 'accessToken', 'jwt', 'auth_token', 'access_token'];
        const tokens = {};
        
        // Check localStorage
        possibleTokenKeys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) tokens[`localStorage.${key}`] = value.substring(0, 20) + '...';
        });
        
        // Check sessionStorage
        possibleTokenKeys.forEach(key => {
          const value = sessionStorage.getItem(key);
          if (value) tokens[`sessionStorage.${key}`] = value.substring(0, 20) + '...';
        });
        
        // Check cookies
        const cookieTokens = {};
        document.cookie.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (possibleTokenKeys.some(key => name.toLowerCase().includes(key.toLowerCase()))) {
            cookieTokens[name] = value ? value.substring(0, 20) + '...' : 'empty';
          }
        });
        
        return { tokens, cookies: cookieTokens };
      };
      
      return checkAuth();
    });
    console.log('Auth tokens found:', JSON.stringify(authState, null, 2));
    
    console.log('\n✅ Diagnosis complete. Browser window will remain open for manual inspection.');
    console.log('   Check the Developer Tools for more details.');
    
    // Keep browser open for manual inspection
    console.log('\n⏸️  Press Ctrl+C to close the browser and exit...');
    await new Promise(() => {}); // Keep script running
    
  } catch (error) {
    console.error('\n❌ Fatal error during diagnosis:', error);
  }
}

// Run diagnosis
diagnoseBrowserState().catch(console.error);