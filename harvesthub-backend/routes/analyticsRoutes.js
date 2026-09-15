const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Customer = require('../models/Customer');
const { authenticateToken, requireFarmer, authenticateAdminToken, requireAdmin } = require('../middleware/auth');

// Farmer analytics: total sales, orders, revenue
router.get('/farmer', authenticateToken, requireFarmer, async (req, res) => {
  try {
    // Get all products owned by this farmer
    const farmerProductIds = await Product.find({ farmer: req.user._id }).distinct('_id');
    // Get all orders that include these products
    const orders = await Order.find({ 'products.product': { $in: farmerProductIds } });
    let totalSales = 0;
    let totalRevenue = 0;
    orders.forEach(order => {
      order.products.forEach(item => {
        if (farmerProductIds.map(id => id.toString()).includes(item.product.toString())) {
          totalSales += item.quantity;
          totalRevenue += item.price * item.quantity;
        }
      });
    });
    res.json({
      totalOrders: orders.length,
      totalSales,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin analytics: total users, products, orders, revenue
router.get('/admin', authenticateAdminToken, requireAdmin, async (req, res) => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    res.json({
      totalFarmers,
      totalCustomers,
      totalProducts,
      totalOrders,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 