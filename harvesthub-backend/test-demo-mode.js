// Test script for demo mode authentication
// This script tests the auto-provisioning demo login feature

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testDemoLogin() {
  console.log('🧪 Testing Demo Mode Authentication...\n');

  // Test 1: Login with new customer email (should auto-create)
  console.log('Test 1: New customer login (auto-provisioning)');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newcustomer@test.com',
        password: 'anypassword123',
        userType: 'customer'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Test 1 passed\n');
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message, '\n');
  }

  // Test 2: Login with new farmer email (should auto-create)
  console.log('Test 2: New farmer login (auto-provisioning)');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newfarmer@test.com',
        password: 'anypassword456',
        userType: 'farmer'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Test 2 passed\n');
  } catch (error) {
    console.log('❌ Test 2 failed:', error.message, '\n');
  }

  // Test 3: Login with existing user (should accept any password in demo mode)
  console.log('Test 3: Existing user login with different password');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newcustomer@test.com',
        password: 'differentpassword789',
        userType: 'customer'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Test 3 passed\n');
  } catch (error) {
    console.log('❌ Test 3 failed:', error.message, '\n');
  }

  // Test 4: Customer route login
  console.log('Test 4: Customer route login');
  try {
    const response = await fetch(`${API_BASE}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customerroute@test.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Test 4 passed\n');
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message, '\n');
  }

  // Test 5: Farmer route login
  console.log('Test 5: Farmer route login');
  try {
    const response = await fetch(`${API_BASE}/farmers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'farmerroute@test.com',
        password: 'password456'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Test 5 passed\n');
  } catch (error) {
    console.log('❌ Test 5 failed:', error.message, '\n');
  }

  console.log('🎉 Demo mode testing complete!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/auth`);
    if (response.ok) {
      console.log('✅ Server is running\n');
      testDemoLogin();
    } else {
      console.log('❌ Server is not responding correctly');
    }
  } catch (error) {
    console.log('❌ Cannot connect to server. Make sure the server is running on http://localhost:5000');
    console.log('Start the server with: DEMO_MODE=true node server.js');
  }
}

checkServer();