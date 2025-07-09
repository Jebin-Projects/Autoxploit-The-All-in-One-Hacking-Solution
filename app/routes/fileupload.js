const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Import the database connection
const { verifyToken } = require('../utils/jwtHelper'); // Middleware to verify JWT token
const fileUploadController = require('../controllers/fileUploadController');

/**
 * POST /api/fileuploadscan
 * Perform a file upload vulnerability scan and save results to the database.
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { uploadUrl, baseUrl } = req.body;
        console.log('Received inputs:', { uploadUrl, baseUrl });

        if (!uploadUrl || !baseUrl) {
            return res.status(400).json({ message: 'Both uploadUrl and baseUrl are required.' });
        }

        try {
            new URL(uploadUrl);
            new URL(baseUrl);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid URL format.' });
        }

        const scanResults = await fileUploadController.fileUploadScan(uploadUrl, baseUrl);
        console.log('Scan results:', scanResults);

        const isVulnerable = scanResults.some(result => result.status === 'vulnerable');

        const userId = req.userId;
        const scanName = 'File Upload Vulnerability Scan';
        const categoryName = 'Website Exploits';
        const targetUrl = uploadUrl;
        const toolUsed = 'Custom File Upload Scanner';
        const scanResultsString = JSON.stringify(scanResults);

        // ✅ Get the category_id from the `categories` table
        const [rows] = await db.query('SELECT id FROM categories WHERE name = ?', [categoryName]);

        if (rows.length === 0) {
            return res.status(400).json({ message: `Category '${categoryName}' not found.` });
        }

        const categoryId = rows[0].id;

        console.log('Saving scan results to database:', {
            userId, scanName, categoryId, targetUrl, toolUsed, isVulnerable, scanResultsString
        });

        // ✅ Use categoryId here
        await db.query(
            'INSERT INTO scans (user_id, scan_name, category_id, target_url, tool_used, is_vulnerable, scan_results) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, scanName, categoryId, targetUrl, toolUsed, isVulnerable, scanResultsString]
        );

        res.status(200).json(scanResults);
    } catch (error) {
        console.error('Error performing file upload scan:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});



module.exports = router;