-- migrations/0002_cleanops_v1_seed_dev.sql

-- 1. Initialize Sequences
INSERT INTO document_sequences (id, next_number) VALUES ('quote', 100);
INSERT INTO document_sequences (id, next_number) VALUES ('invoice', 200);

-- 2. Catalogue Items
INSERT INTO catalogue_items (id, item_type, income_category, name, description, default_unit, default_rate_pence, default_vat_code, is_active)
VALUES 
('cat-1', 'service', 'cleaning_service', 'Standard Domestic Cleaning', 'Regular domestic cleaning service', 'Hour', 2000, 'not_applicable', 1),
('cat-2', 'product', 'goods_sale', 'Premium Cleaning Kit', 'A bundle of premium supplies', 'Item', 4500, 'not_applicable', 1),
('cat-3', 'fee', 'adjustment', 'Late Cancellation Fee', 'Fee applied for less than 24h notice', 'Fixed', 2500, 'not_applicable', 1),
('cat-4', 'discount', 'adjustment', 'Loyalty Discount', '10% recurring discount', 'Fixed', -1000, 'not_applicable', 1),
('cat-5', 'service', 'non_cleaning_service', 'Gutter Clearing', 'Clear out front and rear gutters', 'Fixed', 15000, 'not_applicable', 1);

-- 3. Customers
-- Cust 1: Individual Cleaning Customer
INSERT INTO customers (id, type, source_type, first_name, last_name) VALUES ('cust-1', 'individual', 'request', 'Alice', 'Smith');
-- Cust 2: Company Cleaning Customer
INSERT INTO customers (id, type, source_type, company_name, email) VALUES ('cust-2', 'company', 'request', 'Acme Corp', 'billing@acme.test');
-- Cust 3: Manual goods sale customer
INSERT INTO customers (id, type, source_type, first_name, last_name) VALUES ('cust-3', 'individual', 'manual_invoice', 'Bob', 'Johnson');
-- Cust 4: Differing Billing/Service
INSERT INTO customers (id, type, source_type, first_name, last_name) VALUES ('cust-4', 'individual', 'manual_quote', 'Charlie', 'Brown');

-- 4. Customer Addresses & Properties
-- Cust 1
INSERT INTO properties (id, customer_id, address_line1, city, postcode) VALUES ('prop-1', 'cust-1', '10 High Street', 'London', 'E1 6AN');
-- Cust 2
INSERT INTO properties (id, customer_id, address_line1, city, postcode) VALUES ('prop-2', 'cust-2', 'Acme HQ, Floor 2', 'London', 'EC1A 1BB');
-- Cust 4 (Differing addresses)
INSERT INTO customer_addresses (id, customer_id, address_type, address_line1, city, postcode, is_default_billing) 
VALUES ('addr-billing-4', 'cust-4', 'billing', 'PO Box 123', 'London', 'W1A 1AA', 1);
INSERT INTO properties (id, customer_id, address_line1, city, postcode) VALUES ('prop-4', 'cust-4', '42 Suburbia Lane', 'Surrey', 'GU1 1AA');

-- 5. Connected Flow (Request -> Quote -> Job -> Visit -> Billable Event -> Invoice)
-- Request
INSERT INTO requests (id, customer_id, property_id, source_type, status, notes) 
VALUES ('req-1', 'cust-1', 'prop-1', 'request', 'won', 'Needs weekly cleaning');

-- Quote
INSERT INTO quotes (id, quote_number, display_ref, customer_id, property_id, source_type, income_category, quote_status, document_status, business_vat_status_snapshot, net_total_pence, vat_total_pence, gross_total_pence)
VALUES ('quote-1', '100', 'Q-00100', 'cust-1', 'prop-1', 'request', 'cleaning_service', 'accepted', 'generated', 'not_registered', 4000, 0, 4000);

-- Quote Line
INSERT INTO quote_lines (id, quote_id, catalogue_item_id, name, quantity, unit_price_pence, net_amount_pence, vat_code, vat_amount_pence, gross_amount_pence)
VALUES ('qline-1', 'quote-1', 'cat-1', 'Standard Domestic Cleaning', 2.0, 2000, 4000, 'not_applicable', 0, 4000);

-- Job
INSERT INTO jobs (id, quote_id, customer_id, property_id, status)
VALUES ('job-1', 'quote-1', 'cust-1', 'prop-1', 'active');

-- Visit
INSERT INTO visits (id, job_id, status, assigned_team)
VALUES ('visit-1', 'job-1', 'completed', 'Team Alpha');

-- Billable Event
INSERT INTO billable_events (id, visit_id, job_id, status, amount_pence)
VALUES ('be-1', 'visit-1', 'job-1', 'invoiced', 4000);

-- Invoice
INSERT INTO invoices (id, invoice_number, customer_id, property_id, source_type, income_category, invoice_status, business_vat_status_snapshot, net_total_pence, vat_total_pence, gross_total_pence)
VALUES ('inv-1', 'INV-00200', 'cust-1', 'prop-1', 'billable_event', 'cleaning_service', 'sent', 'not_registered', 4000, 0, 4000);

-- Update billable_event to point to invoice
UPDATE billable_events SET invoice_id = 'inv-1' WHERE id = 'be-1';

-- Invoice Line
INSERT INTO invoice_lines (id, invoice_id, billable_event_id, catalogue_item_id, name, quantity, unit_price_pence, net_amount_pence, vat_code, vat_amount_pence, gross_amount_pence)
VALUES ('iline-1', 'inv-1', 'be-1', 'cat-1', 'Standard Domestic Cleaning', 2.0, 2000, 4000, 'not_applicable', 0, 4000);

-- 6. Manual Standalone Invoice (goods_sale, no job/property)
INSERT INTO invoices (id, invoice_number, customer_id, property_id, source_type, income_category, invoice_status, business_vat_status_snapshot, net_total_pence, vat_total_pence, gross_total_pence)
VALUES ('inv-2', 'INV-00201', 'cust-3', NULL, 'manual_invoice', 'goods_sale', 'paid', 'not_registered', 4500, 0, 4500);

INSERT INTO invoice_lines (id, invoice_id, catalogue_item_id, name, quantity, unit_price_pence, net_amount_pence, vat_code, vat_amount_pence, gross_amount_pence)
VALUES ('iline-2', 'inv-2', NULL, 'Premium Cleaning Kit', 1.0, 4500, 4500, 'not_applicable', 0, 4500);

-- 7. Manual Standalone Quote (non_cleaning_service)
INSERT INTO quotes (id, quote_number, display_ref, customer_id, property_id, source_type, income_category, quote_status, document_status, business_vat_status_snapshot, net_total_pence, vat_total_pence, gross_total_pence)
VALUES ('quote-2', '101', 'Q-00101', 'cust-4', 'prop-4', 'manual_quote', 'non_cleaning_service', 'sent', 'generated', 'not_registered', 15000, 0, 15000);

INSERT INTO quote_lines (id, quote_id, catalogue_item_id, name, quantity, unit_price_pence, net_amount_pence, vat_code, vat_amount_pence, gross_amount_pence)
VALUES ('qline-2', 'quote-2', 'cat-5', 'Gutter Clearing', 1.0, 15000, 15000, 'not_applicable', 0, 15000);


-- 8. Payment Records
INSERT INTO payment_records (id, invoice_id, amount_pence, payment_method, status, reference, paid_at)
VALUES ('pay-1', 'inv-2', 4500, 'card', 'recorded', 'stripe_ch_123', '2026-06-13 14:00:00');
