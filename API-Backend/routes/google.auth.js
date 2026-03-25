const express = require('express');
const passport = require('passport');
const router = express.Router();
const googleAuthController = require('../controllers/google.auth');

// Initialize Google OAuth login for user
router.get('/',
    (req, res, next) => {
        console.log('Google OAuth login route called');
        next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Initialize Google OAuth login for brand
router.get('/brand',
    (req, res, next) => {
        console.log('Google OAuth brand login route called');
        next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'], state: 'brand' })
);

// Google OAuth callback
router.get('/callback', function(req, res, next) {
    passport.authenticate('google', { session: false }, function(err, user, info) {
        if (err || !user) {
            console.error('Passport Google Auth Error:', err || 'No user returned');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
        }
        req.user = user;
        return googleAuthController.googleCallback(req, res);
    })(req, res, next);
});

module.exports = router;