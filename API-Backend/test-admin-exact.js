const http = require('http');
const fs = require('fs');

const data = JSON.stringify({ email: 'admin@dreamxstore.com', password: 'AdminPass@123' });

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  res.setEncoding('utf8');
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('test-output.txt', body);
    console.log('done');
  });
});

req.on('error', e => {
  fs.writeFileSync('test-output.txt', e.message);
  console.log('done');
});

req.write(data);
req.end();
