const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, requireCustomer, requireFarmer } = require('../middleware/auth');

// Customer: View their order history
router.get('/my-orders', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Farmer: View all orders for their products
router.get('/farmer-orders', authenticateToken, requireFarmer, async (req, res) => {
  try {
    // Find all orders that include products owned by this farmer
    const orders = await Order.find({
      'products.product': { $in: await Product.find({ farmer: req.user._id }).distinct('_id') }
    }).populate('products.product').populate('customer');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Farmer: Update order status
router.put('/:orderId/status', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId).populate('products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only allow farmer to update status for their own products
    const farmerProductIds = (await Product.find({ farmer: req.user._id }).distinct('_id')).map(id => id.toString());
    const hasProduct = order.products.some(item => farmerProductIds.includes(item.product._id.toString()));
    if (!hasProduct) return res.status(403).json({ message: 'You can only update orders for your products' });
    order.status = status;
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 