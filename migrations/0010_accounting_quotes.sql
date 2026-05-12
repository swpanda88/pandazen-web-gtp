CREATE TABLE IF NOT EXISTS accounting_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_number INTEGER UNIQUE,
  version_number INTEGER NOT NULL DEFAULT 1,
  display_reference TEXT UNIQUE,
  assessment_quote_id INTEGER NOT NULL,
  lead_id INTEGER,
  client_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  scope_of_work TEXT,
  included_items TEXT,
  excluded_items TEXT,
  assumptions TEXT,
  price_lines TEXT,
  pricing_notes TEXT,
  total_price INTEGER,
  recurring_price INTEGER,
  valid_until TEXT,
  client_notes TEXT,
  internal_notes TEXT,
  sent_at TEXT,
  accepted_at TEXT,
  rejected_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_quote_id) REFERENCES assessment_quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_quotes_assessment_version
ON accounting_quotes(assessment_quote_id, version_number);

CREATE INDEX IF NOT EXISTS idx_accounting_quotes_status
ON accounting_quotes(status, updated_at);

CREATE INDEX IF NOT EXISTS idx_accounting_quotes_lead
ON accounting_quotes(lead_id);
