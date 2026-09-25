const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require('multer');
const path = require('path');
const Farmer = require("../models/Farmer");
const Customer = require("../models/Customer");
const { authenticateToken } = require("../middleware/auth");
const { sendWelcomeEmail, sendLoginConfirmation, sendPasswordResetEmail } = require("../utils/emailService");
const ALLOW_ANY_LOGIN = process.env.ALLOW_ANY_LOGIN === 'true';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const normalizeUserType = (value, fallback = 'customer') => {
  const safeValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!safeValue) return fallback;

  const aliases = {
    customer: ['customer', 'client', 'user', 'users', 'consumer'],
    farmer: ['farmer', 'farmers', 'grower', 'seller', 'producer']
  };

  for (const [type, values] of Object.entries(aliases)) {
    if (values.includes(safeValue)) return type;
  }

  return ['customer', 'farmer'].includes(safeValue) ? safeValue : fallback;
};

const getUserByEmail = async (email) => {
  const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (customer) return { user: customer, userType: customer.userType || customer.role || 'customer' };

  const farmer = await Farmer.findOne({ email: email.toLowerCase().trim() });
  if (farmer) return { user: farmer, userType: farmer.userType || farmer.role || 'farmer' };

  return { user: null, userType: null };
};

const buildAuthResponse = (user, userType) => {
  const resolvedRole = normalizeUserType(userType || user.userType || user.role || 'customer');
  const safeRoles = Array.isArray(user.roles) && user.roles.length ? user.roles : [resolvedRole];

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role || resolvedRole,
    userType: resolvedRole,
    activeRole: resolvedRole,
    roles: safeRoles,
    ...(resolvedRole === 'farmer' ? { farmAddress: user.farmAddress || '' } : { address: user.address || '' })
  };
};

const createDemoUser = async (email, password, userType) => {
  const normalizedUserType = normalizeUserType(userType, 'customer');
  const defaultPassword = password || 'demo123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  // Generate a default name from email
  const emailParts = email.split('@')[0];
  const defaultName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1).replace(/[._]/g, ' ');
  
  const baseProfile = {
    name: defaultName,
    email: email.toLowerCase().trim(),
    phone: '',
    password: hashedPassword,
    role: normalizedUserType,
    userType: normalizedUserType,
    roles: [normalizedUserType]
  };

  let newUser;
  if (normalizedUserType === 'farmer') {
    newUser = new Farmer({
      ...baseProfile,
      farmAddress: 'Demo Farm Address',
      walletBalance: 0
    });
  } else {
    newUser = new Customer({
      ...baseProfile,
      address: 'Demo Address'
    });
  }

  await newUser.save();
  return { user: newUser, userType: normalizedUserType, wasNewUser: true };
};

// ✅ Test route
router.get("/", (req, res) => {
  res.send("✅ Auth route working");
});

// ✅ Unified registration route (for both farmers and customers)
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, userType, role, phone, address, farmAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedUserType = normalizeUserType(role || userType, 'customer');
    if (!['customer', 'farmer'].includes(normalizedUserType)) {
      return res.status(400).json({ message: "Invalid user type. Must be 'farmer' or 'customer'." });
    }

    const lowerEmail = String(email).trim().toLowerCase();
    const existingUser = await getUserByEmail(lowerEmail);
    if (existingUser.user) {
      return res.status(400).json({
        message: `An account with this email already exists as a ${existingUser.userType}.`,
        userType: existingUser.userType
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const baseProfile = {
      name: String(name).trim(),
      email: lowerEmail,
      phone: phone ? String(phone).trim() : '',
      password: hashedPassword,
      role: normalizedUserType,
      userType: normalizedUserType,
      roles: [normalizedUserType]
    };

    let newUser;
    if (normalizedUserType === 'farmer') {
      newUser = new Farmer({
        ...baseProfile,
        farmAddress: farmAddress ? String(farmAddress).trim() : '',
        walletBalance: 0
      });
    } else {
      newUser = new Customer({
        ...baseProfile,
        address: address ? String(address).trim() : ''
      });
    }

    await newUser.save();

    try {
      await sendWelcomeEmail(newUser.email, newUser.name, normalizedUserType);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, userType: normalizedUserType },
      process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: `${normalizedUserType.charAt(0).toUpperCase() + normalizedUserType.slice(1)} registered successfully.`,
      token,
      userType: normalizedUserType,
      activeRole: normalizedUserType,
      user: buildAuthResponse(newUser, normalizedUserType)
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'email';
      return res.status(400).json({ message: `A user with this ${field} already exists.` });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message || 'Validation failed.' });
    }

    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ✅ Unified login route (for both farmers and customers)
router.post("/login", async (req, res) => {
  try {
    let { email, password, userType, role } = req.body;
    const normalizedUserType = normalizeUserType(role || userType, 'customer');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const lookupEmail = String(email).trim().toLowerCase();
    let existingUser = await getUserByEmail(lookupEmail);
    let wasNewUser = false;

    // Auto-provisioning demo mode: create user if they don't exist
    if (!existingUser.user && DEMO_MODE) {
      try {
        existingUser = await createDemoUser(lookupEmail, password, normalizedUserType);
        wasNewUser = true;
      } catch (createError) {
        console.error('Demo user creation failed:', createError);
        return res.status(500).json({ message: 'Failed to create demo user.' });
      }
    }

    if (!existingUser.user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const actualUserType = normalizeUserType(existingUser.userType || existingUser.user.role || 'customer');
    
    // For demo mode, allow any user type if auto-provisioned
    if (!wasNewUser && actualUserType !== normalizedUserType) {
      return res.status(403).json({
        message: `This account is registered as a ${actualUserType}. Please log in using the ${actualUserType} portal.`,
        requestedUserType: normalizedUserType,
        actualUserType
      });
    }

    // Bypass password verification in demo mode or if ALLOW_ANY_LOGIN is enabled
    const isPasswordValid = DEMO_MODE || ALLOW_ANY_LOGIN === 'true'
      ? true
      : await bcrypt.compare(password, existingUser.user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: existingUser.user._id, email: existingUser.user.email, userType: actualUserType },
      process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
      { expiresIn: '7d' }
    );

    try {
      const LoginLog = require('../models/LoginLog');
      await LoginLog.create({
        email: lookupEmail,
        userType: actualUserType,
        wasNewUser: wasNewUser,
        success: true,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {
      console.warn('LoginLog (auth unified) write failed:', logErr.message);
    }

    res.status(200).json({
      message: wasNewUser ? 'Demo account created and logged in successfully.' : 'Login successful.',
      token,
      userType: actualUserType,
      activeRole: actualUserType,
      user: buildAuthResponse(existingUser.user, actualUserType),
      wasNewUser: wasNewUser
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      void sendLoginConfirmation(existingUser.user.email, existingUser.user.name, actualUserType)
        .then((result) => {
          if (!result?.success) {
            console.error('Login confirmation email failed:', result?.error || 'Unknown email error');
          }
        })
        .catch((emailError) => {
          console.error('Login confirmation email failed:', emailError);
        });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ✅ Verify token route
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user,
      userType: req.userType,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Logout route (client-side token removal)
router.post("/logout", (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ✅ Forgot Password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const lookupEmail = String(email).trim().toLowerCase();
    const existingUser = await getUserByEmail(lookupEmail);

    if (!existingUser.user) {
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = hashResetToken(resetToken);
    const resetTokenExpiry = Date.now() + 3600000;

    existingUser.user.resetPasswordToken = hashedResetToken;
    existingUser.user.resetPasswordExpiry = resetTokenExpiry;
    await existingUser.user.save();

    try {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(existingUser.user.email, existingUser.user.name || 'User', resetUrl);
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
    }

    res.status(200).json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error while processing password reset request.' });
  }
});

// ✅ Reset Password route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password, newPassword } = req.body;
    const finalPassword = password || newPassword;

    if (!token || !finalPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }

    if (String(finalPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const hashedToken = hashResetToken(String(token));
    const customerMatch = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    const farmerMatch = await Farmer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    const user = customerMatch || farmerMatch;
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(String(finalPassword), 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
});

// ✅ Farmer Application route - for customers to become farmers
router.post("/farmer-application", authenticateToken, upload.fields([
  { name: 'farmImages', maxCount: 5 },
  { name: 'idProofs', maxCount: 10 }
]), async (req, res) => {
  try {
    const { name, email, phone, farmName, farmLocation, farmAddress, farmType, experience, description } = req.body;
    const files = req.files;
    
    // Validate required fields
    if (!name || !email || !phone || !farmAddress) {
      return res.status(400).json({ message: 'Name, email, phone, and farm address are required.' });
    }

    // Get the authenticated user from token
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email || email;
    const userType = req.userType;

    // Check if user already exists as a farmer (in Farmer collection)
    let existingFarmer = await Farmer.findOne({ email: userEmail.toLowerCase().trim() });
    
    if (existingFarmer) {
      // Update existing farmer (preserve existing Farmer collection functionality)
      existingFarmer.name = name;
      existingFarmer.phone = phone;
      existingFarmer.farmAddress = farmAddress;
      existingFarmer.farmType = farmType;
      existingFarmer.experience = experience;
      existingFarmer.description = description;
      
      // Add farm images if uploaded
      if (files && files.farmImages) {
        const farmImagePaths = files.farmImages.map(file => '/uploads/' + file.filename);
        existingFarmer.farmImages = [...(existingFarmer.farmImages || []), ...farmImagePaths];
      }
      
      // Add ID proofs if uploaded
      if (files && files.idProofs) {
        const idProofPaths = files.idProofs.map(file => '/uploads/' + file.filename);
        existingFarmer.idProofs = [...(existingFarmer.idProofs || []), ...idProofPaths];
      }
      
      await existingFarmer.save();
      
      return res.status(200).json({
        message: 'Farmer profile updated successfully.',
        farmer: buildAuthResponse(existingFarmer, 'farmer')
      });
    }

    // If authenticated user is a Customer, update the Customer document instead of creating new Farmer
    if (userType === 'customer' && req.user) {
      const existingCustomer = await Customer.findById(userId);

      if (existingCustomer) {
        // Add farmer role if not already present
        if (!existingCustomer.roles.includes('farmer')) {
          existingCustomer.roles.push('farmer');
        }

        // Update farmer-specific fields on Customer document
        existingCustomer.name = name;
        existingCustomer.phone = phone;
        existingCustomer.farmAddress = farmAddress;
        existingCustomer.farmType = farmType;
        existingCustomer.farmLocation = farmLocation;
        existingCustomer.experience = experience;
        existingCustomer.description = description;

        // Add farm images if uploaded
        if (files && files.farmImages) {
          const farmImagePaths = files.farmImages.map(file => '/uploads/' + file.filename);
          existingCustomer.farmImages = [...(existingCustomer.farmImages || []), ...farmImagePaths];
        }

        // Add ID proofs if uploaded
        if (files && files.idProofs) {
          const idProofPaths = files.idProofs.map(file => '/uploads/' + file.filename);
          existingCustomer.idProofs = [...(existingCustomer.idProofs || []), ...idProofPaths];
        }

        // Initialize wallet balance if not set
        if (existingCustomer.walletBalance === undefined) {
          existingCustomer.walletBalance = 0;
        }

        await existingCustomer.save();

        // Generate new token with both customer and farmer roles
        const token = jwt.sign(
          { id: existingCustomer._id, email: existingCustomer.email, userType: 'farmer' },
          process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
          { expiresIn: '7d' }
        );

        return res.status(200).json({
          message: 'Farmer application submitted successfully.',
          token,
          userType: 'farmer',
          activeRole: 'farmer',
          user: buildAuthResponse(existingCustomer, 'farmer')
        });
      }
    }
    
    // Fallback: Create new farmer profile (for non-customer users)
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const newFarmer = new Farmer({
      name: name,
      email: userEmail.toLowerCase().trim(),
      phone: phone,
      password: hashedPassword,
      role: 'farmer',
      userType: 'farmer',
      roles: ['farmer'],
      farmAddress: farmAddress,
      farmType: farmType,
      experience: experience,
      description: description,
      walletBalance: 0
    });

    // Add farm images if uploaded
    if (files && files.farmImages) {
      newFarmer.farmImages = files.farmImages.map(file => '/uploads/' + file.filename);
    }

    // Add ID proofs if uploaded
    if (files && files.idProofs) {
      newFarmer.idProofs = files.idProofs.map(file => '/uploads/' + file.filename);
    }

    await newFarmer.save();

    // Generate new token with farmer role
    const token = jwt.sign(
      { id: newFarmer._id, email: newFarmer.email, userType: 'farmer' },
      process.env.JWT_SECRET || 'harvesthub_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Farmer application submitted successfully.',
      token,
      userType: 'farmer',
      activeRole: 'farmer',
      user: buildAuthResponse(newFarmer, 'farmer')
    });
  } catch (error) {
    console.error('Farmer application error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'email';
      return res.status(400).json({ message: `A farmer with this ${field} already exists.` });
    }
    res.status(500).json({ message: 'Server error during farmer application.' });
  }
});

module.exports = router;