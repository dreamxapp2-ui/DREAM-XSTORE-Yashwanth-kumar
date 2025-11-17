const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    try {
      // Verify and decode token (don't need to lookup user for payment API)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[Auth] Token verified successfully:', decoded);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('[Auth] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('[Auth] Authentication error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

module.exports = auth;
