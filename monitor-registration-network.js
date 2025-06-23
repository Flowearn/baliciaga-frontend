// Network Request Monitor for User Registration
// Run this script in the browser console before performing registration

console.log('🔍 Starting network request monitoring for user registration...');

// Store original fetch
const originalFetch = window.fetch;

// Array to store captured requests
const capturedRequests = [];

// Override fetch to intercept all requests
window.fetch = async function(...args) {
    const [resource, config] = args;
    const method = (config && config.method) || 'GET';
    
    console.log(`📤 ${method} Request to:`, resource);
    
    // Clone the request body if it exists
    let requestBody = null;
    if (config && config.body) {
        try {
            requestBody = JSON.parse(config.body);
        } catch (e) {
            requestBody = config.body;
        }
    }
    
    const requestInfo = {
        url: resource,
        method: method,
        headers: config?.headers || {},
        body: requestBody,
        timestamp: new Date().toISOString()
    };
    
    console.log('Request Details:', requestInfo);
    
    try {
        // Call original fetch
        const response = await originalFetch.apply(this, args);
        
        // Clone response to read it
        const responseClone = response.clone();
        let responseBody = null;
        
        try {
            responseBody = await responseClone.json();
        } catch (e) {
            try {
                responseBody = await responseClone.text();
            } catch (e2) {
                responseBody = 'Unable to read response body';
            }
        }
        
        const responseInfo = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody
        };
        
        console.log(`📥 ${method} Response from ${resource}:`, responseInfo);
        
        // Store complete request/response info
        capturedRequests.push({
            request: requestInfo,
            response: responseInfo
        });
        
        // Highlight Cognito or localhost:3006 requests
        if (resource.includes('cognito-idp') || resource.includes('localhost:3006')) {
            console.warn('⚠️ IMPORTANT REQUEST CAPTURED:', {
                url: resource,
                request: requestInfo,
                response: responseInfo
            });
        }
        
        return response;
    } catch (error) {
        console.error(`❌ ${method} Request failed for ${resource}:`, error);
        capturedRequests.push({
            request: requestInfo,
            error: error.message
        });
        throw error;
    }
};

// Also monitor XMLHttpRequest (in case AWS SDK uses it)
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._method = method;
    this._url = url;
    console.log(`📤 XHR ${method} Request to:`, url);
    return originalXHROpen.apply(this, [method, url, ...args]);
};

XMLHttpRequest.prototype.send = function(body) {
    const xhr = this;
    const method = xhr._method;
    const url = xhr._url;
    
    let requestBody = null;
    if (body) {
        try {
            requestBody = JSON.parse(body);
        } catch (e) {
            requestBody = body;
        }
    }
    
    console.log('XHR Request Details:', {
        url: url,
        method: method,
        body: requestBody
    });
    
    xhr.addEventListener('load', function() {
        let responseBody = null;
        try {
            responseBody = JSON.parse(xhr.responseText);
        } catch (e) {
            responseBody = xhr.responseText;
        }
        
        console.log(`📥 XHR Response from ${url}:`, {
            status: xhr.status,
            statusText: xhr.statusText,
            body: responseBody
        });
        
        if (url.includes('cognito-idp') || url.includes('localhost:3006')) {
            console.warn('⚠️ IMPORTANT XHR REQUEST CAPTURED:', {
                url: url,
                method: method,
                request: { body: requestBody },
                response: {
                    status: xhr.status,
                    body: responseBody
                }
            });
        }
    });
    
    return originalXHRSend.apply(this, [body]);
};

// Function to get all captured requests
window.getCapturedRequests = () => {
    console.log('📊 All Captured Requests:', capturedRequests);
    return capturedRequests;
};

// Function to get only Cognito/backend requests
window.getImportantRequests = () => {
    const important = capturedRequests.filter(req => 
        req.request.url.includes('cognito-idp') || 
        req.request.url.includes('localhost:3006')
    );
    console.log('⚠️ Important Requests (Cognito/Backend):', important);
    return important;
};

// Function to export data as JSON
window.exportNetworkData = () => {
    const data = JSON.stringify(capturedRequests, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network-capture-' + new Date().toISOString() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Network data exported');
};

console.log('✅ Network monitoring is now active!');
console.log('📝 Instructions:');
console.log('1. Perform the registration with email: network-test@test.com');
console.log('2. After registration, run: window.getImportantRequests()');
console.log('3. To see all requests: window.getCapturedRequests()');
console.log('4. To export data: window.exportNetworkData()');