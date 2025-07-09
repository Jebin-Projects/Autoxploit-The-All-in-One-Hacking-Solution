const express = require('express');
const router = express.Router();
const csrfController = require('../controllers/csrfController'); // Updated controller name

// POST /api/csrfscan
router.post('/', csrfController.csrfScan); // Updated route handler

module.exports = router;