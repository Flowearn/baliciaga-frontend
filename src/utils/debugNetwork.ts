export async function debugNetworkIssue() {
  console.group('🔍 Network Debug Report');
  
  // 1. Check environment
  console.log('Environment:', {
    origin: window.location.origin,
    protocol: window.location.protocol,
    apiUrl: import.meta.env.VITE_API_BASE_URL,
    nodeEnv: import.meta.env.MODE
  });
  
  // 2. Test basic connectivity
  try {
    const basicResponse = await fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/places');
    console.log('✅ Basic API connectivity: OK', basicResponse.status);
  } catch (e) {
    console.error('❌ Basic API connectivity: FAILED', e);
  }
  
  // 3. Test CORS preflight
  try {
    const corsResponse = await fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/users/me/avatar-upload-url', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    });
    console.log('✅ CORS preflight: OK', corsResponse.status);
    
    // Log CORS headers
    const corsHeaders: Record<string, string> = {};
    corsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('access-control')) {
        corsHeaders[key] = value;
      }
    });
    console.log('CORS Headers:', corsHeaders);
  } catch (e) {
    console.error('❌ CORS preflight: FAILED', e);
  }
  
  // 4. Test actual POST with fetch
  try {
    const postResponse = await fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/users/me/avatar-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      body: JSON.stringify({
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1000
      })
    });
    console.log('✅ POST with fetch: OK', postResponse.status);
    const responseText = await postResponse.text();
    console.log('Response:', responseText);
  } catch (e) {
    console.error('❌ POST with fetch: FAILED', e);
  }
  
  // 5. Check for browser extensions
  if ((window as any).chrome?.runtime?.id) {
    console.warn('⚠️ Chrome extension detected - may interfere with requests');
  }
  
  // 6. Check for ad blockers
  const testAdBlocker = document.createElement('div');
  testAdBlocker.className = 'ad-banner';
  document.body.appendChild(testAdBlocker);
  setTimeout(() => {
    if (testAdBlocker.offsetHeight === 0) {
      console.warn('⚠️ Ad blocker detected - may interfere with requests');
    }
    document.body.removeChild(testAdBlocker);
  }, 100);
  
  console.groupEnd();
}

// Export to window for easy access
(window as any).debugNetworkIssue = debugNetworkIssue;