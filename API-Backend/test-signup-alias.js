async function testSignupAlias() {
  const email = 'test_signup_' + Date.now() + '@example.com';
  const password = 'Password123!';
  const username = 'testsignup' + Math.floor(Math.random() * 1000);

  console.log('Testing /api/auth/signup alias...');
  try {
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    const data = await res.json();
    console.log('Signup Alias Response:', res.status, data);
    
    if (res.status === 201) {
      console.log('SUCCESS: /signup alias is working!');
    } else {
      console.log('FAILURE: /signup alias returned status', res.status);
    }
  } catch (err) {
    console.error('ERROR during /signup alias test:', err.message);
  }
}

testSignupAlias();
