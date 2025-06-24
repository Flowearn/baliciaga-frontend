import { chromium } from 'playwright';

async function captureBrowserState() {
  console.log('🔍 Capturing current browser state with authentication issue...\n');
  
  // Connect to existing browser instead of launching a new one
  const browser = await chromium.launch({
    headless: false,
    devtools: true,
  });

  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8082',
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // Navigate directly to the problematic URL shown in the error
    console.log('📱 Navigating to the problematic URL...');
    
    // First, let's check the login state
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    // Try logging in
    console.log('🔐 Attempting login with finaltest78@test.com...');
    await page.fill('input[type="email"]', 'finaltest78@test.com');
    await page.fill('input[type="password"]', 'test123');
    
    // Take a screenshot before submitting
    await page.screenshot({ path: 'login-form-filled.png', fullPage: true });
    
    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check current URL and any error messages
    const currentState = await page.evaluate(() => {
      return {
        currentUrl: window.location.href,
        pageTitle: document.title,
        errorMessages: Array.from(document.querySelectorAll('.error, .error-message, [role="alert"]')).map(el => el.textContent),
        bodyText: document.body.innerText,
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {}),
        sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
          acc[key] = sessionStorage.getItem(key);
          return acc;
        }, {}),
        cookies: document.cookie
      };
    });
    
    console.log('\n📊 Current Browser State:');
    console.log('URL:', currentState.currentUrl);
    console.log('Title:', currentState.pageTitle);
    console.log('Error Messages:', currentState.errorMessages);
    console.log('\nStorage State:');
    console.log('LocalStorage:', JSON.stringify(currentState.localStorage, null, 2));
    console.log('SessionStorage:', JSON.stringify(currentState.sessionStorage, null, 2));
    console.log('Cookies:', currentState.cookies);
    
    // Now navigate to listings
    console.log('\n🏠 Navigating to /listings...');
    const response = await page.goto('/listings', { waitUntil: 'networkidle' });
    
    // Capture the exact error
    const listingsState = await page.evaluate(() => {
      // Look for any error messages
      const errorElements = document.querySelectorAll('*');
      const errorTexts = [];
      
      errorElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.toLowerCase().includes('signed in users')) {
          errorTexts.push({
            text: text,
            element: el.tagName,
            className: el.className,
            id: el.id
          });
        }
      });
      
      return {
        currentUrl: window.location.href,
        pageContent: document.body.innerText,
        errorMessages: errorTexts,
        authHeaders: {
          // Check if there are any auth-related meta tags or scripts
          metaTags: Array.from(document.querySelectorAll('meta')).map(m => ({
            name: m.getAttribute('name'),
            content: m.getAttribute('content')
          })).filter(m => m.name && (m.name.includes('auth') || m.name.includes('token')))
        }
      };
    });
    
    console.log('\n📄 Listings Page State:');
    console.log('URL:', listingsState.currentUrl);
    console.log('Error Messages Found:', JSON.stringify(listingsState.errorMessages, null, 2));
    
    // Take final screenshot
    await page.screenshot({ path: 'listings-error-state.png', fullPage: true });
    console.log('\n📸 Screenshots saved: login-form-filled.png, listings-error-state.png');
    
    // Check network requests
    console.log('\n🔍 Monitoring network requests to /listings...');
    page.on('request', request => {
      if (request.url().includes('/listings') || request.url().includes('api')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
        console.log('Headers:', request.headers());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/listings') || response.url().includes('api')) {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      }
    });
    
    // Try to access the listings API directly
    console.log('\n🔍 Checking API access...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3006/dev/listings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include any auth headers if they exist
          },
          credentials: 'include'
        });
        
        const text = await response.text();
        return {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: text
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('API Response:', JSON.stringify(apiResponse, null, 2));
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
  }
}

captureBrowserState().catch(console.error);