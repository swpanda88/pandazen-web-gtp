-- migrations/0001_cleanops_v1_schema.sql

CREATE TABLE document_sequences (
    id TEXT PRIMARY KEY,
    next_number INTEGER NOT NULL DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_properties_customer_id ON properties(customer_id);

CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    property_id TEXT,
    source_type TEXT CHECK (source_type IN ('request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other')),
    status TEXT CHECK (status IN ('new', 'contacted', 'waiting_customer', 'assessment_needed', 'quote_needed', 'quoted', 'won', 'lost', 'not_suitable', 'archived')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

CREATE INDEX idx_requests_customer_id ON requests(customer_id);
CREATE INDEX idx_requests_property_id ON requests(property_id);

CREATE TABLE catalogue_items (
    id TEXT PRIMARY KEY,
    item_type TEXT CHECK (item_type IN ('service', 'product', 'fee', 'discount', 'adjustment')),
    income_category TEXT CHECK (income_category IN ('cleaning_service', 'non_cleaning_service', 'goods_sale', 'adjustment')),
    name TEXT NOT NULL,
    description TEXT,
    default_unit TEXT,
    default_rate_pence INTEGER NOT NULL,
    default_vat_code TEXT CHECK (default_vat_code IN ('not_applicable', 'standard', 'zero', 'exempt', 'outside_scope')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_property_id ON quotes(property_id);

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

CREATE INDEX idx_quote_lines_quote_id ON quote_lines(quote_id);
CREATE INDEX idx_quote_lines_catalogue_item_id ON quote_lines(catalogue_item_id);

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

CREATE INDEX idx_jobs_quote_id ON jobs(quote_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_property_id ON jobs(property_id);

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

CREATE INDEX idx_visits_job_id ON visits(job_id);

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

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_property_id ON invoices(property_id);

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

CREATE INDEX idx_billable_events_visit_id ON billable_events(visit_id);
CREATE INDEX idx_billable_events_job_id ON billable_events(job_id);
CREATE INDEX idx_billable_events_invoice_id ON billable_events(invoice_id);

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

CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_billable_event_id ON invoice_lines(billable_event_id);
CREATE INDEX idx_invoice_lines_catalogue_item_id ON invoice_lines(catalogue_item_id);

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

CREATE INDEX idx_payment_records_invoice_id ON payment_records(invoice_id);
