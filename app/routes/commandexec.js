const express = require('express');
const router = express.Router();
const commandExecController = require('../controllers/commandExecController'); // Updated controller name

// POST /api/commandexec
router.post('/', commandExecController.commandExecScan); // Updated route handler

module.exports = router;