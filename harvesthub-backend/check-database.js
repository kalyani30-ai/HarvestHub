const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Customer = require('./models/Customer');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');
const Order = require('./models/Order');

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check Customers
    const customers = await Customer.find({}).select('-password');
    console.log('\n👥 Customers in Database:', customers.length);
    customers.forEach(customer => {
      console.log(`  - ${customer.name} (${customer.email})`);
    });

    // Check Farmers
    const farmers = await Farmer.find({}).select('-password');
    console.log('\n👨‍🌾 Farmers in Database:', farmers.length);
    farmers.forEach(farmer => {
      console.log(`  - ${farmer.name} (${farmer.email})`);
    });

    // Check Products
    const products = await Product.find({});
    console.log('\n🛍️ Products in Database:', products.length);
    products.forEach(product => {
      console.log(`  - ${product.name} (₹${product.price})`);
    });

    // Check Orders
    const orders = await Order.find({});
    console.log('\n📦 Orders in Database:', orders.length);
    orders.forEach(order => {
      console.log(`  - Order #${order._id} - Status: ${order.status}`);
    });

    console.log('\n📊 Database Summary:');
    console.log(`  - Customers: ${customers.length}`);
    console.log(`  - Farmers: ${farmers.length}`);
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Orders: ${orders.length}`);

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkDatabase(); 