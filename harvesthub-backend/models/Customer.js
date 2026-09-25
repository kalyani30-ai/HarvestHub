const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  role: { type: String, default: "customer" },
  userType: { type: String, default: "customer" },
  roles: { type: [String], default: ['customer'] },
  address: { type: String },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
  // Farmer-specific fields (optional - for customers who become farmers)
  farmAddress: { type: String },
  farmType: { type: String },
  farmLocation: { type: String },
  experience: { type: String },
  description: { type: String },
  farmImages: [{ type: String }],
  idProofs: [{ type: String }],
  walletBalance: { type: Number, default: 0 },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
});

module.exports = mongoose.model("Customer", customerSchema); 
