require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Brand = require('../models/Brand');


// const googleStrategy = new GoogleStrategy(
//     {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL:   `${process.env.BACKEND_URL}/api/auth/google/callback`, 
//         scope: ['profile', 'email']
//     },
//     async (accessToken, refreshToken, profile, done) => {
//         try {

//             let user = await User.findOne({ googleId: profile.id });

//             if (!user) {
//                 // Check if user exists with same email
//                 user = await User.findOne({ email: profile.emails[0].value });

//                 if (user) {
//                     // Update existing user with Google info
//                     user.googleId = profile.id;
//                     user.isVerified = true;
//                     await user.save();
//                 } else {
//                     // Create new user
//                     user = await User.create({
//                         googleId: profile.id,
//                         email: profile.emails[0].value,
//                         firstName: profile.name.givenName,
//                         lastName: profile.name.familyName,
//                         profilePicture: profile.photos?.[0]?.value,
//                         authType: 'google',
//                         isVerified: true
//                     });
//                 }
//             }

//             return done(null, user);
//         } catch (error) {
//             console.error('Google Strategy Error:', error);
//             return done(error, null);
//         }
//     }
// );

// passport.use(googleStrategy);

// // Required for sessions
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     } catch (error) {
//         done(error, null);
//     }
// });

// module.exports = passport;


console.log('--- Passport Initialization ---');
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'LOADED' : 'MISSING');
console.log('BACKEND_URL:', process.env.BACKEND_URL || 'NOT SET (using relative paths)');


const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: (() => {
      // Prioritize absolute URL from BACKEND_URL to avoid "undefined" relative issues
      let baseUrl = (process.env.BACKEND_URL || 'https://dreamx-store.onrender.com').replace(/\/$/, '');
      
      // Explicitly catch the "undefined" error seen in production
      if (baseUrl.includes('undefined') || !baseUrl.startsWith('http')) {
        console.log('Warning: BACKEND_URL invalid, forcing production default');
        baseUrl = 'https://dreamx-store.onrender.com';
      }
      
      // Force https for Render
      if (baseUrl.includes('onrender.com')) {
        baseUrl = baseUrl.replace('http://', 'https://');
      }

      const url = `${baseUrl}/api/auth/google/callback`;
      console.log('Constructed Callback URL:', url);
      return url;
    })(),
    scope: ['profile', 'email'],
    prompt: 'select_account', // force account selection
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const isBrand = req.query.state === 'brand';

      if (isBrand) {
        let brand = await Brand.findOne({ googleId: profile.id });

        if (!brand) {
          brand = await Brand.findOne({ ownerEmail: profile.emails[0].value });

          if (brand) {
            brand.googleId = profile.id;
            brand.isVerified = true;
            await brand.save();
          } else {
            brand = await Brand.create({
              googleId: profile.id,
              ownerEmail: profile.emails[0].value,
              brandName: profile.displayName || profile.name?.givenName || 'Google Brand',
              password: Math.random().toString(36).slice(-8) + 'A1!',
              isVerified: true
            });
          }
        }
        brand.isBrandModel = true;
        return done(null, brand);
      } else {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            user.isVerified = true;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              profilePicture: profile.photos?.[0]?.value,
              authType: 'google',
              isVerified: true
            });
          }
        }
        user.isBrandModel = false;
        return done(null, user);
      }
    } catch (error) {
      console.error('Google Strategy Error:', error);
      return done(error, null);
    }
  }
);

passport.use(googleStrategy);

passport.serializeUser((user, done) => {
  done(null, { id: user.id || user._id, isBrand: !!user.isBrandModel });
});

passport.deserializeUser(async (data, done) => {
  try {
    if (data.isBrand) {
      const brand = await Brand.findById(data.id);
      if (brand) brand.isBrandModel = true;
      done(null, brand);
    } else {
      const user = await User.findById(data.id);
      if (user) user.isBrandModel = false;
      done(null, user);
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

module.exports = passport;