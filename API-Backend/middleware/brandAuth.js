const jwt = require('jsonwebtoken');
const Brand = require('../models/Brand');

/**
 * Brand Authentication Middleware
 * Verifies brand JWT token and attaches brand data to request
 */
const brandAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if this is a brand token (contains brandId)
            if (!decoded.brandId) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid brand token'
                });
            }
            
            // Find brand
            const brand = await Brand.findById(decoded.brandId).select('-password');
            if (!brand) {
                return res.status(401).json({
                    success: false,
                    message: 'Brand not found'
                });
            }
        
            // Attach brand to request object
            req.brand = brand;
            req.brandId = brand._id;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = brandAuth;
