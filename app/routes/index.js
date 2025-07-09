const express = require('express');
const router = express.Router();

// Import route handlers
const scanRoutes = require('./scans');
const bruteforceRoutes = require('./bruteforce');
const sqliscanRoute = require('./sqliscan');
const fileUploadRoutes = require('./fileupload'); // Import file upload routes

// Define routes
router.use('/scan', scanRoutes);
router.use('/bruteforce', bruteforceRoutes);
router.use('/sqliscan', sqliscanRoute);

// Add the file upload route
router.use('/api/fileuploadscan', fileUploadRoutes); // Mount the file upload route

module.exports = router;