// 请在 https://baliciaga.com 的浏览器控制台中运行此代码

// 1. 检查当前页面的 Origin
console.log('当前页面 Origin:', window.location.origin);

// 2. 测试 OPTIONS 预检请求
fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/users/me/avatar-upload-url', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'authorization,content-type'
  }
}).then(res => {
  console.log('OPTIONS 预检请求状态:', res.status);
  console.log('CORS Headers:');
  res.headers.forEach((value, key) => {
    if (key.toLowerCase().includes('access-control')) {
      console.log(`  ${key}: ${value}`);
    }
  });
}).catch(err => console.error('OPTIONS 请求失败:', err));

// 3. 等待 2 秒后测试实际的 POST 请求
setTimeout(() => {
  // 获取真实的 token
  const authHeader = document.querySelector('[data-auth]')?.dataset?.auth || 
    localStorage.getItem('CognitoIdentityServiceProvider.uih6lkbummdletgseo8p2385b.LastAuthUser');
  
  console.log('\n测试 POST 请求...');
  
  fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/users/me/avatar-upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // 会返回 401，但能测试连接
    },
    body: JSON.stringify({
      fileName: 'test.jpg',
      fileType: 'image/jpeg', 
      fileSize: 1000
    })
  }).then(res => {
    console.log('POST 请求状态:', res.status);
    return res.text();
  }).then(text => {
    console.log('响应内容:', text);
  }).catch(err => {
    console.error('POST 请求失败:', err);
    console.error('错误类型:', err.name);
    console.error('错误消息:', err.message);
  });
}, 2000);