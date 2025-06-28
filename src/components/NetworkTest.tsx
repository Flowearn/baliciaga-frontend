import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function NetworkTest() {
  const [results, setResults] = useState<string[]>([]);
  
  const addResult = (msg: string) => {
    setResults(prev => [...prev, msg]);
    console.log(msg);
  };
  
  const runTests = async () => {
    setResults([]);
    addResult('开始网络测试...');
    
    const apiUrl = 'https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/users/me/avatar-upload-url';
    
    // Test 1: 直接 fetch 不带凭证
    try {
      addResult('\n测试1: 简单 fetch (无凭证)');
      const resp1 = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'test.jpg',
          fileType: 'image/jpeg',
          fileSize: 1000
        })
      });
      addResult(`状态码: ${resp1.status}`);
    } catch (e: any) {
      addResult(`错误: ${e.message}`);
    }
    
    // Test 2: 带 Authorization 头
    try {
      addResult('\n测试2: 带 Authorization 头');
      const resp2 = await fetch(apiUrl, {
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
      addResult(`状态码: ${resp2.status}`);
      const text = await resp2.text();
      addResult(`响应: ${text}`);
    } catch (e: any) {
      addResult(`错误: ${e.message}`);
    }
    
    // Test 3: 测试其他 API
    try {
      addResult('\n测试3: 测试 /places 端点');
      const resp3 = await fetch('https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod/places');
      addResult(`状态码: ${resp3.status}`);
    } catch (e: any) {
      addResult(`错误: ${e.message}`);
    }
    
    // Test 4: 检查浏览器扩展
    addResult('\n测试4: 浏览器环境检查');
    if ((window as any).chrome?.runtime?.id) {
      addResult('检测到 Chrome 扩展');
    }
    
    // 检查广告拦截器
    const testDiv = document.createElement('div');
    testDiv.className = 'ad-banner google-ad adsbox';
    testDiv.style.height = '1px';
    document.body.appendChild(testDiv);
    
    setTimeout(() => {
      if (testDiv.offsetHeight === 0) {
        addResult('检测到广告拦截器 - 可能干扰网络请求');
      } else {
        addResult('未检测到广告拦截器');
      }
      document.body.removeChild(testDiv);
    }, 100);
    
    addResult('\n测试完成！');
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="font-bold mb-2">网络诊断工具</h3>
      <Button onClick={runTests} className="mb-2">运行测试</Button>
      <pre className="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-auto">
        {results.join('\n')}
      </pre>
    </div>
  );
}