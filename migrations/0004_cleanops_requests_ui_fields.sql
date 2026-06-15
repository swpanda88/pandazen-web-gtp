-- Add properties table fields
ALTER TABLE properties ADD COLUMN property_type TEXT;
ALTER TABLE properties ADD COLUMN bedrooms TEXT;
ALTER TABLE properties ADD COLUMN bathrooms TEXT;
ALTER TABLE properties ADD COLUMN pets_present TEXT;
ALTER TABLE properties ADD COLUMN parking TEXT;

-- Add requests table fields
ALTER TABLE requests ADD COLUMN request_type TEXT;
ALTER TABLE requests ADD COLUMN cadence TEXT;
ALTER TABLE requests ADD COLUMN how_soon TEXT;
ALTER TABLE requests ADD COLUMN preferred_day TEXT;
ALTER TABLE requests ADD COLUMN preferred_time_window TEXT;
ALTER TABLE requests ADD COLUMN approx_size TEXT;
ALTER TABLE requests ADD COLUMN photos_helpful TEXT;
ALTER TABLE requests ADD COLUMN quote_readiness TEXT;
ALTER TABLE requests ADD COLUMN assessment_required TEXT;
ALTER TABLE requests ADD COLUMN initial_clean_required TEXT;
ALTER TABLE requests ADD COLUMN pricing_basis TEXT;
ALTER TABLE requests ADD COLUMN estimated_regular_duration_minutes INTEGER;
ALTER TABLE requests ADD COLUMN estimated_initial_duration_minutes INTEGER;
ALTER TABLE requests ADD COLUMN estimated_team_size INTEGER;
ALTER TABLE requests ADD COLUMN scope_confidence TEXT;
ALTER TABLE requests ADD COLUMN main_priorities_json TEXT;
ALTER TABLE requests ADD COLUMN quote_considerations_json TEXT;
ALTER TABLE requests ADD COLUMN cleaning_products TEXT;
ALTER TABLE requests ADD COLUMN vacuum_hoover TEXT;
ALTER TABLE requests ADD COLUMN mop TEXT;
ALTER TABLE requests ADD COLUMN setup_confirmed INTEGER DEFAULT 0;
ALTER TABLE requests ADD COLUMN customer_message TEXT;
ALTER TABLE requests ADD COLUMN short_scoping_note TEXT;
ALTER TABLE requests ADD COLUMN property_notes TEXT;
ALTER TABLE requests ADD COLUMN cleaning_notes TEXT;
ALTER TABLE requests ADD COLUMN internal_notes TEXT;
