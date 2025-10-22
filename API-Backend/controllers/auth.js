// const User = require('../models/User');
// const { SendMail } = require('../helpers/mailing');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// const authController = {
//   async register(req, res) {
//     try {
//       const { email, password, username, lastName } = req.body;

//       // Input validation
//       if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password are required' });
//       }

//       // Check if user already exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ message: 'Email already registered' });
//       }

//       // Hash password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       // Generate verification token
//       const verificationToken = jwt.sign(
//         { email },
//         process.env.JWT_SECRET,
//      { expiresIn: '30d' }
//       );

//       // Create new user with verification token
//       const user = new User({
//         email,
//         password: hashedPassword,
//         username,
//         lastName,
//         authType: 'email',
//         verificationToken,
//         verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
//         isVerified: false
//       });

//       await user.save();

//       // Create verification URL
//       const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

//       // Send verification email
//       const emailContent = `
//         Hello ${username || 'there'},

//         Thank you for registering with DesignersDen! To complete your registration, please verify your email address by clicking the link below:

//         ${verificationUrl}

//         This link will expire in 24 hours.

//         If you didn't create this account, please ignore this email.

//         Best regards,
//         The DesignersDen Team
//       `;

//       const emailSubject = 'Welcome to DesignersDen - Verify Your Email';

//       try {
//         await SendMail(emailContent, emailSubject, email);
//       } catch (emailError) {
//         console.error('Failed to send verification email:', emailError);
//         // Delete the user if email sending fails
//         await User.deleteOne({ _id: user._id });
//         return res.status(500).json({ message: 'Failed to send verification email' });
//       }

//       // Remove sensitive information from response
//       const userResponse = user.toObject();
//       delete userResponse.password;
//       delete userResponse.verificationToken;
//       delete userResponse.verificationTokenExpiry;

//       res.status(201).json({
//         message: 'Registration initiated. Please check your email to verify your account.',
//         user: {
//           id: userResponse._id,
//           email: userResponse.email,
//           username: userResponse.username,
//           lastName: userResponse.lastName,
//           isVerified: false
//         }
//       });

//     } catch (error) {
//       console.error('Registration error:', error);
//       res.status(500).json({ 
//         message: 'Error registering user', 
//         error: error.message 
//       });
//     }
//   },

//   async verifyEmail(req, res) {
//     try {
//       const { token } = req.body;

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
//       // Find user by verification token
//       const user = await User.findOne({ 
//         email: decoded.email,
//         verificationToken: token,
//         verificationTokenExpiry: { $gt: new Date() }
//       });

//       if (!user) {
//         return res.status(400).json({ message: 'Invalid or expired verification token' });
//       }

//       // Update user verification status
//       user.isVerified = true;
//       user.verificationToken = undefined;
//       user.verificationTokenExpiry = undefined;
//       await user.save();

//       // Generate new JWT token for authenticated session
//       const authToken = jwt.sign(
//         { userId: user._id },
//         process.env.JWT_SECRET,
//         { expiresIn: '30d' }
//       );

//       res.status(200).json({
//         message: 'Email verified successfully',
//         token: authToken,
//         user: {
//           id: user._id,
//           email: user.email,
//           username: user.username,
//           lastName: user.lastName,
//           isVerified: true
//         }
//       });

//     } catch (error) {
//       console.error('Email verification error:', error);
//       res.status(500).json({ 
//         message: 'Error verifying email', 
//         error: error.message 
//       });
//     }
//   },
//   async login(req, res) {
//     try {
//       const { email, password } = req.body;
//       console.log(req.body)

//       // Input validation
//       if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password are required' });
//       }

//       // Find user by email
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(401).json({ message: 'Invalid email or password' });
//       }
//       console.log(user)
//       // Compare password
//       console.log(user.password)
//       const isValidPassword = await bcrypt.compare(password, user.password);
//       if (!isValidPassword) {
//         return res.status(401).json({ message: 'Invalid email or password' });
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         { userId: user._id },
//         process.env.JWT_SECRET,
//         { expiresIn: '30d' }
//       );

//       // Remove password from response
//       const userResponse = user.toObject();
//       delete userResponse.password;

//       res.json({
//         message: 'Login successful',
//         token,
//         user: {
//           id: userResponse._id,
//           email: userResponse.email,
//           username: userResponse.username,
//           lastName: userResponse.lastName
//         }
//       });

//     } catch (error) {
//       console.error('Login error:', error);
//       res.status(500).json({ 
//         message: 'Error logging in', 
//         error: error.message 
//       });
//     }
//   },

//   // Change password
//   async changePassword(req, res) {
//     try {
//       const { currentPassword, newPassword } = req.body;
//       const userId = req.user._id; // From auth middleware

//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }

//       // Verify current password
//       const isValidPassword = await bcrypt.compare(currentPassword, user.password);
//       if (!isValidPassword) {
//         return res.status(401).json({ message: 'Current password is incorrect' });
//       }

//       // Hash new password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(newPassword, salt);

//       // Update password
//       user.password = hashedPassword;
//       await user.save();

//       res.json({ message: 'Password updated successfully' });

//     } catch (error) {
//       console.error('Change password error:', error);
//       res.status(500).json({ 
//         message: 'Error changing password', 
//         error: error.message 
//       });
//     }
//   }
// };

// module.exports = authController;


const User = require('../models/User');
const { SendMail } = require('../helpers/mailing');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  // Helper function for email validation (simple regex)
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Helper function for password strength validation
  isValidPassword(password) {
    // Must have at least 8 chars, one lowercase, one uppercase, one digit, one special char
    const hasMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&#\-_.,;:()[\]{}'"<>~`+=|\\\/]/.test(password);
    
    return hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar;
  },

  async register(req, res) {
    try {
      const { email, password, username, isBrand } = req.body;  // Dropped lastName

      // Enhanced input validation (granular, with field-specific errors)
      if (!email || !password || !username) {
        return res.status(400).json({ 
          message: 'Email, password, and username are required', 
          field: 'general'  // For client to show global error
        });
      }
      if (!authController.isValidEmail(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format', 
          field: 'email' 
        });
      }
      if (!authController.isValidPassword(password)) {
        return res.status(400).json({ 
          message: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character', 
          field: 'password' 
        });
      }
      if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ 
          message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores', 
          field: 'username' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email already registered', 
          field: 'email' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token (aligned to 24h / 1 day)
      const verificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }  // Changed from '30d' to match expiry field
      );

      // Create new user with verification token (dropped lastName)
      const user = new User({
        email,
        password: hashedPassword,
        username,
        isBrand: isBrand || false,
        authType: 'email',
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours / 1 day
        isVerified: false,
      });

      await user.save();

      // Create verification URL
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      // Send verification email (dropped lastName reference)
       const emailContent = `
         Hello ${username || 'there'},

         Thank you for registering with DesignersDen! To complete your registration, please verify your email address by clicking the link below:

         ${verificationUrl}

         This link will expire in 24 hours.

        If you didn't create this account, please ignore this email.

         Best regards,
         The DesignersDen Team
       `;

      const emailSubject = 'Welcome to DesignersDen - Verify Your Email';

      try {
        await SendMail(emailContent, emailSubject, email);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Delete the user if email sending fails
        await User.deleteOne({ _id: user._id });
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again.', 
          field: 'general' 
        });
      }

      // Remove sensitive information from response (dropped lastName)
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.verificationToken;
      delete userResponse.verificationTokenExpiry;

      res.status(201).json({
        message: 'Registration initiated. Please check your email to verify your account.',
        user: {
          id: userResponse._id,
          email: userResponse.email,
          username: userResponse.username,
          isBrand: userResponse.isBrand || false,
          isVerified: false
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Error registering user', 
        field: 'general',
        error: error.message  // Keep for debugging, but remove in prod if sensitive
      });
    }
  },

  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ 
          message: 'Verification token is required', 
          field: 'token' 
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by verification token
      const user = await User.findOne({ 
        email: decoded.email,
        verificationToken: token,
        verificationTokenExpiry: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired verification token', 
          field: 'token' 
        });
      }

      // Update user verification status
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiry = undefined;
      await user.save();

      // Generate new JWT token for authenticated session
      const authToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        message: 'Email verified successfully',
        token: authToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          isVerified: true
        }
      });

    } catch (error) {
      // Handle JWT expiry/invalid token specifically
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ 
          message: 'Verification token has expired. Please register again.', 
          field: 'token' 
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ 
          message: 'Invalid verification token. Please register again.', 
          field: 'token' 
        });
      }
      console.error('Email verification error:', error);
      res.status(500).json({ 
        message: 'Error verifying email', 
        field: 'general',
        error: error.message 
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log(req.body);  // Keep for debugging; remove in prod

      // Enhanced input validation
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required', 
          field: 'general' 
        });
      }
      if (!authController.isValidEmail(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format', 
          field: 'email' 
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid email or password', 
          field: 'email' 
        });
      }
      console.log(user);  // Keep for debugging
      // Compare password
      console.log(user.password);  // Keep for debugging
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Invalid email or password', 
          field: 'password' 
        });
      }

      // Check if verified (add this for security)
      if (!user.isVerified) {
        return res.status(401).json({ 
          message: 'Please verify your email before logging in.', 
          field: 'general' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: userResponse._id,
          email: userResponse.email,
          username: userResponse.username,
          isBrand: userResponse.isBrand || false
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Error logging in', 
        field: 'general',
        error: error.message 
      });
    }
  },

  // Change password (minor enhancements for consistency)
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id; // From auth middleware

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: 'Current password and new password are required', 
          field: 'general' 
        });
      }
      if (!authController.isValidPassword(newPassword)) {
        return res.status(400).json({ 
          message: 'New password must meet strength requirements', 
          field: 'newPassword' 
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found', 
          field: 'general' 
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Current password is incorrect', 
          field: 'currentPassword' 
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        message: 'Error changing password', 
        field: 'general',
        error: error.message 
      });
    }
  }
};

module.exports = authController;