const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { authenticateToken, requireCustomer } = require('../middleware/auth');

// Add a review
router.post('/add', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    // Prevent multiple reviews by the same customer for the same product
    const existing = await Review.findOne({ product: productId, customer: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product.' });
    const review = new Review({
      product: productId,
      customer: req.user._id,
      rating,
      comment
    });
    await review.save();
    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a review for a farmer
router.post('/add-farmer', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { farmerId, rating, comment } = req.body;
    // Prevent multiple reviews by the same customer for the same farmer
    const existing = await Review.findOne({ farmer: farmerId, customer: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this farmer.' });
    const review = new Review({
      farmer: farmerId,
      customer: req.user._id,
      rating,
      comment
    });
    await review.save();
    res.status(201).json({ message: 'Review added for farmer', review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('customer', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reviews for a farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId }).populate('customer', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit own review
router.put('/:reviewId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: req.params.reviewId, customer: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.rating = rating;
    review.comment = comment;
    review.updatedAt = Date.now();
    await review.save();
    res.json({ message: 'Review updated', review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete own review
router.delete('/:reviewId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.reviewId, customer: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 