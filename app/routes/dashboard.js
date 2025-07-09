const express = require('express');
const { verifyToken } = require('../utils/jwtHelper');
const router = express.Router();

// Middleware to check if the user is authenticated
router.use(verifyToken);

// Dashboard route
router.get('/', async (req, res) => {
    try {
        // Fetch user details or other data here if needed
        res.status(200).sendFile('dashboard.html', { root: 'public' });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;