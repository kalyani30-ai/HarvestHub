const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure at least one of product or farmer is present
reviewSchema.pre('validate', function(next) {
  if (!this.product && !this.farmer) {
    next(new Error('Review must reference a product or a farmer.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Review', reviewSchema); 