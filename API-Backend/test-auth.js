// using native fetch

async function run() {
  try {
    const email = 'test_unauth_' + Date.now() + '@example.com';
    const password = 'Password123!';
    const username = 'testunauth123';

    // 1. Register
    console.log('Registering...');
    let res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    let data = await res.json();
    console.log('Register response:', res.status, data);

    // 2. We need to verify if isVerified is required
    // The backend requires isVerified to login, but wait, maybe 'authController' login checks it?
    // Let's force verify in DB using mongoose inline since we are in API-Backend
    const mongoose = require('mongoose');
    require('dotenv').config();
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    await User.updateOne({ email }, { $set: { isVerified: true } });
    console.log('Forced user verification in DB');

    // 3. Login
    console.log('Logging in...');
    res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    data = await res.json();
    console.log('Login response:', res.status, data);

    const token = data.token;
    if (!token) {
        console.log('No token received!');
        process.exit(1);
    }

    // 4. Fetch profile
    console.log('Fetching profile with token...');
    res = await fetch('http://localhost:3000/api/user/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    data = await res.json();
    console.log('Profile response:', res.status, data);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
