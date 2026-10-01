CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_number TEXT NOT NULL UNIQUE,
  field TEXT NOT NULL,
  amount_range TEXT,
  amount_exact REAL,
  description TEXT NOT NULL,
  region TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  voen TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 0,
  routing_group TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transfer_attempts INTEGER NOT NULL DEFAULT 0,
  transfer_error TEXT,
  internal_ref TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_app_number ON applications(app_number);
