/**
 * Role-Based Authorization Middleware
 * 
 * This middleware checks if the authenticated user has the required role(s)
 * to access a protected route.
 * 
 * Usage:
 *   app.delete('/api/products/:id', auth, authorize('superadmin'), deleteProduct);
 *   app.get('/api/analytics', auth, authorize(['admin', 'superadmin']), getAnalytics);
 */

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated (auth middleware must run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Flatten allowedRoles in case it's passed as array or multiple args
    const roles = allowedRoles.flat();

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRole: roles,
        userRole: req.user.role
      });
    }

    // User has required role, proceed to next middleware/route handler
    next();
  };
};

module.exports = authorize;
