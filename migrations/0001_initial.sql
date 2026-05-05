PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS option_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  allow_other INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_key TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_key, value),
  FOREIGN KEY (group_key) REFERENCES option_groups(key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cleaner',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  area TEXT,
  address TEXT,
  source TEXT,
  source_other TEXT,
  service_type TEXT,
  service_other TEXT,
  preferred_contact TEXT,
  preferred_days TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER,
  customer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  area TEXT,
  address TEXT,
  preferred_contact TEXT,
  access_method TEXT,
  access_other TEXT,
  access_notes TEXT,
  parking_notes TEXT,
  pet_type TEXT,
  pet_other TEXT,
  pet_notes TEXT,
  product_preference TEXT,
  product_other TEXT,
  surface_notes TEXT,
  internal_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER,
  client_id INTEGER,
  customer_name TEXT NOT NULL,
  scheduled_date TEXT,
  scheduled_time TEXT,
  area TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'booked',
  service_type TEXT,
  frequency TEXT,
  estimated_man_hours REAL,
  main_cleaner_id INTEGER,
  helper_id INTEGER,
  product_preference TEXT,
  summary_notes TEXT,
  quote_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  FOREIGN KEY (main_cleaner_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (helper_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assessment_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  room_type TEXT NOT NULL,
  room_other TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  condition_level TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cleaning_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default cleaning plan',
  frequency TEXT,
  default_man_hours REAL,
  main_cleaner_id INTEGER,
  helper_id INTEGER,
  special_instructions TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (main_cleaner_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (helper_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cleaning_plan_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cleaning_plan_id INTEGER NOT NULL,
  section TEXT,
  label TEXT NOT NULL,
  is_required INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cleaning_plan_id) REFERENCES cleaning_plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recurring_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  cleaning_plan_id INTEGER,
  frequency TEXT NOT NULL,
  day_of_week TEXT,
  start_date TEXT,
  end_date TEXT,
  default_time TEXT,
  default_man_hours REAL,
  main_cleaner_id INTEGER,
  helper_id INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (cleaning_plan_id) REFERENCES cleaning_plans(id) ON DELETE SET NULL,
  FOREIGN KEY (main_cleaner_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (helper_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  recurring_schedule_id INTEGER,
  cleaning_plan_id INTEGER,
  job_type TEXT NOT NULL DEFAULT 'regular_clean',
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT,
  man_hours REAL,
  main_cleaner_id INTEGER,
  helper_id INTEGER,
  special_instructions TEXT,
  completion_notes TEXT,
  completed_at TEXT,
  cancelled_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (recurring_schedule_id) REFERENCES recurring_schedules(id) ON DELETE SET NULL,
  FOREIGN KEY (cleaning_plan_id) REFERENCES cleaning_plans(id) ON DELETE SET NULL,
  FOREIGN KEY (main_cleaner_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (helper_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS job_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  section TEXT,
  label TEXT NOT NULL,
  is_required INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  completion_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TEXT NOT NULL,
  due_date TEXT,
  amount_pence INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  service_period_start TEXT,
  service_period_end TEXT,
  notes TEXT,
  sent_at TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  note TEXT NOT NULL,
  is_private INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_options_group ON options(group_key, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_assessments_status_date ON assessments(status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status, customer_name);
CREATE INDEX IF NOT EXISTS idx_jobs_date_status ON jobs(scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_job_checklist_job ON job_checklist_items(job_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status, invoice_date);
