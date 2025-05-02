const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, phoneNumber, gender, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = new User({ name, email, password, phoneNumber, gender, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Register input:', req.body);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name,
        email,
        phoneNumber,
        gender,
        role,
      },
    });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body.password);
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
    console.error('Login Error:', err.message);
  }
});

// CHECK AUTH (GET /api/auth/me)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: user._id, // Add id for consistency
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;