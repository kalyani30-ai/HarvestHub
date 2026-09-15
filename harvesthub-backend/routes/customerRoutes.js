const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const { authenticateToken, requireCustomer } = require("../middleware/auth");
const { sendLoginConfirmation, sendWelcomeEmail } = require("../utils/emailService");
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose'); // Added for mongoose.connection.readyState
const ALLOW_ANY_LOGIN = process.env.ALLOW_ANY_LOGIN === 'true';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Test route
router.get("/", (req, res) => {
  res.send("✅ Customer route working");
});

// ✅ Register route
router.post("/register", async (req, res) => {
  const { name, phone, email, password, address } = req.body;

  try {
    console.log("Registration attempt - Email:", email, "Phone:", phone);
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if customer already exists by email
    console.log("Checking duplicate for email:", email);
    const existingCustomerByEmail = await Customer.findOne({ email });
    if (existingCustomerByEmail) {
      console.log("Duplicate email found:", email);
      return res.status(400).json({ message: "A customer with this email already exists" });
    }

    // Check if customer already exists by phone (only if phone is provided)
    if (phone && phone.trim() !== '') {
      console.log("Checking duplicate for phone:", phone);
      const existingCustomerByPhone = await Customer.findOne({ phone });
      if (existingCustomerByPhone) {
        console.log("Duplicate phone found:", phone);
        return res.status(400).json({ message: "A customer with this phone number already exists" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer
    const newCustomer = new Customer({
      name,
      phone: phone || undefined, // Only include phone if provided
      email,
      password: hashedPassword,
      address
    });

    await newCustomer.save();
    console.log("Customer registered successfully:", email);

    // Send welcome email
    try {
      await sendWelcomeEmail(newCustomer.email, newCustomer.name, 'customer');
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(201).json({ message: "Customer registered successfully" });

  } catch (error) {
    console.error("Registration Error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `A customer with this ${field} already exists` 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message || "Validation failed" 
      });
    }
    
    res.status(500).json({ 
      message: error.message || "Database error" 
    });
  }
});

// In-memory fallback when MongoDB is not connected
const inMemoryCustomers = new Map();

// ✅ Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let wasNewUser = false;

    // If MongoDB is not connected, use in-memory store so login still works
    if (mongoose.connection.readyState !== 1) {
      let customer = inMemoryCustomers.get(email);
      if (!customer) {
        const hashedPassword = await bcrypt.hash(password, 10);
        customer = {
          _id: `${Date.now()}`,
          name: email.split('@')[0] || 'Customer',
          email,
          phone: '1234567890',
          address: 'Default Address',
          password: hashedPassword,
          role: 'customer'
        };
        inMemoryCustomers.set(email, customer);
        wasNewUser = true;
        console.log('🧠 In-memory customer created:', email);
      } else {
        if (!ALLOW_ANY_LOGIN) {
          const isMatch = await bcrypt.compare(password, customer.password);
          if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password. Please try again." });
          }
        }
        console.log('🧠 In-memory customer login successful:', email);
      }

      const token = jwt.sign(
        { id: 'in-memory' },
        process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          role: customer.role
        },
        wasNewUser
      });
    }

    // Check if customer exists in database
    let customer = await Customer.findOne({ email });

    if (!customer) {
      // Create new customer if doesn't exist (auto-provisioning)
      const hashedPassword = await bcrypt.hash(password, 10);
      customer = new Customer({
        name: email.split('@')[0] || 'Customer',
        email: email,
        phone: '123456789' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        address: 'Default Address',
        password: hashedPassword,
        role: 'customer'
      });
      await customer.save();
      wasNewUser = true;
      console.log('✅ New customer created and saved to MongoDB:', email);
    } else {
      // Verify password for existing customer (unless demo mode or permissive mode is enabled)
      if (DEMO_MODE || ALLOW_ANY_LOGIN) {
        // In demo mode, any password is accepted
        console.log('⚠️ Demo mode: password bypassed for existing customer');
      } else {
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Incorrect password. Please try again." });
        }
      }
      console.log('✅ Existing customer login successful:', email);
    }

    // Persist login email to MongoDB (LoginLog)
    try {
      const LoginLog = require('../models/LoginLog');
      await LoginLog.create({
        email,
        userType: 'customer',
        wasNewUser,
        success: true,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {
      console.warn('LoginLog (customer) write failed:', logErr.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
      { expiresIn: "7d" }
    );

    // Send login confirmation email (if MongoDB is connected)
    if (mongoose.connection.readyState === 1) {
      try {
        await sendLoginConfirmation(customer.email, customer.name, 'Customer');
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the login if email fails
      }
    }

    console.log('✅ Customer login successful:', email);

    res.json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: customer.role
      },
      wasNewUser
    });

  } catch (error) {
    console.error('❌ Error in customer login:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get customer profile (protected route)
router.get("/profile", authenticateToken, requireCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select('-password');
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update customer profile (protected route)
router.put("/profile", authenticateToken, requireCustomer, async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Change password (protected route)
router.put("/change-password", authenticateToken, requireCustomer, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const customer = await Customer.findById(req.user._id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    customer.password = hashedNewPassword;
    await customer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload or update profile image (protected route)
router.post('/profile/upload-image', authenticateToken, requireCustomer, upload.single('profileImage'), async (req, res) => {
  try {
    const imagePath = '/uploads/' + req.file.filename;
    const customer = await Customer.findByIdAndUpdate(
      req.user._id,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');
    res.json({ message: 'Profile image updated', customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 