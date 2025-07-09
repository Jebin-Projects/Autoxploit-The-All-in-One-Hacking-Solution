const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Signup a new user.
 */
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        console.log('Signup request received:', { username, email });

        // Check if user already exists
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            console.log('User already exists:', { email });
            return res.status(400).json({ message: 'User already exists.' });
        }

        console.log('Creating new user:', { username, email });

        // Create the user in the database (without hashing the password)
        const userId = await User.createUser(username, email, password);

        console.log('User created successfully:', { userId });

        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Login an existing user.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        console.log('Login request received:', { email });

        // Find the user by email
        const user = await User.findUserByEmail(email);
        if (!user) {
            console.log('User not found:', { email });
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        console.log('User found:', { id: user.id, username: user.username });

        // Compare the password (plain text comparison)
        if (password !== user.password) {
            console.log('Password mismatch:', { email });
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('JWT Token generated:', token);

        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};