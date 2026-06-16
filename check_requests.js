async function runTest() {
  const baseUrl = 'https://pandazen-web-gtp.pages.dev';
  console.log('Fetching Requests from API...');
  const res = await fetch(baseUrl + '/api/cleanops/requests');
  const data = await res.json();
  const requests = data.requests || [];
  
  console.log('Total requests found:', requests.length);
  const smokeReqs = requests.filter(r => r.customerEmail && r.customerEmail.includes('smoketest'));
  console.log('Smoke requests:', JSON.stringify(smokeReqs, null, 2));
}

runTest().catch(console.error);
