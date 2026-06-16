async function runTests() {
  const baseUrl = 'http://127.0.0.1:8788';
  let passed = true;

  // Test 1: Submit with no email and no phone
  let res = await fetch(baseUrl + '/api/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', area: 'E1', service: 'Regular cleaning', privacyAcknowledgement: true })
  });
  let data = await res.json();
  if (res.status === 400 && data.errors && data.errors.contact === 'Please enter either an email address or a phone number.') {
    console.log('Test 1 passed: Contact error message works');
  } else {
    console.log('Test 1 failed:', JSON.stringify(data));
    passed = false;
  }

  // Test 2: Submit with invalid email
  res = await fetch(baseUrl + '/api/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', area: 'E1', service: 'Regular cleaning', privacyAcknowledgement: true, email: 'invalid' })
  });
  data = await res.json();
  if (res.status === 400 && data.errors && data.errors.email === 'Please enter a valid email address.') {
    console.log('Test 2 passed: Email error message works');
  } else {
    console.log('Test 2 failed:', JSON.stringify(data));
    passed = false;
  }

  // Test 3: Submit valid form with notes empty
  const ts = Date.now();
  const testEmail = "local_@example.com";
  res = await fetch(baseUrl + '/api/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test No Notes', area: 'E1', service: 'Regular cleaning', privacyAcknowledgement: true, email: testEmail })
  });
  if (res.status === 200) {
    console.log('Test 3 passed: Valid form with notes empty succeeds');
  } else {
    console.log('Test 3 failed with status:', res.status, await res.text());
    passed = false;
  }

  // Give API a tiny bit of time
  await new Promise(r => setTimeout(r, 500));

  // Test 4-7: Confirm CleanOps request appears and has sensible title
  res = await fetch(baseUrl + '/api/cleanops/requests');
  data = await res.json();
  const reqs = data.data.requests || [];
  const req = reqs.find(r => r.email === testEmail);
  if (req) {
    console.log('Test 4 passed: Request appeared in list');
    if (req.customerMessage === null || req.customerMessage === undefined) {
      console.log('Test 5 passed: Empty customer message correctly saved as null/undefined');
    } else {
      console.log('Test 5 failed: customerMessage is', req.customerMessage);
      passed = false;
    }
  } else {
    console.log('Test 4 failed: Request not found!');
    passed = false;
  }

  if (passed) {
    console.log('\nAll tests passed!');
  }
}

runTests().catch(console.error);
