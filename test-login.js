const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

// Test login function
async function testLogin(email, password, confirmPassword, userType) {
  console.log(`\n🧪 Testing ${userType} login...`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Confirm Password: ${confirmPassword}`);
  
  // Validate password match
  if (password !== confirmPassword) {
    console.log('❌ Passwords do not match!');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Invalid email format!');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/${userType}s/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log(`Token: ${data.token}`);
      console.log(`User: ${data[userType].name} (${data[userType].email})`);
      console.log(`Role: ${data[userType].role}`);
    } else {
      console.log('❌ Login failed!');
      console.log(`Error: ${data.message}`);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

// Test cases
async function runTests() {
  console.log('🚀 Testing Login Functionality');
  console.log('================================');
  
  // Test 1: Valid customer login
  await testLogin('customer@test.com', 'password123', 'password123', 'customer');
  
  // Test 2: Valid farmer login
  await testLogin('farmer@test.com', 'password123', 'password123', 'farmer');
  
  // Test 3: Invalid email
  await testLogin('invalid-email', 'password123', 'password123', 'customer');
  
  // Test 4: Wrong password
  await testLogin('customer@test.com', 'wrongpassword', 'wrongpassword', 'customer');
  
  // Test 5: Password mismatch
  await testLogin('customer@test.com', 'password123', 'differentpassword', 'customer');
  
  // Test 6: Non-existent user
  await testLogin('nonexistent@test.com', 'password123', 'password123', 'customer');
  
  console.log('\n🎉 Login testing completed!');
}

runTests(); 