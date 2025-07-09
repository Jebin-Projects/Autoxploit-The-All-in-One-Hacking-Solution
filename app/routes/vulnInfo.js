const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/api/vuln-info', async (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).json({ error: 'Missing vulnerability name' });
    }

    try {
        // This is a placeholder. Replace it with actual scraping or API
        const info = `CSRF (Cross-Site Request Forgery) allows attackers to perform unauthorized actions on behalf of users.`;
        const mitigation = `Use anti-CSRF tokens and verify them on server-side.`;

        res.json({ info, mitigation });
    } catch (err) {
        console.error('Error fetching vulnerability info:', err);
        res.status(500).json({ error: 'Failed to fetch vulnerability info' });
    }
});

module.exports = router;
