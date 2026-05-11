CREATE TABLE IF NOT EXISTS assessment_quote_assist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_quote_id INTEGER NOT NULL UNIQUE,
  fit_score INTEGER NOT NULL DEFAULT 50,
  price_shopper_risk TEXT NOT NULL DEFAULT 'Medium',
  travel_suitability TEXT NOT NULL DEFAULT 'Unknown',
  estimated_first_clean_hours_min REAL,
  estimated_first_clean_hours_max REAL,
  estimated_recurring_hours_min REAL,
  estimated_recurring_hours_max REAL,
  suggested_price_min INTEGER,
  suggested_price_max INTEGER,
  minimum_recommended_price INTEGER,
  recommended_next_action TEXT,
  confidence TEXT NOT NULL DEFAULT 'Low',
  explanation TEXT,
  risk_flags TEXT,
  positive_flags TEXT,
  rule_version TEXT NOT NULL DEFAULT 'assessment-quote-assist-v1',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_quote_id) REFERENCES assessment_quotes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assessment_quote_assist_quote
ON assessment_quote_assist(assessment_quote_id);
