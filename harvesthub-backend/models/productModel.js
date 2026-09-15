const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stock: { type: Number, default: 1 },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);


