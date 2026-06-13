ALTER TABLE clients ADD COLUMN assessment_quote_id INTEGER REFERENCES assessment_quotes(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_assessment_quote_unique
ON clients(assessment_quote_id)
WHERE assessment_quote_id IS NOT NULL;
