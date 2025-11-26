// Core data types for Open Medpass

export interface Patient {
  id: string;
  deviceId: string;
  publicKey: string;
  name: string;
  nationalId?: string;
  pinHash: string;
  recoveryQuestion: string;
  recoveryAnswerHash: string;
  createdAt: number;
  lastModified: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  
  // FHIR-inspired fields
  medicationCode?: string;
  medicationDisplay: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  prescriberName?: string;
  prescriberId?: string;
  notes?: string;
  status: 'active' | 'completed' | 'discontinued';
  
  // Sync metadata
  deviceId: string;
  version: number;
  createdAt: number;
  lastModified: number;
  isDeleted: boolean;
}

export interface VersionVector {
  recordId: string;
  deviceId: string;
  version: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  deviceId: string;
  action: 'create' | 'update' | 'delete' | 'sync' | 'restore';
  recordType: 'patient' | 'prescription' | 'consultation' | 'investigation';
  recordId: string;
  changes?: string; // JSON string
}

export interface BackupDevice {
  id: string;
  name: string;
  publicKey: string;
  transportType: 'ble' | 'dht' | 'nfc' | 'mock';
  relationship?: string; // 'family', 'friend', 'clinic', etc.
  lastSeen?: number;
  isDhtNode: boolean;
  dhtAddress?: string;
  lastBackupDate?: number;
  backupCount: number;
}

// Medication reference data
export interface Medication {
  code: string;
  display: string;
  defaultDosage: string;
}

export const SAMPLE_MEDICATIONS: Medication[] = [
  { code: 'ACT', display: 'Artemisinin-based Combination Therapy (Malaria)', defaultDosage: '1 tablet' },
  { code: 'AMOX', display: 'Amoxicillin', defaultDosage: '500mg' },
  { code: 'PARA', display: 'Paracetamol', defaultDosage: '500mg' },
  { code: 'ORS', display: 'Oral Rehydration Salts', defaultDosage: '1 sachet' },
  { code: 'IBU', display: 'Ibuprofen', defaultDosage: '400mg' },
  { code: 'METRO', display: 'Metronidazole', defaultDosage: '400mg' },
  { code: 'COARTEM', display: 'Coartem (Artemether/Lumefantrine)', defaultDosage: '4 tablets' },
  { code: 'ALBEN', display: 'Albendazole', defaultDosage: '400mg' },
];

export const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 6 hours',
  'Every 8 hours',
  'As needed',
  'Before meals',
  'After meals',
];

