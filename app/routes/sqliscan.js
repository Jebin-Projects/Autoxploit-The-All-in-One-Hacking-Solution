const express = require('express');
const router = express.Router();
const sqlController = require('../controllers/sqlController'); // Ensure this path is correct

// POST /api/sqliscan
router.post('/', async (req, res) => {
    try {
        const { url } = req.body;

        // Validate required fields
        if (!url) {
            return res.status(400).json({ error: 'URL is required.' });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL format.' });
        }

        // Perform the vulnerability scan
        const scanResults = await sqlController.vulnerabilityScan(url);

        // Return the scan results
        res.status(200).json(scanResults);
    } catch (error) {
        console.error('Error in SQLi scan route:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;