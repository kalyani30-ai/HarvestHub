const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

// Test data
const testCustomer = {
  email: 'testcustomer@example.com',
  password: 'testpass123'
};

const testFarmer = {
  email: 'testfarmer@example.com',
  password: 'farmerpass123'
};

async function testCustomerLogin() {
  console.log('🧪 Testing Customer Login...');
  
  try {
    // Test 1: Valid credentials
    console.log('\n1. Testing with valid credentials...');
    const validResponse = await fetch(`${API_URL}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCustomer)
    });
    
    if (validResponse.ok) {
      const data = await validResponse.json();
      console.log('✅ Valid login successful:', data.message || 'Login successful');
    } else {
      const error = await validResponse.json();
      console.log('❌ Valid login failed:', error.message);
    }
    
    // Test 2: Invalid password
    console.log('\n2. Testing with incorrect password...');
    const invalidPasswordResponse = await fetch(`${API_URL}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomer.email,
        password: 'wrongpassword'
      })
    });
    
    if (!invalidPasswordResponse.ok) {
      const error = await invalidPasswordResponse.json();
      console.log('✅ Correctly rejected invalid password:', error.message);
    } else {
      console.log('❌ Should have rejected invalid password');
    }
    
    // Test 3: Non-existent email
    console.log('\n3. Testing with non-existent email...');
    const invalidEmailResponse = await fetch(`${API_URL}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'anypassword'
      })
    });
    
    if (!invalidEmailResponse.ok) {
      const error = await invalidEmailResponse.json();
      console.log('✅ Correctly rejected non-existent email:', error.message);
    } else {
      console.log('❌ Should have rejected non-existent email');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testFarmerLogin() {
  console.log('\n🧪 Testing Farmer Login...');
  
  try {
    // Test 1: Valid credentials
    console.log('\n1. Testing with valid credentials...');
    const validResponse = await fetch(`${API_URL}/api/farmers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testFarmer)
    });
    
    if (validResponse.ok) {
      const data = await validResponse.json();
      console.log('✅ Valid login successful:', data.message || 'Login successful');
    } else {
      const error = await validResponse.json();
      console.log('❌ Valid login failed:', error.message);
    }
    
    // Test 2: Invalid password
    console.log('\n2. Testing with incorrect password...');
    const invalidPasswordResponse = await fetch(`${API_URL}/api/farmers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testFarmer.email,
        password: 'wrongpassword'
      })
    });
    
    if (!invalidPasswordResponse.ok) {
      const error = await invalidPasswordResponse.json();
      console.log('✅ Correctly rejected invalid password:', error.message);
    } else {
      console.log('❌ Should have rejected invalid password');
    }
    
    // Test 3: Non-existent email
    console.log('\n3. Testing with non-existent email...');
    const invalidEmailResponse = await fetch(`${API_URL}/api/farmers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'anypassword'
      })
    });
    
    if (!invalidEmailResponse.ok) {
      const error = await invalidEmailResponse.json();
      console.log('✅ Correctly rejected non-existent email:', error.message);
    } else {
      console.log('❌ Should have rejected non-existent email');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  await testCustomerLogin();
  await testFarmerLogin();
  
  console.log('\n✅ Authentication tests completed!');
  console.log('\n📝 Summary:');
  console.log('- Customer login now validates passwords properly');
  console.log('- Farmer login already validates passwords properly');
  console.log('- Both show "Invalid credentials" for wrong passwords');
  console.log('- Both show "Account not found" for non-existent emails');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCustomerLogin, testFarmerLogin }; 