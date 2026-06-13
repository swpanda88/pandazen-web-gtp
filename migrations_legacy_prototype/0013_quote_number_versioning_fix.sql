PRAGMA foreign_keys = OFF;

CREATE TABLE accounting_quotes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_number INTEGER,
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
  expired_at TEXT,
  voided_at TEXT,
  superseded_by_quote_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_quote_id) REFERENCES assessment_quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

INSERT INTO accounting_quotes_new (
  id, quote_number, version_number, display_reference, assessment_quote_id, lead_id, client_id, status,
  scope_of_work, included_items, excluded_items, assumptions, price_lines, pricing_notes,
  total_price, recurring_price, valid_until, client_notes, internal_notes,
  sent_at, accepted_at, rejected_at, expired_at, voided_at, superseded_by_quote_id,
  created_at, updated_at
)
SELECT
  id, quote_number, version_number, display_reference, assessment_quote_id, lead_id, client_id, status,
  scope_of_work, included_items, excluded_items, assumptions, price_lines, pricing_notes,
  total_price, recurring_price, valid_until, client_notes, internal_notes,
  sent_at, accepted_at, rejected_at, expired_at, voided_at, superseded_by_quote_id,
  created_at, updated_at
FROM accounting_quotes;

DROP TABLE accounting_quotes;
ALTER TABLE accounting_quotes_new RENAME TO accounting_quotes;

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_quotes_assessment_version
ON accounting_quotes(assessment_quote_id, version_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_quotes_display_reference
ON accounting_quotes(display_reference);

CREATE INDEX IF NOT EXISTS idx_accounting_quotes_status
ON accounting_quotes(status, updated_at);

CREATE INDEX IF NOT EXISTS idx_accounting_quotes_lead
ON accounting_quotes(lead_id);

CREATE INDEX IF NOT EXISTS idx_accounting_quotes_quote_number
ON accounting_quotes(quote_number);

CREATE INDEX IF NOT EXISTS idx_accounting_quotes_superseded_by
ON accounting_quotes(superseded_by_quote_id);

PRAGMA foreign_keys = ON;
