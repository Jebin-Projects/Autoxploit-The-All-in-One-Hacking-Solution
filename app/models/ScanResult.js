// app/models/ScanResult.js
const mongoose = require('mongoose');

const ScanResultSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true, // e.g., "network", "bruteforce", "vulnerability"
    },
    target: {
        type: String,
        required: true, // Target IP/URL
    },
    results: {
        type: Object,
        required: true, // Scan results (JSON object)
    },
    createdAt: {
        type: Date,
        default: Date.now, // Timestamp of when the scan was performed
    },
});

module.exports = mongoose.model('ScanResult', ScanResultSchema);