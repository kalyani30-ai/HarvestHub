const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

// Test login function that checks MongoDB persistence
async function testMongoDBLogin(email, password, userType) {
  console.log(`\n🧪 Testing ${userType} login with MongoDB persistence...`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  
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
      console.log(`Was New User: ${data.wasNewUser}`);
      
      if (data.wasNewUser) {
        console.log('🆕 New user created and saved to MongoDB');
      } else {
        console.log('👤 Existing user logged in from MongoDB');
      }
      
      return data;
    } else {
      console.log('❌ Login failed!');
      console.log(`Error: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return null;
  }
}

// Test cases for MongoDB persistence
async function runMongoDBTests() {
  console.log('🚀 Testing MongoDB Login Persistence');
  console.log('=====================================');
  
  // Test 1: First login (should create new user)
  console.log('\n📝 Test 1: First login - should create new user');
  const firstLogin = await testMongoDBLogin('testfarmer@example.com', 'password123', 'farmer');
  
  // Test 2: Second login with same credentials (should find existing user)
  console.log('\n📝 Test 2: Second login - should find existing user');
  const secondLogin = await testMongoDBLogin('testfarmer@example.com', 'password123', 'farmer');
  
  // Test 3: Customer login (should create new customer)
  console.log('\n📝 Test 3: Customer login - should create new customer');
  const customerLogin = await testMongoDBLogin('testcustomer@example.com', 'password123', 'customer');
  
  // Test 4: Customer second login (should find existing customer)
  console.log('\n📝 Test 4: Customer second login - should find existing customer');
  const customerSecondLogin = await testMongoDBLogin('testcustomer@example.com', 'password123', 'customer');
  
  // Test 5: Wrong password for existing user
  console.log('\n📝 Test 5: Wrong password for existing user');
  await testMongoDBLogin('testfarmer@example.com', 'wrongpassword', 'farmer');
  
  console.log('\n🎉 MongoDB login persistence testing completed!');
  console.log('\n📊 Summary:');
  console.log('- New users should be created and saved to MongoDB');
  console.log('- Existing users should be found and authenticated');
  console.log('- Passwords should be properly hashed and verified');
  console.log('- Login confirmation emails should be sent');
}

runMongoDBTests(); 