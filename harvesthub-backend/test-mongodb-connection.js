const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Import models
const Customer = require('./models/Customer');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');

const testMongoDBConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB Connection...');
    console.log('🔗 URI:', MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database: Harvesthub');
    
    // Test Customer creation
    console.log('\n🧪 Testing Customer Model...');
    const testCustomer = new Customer({
      name: 'Test Customer',
      email: 'testcustomer@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '1234567890',
      address: 'Test Address'
    });
    await testCustomer.save();
    console.log('✅ Customer created successfully');
    
    // Test Farmer creation
    console.log('\n🧪 Testing Farmer Model...');
    const testFarmer = new Farmer({
      name: 'Test Farmer',
      email: 'testfarmer@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '0987654321',
      farmAddress: 'Test Farm Address'
    });
    await testFarmer.save();
    console.log('✅ Farmer created successfully');
    
    // Test Product creation
    console.log('\n🧪 Testing Product Model...');
    const testProduct = new Product({
      name: 'Test Product',
      category: 'Vegetables',
      price: 10.99,
      stock: 100,
      description: 'A test product',
      farmer: testFarmer._id
    });
    await testProduct.save();
    console.log('✅ Product created successfully');
    
    // Test data retrieval
    console.log('\n🧪 Testing Data Retrieval...');
    const customers = await Customer.find();
    const farmers = await Farmer.find();
    const products = await Product.find();
    
    console.log(`✅ Found ${customers.length} customers`);
    console.log(`✅ Found ${farmers.length} farmers`);
    console.log(`✅ Found ${products.length} products`);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Customer.deleteOne({ email: 'testcustomer@example.com' });
    await Farmer.deleteOne({ email: 'testfarmer@example.com' });
    await Product.deleteOne({ name: 'Test Product' });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All MongoDB tests passed successfully!');
    console.log('📊 Database is ready for use');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testMongoDBConnection(); 