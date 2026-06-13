ALTER TABLE accounting_quotes ADD COLUMN expired_at TEXT;
ALTER TABLE accounting_quotes ADD COLUMN voided_at TEXT;
ALTER TABLE accounting_quotes ADD COLUMN superseded_by_quote_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_accounting_quotes_superseded_by
ON accounting_quotes(superseded_by_quote_id);
