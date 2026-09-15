const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Customer = require('./models/Customer');
const Farmer = require('./models/Farmer');

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create test customer
    const customerPassword = await bcrypt.hash('password123', 10);
    const testCustomer = new Customer({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: customerPassword,
      phone: '1234567890',
      address: '123 Test Street, Test City',
      role: 'customer'
    });

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: 'customer@test.com' });
    if (!existingCustomer) {
      await testCustomer.save();
      console.log('✅ Test customer created: customer@test.com / password123');
    } else {
      console.log('ℹ️  Test customer already exists');
    }

    // Create test farmer
    const farmerPassword = await bcrypt.hash('password123', 10);
    const testFarmer = new Farmer({
      name: 'Test Farmer',
      email: 'farmer@test.com',
      password: farmerPassword,
      phone: '0987654321',
      farmAddress: '456 Farm Road, Farm City',
      role: 'farmer'
    });

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ email: 'farmer@test.com' });
    if (!existingFarmer) {
      await testFarmer.save();
      console.log('✅ Test farmer created: farmer@test.com / password123');
    } else {
      console.log('ℹ️  Test farmer already exists');
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Customer: customer@test.com / password123');
    console.log('Farmer: farmer@test.com / password123');
    console.log('\n💡 You can now test login functionality!');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTestUsers(); 