const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../utils/emailService');

// Get current user's cart
router.get('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');
    if (!cart) cart = { items: [] };
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to cart
router.post('/add', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ message: 'Product added to cart', cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update quantity of a cart item
router.put('/update', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Product not in cart' });
    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ message: 'Item removed from cart', cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Checkout and place order
router.post('/checkout', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { deliveryType } = req.body;
    let cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock for each product
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.product.name}` });
      }
    }

    // Create order items and calculate total price
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));
    const totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Create order
    const order = new Order({
      customer: req.user._id,
      products: orderItems,
      totalPrice,
      status: 'pending',
      deliveryType: deliveryType || 'Normal',
      deliveryStatus: 'Pending',
      deliveryTimestamps: {}
    });
    await order.save();

    // Deduct stock and credit farmer's wallet
    for (const item of cart.items) {
      item.product.stock -= item.quantity;
      await item.product.save();
      // Credit to farmer's wallet
      const Farmer = require('../models/Farmer');
      await Farmer.findByIdAndUpdate(item.product.farmer, { $inc: { walletBalance: item.price * item.quantity } });
    }

    // Add order to customer
    await Customer.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email
    try {
      const customer = await Customer.findById(req.user._id);
      const populatedOrder = await Order.findById(order._id).populate('products.product');
      await sendOrderConfirmation(customer.email, customer.name, populatedOrder);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 