CREATE UNIQUE INDEX IF NOT EXISTS idx_assessment_quotes_lead_unique
ON assessment_quotes(lead_id)
WHERE lead_id IS NOT NULL;
