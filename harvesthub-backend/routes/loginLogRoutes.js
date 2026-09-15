const express = require('express');
const router = express.Router();
const LoginLog = require('../models/LoginLog');

// GET /api/login-logs
// Query params: email, userType, success, limit, page
router.get('/', async (req, res) => {
  try {
    const { email, userType, success, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (email) filter.email = email;
    if (userType) filter.userType = userType;
    if (typeof success !== 'undefined') filter.success = success === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      LoginLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LoginLog.countDocuments(filter)
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1
    });
  } catch (err) {
    console.error('Error fetching login logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


