import { chromium } from 'playwright';

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnosing authentication issue...\n');
  
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

    // Enable console logging
    page.on('console', msg => {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error}`);
    });

    // First, let's check if the user is already logged in
    console.log('📱 Checking authentication state...');
    await page.goto('/');
    
    // Check if AWS Amplify auth tokens exist
    const authState = await page.evaluate(async () => {
      try {
        // Check localStorage for AWS Amplify tokens
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('CognitoIdentityServiceProvider') || 
          key.includes('amplify') ||
          key.includes('auth')
        );
        
        const authData = {};
        authKeys.forEach(key => {
          authData[key] = localStorage.getItem(key);
        });
        
        // Try to get current user
        let currentUser = null;
        try {
          const { getCurrentUser } = await import('aws-amplify/auth');
          currentUser = await getCurrentUser();
        } catch (e) {
          console.log('No current user');
        }
        
        return {
          hasAuthTokens: authKeys.length > 0,
          authKeys: authKeys,
          currentUser: currentUser,
          localStorage: authData
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('\n🔐 Current Auth State:');
    console.log('Has Auth Tokens:', authState.hasAuthTokens);
    console.log('Auth Keys:', authState.authKeys);
    console.log('Current User:', authState.currentUser);
    
    // Now login with the test account
    console.log('\n🔐 Logging in with finaltest78@test.com...');
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Fill and submit login form
    await page.fill('input[type="email"]', 'finaltest78@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    await page.waitForTimeout(3000);
    
    // Check auth state after login
    const authStateAfterLogin = await page.evaluate(async () => {
      try {
        const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        
        return {
          user: user,
          hasIdToken: !!session.tokens?.idToken,
          hasAccessToken: !!session.tokens?.accessToken,
          userSub: user?.userId,
          email: user?.signInDetails?.loginId
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('\n🔐 Auth State After Login:', JSON.stringify(authStateAfterLogin, null, 2));
    
    // Now navigate to listings and monitor what happens
    console.log('\n🏠 Navigating to /listings...');
    
    // Monitor network requests
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('/dev/')) {
        const headers = request.headers();
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          authHeader: headers['authorization'],
          testHeaders: {
            'x-test-user-sub': headers['x-test-user-sub'],
            'x-test-user-email': headers['x-test-user-email']
          }
        });
      }
    });
    
    await page.goto('/listings');
    await page.waitForTimeout(3000);
    
    // Get the page content
    const pageContent = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        // Look for any element containing "signed in users"
        errorText: Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.includes('signed in users')
        )?.textContent,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('\n📄 Page Content:');
    console.log('URL:', pageContent.url);
    console.log('Title:', pageContent.title);
    console.log('Error Text:', pageContent.errorText);
    console.log('Body Preview:', pageContent.bodyText);
    
    console.log('\n📡 API Requests Made:');
    apiRequests.forEach((req, index) => {
      console.log(`\nRequest ${index + 1}:`);
      console.log('  URL:', req.url);
      console.log('  Method:', req.method);
      console.log('  Auth Header:', req.authHeader ? 'Present' : 'Missing');
      console.log('  Test Headers:', req.testHeaders);
    });
    
    // Check console for errors
    await page.evaluate(() => {
      console.log('🔍 Checking for errors in console...');
      // Trigger any console errors
      if (window.errors) {
        console.error('Window errors:', window.errors);
      }
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'auth-issue-diagnosis.png', fullPage: true });
    console.log('\n📸 Screenshot saved as auth-issue-diagnosis.png');
    
    console.log('\n⏸️  Browser will remain open for manual inspection...');
    console.log('   Check the Network tab in DevTools for failed requests.');
    console.log('   Check the Console for any error messages.');
    console.log('   Press Ctrl+C to close the browser and exit.');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

diagnoseAuthIssue().catch(console.error);