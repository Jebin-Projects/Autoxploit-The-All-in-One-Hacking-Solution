const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const db = require('./models/db'); // Database connection (from autoxploit)
require('dotenv').config(); // Load environment variables

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to disable caching for protected routes
app.use((req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    next();
});

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json({ limit: '50mb' })); // Parse JSON request bodies with increased size limit
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from both "public" folders
app.use(express.static(path.join(__dirname, '..', 'public'))); // AutoXploit public folder
app.use('/app_control', express.static(path.join(__dirname, '..', 'app_control', 'public'))); // app_control public folder

// Default route to serve AutoXploit's index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});



// Configure multer for file uploads (from autoxploit)
const upload = multer({ dest: 'temp/' }); // Save uploaded files to the "temp" directory

// Import routes from autoxploit
const sqliscanRoute = require('./routes/sqliscan'); // SQL Injection route
const xssscanRoute = require('./routes/xssscan');   // XSS route
const commandexecRoute = require('./routes/commandexec'); // Command Execution route
const csrfRoute = require('./routes/csrf'); // CSRF route
const fileUploadRoute = require('./routes/fileupload'); // File Upload route
const authRoutes = require('./routes/auth'); // Authentication routes
const scanResultsRoutes = require('./routes/scanResults'); // Scan results routes
const categoriesRoutes = require('./routes/categories'); // Categories route
const scansRoute = require('./routes/scans'); // Scans route (newly added)

// Register API routes from autoxploit
app.use('/api/sqliscan', sqliscanRoute);
app.use('/api/xssscan', xssscanRoute);
app.use('/api/commandexec', commandexecRoute);
app.use('/api/csrfscan', csrfRoute); // Ensure this line exists
app.use('/api/fileuploadscan', fileUploadRoute);
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/scan-results', scanResultsRoutes); // Scan results routes
app.use('/api/categories', categoriesRoutes);
app.use('/api/scans', scansRoute); // Newly added scans route

// Example of a protected route (from autoxploit)
const { verifyToken } = require('./utils/jwtHelper');
app.get('/api/dashboard', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Welcome to the dashboard!', userId: req.userId });
});

// Error Handling Middleware (from autoxploit)
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
});

// Catch-all route for undefined endpoints (from autoxploit)
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

const vulnInfo = require('./routes/vulnInfo');
app.use(vulnInfo);


// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});