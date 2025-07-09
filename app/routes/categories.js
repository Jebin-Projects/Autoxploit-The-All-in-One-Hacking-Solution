const express = require('express');
const db = require('../models/db');
const router = express.Router();

// Fetch all categories
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.status(200).json({ categories: rows });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;