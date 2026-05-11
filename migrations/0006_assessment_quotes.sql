PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS assessment_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  assessment_type TEXT,
  quote_stage TEXT NOT NULL DEFAULT 'new',
  customer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  area TEXT,
  postcode TEXT,
  service_type TEXT,
  frequency TEXT,
  property_type TEXT,
  bedrooms TEXT,
  bathrooms TEXT,
  property_condition TEXT,
  pets TEXT,
  parking TEXT,
  priorities TEXT,
  product_preferences TEXT,
  notes TEXT,
  assessment_notes TEXT,
  quote_notes TEXT,
  estimated_hours_min REAL,
  estimated_hours_max REAL,
  suggested_price_min INTEGER,
  suggested_price_max INTEGER,
  quoted_price INTEGER,
  quote_sent_at TEXT,
  quote_accepted_at TEXT,
  quote_rejected_at TEXT,
  lost_reason TEXT,
  converted_client_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (converted_client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_assessment_quotes_lead ON assessment_quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_assessment_quotes_status ON assessment_quotes(status, quote_stage, updated_at);
