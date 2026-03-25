const axios = require('axios');
const mongoose = require('mongoose');

async function test() {
  try {
    const e = 'test2' + Date.now() + '@example.com';
    const pwd = 'Password123!';
    
    // 1. Register
    await axios.post('http://127.0.0.1:3000/api/auth/register', {email: e, password: pwd, username: 'tester2'});
    
    // 2. Force Verify
    require('dotenv').config();
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({}, {strict:false}));
    await User.updateOne({email: e}, {$set: {isVerified: true}});
    
    // 3. Login
    const loginRes = await axios.post('http://127.0.0.1:3000/api/auth/login', {email: e, password: pwd});
    const token = loginRes.data.token;
    
    // 4. Fetch Profile
    const profileRes = await axios.get('http://127.0.0.1:3000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Profile Success:', profileRes.data.success);
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}
test();
