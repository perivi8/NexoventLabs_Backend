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
 * 
 * Optimized for Render Cron Jobs:
 * - Fast execution (< 30 seconds)
 * - Proper error handling
 * - Retry logic for cold starts
 */

import https from 'https';
import http from 'http';

const BACKEND_URL = process.env.BACKEND_URL || 'https://nexoventlabs-backend.onrender.com';
const PING_ENDPOINT = '/api/ping';
const TIMEOUT = 25000; // 25 seconds timeout (Render cron has 30s limit)
const MAX_RETRIES = 2; // Retry twice for cold starts

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

async function pingWithRetry(url, attempt = 1) {
  try {
    log(`📍 Attempt ${attempt}/${MAX_RETRIES + 1}: Pinging ${url}...`, 'blue');
    const result = await makeRequest(url);
    
    if (result.success) {
      log(`✅ Ping successful! (${result.duration}ms)`, 'green');
      if (result.data && typeof result.data === 'object') {
        log(`📊 Status: ${result.data.status || 'alive'}`, 'green');
        if (result.data.pings) {
          log(`🔄 Total pings: ${result.data.pings}`, 'cyan');
        }
      }
      return true;
    } else {
      throw new Error(`HTTP ${result.statusCode}: ${JSON.stringify(result.data)}`);
    }
  } catch (error) {
    const errorMsg = error.error || error.message;
    log(`❌ Attempt ${attempt} failed: ${errorMsg}`, 'red');
    
    if (attempt <= MAX_RETRIES) {
      const waitTime = attempt * 2000; // 2s, 4s
      log(`⏳ Waiting ${waitTime}ms before retry (server might be cold starting)...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return pingWithRetry(url, attempt + 1);
    }
    
    return false;
  }
}

async function pingServer() {
  log('🚀 Starting keep-alive ping...', 'cyan');
  log(`📡 Target: ${BACKEND_URL}${PING_ENDPOINT}`, 'blue');
  log(`⏱️  Timeout: ${TIMEOUT}ms`, 'blue');
  
  const pingUrl = `${BACKEND_URL}${PING_ENDPOINT}`;
  const success = await pingWithRetry(pingUrl);
  
  if (success) {
    log('✅ Keep-alive completed successfully!', 'green');
    process.exit(0);
  } else {
    log('❌ Keep-alive failed after all retries', 'red');
    log('💡 Check if BACKEND_URL is correct and server is deployed', 'yellow');
    log(`💡 Current URL: ${BACKEND_URL}`, 'yellow');
    process.exit(1);
  }
}

// Run the ping
pingServer();
