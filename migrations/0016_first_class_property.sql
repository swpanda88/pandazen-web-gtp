PRAGMA foreign_keys = ON;

-- ============================================================
-- 0016: First-class Property foundation
--
-- Adds a properties table under Client.
-- Adds nullable property_id FK columns to downstream tables
-- for forward compatibility (not yet wired to business logic).
-- Does NOT drop or mutate any existing flat address columns.
-- Existing records with property_id = NULL remain fully valid.
-- ============================================================

CREATE TABLE IF NOT EXISTS properties (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id          INTEGER NOT NULL,
  -- Human label for this property (NULL until explicitly set; display should compute from address).
  -- Examples of valid label values: "Main home", "Rental flat", "Office".
  label              TEXT,
  address            TEXT,
  area               TEXT,
  postcode           TEXT,
  property_type      TEXT,
  bedrooms           TEXT,
  bathrooms          TEXT,
  property_condition TEXT,
  -- Operational notes. Sensitive access credentials (key codes, alarms) are excluded until
  -- admin/API security boundaries are strengthened.
  access_notes       TEXT,
  parking_notes      TEXT,
  pet_notes          TEXT,
  surface_notes      TEXT,
  notes              TEXT,    -- internal operational notes
  is_primary         INTEGER  NOT NULL DEFAULT 1,  -- 1 = primary/main property for this client
  is_active          INTEGER  NOT NULL DEFAULT 1,
  created_at         TEXT     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TEXT     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_properties_client_primary
ON properties(client_id, is_primary, is_active);

CREATE INDEX IF NOT EXISTS idx_properties_postcode
ON properties(postcode);

-- Forward-compat column: assessment_quotes.property_id
-- Nullable; existing assessment rows are unaffected.
ALTER TABLE assessment_quotes
  ADD COLUMN property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assessment_quotes_property
ON assessment_quotes(property_id)
WHERE property_id IS NOT NULL;

-- Forward-compat column: cleaning_plans.property_id
ALTER TABLE cleaning_plans
  ADD COLUMN property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL;

-- Forward-compat column: recurring_schedules.property_id
ALTER TABLE recurring_schedules
  ADD COLUMN property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL;

-- Forward-compat column: jobs.property_id
-- Not yet wired to Job Builder (not yet built). Column reserved for when Job coding starts.
ALTER TABLE jobs
  ADD COLUMN property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL;

-- Forward-compat column: invoices.property_id
-- Optional context only. Invoice belongs to Client; property_id may be NULL for manual invoices.
ALTER TABLE invoices
  ADD COLUMN property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL;
