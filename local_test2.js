async function runTests() {
  const baseUrl = 'http://127.0.0.1:8788';
  let passed = true;

  const res = await fetch(baseUrl + '/api/cleanops/requests');
  const text = await res.text();
  console.log('API response:', text);
}

runTests().catch(console.error);
