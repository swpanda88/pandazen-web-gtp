const fs = require('fs');

let raw = fs.readFileSync('clean_schema.json', 'utf16le');
const dump = JSON.parse(raw.substring(raw.indexOf('[')));
const tables = dump[0].results;

const tablesToRecreate = [
  'customers',
  'customer_addresses',
  'properties',
  'requests',
  'quotes',
  'quote_lines',
  'jobs',
  'visits',
  'invoices',
  'billable_events',
  'invoice_lines',
  'payment_records'
];

const dropOrder = [
  'payment_records',
  'invoice_lines',
  'quote_lines',
  'billable_events',
  'invoices',
  'visits',
  'jobs',
  'quotes',
  'requests',
  'properties',
  'customer_addresses',
  'customers'
];

let sql = '-- Step 1: Rename old tables\n';
for (const t of dropOrder) {
  sql += 'ALTER TABLE ' + t + ' RENAME TO ' + t + '_old;\n';
}

sql += '\n-- Step 2: Create new tables\n';

for (const t of tablesToRecreate) {
  // It might be named customers_old or customers depending on when the dump was taken
  let tableObj = tables.find(x => x.sql && (x.sql.startsWith('CREATE TABLE ' + t + ' ') || x.sql.startsWith('CREATE TABLE "' + t + '_old" ')));
  if (!tableObj) tableObj = tables.find(x => x.sql && (x.sql.includes('CREATE TABLE ' + t + '(') || x.sql.includes('CREATE TABLE ' + t + '_old')));
  
  if (!tableObj) throw new Error('Cannot find table ' + t);
  
  let tableDef = tableObj.sql;
  
  // Replace the table name back to the original
  tableDef = tableDef.replace(new RegExp('CREATE TABLE "?' + t + '_old"?'), 'CREATE TABLE ' + t);
  
  tableDef = tableDef.replace(/IN \('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'other'\)/g, 
    "IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other')");
  tableDef = tableDef.replace(/website_enquiry', 'website_enquiry/g, "website_enquiry");
  tableDef = tableDef.replace(/REFERENCES "([a-z_]+)_old"/g, 'REFERENCES $1');
  tableDef = tableDef.replace(/REFERENCES ([a-z_]+)_old/g, 'REFERENCES $1');
  sql += tableDef + ';\n\n';
}

sql += '-- Step 3: Insert data\n';
for (const t of tablesToRecreate) {
  sql += 'INSERT INTO ' + t + ' SELECT * FROM ' + t + '_old;\n';
}

sql += '\n-- Step 4: Drop old tables\n';
for (const t of dropOrder) {
  sql += 'DROP TABLE ' + t + '_old;\n';
}

fs.writeFileSync('C:/Users/sewer/Documents/New project 2/pandazen-web-gtp/migrations/0005_allow_website_enquiry_source.sql', sql);
console.log('0005 generated successfully.');
