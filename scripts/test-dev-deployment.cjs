#!/usr/bin/env node

const https = require('https');

// Dev frontend URL - 可能需要根据实际URL调整
const DEV_FRONTEND_URL = 'https://baliciaga-dev.vercel.app';

function checkDeployment() {
  console.log('Checking frontend deployment status...\n');
  
  // 检查主页是否可访问
  https.get(DEV_FRONTEND_URL, (res) => {
    console.log(`Frontend Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    if (res.statusCode === 200) {
      console.log('\n✅ Frontend is accessible');
      console.log('Deployment ID:', res.headers['x-vercel-deployment-url'] || 'N/A');
      console.log('Cache Status:', res.headers['x-vercel-cache'] || 'N/A');
    } else {
      console.log('\n❌ Frontend returned status:', res.statusCode);
    }
  }).on('error', (err) => {
    console.error('Error accessing frontend:', err.message);
  });
}

// 提示
console.log(`
要验证bar attributes是否正确显示：

1. 访问 ${DEV_FRONTEND_URL}
2. 导航到 Bars 分类
3. 点击任意一个bar (如 Honeycomb Hookah & Eatery)
4. 检查是否显示以下属性：
   - Bar Type
   - Drink Focus
   - Atmosphere
   - Price Range
   - Signature Drinks (如果有)

如果仍然只显示 Atmosphere，可能需要：
- 等待 Vercel 部署完成（通常1-2分钟）
- 清除浏览器缓存并刷新页面
- 检查浏览器控制台是否有错误
`);

checkDeployment();