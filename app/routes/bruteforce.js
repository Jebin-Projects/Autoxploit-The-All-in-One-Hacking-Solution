const express = require('express');
const router = express.Router();
const bruteforceController = require('../controllers/bruteforceController');

// POST /api/bruteforce
router.post('/', bruteforceController.bruteForce);

module.exports = router;