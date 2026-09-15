const Farmer = require('../models/Farmer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerFarmer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingFarmer = await Farmer.findOne({ email });
    if (existingFarmer) {
      return res.status(400).json({ message: 'Farmer already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const farmer = new Farmer({
      name,
      email,
      password: hashedPassword,
    });

    await farmer.save();

    const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET || 'harvesthub_secret_key_2024', { expiresIn: '7d' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error in registerFarmer:', error); // 💥 VERY IMPORTANT FOR DEBUGGING
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerFarmer };
