const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.verifyToken = (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.headers['authorization'];

    // Check if the token exists
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user ID to the request object
        req.userId = decoded.id; // Assuming the token contains an "id" field

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification errors
        console.error('Token verification failed:', error.message);

        // Return an appropriate error response
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid token.' });
        } else {
            return res.status(500).json({ message: 'An error occurred while verifying the token.' });
        }
    }
};