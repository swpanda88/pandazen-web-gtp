-- migrations/0009_cleanops_quotes_unique_request.sql

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_unique_request ON quotes(request_id) WHERE request_id IS NOT NULL;
