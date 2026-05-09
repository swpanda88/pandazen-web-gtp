ALTER TABLE leads ADD COLUMN best_contact_time TEXT;
ALTER TABLE leads ADD COLUMN postcode TEXT;
ALTER TABLE leads ADD COLUMN frequency TEXT;
ALTER TABLE leads ADD COLUMN urgency TEXT;
ALTER TABLE leads ADD COLUMN property_type TEXT;
ALTER TABLE leads ADD COLUMN bedrooms TEXT;
ALTER TABLE leads ADD COLUMN bathrooms TEXT;
ALTER TABLE leads ADD COLUMN reception_rooms TEXT;
ALTER TABLE leads ADD COLUMN kitchen_size TEXT;
ALTER TABLE leads ADD COLUMN property_size TEXT;
ALTER TABLE leads ADD COLUMN property_condition TEXT;
ALTER TABLE leads ADD COLUMN priorities TEXT;
ALTER TABLE leads ADD COLUMN pets TEXT;
ALTER TABLE leads ADD COLUMN parking TEXT;
ALTER TABLE leads ADD COLUMN product_preferences TEXT;
ALTER TABLE leads ADD COLUMN photo_available TEXT;
ALTER TABLE leads ADD COLUMN privacy_policy_accepted INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN privacy_policy_version TEXT;
ALTER TABLE leads ADD COLUMN privacy_policy_accepted_at TEXT;
ALTER TABLE leads ADD COLUMN marketing_opt_in INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN marketing_opt_in_at TEXT;
ALTER TABLE leads ADD COLUMN marketing_source TEXT;
ALTER TABLE leads ADD COLUMN closed_at TEXT;
ALTER TABLE leads ADD COLUMN lost_reason TEXT;
ALTER TABLE leads ADD COLUMN anonymise_after TEXT;
ALTER TABLE leads ADD COLUMN anonymised_at TEXT;

CREATE TABLE IF NOT EXISTS lead_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  notes TEXT,
  task_type TEXT NOT NULL DEFAULT 'Lead follow-up',
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Normal',
  due_at TEXT,
  linked_type TEXT,
  linked_id INTEGER,
  assigned_to TEXT,
  repeat_rule TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS lead_quote_assist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL UNIQUE,
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
  rule_version TEXT NOT NULL DEFAULT 'quote-assist-v1',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public_submission_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_hash TEXT,
  contact_hash TEXT,
  route TEXT NOT NULL DEFAULT '/api/public/leads',
  outcome TEXT NOT NULL,
  reason TEXT,
  user_agent_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_status_due ON admin_tasks(status, due_at, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_linked ON admin_tasks(linked_type, linked_id);
CREATE INDEX IF NOT EXISTS idx_submission_attempts_ip ON public_submission_attempts(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_submission_attempts_contact ON public_submission_attempts(contact_hash, created_at);
