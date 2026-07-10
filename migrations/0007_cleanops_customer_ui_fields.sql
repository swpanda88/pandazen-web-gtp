ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'lead';
ALTER TABLE customers ADD COLUMN billing_address TEXT;
ALTER TABLE customers ADD COLUMN internal_note TEXT;