const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/admin/login', {
      email: 'admin@dreamxstore.com',
      password: 'AdminPass@123'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
