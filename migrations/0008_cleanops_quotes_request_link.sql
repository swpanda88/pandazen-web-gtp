-- migrations/0008_cleanops_quotes_request_link.sql

ALTER TABLE quotes ADD COLUMN request_id TEXT REFERENCES requests(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_request_id ON quotes(request_id);
