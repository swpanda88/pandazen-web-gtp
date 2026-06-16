async function runTests() {
  const baseUrl = 'http://127.0.0.1:8788';
  let passed = true;

  const testEmail = 'local_@example.com';

  // Test 4-7: Confirm CleanOps request appears and has sensible title
  const res = await fetch(baseUrl + '/api/cleanops/requests');
  const data = await res.json();
  const reqs = data.data.requests || [];
  const req = reqs.find(r => r.email === testEmail);
  if (req) {
    console.log('Test 4 passed: Request appeared in list');
    if (!req.customerMessage) {
      console.log('Test 5 passed: Empty customer message correctly saved as null/undefined/empty string');
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
