const fs = require('fs');
const { execSync } = require('child_process');

const sql = fs.readFileSync('C:/Users/sewer/Documents/New project 2/pandazen-web-gtp/migrations/0005_allow_website_enquiry_source.sql', 'utf8');
const lines = sql.split(';');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.startsWith('--')) continue;
  
  console.log('Executing:', line.substring(0, 50) + '...');
  fs.writeFileSync('temp.sql', line + ';');
  try {
    execSync('npx wrangler@3.114.14 d1 execute pandazen-cleanops-v2 --local --file temp.sql', { stdio: 'pipe' });
  } catch (e) {
    console.error('FAILED AT:', line);
    console.error(e.stderr ? e.stderr.toString() : e.stdout ? e.stdout.toString() : e.message);
    process.exit(1);
  }
}
console.log('ALL PASSED');
