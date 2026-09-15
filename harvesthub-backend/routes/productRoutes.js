const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requireFarmer } = require('../middleware/auth');
// Alias to match requested middleware name
const protect = authenticateToken;
const { createProduct, getAllProducts } = require('../controllers/productController');

// Add a product (Farmer only)
router.post('/add', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const { name, category, price, stock, description, images } = req.body;
    const newProduct = new Product({
      name,
      category,
      price,
      stock,
      description,
      images, // array of image URLs/paths
      farmer: req.user._id
    });
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create product using controller (Farmer only)
router.post('/', authenticateToken, requireFarmer, createProduct);

// Create product with generic protect middleware name
router.post('/products', protect, createProduct);

// Edit a product (Farmer only, only their own products)
router.put('/:id', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not owned by you' });
    }
    const updates = req.body;
    Object.assign(product, updates);
    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product (Farmer only, only their own products)
router.delete('/:id', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not owned by you' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// View all products listed by the logged-in farmer
router.get('/my-products', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products (public)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().populate('farmer', 'name email phone');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New: Get all products via controller (public)
router.get('/products', getAllProducts);

// Filter products by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product details by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
