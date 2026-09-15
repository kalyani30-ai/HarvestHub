const mongoose = require('mongoose');
require('dotenv').config();

// Test MongoDB connection
async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...');
  console.log('MongoDB URI:', process.env.MONGO_URI);
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    await testDatabaseOperations();
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Test database operations
async function testDatabaseOperations() {
  console.log('\n🧪 Testing Database Operations...');
  
  // Test Customer model
  const Customer = require('./models/Customer');
  
  try {
    // Test creating a customer
    const testCustomer = new Customer({
      name: 'Test Customer',
      phone: '1234567890',
      email: 'test@example.com',
      password: 'hashedpassword123',
      address: 'Test Address'
    });
    
    await testCustomer.save();
    console.log('✅ Customer created successfully:', testCustomer._id);
    
    // Test finding the customer
    const foundCustomer = await Customer.findOne({ email: 'test@example.com' });
    if (foundCustomer) {
      console.log('✅ Customer found successfully:', foundCustomer.name);
    } else {
      console.log('❌ Customer not found');
    }
    
    // Clean up - delete test customer
    await Customer.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test customer cleaned up');
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...');
  
  try {
    // Test root endpoint
    const response = await fetch('http://localhost:5000');
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Root endpoint working:', data);
    } else {
      console.log('❌ Root endpoint failed:', response.status);
    }
    
    // Test customer registration
    const registerResponse = await fetch('http://localhost:5000/api/customers/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'API Test Customer',
        phone: '9876543210',
        email: 'apitest@example.com',
        password: 'testpass123',
        address: 'API Test Address'
      })
    });
    
    if (registerResponse.ok) {
      const data = await registerResponse.json();
      console.log('✅ Customer registration working:', data.message);
    } else {
      const error = await registerResponse.json();
      console.log('❌ Customer registration failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Database and API Tests...\n');
  
  await testMongoDBConnection();
  await testAPIEndpoints();
  
  console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testMongoDBConnection, testDatabaseOperations, testAPIEndpoints }; 