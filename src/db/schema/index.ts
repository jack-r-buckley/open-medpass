// SQL Schemas for Open Medpass
// These are kept as separate logical units for maintainability

export const PATIENT_SCHEMA = `
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
`;

export const PRESCRIPTIONS_SCHEMA = `
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  
  medication_code TEXT,
  medication_display TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration_days INTEGER,
  prescriber_name TEXT,
  prescriber_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  
  device_id TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  last_modified INTEGER NOT NULL,
  is_deleted BOOLEAN DEFAULT 0,
  
  FOREIGN KEY (patient_id) REFERENCES patient(id)
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
`;

export const REPLICATION_SCHEMA = `
CREATE TABLE IF NOT EXISTS version_vectors (
  record_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  PRIMARY KEY (record_id, device_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  action TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  changes TEXT
);

CREATE TABLE IF NOT EXISTS backup_devices (
  id TEXT PRIMARY KEY,
  name TEXT,
  public_key TEXT,
  transport_type TEXT,
  relationship TEXT,
  last_seen INTEGER,
  is_dht_node BOOLEAN DEFAULT 0,
  dht_address TEXT,
  last_backup_date INTEGER,
  backup_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(record_type, record_id);
`;

