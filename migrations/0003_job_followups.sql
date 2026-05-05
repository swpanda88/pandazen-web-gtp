CREATE TABLE IF NOT EXISTS job_followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  source_job_id INTEGER,
  target_job_id INTEGER,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (source_job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (target_job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_job_followups_client_status ON job_followups(client_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_job_followups_target ON job_followups(target_job_id, status);

INSERT OR IGNORE INTO job_followups (id, client_id, source_job_id, target_job_id, note, status, created_by) VALUES
  (1, 1, 1, NULL, 'Follow up next visit: check study shelves if extra kitchen time runs over.', 'open', 'Anna');
