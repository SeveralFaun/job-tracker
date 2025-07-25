const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({ email, password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email' });
        }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set token in cookie
        res.cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req, res) => {
    res.json(req.user || null);
});

module.exports = router;

