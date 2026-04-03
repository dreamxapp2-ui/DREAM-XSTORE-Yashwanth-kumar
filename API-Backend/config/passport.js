require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {
  getBrandByGoogleId,
  getBrandByEmail,
  getBrandById,
  linkGoogleAccount: linkBrandGoogle,
  createGoogleBrand,
} = require('../repositories/brandRepository');
const {
  createGoogleUser,
  getUserByEmail,
  getUserByGoogleId,
  getUserById,
  linkGoogleAccount,
} = require('../repositories/userAuthRepository');


console.log('--- Passport Initialization ---');
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'LOADED' : 'MISSING');
console.log('BACKEND_URL:', process.env.BACKEND_URL || 'NOT SET (using relative paths)');


const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: (() => {
      // Use GOOGLE_CALLBACK_URL if explicitly set
      if (process.env.GOOGLE_CALLBACK_URL) return process.env.GOOGLE_CALLBACK_URL;
      
      // Otherwise construct from BACKEND_URL (which points to the proxy root in monolith setup)
      let baseUrl = (process.env.BACKEND_URL || 'https://dreamx-store.onrender.com').replace(/\/$/, '');
      
      // Force https for production
      if (baseUrl.includes('onrender.com')) baseUrl = baseUrl.replace('http://', 'https://');

      return `${baseUrl}/api/auth/google/callback`;
    })(),
    scope: ['profile', 'email'],
    prompt: 'select_account', // force account selection
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const isBrand = req.query.state === 'brand';

      if (isBrand) {
        let brand = await getBrandByGoogleId(profile.id);

        if (!brand) {
          brand = await getBrandByEmail(profile.emails[0].value);

          if (brand) {
            brand = await linkBrandGoogle(brand._id, profile.id);
          } else {
            brand = await createGoogleBrand({
              id: profile.id,
              email: profile.emails[0].value,
              displayName: profile.displayName || profile.name?.givenName || 'Google Brand',
            });
          }
        }
        brand.isBrandModel = true;
        return done(null, brand);
      } else {
        let user = await getUserByGoogleId(profile.id);

        if (!user) {
          user = await getUserByEmail(profile.emails[0].value);

          if (user) {
            user = await linkGoogleAccount(user._id, {
              id: profile.id,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profilePicture: profile.photos?.[0]?.value,
            });
          } else {
            user = await createGoogleUser({
              id: profile.id,
              email: profile.emails[0].value,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profilePicture: profile.photos?.[0]?.value,
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
      const brand = await getBrandById(data.id);
      if (brand) brand.isBrandModel = true;
      done(null, brand);
    } else {
      const user = await getUserById(data.id);
      if (user) user.isBrandModel = false;
      done(null, user);
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;