const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  userType: { type: String, enum: ['customer', 'farmer', 'admin'], required: true },
  wasNewUser: { type: Boolean, default: false },
  success: { type: Boolean, default: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoginLog', loginLogSchema);


