const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { authenticateToken, requireCustomer } = require('../middleware/auth');

// View wishlist
router.get('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate('wishlist');
    res.json(customer.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to wishlist
router.post('/add', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { productId } = req.body;
    const customer = await Customer.findById(req.user._id);
    if (!customer.wishlist.includes(productId)) {
      customer.wishlist.push(productId);
      await customer.save();
    }
    res.json({ message: 'Product added to wishlist', wishlist: customer.wishlist });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove product from wishlist
router.delete('/remove/:productId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    customer.wishlist = customer.wishlist.filter(
      id => id.toString() !== req.params.productId
    );
    await customer.save();
    res.json({ message: 'Product removed from wishlist', wishlist: customer.wishlist });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 