const express = require('express');
const Scan = require('../models/Scan');
const { verifyToken } = require('../utils/jwtHelper');
const db = require('../models/db'); // Import the database connection

// Initialize the router
const router = express.Router();

/**
 * Save scan results.
 */
router.post('/save', verifyToken, async (req, res) => {
    try {
        const { scanName, category, targetUrl, toolUsed, isVulnerable, scanResults } = req.body;
        const userId = req.userId; // Extracted from JWT token

        // Validate required fields
        if (!scanName || !category || !targetUrl || !toolUsed || typeof isVulnerable !== 'boolean' || !scanResults) {
            return res.status(400).json({ message: 'Missing or invalid fields.' });
        }

        console.log('Saving scan results:', { userId, scanName, category, targetUrl, toolUsed, isVulnerable });

        // Parse the raw scan results if they are in JSON string format
        let parsedResults = {};
        try {
            parsedResults = JSON.parse(scanResults);
        } catch (error) {
            console.warn('Scan results are not in JSON format. Using raw results.');
            parsedResults = scanResults;
        }

        // Summarize the results
        const summary = summarizeScanResults(parsedResults);

        // Dynamically assign categoryId based on the category name
        const categoryId = await getCategoryId(category);

        // Save the summarized scan to the database
        const scanId = await Scan.createScan(userId, scanName, category, targetUrl, toolUsed, isVulnerable, JSON.stringify(summary), categoryId);
        console.log('Scan saved successfully:', { scanId });

        res.status(201).json({ message: 'Scan results saved successfully', scanId });
    } catch (error) {
        console.error('Error saving scan results:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Fetch all scans for the logged-in user.
 */
router.get('/all', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        const [rows] = await db.query('SELECT * FROM scans WHERE user_id = ?', [userId]);

        res.status(200).json({ scans: rows });
    } catch (error) {
        console.error('Error fetching scans:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Summarizes the scan results into a smaller, crisper format.
 * @param {Object[]} results - The raw scan results.
 * @returns {Object} - The summarized scan results.
 */
function summarizeScanResults(results) {
    const uniqueTechniques = new Set();
    let vulnerablePayloads = 0;

    if (Array.isArray(results)) {
        results.forEach(result => {
            if (result.status === 'vulnerable') {
                vulnerablePayloads++;
                // Extract unique techniques based on payload patterns
                if (result.payload && typeof result.payload === 'string') {
                    if (result.payload.includes('<script>')) uniqueTechniques.add('Script Injection');
                    if (result.payload.includes('onerror') || result.payload.includes('onload')) uniqueTechniques.add('Event Handlers');
                    if (result.payload.includes('<iframe>')) uniqueTechniques.add('Iframe Injection');
                    if (result.payload.includes('eval(')) uniqueTechniques.add('Eval Function');
                    if (result.payload.includes('fetch(')) uniqueTechniques.add('Data Exfiltration');
                }
            }
        });
    }

    return {
        totalVulnerabilities: vulnerablePayloads,
        techniques: Array.from(uniqueTechniques),
        isVulnerable: vulnerablePayloads > 0
    };
}

/**
 * Dynamically assigns a categoryId based on the category name.
 * @param {string} categoryName - The name of the category (e.g., "Website Exploits").
 * @returns {number} - The corresponding categoryId.
 */
async function getCategoryId(categoryName) {
    const categories = {
        'Website Exploits': 1,
        'Network Vulnerabilities': 2,
        'Authentication Issues': 3,
        'CSRF': 1, // CSRF falls under "Website Exploits"
        'XSS': 1, // XSS falls under "Website Exploits"
        'SQL Injection': 1 // SQL Injection falls under "Website Exploits"
    };

    return categories[categoryName] || 1; // Default to "Website Exploits" if category is unknown
}

module.exports = router;