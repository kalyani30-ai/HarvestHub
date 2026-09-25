const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "farmer" },
  userType: { type: String, default: "farmer" },
  roles: { type: [String], default: ['farmer'] },
  farmAddress: { type: String },
  farmType: { type: String },
  farmLocation: { type: String },
  experience: { type: String },
  description: { type: String },
  farmImages: [{ type: String }],
  idProofs: [{ type: String }],
  walletBalance: { type: Number, default: 0 },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  profileImage: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Farmer", farmerSchema);
