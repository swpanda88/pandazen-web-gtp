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