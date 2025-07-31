#!/usr/bin/env node

// QR Promotion System Test Script
const http = require('http');

const BASE_URL = 'http://localhost:3008';

// Test configuration
const tests = [
    {
        name: 'Health Check',
        method: 'GET',
        path: '/api/health',
        expected: { success: true }
    },
    {
        name: 'Auth Status (Not Logged In)',
        method: 'GET',
        path: '/api/auth-status',
        expected: { authenticated: false }
    },
    {
        name: 'Login Test',
        method: 'POST',
        path: '/api/login',
        data: { username: 'admin', password: 'Thien.28' },
        expected: { success: true }
    }
];

// HTTP request helper
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: jsonBody
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Run a single test
async function runTest(test) {
    console.log(`\n🧪 Testing: ${test.name}`);
    
    const options = {
        hostname: 'localhost',
        port: 3008,
        path: test.path,
        method: test.method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await makeRequest(options, test.data);
        
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
        
        // Check if response matches expected
        if (test.expected) {
            const matches = Object.keys(test.expected).every(key => 
                response.body[key] === test.expected[key]
            );
            
            if (matches) {
                console.log(`   ✅ PASS`);
                return true;
            } else {
                console.log(`   ❌ FAIL - Expected: ${JSON.stringify(test.expected)}`);
                return false;
            }
        } else {
            console.log(`   ✅ PASS (No validation)`);
            return true;
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting QR Promotion System Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await runTest(test);
        if (result) {
            passed++;
        } else {
            failed++;
        }
    }
    
    console.log('\n📊 Test Results:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please check the issues above.');
        process.exit(1);
    }
}

// Check if server is running
async function checkServer() {
    console.log('🔍 Checking if server is running...');
    
    try {
        const options = {
            hostname: 'localhost',
            port: 3008,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        };
        
        await makeRequest(options);
        console.log('✅ Server is running on port 3008\n');
        return true;
    } catch (error) {
        console.log('❌ Server is not running on port 3008');
        console.log('   Please start the server with: npm run pm2:start');
        console.log('   Or check if it\'s running on a different port\n');
        return false;
    }
}

// Run the tests
async function main() {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        process.exit(1);
    }
    
    await runAllTests();
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
QR Promotion System Test Script

Usage:
  node test-system.js          Run all tests
  node test-system.js --help   Show this help message

This script tests the basic functionality of the QR Promotion System:
- Health check endpoint
- Authentication status
- Login functionality

Make sure the server is running on port 3008 before running tests.
`);
    process.exit(0);
}

// Run main function
main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
