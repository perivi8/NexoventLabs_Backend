#!/usr/bin/env node

/**
 * Quick Test Script for Ping Endpoint
 * 
 * Usage: node test-ping.js [URL]
 * Example: node test-ping.js https://nexoventlabs-backend.onrender.com
 */

import https from 'https';
import http from 'http';

const BACKEND_URL = process.argv[2] || process.env.BACKEND_URL || 'https://nexoventlabs-backend.onrender.com';

console.log('🧪 Testing Ping Endpoint');
console.log('📡 URL:', BACKEND_URL);
console.log('━'.repeat(50));

function testEndpoint(url, endpoint) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(endpoint, url);
    const protocol = fullUrl.protocol === 'https:' ? https : http;
    
    console.log(`\n📍 Testing: ${fullUrl.href}`);
    const startTime = Date.now();
    
    const req = protocol.request(fullUrl, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`⏱️  Duration: ${duration}ms`);
          console.log(`📊 Response:`, JSON.stringify(jsonData, null, 2));
          resolve({ success: true, statusCode: res.statusCode, data: jsonData, duration });
        } catch (e) {
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`⏱️  Duration: ${duration}ms`);
          console.log(`📄 Response: ${data}`);
          resolve({ success: true, statusCode: res.statusCode, data, duration });
        }
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ Error: ${error.message}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      reject({ error: error.message, duration });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ Timeout after 10 seconds`);
      reject({ error: 'Timeout', duration: 10000 });
    });
    
    req.end();
  });
}

async function runTests() {
  const endpoints = [
    { name: 'Root', path: '/' },
    { name: 'Ping', path: '/api/ping' },
    { name: 'Health', path: '/api/health' }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Testing: ${endpoint.name}`);
      console.log('='.repeat(50));
      
      const result = await testEndpoint(BACKEND_URL, endpoint.path);
      
      if (result.statusCode !== 200) {
        allPassed = false;
        console.log(`⚠️  Warning: Expected status 200, got ${result.statusCode}`);
      }
    } catch (error) {
      allPassed = false;
      console.log(`❌ Test failed for ${endpoint.name}`);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  
  if (allPassed) {
    console.log('✅ All tests passed!');
    console.log('💡 Your backend is ready for cron job pings');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    console.log('💡 Check the errors above and verify your backend URL');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
