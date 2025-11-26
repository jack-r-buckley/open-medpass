-- Version vectors for conflict resolution
CREATE TABLE IF NOT EXISTS version_vectors (
  record_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  PRIMARY KEY (record_id, device_id)
);

-- Audit log for provenance tracking
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  action TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  changes TEXT
);

-- Backup devices registry
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

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(record_type, record_id);

