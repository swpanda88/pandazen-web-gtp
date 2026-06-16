const fs = require('fs');
const path = 'C:/Users/sewer/Documents/New project 2/pandazen-web-gtp/migrations/0001_cleanops_v1_schema.sql';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/IN \('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other'\)/g, 
  "IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'other')");

fs.writeFileSync(path, content);
console.log('Restored 0001 schema');
