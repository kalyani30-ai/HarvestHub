const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['customer', 'farmer', 'admin'], required: true }
  },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema); 