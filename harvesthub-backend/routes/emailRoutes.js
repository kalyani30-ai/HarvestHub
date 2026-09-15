const express = require('express');
const router = express.Router();
const { sendLoginConfirmation, sendOrderConfirmation } = require('../utils/emailService');

// Test email route (for development/testing purposes)
router.post('/test', async (req, res) => {
  const { email, name, userType } = req.body;

  try {
    if (!email || !name || !userType) {
      return res.status(400).json({ 
        message: "Email, name, and userType are required" 
      });
    }

    const result = await sendLoginConfirmation(email, name, userType);

    // Also persist the tested email send as a login-like log for visibility
    try {
      const LoginLog = require('../models/LoginLog');
      await LoginLog.create({
        email,
        userType: (userType || 'customer').toLowerCase(),
        wasNewUser: false,
        success: !!result.success,
        message: 'Test email trigger',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {
      console.warn('LoginLog (email test) write failed:', logErr.message);
    }
    
    if (result.success) {
      res.json({ 
        message: "Test email sent successfully", 
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        message: "Failed to send email", 
        error: result.error || result.message 
      });
    }
  } catch (error) {
    console.error('Error in test email route:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Test order confirmation email route
router.post('/test-order', async (req, res) => {
  const { email, name, orderData } = req.body;

  try {
    if (!email || !name || !orderData) {
      return res.status(400).json({ 
        message: "Email, name, and orderData are required" 
      });
    }

    const result = await sendOrderConfirmation(email, name, orderData);
    
    if (result.success) {
      res.json({ 
        message: "Order confirmation email sent successfully", 
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        message: "Failed to send order confirmation email", 
        error: result.error || result.message 
      });
    }
  } catch (error) {
    console.error('Error in test order email route:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get email configuration status
router.get('/status', (req, res) => {
  const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  res.json({
    emailConfigured: hasEmailConfig,
    emailUser: hasEmailConfig ? process.env.EMAIL_USER : null,
    message: hasEmailConfig 
      ? "Email service is configured" 
      : "Email service is not configured. Add EMAIL_USER and EMAIL_PASS to your .env file."
  });
});

module.exports = router; 