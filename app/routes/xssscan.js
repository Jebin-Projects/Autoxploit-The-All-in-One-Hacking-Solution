const express = require('express');
const router = express.Router();
const xssController = require('../controllers/xssController'); // Updated controller name

// POST /api/xssscan
router.post('/', xssController.xssScan); // Updated route handler

module.exports = router;