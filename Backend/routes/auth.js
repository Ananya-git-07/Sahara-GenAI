// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate tokens function
const generateTokens = (user) => {
    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User({ username, password });
        await user.save(); // The error is most likely happening here
        const tokens = generateTokens(user);
        res.status(201).json(tokens);
    } catch (error) {
        // --- THIS IS THE IMPORTANT NEW PART ---
        console.error("--- REGISTRATION FAILED ---");
        console.error("The error occurred trying to save a new user:");
        console.error(error); // This will print the full Mongoose error object

        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const tokens = generateTokens(user);
        res.json(tokens);
    } catch (error) {
        // Adding better logging here too, just in case.
        console.error("--- LOGIN FAILED ---");
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;