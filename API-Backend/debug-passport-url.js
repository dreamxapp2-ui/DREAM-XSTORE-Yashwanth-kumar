require('dotenv').config();
const BACKEND_URL = process.env.BACKEND_URL;

const callbackURL = (() => {
  const url = BACKEND_URL 
    ? `${BACKEND_URL.replace(/\/$/, '')}/api/auth/google/callback` 
    : '/api/auth/google/callback';
  return url;
})();

console.log('BACKEND_URL from env:', BACKEND_URL);
console.log('Constructed callbackURL:', callbackURL);
