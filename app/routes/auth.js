const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User'); // Import the User model
const router = express.Router();


/**
 * Register a new user.
 */
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        // Create new user (storing password as plain text here — hash in production)
        const userId = await User.createUser(username, email, password);


        res.status(201).json({ message: 'Signup successful.', userId });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * Login an existing user.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find the user by email
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Compare the password (plain text comparison)
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token and user details
        res.status(200).json({
            message: 'Login successful.',
            token: newToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get user details from the token.
 */
router.get('/user', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Fetch user details from the database
        const user = await User.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Return user details
        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; // Export the router