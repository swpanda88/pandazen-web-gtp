async function runTest() {
  const baseUrl = 'https://pandazen-web-gtp.pages.dev';
  console.log('Fetching Requests from API...');
  const res = await fetch(baseUrl + '/api/cleanops/requests');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}

runTest().catch(console.error);
