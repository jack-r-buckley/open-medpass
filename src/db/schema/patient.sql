-- Patient identity and device registration
CREATE TABLE IF NOT EXISTS patient (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  name TEXT NOT NULL,
  national_id TEXT,
  pin_hash TEXT NOT NULL,
  recovery_question TEXT NOT NULL,
  recovery_answer_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_modified INTEGER NOT NULL
);

