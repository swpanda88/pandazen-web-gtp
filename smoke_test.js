const assert = require('assert');

async function runTest() {
  console.log('--- Starting Production Smoke Test ---');
  
  const baseUrl = 'https://pandazen-web-gtp.pages.dev';

  // 1. Invalid Submit
  console.log('Testing invalid form submit...');
  let res = await fetch(baseUrl + '/api/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.strictEqual(res.status, 400, 'Expected 400 for invalid submit');
  let data = await res.json();
  assert.strictEqual(data.ok, false, 'Expected ok: false');
  assert.ok(data.fields.name, 'Expected field error for name');
  assert.ok(data.fields.email, 'Expected field error for email');
  console.log('Invalid submit test passed!');

  // 2. Valid Submit
  console.log('Testing valid form submit...');
  const testEmail = 'smoketest_' + Date.now() + '@example.com';
  const payload = {
    name: 'Smoke Test User',
    email: testEmail,
    area: 'London',
    service: 'Regular cleaning',
    message: 'This is a production smoke test.',
    privacyAcknowledgement: true
  };
  res = await fetch(baseUrl + '/api/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.strictEqual(res.status, 200, 'Expected 200 for valid submit');
  data = await res.json();
  assert.strictEqual(data.ok, true, 'Expected ok: true');
  console.log('Valid submit test passed!');

  // 3. Verify in CleanOps Requests API
  console.log('Fetching Requests from API...');
  res = await fetch(baseUrl + '/api/cleanops/requests');
  assert.strictEqual(res.status, 200, 'Expected 200 for GET requests');
  data = await res.json();
  const requests = data.requests || [];
  
  const newReq = requests.find(r => r.customerEmail === testEmail);
  assert.ok(newReq, 'Newly created request should appear in the list');
  assert.strictEqual(newReq.sourceType, 'website_enquiry', 'Source type must be website_enquiry');
  console.log('CleanOps verification passed!');
  
  console.log('--- Production Smoke Test Success! ---');
}

runTest().catch(err => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
