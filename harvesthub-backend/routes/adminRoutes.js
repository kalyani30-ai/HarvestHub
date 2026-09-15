const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { authenticateAdminToken, requireAdmin } = require('../middleware/auth');
const ALLOW_ANY_LOGIN = process.env.ALLOW_ANY_LOGIN === 'true';

// Admin registration (for initial setup, can be removed later)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    if (!ALLOW_ANY_LOGIN) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'harvesthub_secret_key_2024', { expiresIn: '7d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// View all farmers
router.get('/farmers', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View all customers
router.get('/customers', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View all products
router.get('/products', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View all orders
router.get('/orders', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('customer').populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new category
router.post('/categories', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Get all categories
router.get('/categories', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update a category
router.put('/categories/:id', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated', category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Delete a category
router.delete('/categories/:id', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete any farmer
router.delete('/farmer/:id', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    await Farmer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Farmer deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete any customer
router.delete('/customer/:id', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete any product
router.delete('/product/:id', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete any order
router.delete('/order/:id', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 