const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
  area: 'Durham',
  service: 'Regular cleaning',
  message: 'Test message',
  privacyAcknowledgement: true
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 8788,
  path: '/api/public/leads',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});

req.write(data);
req.end();
