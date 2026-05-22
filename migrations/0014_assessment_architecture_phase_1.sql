ALTER TABLE assessment_quotes ADD COLUMN client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE assessment_quotes ADD COLUMN source_type TEXT;
ALTER TABLE assessment_quotes ADD COLUMN assessment_purpose TEXT;

CREATE INDEX IF NOT EXISTS idx_assessment_quotes_client
ON assessment_quotes(client_id, updated_at);
