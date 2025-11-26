-- Prescriptions (FHIR MedicationRequest-inspired)
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  
  -- FHIR-ish fields
  medication_code TEXT,
  medication_display TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration_days INTEGER,
  prescriber_name TEXT,
  prescriber_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  
  -- Sync metadata
  device_id TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  last_modified INTEGER NOT NULL,
  is_deleted BOOLEAN DEFAULT 0,
  
  FOREIGN KEY (patient_id) REFERENCES patient(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

