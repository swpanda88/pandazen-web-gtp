-- Step 1: Rename old tables
ALTER TABLE payment_records RENAME TO payment_records_old;
ALTER TABLE invoice_lines RENAME TO invoice_lines_old;
ALTER TABLE quote_lines RENAME TO quote_lines_old;
ALTER TABLE billable_events RENAME TO billable_events_old;
ALTER TABLE invoices RENAME TO invoices_old;
ALTER TABLE visits RENAME TO visits_old;
ALTER TABLE jobs RENAME TO jobs_old;
ALTER TABLE quotes RENAME TO quotes_old;
ALTER TABLE requests RENAME TO requests_old;
ALTER TABLE properties RENAME TO properties_old;
ALTER TABLE customer_addresses RENAME TO customer_addresses_old;
ALTER TABLE customers RENAME TO customers_old;

-- Step 2: Create new tables
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
    source_type TEXT CHECK (source_type IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other')),
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (company_name IS NOT NULL OR first_name IS NOT NULL OR last_name IS NOT NULL)
);

CREATE TABLE customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    address_type TEXT NOT NULL CHECK (address_type IN ('billing', 'contact', 'service', 'other')),
    label TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    postcode TEXT,
    country TEXT,
    is_default_billing INTEGER DEFAULT 0,
    is_default_service INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE properties (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    postcode TEXT,
    country TEXT,
    access_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, property_type TEXT, bedrooms TEXT, bathrooms TEXT, pets_present TEXT, parking TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    property_id TEXT,
    source_type TEXT CHECK (source_type IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other')),
    status TEXT CHECK (status IN ('new', 'contacted', 'waiting_customer', 'assessment_needed', 'quote_needed', 'quoted', 'won', 'lost', 'not_suitable', 'archived')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, request_type TEXT, cadence TEXT, how_soon TEXT, preferred_day TEXT, preferred_time_window TEXT, approx_size TEXT, photos_helpful TEXT, quote_readiness TEXT, assessment_required TEXT, initial_clean_required TEXT, pricing_basis TEXT, estimated_regular_duration_minutes INTEGER, estimated_initial_duration_minutes INTEGER, estimated_team_size INTEGER, scope_confidence TEXT, main_priorities_json TEXT, quote_considerations_json TEXT, cleaning_products TEXT, vacuum_hoover TEXT, mop TEXT, setup_confirmed INTEGER DEFAULT 0, customer_message TEXT, short_scoping_note TEXT, property_notes TEXT, cleaning_notes TEXT, internal_notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

CREATE TABLE quotes (
    id TEXT PRIMARY KEY,
    quote_number TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    display_ref TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    property_id TEXT,
    source_type TEXT CHECK (source_type IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other')),
    income_category TEXT CHECK (income_category IN ('cleaning_service', 'non_cleaning_service', 'goods_sale', 'adjustment')),
    quote_status TEXT CHECK (quote_status IN ('draft', 'ready_to_send', 'sent', 'accepted', 'rejected', 'expired', 'superseded', 'archived')),
    document_status TEXT CHECK (document_status IN ('not_generated', 'generated', 'needs_update')),
    business_vat_status_snapshot TEXT CHECK (business_vat_status_snapshot IN ('not_registered', 'registered')),
    customer_snapshot_json TEXT,
    billing_address_snapshot_json TEXT,
    service_address_snapshot_json TEXT,
    valid_until DATETIME,
    net_total_pence INTEGER NOT NULL DEFAULT 0,
    vat_total_pence INTEGER NOT NULL DEFAULT 0,
    gross_total_pence INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quote_number, version),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

CREATE TABLE quote_lines (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    catalogue_item_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    quantity REAL NOT NULL,
    unit_price_pence INTEGER NOT NULL,
    net_amount_pence INTEGER NOT NULL,
    vat_code TEXT CHECK (vat_code IN ('not_applicable', 'standard', 'zero', 'exempt', 'outside_scope')),
    vat_amount_pence INTEGER NOT NULL,
    gross_amount_pence INTEGER NOT NULL,
    is_optional INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (catalogue_item_id) REFERENCES catalogue_items(id) ON DELETE SET NULL
);

CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    quote_id TEXT,
    customer_id TEXT NOT NULL,
    property_id TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT
);

CREATE TABLE visits (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    status TEXT,
    scheduled_start DATETIME,
    scheduled_end DATETIME,
    assigned_team TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    property_id TEXT,
    source_type TEXT CHECK (source_type IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other')),
    income_category TEXT CHECK (income_category IN ('cleaning_service', 'non_cleaning_service', 'goods_sale', 'adjustment')),
    invoice_status TEXT CHECK (invoice_status IN ('draft', 'ready', 'sent', 'part_paid', 'paid', 'overdue', 'void')),
    payment_state TEXT,
    business_vat_status_snapshot TEXT CHECK (business_vat_status_snapshot IN ('not_registered', 'registered')),
    customer_snapshot_json TEXT,
    billing_address_snapshot_json TEXT,
    service_address_snapshot_json TEXT,
    due_date DATETIME,
    net_total_pence INTEGER NOT NULL DEFAULT 0,
    vat_total_pence INTEGER NOT NULL DEFAULT 0,
    gross_total_pence INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

CREATE TABLE billable_events (
    id TEXT PRIMARY KEY,
    visit_id TEXT,
    job_id TEXT,
    invoice_id TEXT,
    status TEXT,
    amount_pence INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

CREATE TABLE invoice_lines (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    billable_event_id TEXT,
    catalogue_item_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    quantity REAL NOT NULL,
    unit_price_pence INTEGER NOT NULL,
    net_amount_pence INTEGER NOT NULL,
    vat_code TEXT CHECK (vat_code IN ('not_applicable', 'standard', 'zero', 'exempt', 'outside_scope')),
    vat_amount_pence INTEGER NOT NULL,
    gross_amount_pence INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (billable_event_id) REFERENCES billable_events(id) ON DELETE SET NULL,
    FOREIGN KEY (catalogue_item_id) REFERENCES catalogue_items(id) ON DELETE SET NULL
);

CREATE TABLE payment_records (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    amount_pence INTEGER NOT NULL,
    payment_method TEXT,
    status TEXT CHECK (status IN ('recorded', 'failed', 'refunded', 'void')),
    reference TEXT,
    notes TEXT,
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Step 3: Insert data
INSERT INTO customers SELECT * FROM customers_old;
INSERT INTO customer_addresses SELECT * FROM customer_addresses_old;
INSERT INTO properties SELECT * FROM properties_old;
INSERT INTO requests SELECT * FROM requests_old;
INSERT INTO quotes SELECT * FROM quotes_old;
INSERT INTO quote_lines SELECT * FROM quote_lines_old;
INSERT INTO jobs SELECT * FROM jobs_old;
INSERT INTO visits SELECT * FROM visits_old;
INSERT INTO invoices SELECT * FROM invoices_old;
INSERT INTO billable_events SELECT * FROM billable_events_old;
INSERT INTO invoice_lines SELECT * FROM invoice_lines_old;
INSERT INTO payment_records SELECT * FROM payment_records_old;

-- Step 4: Drop old tables
DROP TABLE payment_records_old;
DROP TABLE invoice_lines_old;
DROP TABLE quote_lines_old;
DROP TABLE billable_events_old;
DROP TABLE invoices_old;
DROP TABLE visits_old;
DROP TABLE jobs_old;
DROP TABLE quotes_old;
DROP TABLE requests_old;
DROP TABLE properties_old;
DROP TABLE customer_addresses_old;
DROP TABLE customers_old;

-- Step 5: Recreate explicit indexes from 0001 for rebuilt tables
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_properties_customer_id ON properties(customer_id);
CREATE INDEX idx_requests_customer_id ON requests(customer_id);
CREATE INDEX idx_requests_property_id ON requests(property_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_property_id ON quotes(property_id);
CREATE INDEX idx_quote_lines_quote_id ON quote_lines(quote_id);
CREATE INDEX idx_quote_lines_catalogue_item_id ON quote_lines(catalogue_item_id);
CREATE INDEX idx_jobs_quote_id ON jobs(quote_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_property_id ON jobs(property_id);
CREATE INDEX idx_visits_job_id ON visits(job_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_property_id ON invoices(property_id);
CREATE INDEX idx_billable_events_visit_id ON billable_events(visit_id);
CREATE INDEX idx_billable_events_job_id ON billable_events(job_id);
CREATE INDEX idx_billable_events_invoice_id ON billable_events(invoice_id);
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_billable_event_id ON invoice_lines(billable_event_id);
CREATE INDEX idx_invoice_lines_catalogue_item_id ON invoice_lines(catalogue_item_id);
CREATE INDEX idx_payment_records_invoice_id ON payment_records(invoice_id);
