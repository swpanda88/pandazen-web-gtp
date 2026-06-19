-- Add properties table fields
ALTER TABLE properties ADD COLUMN default_service_type TEXT;
ALTER TABLE properties ADD COLUMN default_cadence TEXT;
ALTER TABLE properties ADD COLUMN preferred_day TEXT;
ALTER TABLE properties ADD COLUMN preferred_time_window TEXT;
ALTER TABLE properties ADD COLUMN cleaning_products TEXT;
ALTER TABLE properties ADD COLUMN vacuum_hoover TEXT;
ALTER TABLE properties ADD COLUMN mop TEXT;
ALTER TABLE properties ADD COLUMN property_notes TEXT;
ALTER TABLE properties ADD COLUMN cleaning_notes TEXT;
