// Comprehensive diagnostic script for the listings page issue
// Run this in the browser console when on http://localhost:8082/listings

console.log('🔍 Starting Comprehensive Listings Page Diagnosis...\n');

// 1. Check current page protocol and URL
console.log('1. Page Information:');
console.log('   Current URL:', window.location.href);
console.log('   Protocol:', window.location.protocol);
console.log('   Port:', window.location.port);

// 2. Check for authentication
console.log('\n2. Authentication Status:');
const authKeys = Object.keys(localStorage).filter(key => 
  key.includes('CognitoIdentityServiceProvider') || 
  key.includes('auth') || 
  key.includes('token') ||
  key.includes('user')
);

if (authKeys.length > 0) {
  console.log('   ✅ Found authentication data in localStorage');
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`   ${key}:`, value ? value.substring(0, 50) + '...' : 'null');
  });
} else {
  console.log('   ❌ No authentication data found in localStorage');
}

// 3. Check API configuration
console.log('\n3. API Configuration:');
const apiUrl = 'http://localhost:3006/dev';
console.log('   Expected API URL:', apiUrl);

// 4. Test direct API call without authentication
console.log('\n4. Testing API without authentication:');
fetch(`${apiUrl}/listings?limit=5&status=active&status=open`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('   Response status:', response.status);
  console.log('   Response headers:', Object.fromEntries(response.headers.entries()));
  return response.json();
})
.then(data => {
  console.log('   ✅ Response data:', data);
  if (data.success && data.data?.listings) {
    console.log('   Found', data.data.listings.length, 'listings');
  }
})
.catch(error => {
  console.error('   ❌ Error:', error);
  console.log('   Error type:', error.constructor.name);
  console.log('   Error message:', error.message);
});

// 5. Check if API is accessible via proxy
console.log('\n5. Testing API via Vite proxy:');
fetch('/api/listings?limit=5&status=active&status=open', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('   Proxy response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('   ✅ Proxy response data:', data);
})
.catch(error => {
  console.error('   ❌ Proxy error:', error);
});

// 6. Check for mixed content issues
console.log('\n6. Mixed Content Check:');
if (window.location.protocol === 'https:') {
  console.log('   ⚠️  Page is on HTTPS, API calls to HTTP will be blocked!');
  console.log('   Solutions:');
  console.log('   - Access the page via HTTP: http://localhost:8082/listings');
  console.log('   - Or use the Vite proxy by changing API calls to use /api prefix');
} else {
  console.log('   ✅ Page is on HTTP, no mixed content issues');
}

// 7. Check React component state
console.log('\n7. React Component State:');
setTimeout(() => {
  // Try to find React component data
  const reactRoot = document.getElementById('root');
  if (reactRoot && reactRoot._reactRootContainer) {
    console.log('   Found React root container');
  }
  
  // Check for error messages in the UI
  const errorElements = document.querySelectorAll('[role="alert"], .error, .alert');
  if (errorElements.length > 0) {
    console.log('   Found error elements in UI:');
    errorElements.forEach((el, index) => {
      console.log(`   Error ${index + 1}:`, el.textContent);
    });
  } else {
    console.log('   No error elements found in UI');
  }
  
  // Check for loading indicators
  const loadingElements = document.querySelectorAll('.skeleton, [aria-busy="true"], .loading');
  if (loadingElements.length > 0) {
    console.log('   Found', loadingElements.length, 'loading indicators');
  }
}, 1000);

// 8. Check browser console for errors
console.log('\n8. Recent Console Errors:');
console.log('   Check the browser console above for any red error messages');

// 9. Network tab analysis
console.log('\n9. Network Analysis Instructions:');
console.log('   1. Open Developer Tools (F12)');
console.log('   2. Go to Network tab');
console.log('   3. Refresh the page');
console.log('   4. Look for requests to /listings');
console.log('   5. Check:');
console.log('      - Status code (should be 200)');
console.log('      - Request headers (look for Authorization header)');
console.log('      - Response data');
console.log('      - Any CORS errors');

// 10. Get current user info if AWS Amplify is available
console.log('\n10. AWS Amplify User Info:');
if (window.Amplify) {
  import('aws-amplify/auth').then(({ getCurrentUser, fetchAuthSession }) => {
    Promise.all([getCurrentUser(), fetchAuthSession()]).then(([user, session]) => {
      console.log('   Current user:', user);
      console.log('   User ID:', user.userId);
      console.log('   Email:', user.signInDetails?.loginId);
      console.log('   Has ID token:', !!session.tokens?.idToken);
      console.log('   ID token preview:', session.tokens?.idToken?.toString().substring(0, 50) + '...');
    }).catch(err => {
      console.log('   ❌ Error getting user info:', err.message);
    });
  });
} else {
  console.log('   ❌ AWS Amplify not found');
}

console.log('\n📋 Diagnosis Complete. Please share all the output above.');