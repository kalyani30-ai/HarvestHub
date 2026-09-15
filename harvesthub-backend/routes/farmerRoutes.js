const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Farmer = require("../models/Farmer");
const { authenticateToken, requireFarmer } = require("../middleware/auth");
const multer = require('multer');
const path = require('path');
const { sendLoginConfirmation, sendWelcomeEmail } = require("../utils/emailService");
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
  res.send("✅ Farmer route working");
});

// ✅ Register route
router.post("/register", async (req, res) => {
  const { name, phone, email, password, farmAddress } = req.body;

  try {
    console.log("Farmer registration attempt - Email:", email, "Phone:", phone);
    
    // Validate required fields
    if (!name || !email || !password || !farmAddress) {
      return res.status(400).json({ message: "Name, email, password, and farm address are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Validate phone number (only if provided)
    if (phone && phone.trim() !== '') {
      if (!/^[0-9]{10,}$/.test(phone)) {
        return res.status(400).json({ message: "Please enter a valid phone number" });
      }
    }

    // Check if farmer already exists with this email
    console.log("Checking duplicate for email:", email);
    const existingFarmerByEmail = await Farmer.findOne({ email });
    if (existingFarmerByEmail) {
      console.log("Duplicate email found:", email);
      return res.status(400).json({ message: "A farmer with this email already exists" });
    }

    // Check if farmer already exists with this phone (only if phone is provided)
    if (phone && phone.trim() !== '') {
      console.log("Checking duplicate for phone:", phone);
      const existingFarmerByPhone = await Farmer.findOne({ phone });
      if (existingFarmerByPhone) {
        console.log("Duplicate phone found:", phone);
        return res.status(400).json({ message: "A farmer with this phone number already exists" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new farmer
    const newFarmer = new Farmer({
      name,
      phone: phone || undefined, // Only include phone if provided
      email,
      password: hashedPassword,
      farmAddress
    });

    await newFarmer.save();
    console.log("Farmer registered successfully:", email);

    // Send welcome email
    try {
      await sendWelcomeEmail(newFarmer.email, newFarmer.name, 'farmer');
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(201).json({ message: "Farmer registered successfully. Please login with your email." });

  } catch (error) {
    console.error("Registration Error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `A farmer with this ${field} already exists` 
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
const inMemoryFarmers = new Map();

// ✅ Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // If MongoDB is not connected, use in-memory store so login still works
    if (mongoose.connection.readyState !== 1) {
      let farmer = inMemoryFarmers.get(email);
      let wasNewUser = false;
      if (!farmer) {
        const hashedPassword = await bcrypt.hash(password, 10);
        farmer = {
          _id: `${Date.now()}`,
          name: email.split('@')[0] || 'Farmer',
          email,
          phone: '9876543210',
          farmAddress: 'Default Farm Address',
          password: hashedPassword,
          role: 'farmer'
        };
        inMemoryFarmers.set(email, farmer);
        wasNewUser = true;
        console.log('🧠 In-memory farmer created:', email);
      } else {
        if (!ALLOW_ANY_LOGIN) {
          const isMatch = await bcrypt.compare(password, farmer.password);
          if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password. Please try again." });
          }
        }
        console.log('🧠 In-memory farmer login successful:', email);
      }

      const token = jwt.sign(
        { id: 'in-memory' },
        process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        farmer: {
          id: farmer._id,
          name: farmer.name,
          email: farmer.email,
          phone: farmer.phone,
          farmAddress: farmer.farmAddress,
          role: farmer.role
        },
        wasNewUser
      });
    }

    // Check if farmer exists in database
    let farmer = await Farmer.findOne({ email });
    let wasNewUser = false;

    if (!farmer) {
      // Create new farmer if doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      farmer = new Farmer({
        name: email.split('@')[0] || 'Farmer',
        email: email,
        phone: '987654321' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        farmAddress: 'Default Farm Address',
        password: hashedPassword,
        role: 'farmer'
      });
      await farmer.save();
      wasNewUser = true;
      console.log('✅ New farmer created and saved to MongoDB:', email);
    } else {
      // Verify password for existing farmer (unless demo mode or permissive mode is enabled)
      if (DEMO_MODE || ALLOW_ANY_LOGIN) {
        // In demo mode, any password is accepted
        console.log('⚠️ Demo mode: password bypassed for existing farmer');
      } else {
        const isMatch = await bcrypt.compare(password, farmer.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Incorrect password. Please try again." });
        }
      }
      console.log('✅ Existing farmer login successful:', email);
    }

    // Persist login email to MongoDB (LoginLog)
    try {
      const LoginLog = require('../models/LoginLog');
      await LoginLog.create({
        email,
        userType: 'farmer',
        wasNewUser,
        success: true,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {
      console.warn('LoginLog (farmer) write failed:', logErr.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: farmer._id },
      process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
      { expiresIn: "7d" }
    );

    // Send login confirmation email (if MongoDB is connected)
    if (mongoose.connection.readyState === 1) {
      try {
        await sendLoginConfirmation(farmer.email, farmer.name, 'Farmer');
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the login if email fails
      }
    }

    console.log('✅ Farmer login successful:', email);

    res.json({
      token,
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        farmAddress: farmer.farmAddress,
        role: farmer.role
      },
      wasNewUser
    });

  } catch (error) {
    console.error('❌ Error in farmer login:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get farmer profile (protected route)
router.get("/profile", authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.user._id).select('-password');
    res.json(farmer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update farmer profile (protected route)
router.put("/profile", authenticateToken, requireFarmer, async (req, res) => {
  const { name, phone, farmAddress } = req.body;

  try {
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.user._id,
      { name, phone, farmAddress },
      { new: true }
    ).select('-password');

    res.json(updatedFarmer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Change password (protected route)
router.put("/change-password", authenticateToken, requireFarmer, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const farmer = await Farmer.findById(req.user._id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, farmer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    farmer.password = hashedNewPassword;
    await farmer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload or update profile image (protected route)
router.post('/profile/upload-image', authenticateToken, requireFarmer, upload.single('profileImage'), async (req, res) => {
  try {
    const imagePath = '/uploads/' + req.file.filename;
    const farmer = await Farmer.findByIdAndUpdate(
      req.user._id,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');
    res.json({ message: 'Profile image updated', farmer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Export router
module.exports = router;
