ALTER TABLE clients ADD COLUMN converted_at TEXT;
ALTER TABLE clients ADD COLUMN converted_by TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_lead_unique
ON clients(lead_id)
WHERE lead_id IS NOT NULL;
