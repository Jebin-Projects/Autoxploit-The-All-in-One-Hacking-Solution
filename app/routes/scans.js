const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Import the database connection
const jwt = require('jsonwebtoken'); // Ensure JWT is imported

/**
 * GET /api/scans
 * Fetch all scans for the authenticated user.
 */
router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Fetch scans for the user from the database
        const [rows] = await db.query(
            'SELECT id, scan_name, category, target_url, tool_used, is_vulnerable, scan_results, scanned_at FROM scans WHERE user_id = ? ORDER BY scanned_at DESC',
            [userId]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching scans:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



/**
 * GET /api/scans/:id
 * Fetch a specific scan by ID for the authenticated user.
 */
router.get('/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const scanId = req.params.id;

        // Fetch scan by ID and user ID (to avoid exposing others' scans)
        const [rows] = await db.query(
            'SELECT id, scan_name, category, target_url, tool_used, is_vulnerable, scan_results, scanned_at FROM scans WHERE id = ? AND user_id = ?',
            [scanId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Scan not found.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching scan by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;