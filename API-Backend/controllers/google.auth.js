//controllers/google.auth.js
const jwt = require('jsonwebtoken');

const googleAuthController = {
    // Handle Google auth callback
    async googleCallback(req, res) {
        try {
            // Generate JWT token
            const token = jwt.sign(
                { userId: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            
            const user = req.user.toObject();
            delete user.password;
            delete user.googleId;

            
            const username = [
            user.firstName || '',
            user.lastName || ''
            ].join(' ').trim(); 

            const encodedUser = encodeURIComponent(JSON.stringify({
            id: user._id,
            username: username || user.email, 
            email: user.email,
            }));


            res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&user=${encodedUser}`);
            

        } catch (error) {
            console.error('Google auth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/auth/google/error`);
        }
    }
};

module.exports = googleAuthController;