PRAGMA defer_foreign_keys=1;
CREATE TABLE customers_new (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
    source_type TEXT CHECK (source_type IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'other', 'website_enquiry')),
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (company_name IS NOT NULL OR first_name IS NOT NULL OR last_name IS NOT NULL)
);
INSERT INTO customers_new SELECT * FROM customers;
DROP TABLE customers;
ALTER TABLE customers_new RENAME TO customers;
