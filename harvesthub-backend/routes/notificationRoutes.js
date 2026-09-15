const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

// Get notifications for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const notifications = await Notification.find({
      'recipient.id': userId,
      'recipient.type': userType
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.recipient.id.toString() !== req.user._id.toString() || notification.recipient.type !== req.userType) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.recipient.id.toString() !== req.user._id.toString() || notification.recipient.type !== req.userType) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 