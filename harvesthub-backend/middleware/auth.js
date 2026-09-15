const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'harvesthub_secret_key_2024');
    
    // Check if user exists in either Farmer or Customer collection
    let user = await Farmer.findById(decoded.id);
    let userType = 'farmer';
    
    if (!user) {
      user = await Customer.findById(decoded.id);
      userType = 'customer';
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is a farmer
const requireFarmer = (req, res, next) => {
  if (req.userType !== 'farmer') {
    return res.status(403).json({ message: 'Farmer access required' });
  }
  next();
};

// Middleware to check if user is a customer
const requireCustomer = (req, res, next) => {
  if (req.userType !== 'customer') {
    return res.status(403).json({ message: 'Customer access required' });
  }
  next();
};

// Middleware to check if user is either farmer or customer
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Middleware to verify Admin JWT token
const authenticateAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'harvesthub_secret_key_2024');
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireFarmer,
  requireCustomer,
  requireAuth,
  authenticateAdminToken,
  requireAdmin
}; 