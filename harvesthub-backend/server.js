require('dotenv').config();

// Enable demo mode for any password/email login
process.env.DEMO_MODE = 'true';
process.env.ALLOW_ANY_LOGIN = 'true';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Import models
const Customer = require('./models/Customer');
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Category = require('./models/Category');
const Review = require('./models/Review');
const Admin = require('./models/Admin');
const Notification = require('./models/Notification');

// Initialize email service
require('./utils/emailService');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emailRoutes = require('./routes/emailRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const loginLogRoutes = require('./routes/loginLogRoutes');
const termsRoutes = require('./routes/termsRoutes');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// MongoDB Connection String - Prioritizes Render Environment Variables
const MONGO_URIS = [
  process.env.MONGODB_URI,
  process.env.MONGO_URI,
  'mongodb://localhost:27017/HarvestHub'
].filter(Boolean);

// Connect to MongoDB
const connectDB = async () => {
  for (const uri of MONGO_URIS) {
    try {
      console.log(`🔍 Trying to connect to MongoDB: ${uri}`);
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB connected successfully to HarvestHub database!');
      console.log('📊 Database: HarvestHub');
      console.log('🔗 MongoDB connection established using environment configuration.');
      return; // Successfully connected
    } catch (error) {
      console.log(`❌ Failed to connect with URI: ${uri}`);
      console.log(`Error: ${error.message}`);
    }
  }
  
  // If all connections fail, use in-memory storage
  console.log('⚠️  All MongoDB connections failed. Using in-memory storage.');
  console.log('💡 To use MongoDB, please check your connection string or network.');
};

const resetMongoCollections = async () => {
  const shouldReset = process.env.RESET_DB_ON_START === 'true' || process.env.RESET_DB === 'true';
  const shouldDrop = process.env.DROP_COLLECTIONS_ON_START === 'true' || process.env.DROP_COLLECTIONS === 'true';

  if (!shouldReset || mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return;
  }

  try {
    for (const collectionName of ['customers', 'farmers']) {
      const collection = mongoose.connection.db.collection(collectionName);
      const countBefore = await collection.countDocuments();

      if (shouldDrop) {
        await collection.drop();
        console.log(`🧹 Dropped MongoDB collection: ${collectionName}`);
      } else {
        await collection.deleteMany({});
        console.log(`🧹 Cleared ${countBefore} document(s) from ${collectionName}`);
      }
    }
  } catch (error) {
    console.error('⚠️ MongoDB reset failed:', error.message);
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/audio', express.static(__dirname + '/public/audio'));
app.use('/uploads', express.static(__dirname + '/public/uploads'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Harvest Hub Backend is running!',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'In-Memory Storage',
    databaseName: 'Harvesthub',
    status: 'Active'
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/login-logs', loginLogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB();
  await resetMongoCollections();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('📋 Smart Login/Registration Enabled:');
    console.log('Customer: ANY email + ANY password (auto-register if new)');
    console.log('Farmer: ANY email + ANY password (auto-register if new)');
    console.log(`💾 Storage: ${mongoose.connection.readyState === 1 ? 'MongoDB (Harvesthub database)' : 'In-Memory Storage'}`);
    console.log('🔄 Auto-registration: New users are automatically created');
    console.log('🔐 JWT Authentication: Enabled');
    console.log(`🧪 Permissive login mode: ${process.env.ALLOW_ANY_LOGIN === 'true' ? 'ON' : 'OFF'}`);
    console.log('📊 All routes integrated and ready');
  });
};

startServer();