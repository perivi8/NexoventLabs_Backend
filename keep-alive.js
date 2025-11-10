#!/usr/bin/env node

/**
 * Keep-Alive Script for Render Backend
 * 
 * This script pings the backend server to prevent it from sleeping
 * Run this as a cron job on Render or any external service
 * 
 * Usage:
 * - Set BACKEND_URL environment variable to your Render backend URL
 * - Run: node keep-alive.js
 */

import https from 'https';
import http from 'http';

const BACKEND_URL = process.env.BACKEND_URL || 'https://nexoventlabs-backend.onrender.com';
const PING_ENDPOINT = '/api/ping';
const HEALTH_ENDPOINT = '/api/health';
const TIMEOUT = 30000; // 30 seconds timeout

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'NexoventLabs-KeepAlive/1.0',
        'Accept': 'application/json'
      }
    };

    const startTime = Date.now();
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            duration,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            duration,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      reject({
        error: error.message,
        duration
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        duration: TIMEOUT
      });
    });

    req.end();
  });
}

async function pingServer() {
  log('🚀 Starting keep-alive ping...', 'cyan');
  log(`📡 Target: ${BACKEND_URL}`, 'blue');
  
  try {
    // First, try the ping endpoint
    log('📍 Pinging /api/ping...', 'blue');
    const pingResult = await makeRequest(`${BACKEND_URL}${PING_ENDPOINT}`);
    
    if (pingResult.success) {
      log(`✅ Ping successful! (${pingResult.duration}ms)`, 'green');
      log(`📊 Response: ${JSON.stringify(pingResult.data)}`, 'green');
      
      // Also check health endpoint for detailed status
      log('📍 Checking /api/health...', 'blue');
      const healthResult = await makeRequest(`${BACKEND_URL}${HEALTH_ENDPOINT}`);
      
      if (healthResult.success) {
        log(`✅ Health check successful! (${healthResult.duration}ms)`, 'green');
        
        if (healthResult.data.uptime) {
          log(`⏱️  Server uptime: ${healthResult.data.uptime.formatted}`, 'cyan');
        }
        
        if (healthResult.data.keepAlive) {
          log(`🔄 Total pings: ${healthResult.data.keepAlive.totalPings}`, 'cyan');
        }
        
        if (healthResult.data.services) {
          log(`📧 Email service: ${healthResult.data.services.email}`, 'cyan');
          log(`🤖 Chatbot service: ${healthResult.data.services.chatbot}`, 'cyan');
        }
        
        log('✅ Keep-alive completed successfully!', 'green');
        process.exit(0);
      } else {
        log(`⚠️  Health check returned status ${healthResult.statusCode}`, 'yellow');
        log('✅ But ping was successful, server is alive!', 'green');
        process.exit(0);
      }
    } else {
      log(`❌ Ping failed with status ${pingResult.statusCode}`, 'red');
      log(`📋 Response: ${JSON.stringify(pingResult.data)}`, 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`❌ Keep-alive failed: ${error.error || error.message}`, 'red');
    log(`⏱️  Duration: ${error.duration}ms`, 'red');
    
    // Try one more time with just a basic HTTP request
    log('🔄 Retrying with basic request...', 'yellow');
    
    try {
      const retryResult = await makeRequest(BACKEND_URL);
      if (retryResult.success) {
        log(`✅ Retry successful! Server is responding (${retryResult.duration}ms)`, 'green');
        process.exit(0);
      } else {
        log(`❌ Retry failed with status ${retryResult.statusCode}`, 'red');
        process.exit(1);
      }
    } catch (retryError) {
      log(`❌ Retry also failed: ${retryError.error || retryError.message}`, 'red');
      process.exit(1);
    }
  }
}

// Run the ping
pingServer();
