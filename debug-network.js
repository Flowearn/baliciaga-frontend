// 在浏览器控制台中运行这个脚本来测试网络连接
async function debugNetworkIssue() {
  console.log('🔍 开始网络调试...');
  
  // 1. 测试基本连接
  try {
    const response = await fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/places');
    console.log('✅ 基本连接测试成功:', response.status);
  } catch (error) {
    console.error('❌ 基本连接失败:', error);
  }
  
  // 2. 测试 CORS 预检
  try {
    const corsResponse = await fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/users/me/avatar-upload-url', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://baliciaga.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    });
    console.log('✅ CORS 预检成功:', corsResponse.status);
    console.log('CORS Headers:', Object.fromEntries(corsResponse.headers.entries()));
  } catch (error) {
    console.error('❌ CORS 预检失败:', error);
  }
  
  // 3. 获取当前用户的真实 token
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    if (idToken) {
      console.log('✅ 获取到认证 token');
      
      // 4. 使用真实 token 测试端点
      const testResponse = await fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/users/me/avatar-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'Origin': 'https://baliciaga.vercel.app'
        },
        body: JSON.stringify({
          fileName: 'test.jpg',
          fileType: 'image/jpeg',
          fileSize: 1000
        })
      });
      
      console.log('✅ 真实请求响应状态:', testResponse.status);
      const responseText = await testResponse.text();
      console.log('响应内容:', responseText);
      
    } else {
      console.error('❌ 无法获取认证 token');
    }
  } catch (error) {
    console.error('❌ 认证测试失败:', error);
  }
}

// 运行调试
debugNetworkIssue();