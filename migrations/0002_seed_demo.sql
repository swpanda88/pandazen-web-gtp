INSERT OR IGNORE INTO option_groups (key, label, allow_other, sort_order) VALUES
  ('lead_status', 'Lead status', 0, 10),
  ('lead_source', 'Lead source', 1, 20),
  ('service_type', 'Service type', 1, 30),
  ('assessment_status', 'Assessment status', 0, 40),
  ('job_type', 'Job type', 1, 50),
  ('job_status', 'Job status', 0, 60),
  ('invoice_status', 'Invoice status', 0, 70),
  ('frequency', 'Frequency', 1, 80),
  ('room_type', 'Room type', 1, 90),
  ('condition_level', 'Condition level', 0, 100),
  ('product_preference', 'Product preference', 1, 110),
  ('pet_type', 'Pet type', 1, 120),
  ('access_method', 'Access method', 1, 130),
  ('preferred_contact', 'Preferred contact', 0, 140);

INSERT OR IGNORE INTO options (group_key, value, label, sort_order) VALUES
  ('lead_status', 'new', 'New enquiry', 10),
  ('lead_status', 'contacted', 'Contacted', 20),
  ('lead_status', 'assessment_booked', 'Assessment booked', 30),
  ('lead_status', 'quote_sent', 'Quote sent', 40),
  ('lead_status', 'accepted', 'Accepted', 50),
  ('lead_status', 'lost', 'Lost', 60),
  ('lead_source', 'website', 'Website', 10),
  ('lead_source', 'leaflet', 'Leaflet', 20),
  ('lead_source', 'referral', 'Referral', 30),
  ('lead_source', 'facebook', 'Facebook', 40),
  ('lead_source', 'phone', 'Phone', 50),
  ('lead_source', 'other', 'Other', 99),
  ('service_type', 'regular_cleaning', 'Regular cleaning', 10),
  ('service_type', 'deep_cleaning', 'Deep cleaning', 20),
  ('service_type', 'one_off_cleaning', 'One-off cleaning', 30),
  ('service_type', 'end_of_tenancy', 'End of tenancy cleaning', 40),
  ('service_type', 'kitchen_bathroom_detailing', 'Kitchen and bathroom detailing', 50),
  ('service_type', 'ironing', 'Ironing services', 60),
  ('service_type', 'other', 'Other', 99),
  ('assessment_status', 'booked', 'Booked', 10),
  ('assessment_status', 'completed', 'Completed', 20),
  ('assessment_status', 'quote_sent', 'Quote sent', 30),
  ('assessment_status', 'cancelled', 'Cancelled', 40),
  ('job_type', 'regular_clean', 'Regular clean', 10),
  ('job_type', 'deep_clean', 'Deep clean', 20),
  ('job_type', 'one_off_clean', 'One-off clean', 30),
  ('job_type', 'assessment', 'Home assessment', 40),
  ('job_type', 'other', 'Other', 99),
  ('job_status', 'scheduled', 'Scheduled', 10),
  ('job_status', 'completed', 'Completed', 20),
  ('job_status', 'cancelled', 'Cancelled', 30),
  ('job_status', 'no_access', 'No access', 40),
  ('job_status', 'needs_follow_up', 'Needs follow-up', 50),
  ('invoice_status', 'draft', 'Draft', 10),
  ('invoice_status', 'sent', 'Sent', 20),
  ('invoice_status', 'paid', 'Paid', 30),
  ('invoice_status', 'overdue', 'Overdue', 40),
  ('invoice_status', 'void', 'Void', 50),
  ('frequency', 'weekly', 'Weekly', 10),
  ('frequency', 'fortnightly', 'Fortnightly', 20),
  ('frequency', 'monthly', 'Monthly', 30),
  ('frequency', 'one_off', 'One-off', 40),
  ('frequency', 'other', 'Other', 99),
  ('room_type', 'kitchen', 'Kitchen', 10),
  ('room_type', 'bathroom', 'Bathroom', 20),
  ('room_type', 'bedroom', 'Bedroom', 30),
  ('room_type', 'living_room', 'Living room', 40),
  ('room_type', 'hallway', 'Hallway', 50),
  ('room_type', 'utility', 'Utility room', 60),
  ('room_type', 'office', 'Office', 70),
  ('room_type', 'other', 'Other', 99),
  ('condition_level', 'light', 'Light', 10),
  ('condition_level', 'standard', 'Standard', 20),
  ('condition_level', 'detailed', 'Detailed', 30),
  ('condition_level', 'heavy', 'Heavy', 40),
  ('product_preference', 'pandazen_supplied', 'Panda Zen products supplied', 10),
  ('product_preference', 'client_supplied', 'Client supplied products', 20),
  ('product_preference', 'mixed', 'Mixed / by room', 30),
  ('product_preference', 'other', 'Other', 99),
  ('pet_type', 'none', 'No pets', 10),
  ('pet_type', 'dog', 'Dog', 20),
  ('pet_type', 'cat', 'Cat', 30),
  ('pet_type', 'multiple', 'Multiple pets', 40),
  ('pet_type', 'other', 'Other', 99),
  ('access_method', 'client_home', 'Client at home', 10),
  ('access_method', 'key_safe', 'Key safe', 20),
  ('access_method', 'key_holder', 'Key held by Panda Zen', 30),
  ('access_method', 'concierge', 'Concierge / reception', 40),
  ('access_method', 'other', 'Other', 99),
  ('preferred_contact', 'phone', 'Phone', 10),
  ('preferred_contact', 'sms', 'SMS', 20),
  ('preferred_contact', 'whatsapp', 'WhatsApp', 30),
  ('preferred_contact', 'email', 'Email', 40);

INSERT OR IGNORE INTO staff (id, display_name, email, phone, role) VALUES
  (1, 'Sam', 'hello.pandazen@gmail.com', '07467 205 405', 'admin'),
  (2, 'Anna', NULL, NULL, 'cleaner');

INSERT OR IGNORE INTO leads (id, customer_name, phone, email, area, source, service_type, preferred_contact, preferred_days, status, notes) VALUES
  (1, 'Mrs Harwood', '07700 900111', NULL, 'Neville''s Cross', 'leaflet', 'regular_cleaning', 'phone', 'Friday morning', 'new', 'Large family home. Wants weekly help.'),
  (2, 'Dr Patel', NULL, 'hello@example.com', 'Durham City', 'website', 'deep_cleaning', 'email', 'Flexible', 'contacted', 'Asked about kitchen and bathroom detailing before guests arrive.'),
  (3, 'Mrs Ellison', '07700 900222', NULL, 'Shincliffe', 'referral', 'regular_cleaning', 'whatsapp', 'Thursday', 'assessment_booked', 'Assessment booked. Has one friendly dog.'),
  (4, 'Mr Green', '07700 900333', NULL, 'Bowburn', 'facebook', 'one_off_cleaning', 'phone', 'Next week', 'quote_sent', 'Quote sent for 5 man-hours one-off clean.'),
  (5, 'Mrs Knowles', '07700 900444', NULL, 'Aykley Heads', 'referral', 'regular_cleaning', 'phone', 'Tuesday morning', 'accepted', 'Accepted weekly Tuesday clean. Convert to client.');

INSERT OR IGNORE INTO clients (id, lead_id, customer_name, phone, area, address, preferred_contact, access_method, access_notes, parking_notes, pet_type, product_preference, surface_notes, internal_notes) VALUES
  (1, 5, 'Mrs Knowles', '07700 900444', 'Aykley Heads', 'Demo address, Aykley Heads, Durham', 'phone', 'client_home', 'Client usually home. Confirm if away.', 'Driveway parking available.', 'none', 'mixed', 'Use client product on marble surfaces.', 'Client values same cleaner. Introduce helper gradually for cover.'),
  (2, 3, 'Mrs Ellison', '07700 900222', 'Shincliffe', 'Demo address, Shincliffe, Durham', 'whatsapp', 'client_home', 'Friendly dog at home.', 'Street parking usually available.', 'dog', 'client_supplied', 'Fragrance-free products upstairs.', 'Products preference to confirm at assessment.');

INSERT OR IGNORE INTO assessments (id, lead_id, client_id, customer_name, scheduled_date, scheduled_time, area, address, status, service_type, frequency, estimated_man_hours, main_cleaner_id, helper_id, product_preference, summary_notes, quote_notes) VALUES
  (1, 3, 2, 'Mrs Ellison', '2026-05-09', '10:30', 'Shincliffe', 'Demo address, Shincliffe, Durham', 'booked', 'regular_cleaning', 'weekly', 4, 2, 1, 'client_supplied', 'Kitchen, 2 bathrooms, 4 bedrooms, living areas. Dog at home.', 'Likely quote around 4 man-hours weekly.'),
  (2, NULL, NULL, 'Mrs Turner', '2026-05-10', '14:00', 'Framwellgate Moor', 'Demo address, Framwellgate Moor', 'booked', 'regular_cleaning', 'fortnightly', 3, 2, NULL, 'mixed', '3 bedroom semi-detached. Focus bathrooms and kitchen.', 'Quote after visit.');

INSERT OR IGNORE INTO assessment_rooms (assessment_id, room_type, quantity, condition_level, notes, sort_order) VALUES
  (1, 'kitchen', 1, 'detailed', 'Main priority room.', 10),
  (1, 'bathroom', 2, 'standard', 'Shower glass and basins.', 20),
  (1, 'bedroom', 4, 'light', 'Vacuum and dust.', 30);

INSERT OR IGNORE INTO cleaning_plans (id, client_id, name, frequency, default_man_hours, main_cleaner_id, helper_id, special_instructions) VALUES
  (1, 1, 'Weekly regular clean', 'weekly', 4, 2, NULL, 'Focus kitchen and guest bedroom this week. Use client product on marble.'),
  (2, 2, 'Draft weekly plan', 'weekly', 4, 2, 1, 'Dog at home. Confirm fragrance-free products upstairs.');

INSERT OR IGNORE INTO cleaning_plan_items (cleaning_plan_id, section, label, is_required, sort_order) VALUES
  (1, 'Kitchen', 'Kitchen worktops, hob and sink', 1, 10),
  (1, 'Bathrooms', 'Bathroom basins, toilets and shower glass', 1, 20),
  (1, 'Living areas', 'Dust living room surfaces', 0, 30),
  (1, 'Bedrooms', 'Vacuum bedrooms and hallway', 1, 40),
  (1, 'Floors', 'Mop kitchen and bathroom floors', 1, 50),
  (2, 'Assessment', 'Confirm rooms and bathrooms', 1, 10),
  (2, 'Assessment', 'Check pets and access notes', 1, 20),
  (2, 'Assessment', 'Estimate weekly man-hours', 1, 30),
  (2, 'Assessment', 'Agree products preference', 1, 40),
  (2, 'Assessment', 'Prepare quote notes', 1, 50);

INSERT OR IGNORE INTO recurring_schedules (id, client_id, cleaning_plan_id, frequency, day_of_week, start_date, default_time, default_man_hours, main_cleaner_id, helper_id, notes) VALUES
  (1, 1, 1, 'weekly', 'tuesday', '2026-05-14', '09:00', 4, 2, NULL, 'Generate monthly after admin review.');

INSERT OR IGNORE INTO jobs (id, client_id, recurring_schedule_id, cleaning_plan_id, job_type, status, scheduled_date, scheduled_time, man_hours, main_cleaner_id, helper_id, special_instructions) VALUES
  (1, 1, 1, 1, 'regular_clean', 'scheduled', '2026-05-14', '09:00', 4, 2, NULL, 'Focus kitchen and guest bedroom this week. Use client product on marble.'),
  (2, 2, NULL, 2, 'assessment', 'scheduled', '2026-05-16', '10:30', 1, 1, 2, 'Measure scope, pets, surfaces, parking and product preferences.');

INSERT OR IGNORE INTO job_checklist_items (job_id, section, label, is_required, sort_order)
SELECT 1, section, label, is_required, sort_order FROM cleaning_plan_items WHERE cleaning_plan_id = 1;

INSERT OR IGNORE INTO job_checklist_items (job_id, section, label, is_required, sort_order)
SELECT 2, section, label, is_required, sort_order FROM cleaning_plan_items WHERE cleaning_plan_id = 2;

INSERT OR IGNORE INTO invoices (id, client_id, invoice_number, invoice_date, due_date, amount_pence, status, service_period_start, service_period_end, notes) VALUES
  (1, 1, 'PZ-2026-0001', '2026-05-31', '2026-06-07', 18400, 'draft', '2026-05-01', '2026-05-31', 'May regular cleaning visits.'),
  (2, 2, 'PZ-2026-0002', '2026-05-12', '2026-05-19', 24600, 'sent', '2026-05-12', '2026-05-12', 'One-off cleaning quote tracker.');
