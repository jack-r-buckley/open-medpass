# Open Medpass POC Roadmap

This document outlines the technical decisions and development roadmap for the Open Medpass Proof of Concept.

## Core Architecture Decisions

### Data Sovereignty Model
- **Approach**: Peer-to-peer mesh with distributed local backups (no cloud)
- **Patient device = source of truth**: Clinics only write new data, never update existing records
- **Conflict resolution**: Patient handles merge conflicts via UI prompts
- **Backup strategy**: Manual BLE transfers to trusted community members (family, friends, clinics, local shops)
- **Future enhancement**: Optional DHT layer with geographic salting for internet-based redundancy

### Technology Stack

**Framework:**
- React Native with Expo (Development Builds, not Expo Go)
- Expo Router for navigation
- TypeScript

**Storage:**
- SQLite for local database (in app's private directory)
- Encrypted at rest

**Sync Protocol:**
- Hypercore Protocol for transport-agnostic replication
- `@synonymdev/react-native-hypercore` for React Native bindings
- Append-only log structure (perfect for audit trails)
- Version vectors for conflict detection

**Transports:**
- **POC**: MockTransport (simulated for fast development)
- **Phase 2**: BLE Transport (`react-native-ble-plx`)
- **Future**: DHT Transport (Hyperswarm with geographic node selection)
- **Future**: NFC Transport

**Other Key Libraries:**
- `expo-camera` - QR code scanning for device handshake
- `react-native-qrcode-svg` - QR code generation
- `expo-crypto` - Cryptographic operations
- `react-native-keychain` - Secure credential storage
- `@types/fhir` - FHIR R4 TypeScript types

### FHIR Compliance
- **Version**: FHIR R4 (stable, good tooling)
- **Approach**: FHIR-inspired schema for POC, not full validation
- **Resources**: Start with MedicationRequest (prescriptions), expand to Encounter and DiagnosticReport later

### React Native vs Native Decision
- **Choice**: React Native with Expo Development Builds
- **Rationale**: 
  - Fast iteration for POC
  - Good ecosystem for offline-first apps
  - Mature BLE library (`react-native-ble-plx`)
  - Can add native modules for performance-critical paths if needed
- **Escape hatch**: Can write Swift/Kotlin modules for BLE or crypto if JS performance insufficient
- **Validation checkpoint**: Month 3 - assess if RN BLE is sufficient or needs native rewrite

## Development Phases

### Phase 0: Foundation & Identity
**Goal**: Establish patient identity and device registration

**Features:**
- Patient onboarding flow
  - Name
  - National ID
  - 6-digit PIN (hashed)
  - Recovery questions
- Device ID generation (UUID)
- Public/private key pair generation
- SQLite database initialization

**Database Schema:**
```sql
CREATE TABLE patient (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  name TEXT NOT NULL,
  national_id TEXT,
  pin_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_modified INTEGER NOT NULL
);
```

**Deliverable**: Can onboard a new patient with PIN-protected identity

---

### Phase 1: Single Record Type CRUD
**Goal**: Manage prescriptions locally with sync-ready schema

**Features:**
- Prescription data model (FHIR MedicationRequest-inspired)
- Hardcoded medication list (~5-10 common drugs)
- Add prescription form
- Edit prescription
- List prescriptions
- View prescription details
- Soft deletes (mark as inactive)

**Database Schema:**
```sql
CREATE TABLE prescriptions (
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
  
  -- Sync metadata
  device_id TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  last_modified INTEGER NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (patient_id) REFERENCES patient(id)
);

CREATE TABLE version_vectors (
  record_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  PRIMARY KEY (record_id, device_id)
);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  action TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  changes TEXT
);
```

**Sample Medications:**
- Artemisinin-based Combination Therapy (Malaria)
- Amoxicillin 500mg
- Paracetamol 500mg
- Oral Rehydration Salts
- Ibuprofen 400mg

**Deliverable**: Functional prescription management with sync-ready data model

---

### Phase 2: Sync Foundation
**Goal**: Create backup bundles and establish sync protocol

**Features:**
- Transport abstraction layer (`IBackupTransport` interface)
- MockTransport implementation for testing
- Backup bundle format
  - Patient identity
  - Encrypted medical records
  - Version vectors
  - Audit log
  - Cryptographic signatures
- Bundle creation/serialization
- Bundle verification/deserialization
- QR code generation for device handshake
- QR code scanning

**Backup Bundle Structure:**
```typescript
interface BackupBundle {
  version: string;
  patientId: string;
  deviceId: string;
  publicKey: string;
  signature: string;
  vectorClock: VectorClock;
  lastModified: number;
  locationHint?: {
    country: string;
    region?: string;
  };
  encryptedRecords: Uint8Array;
  auditLog: EncryptedAuditEntry[];
}
```

**Deliverable**: Can create and verify backup bundles using MockTransport

---

### Phase 3: BLE Transfer
**Goal**: Device-to-device backup and restore over BLE

**Features:**
- BLE Transport implementation
- BLE device discovery
- BLE connection management
- QR handshake → BLE connection flow
- Chunked data transfer (handle MTU limits)
- Progress indicators
- Error handling and retry logic
- Backup device registry
  - Track backup locations (friend, clinic, etc.)
  - Last backup timestamp
- Restore from backup flow

**Database Extension:**
```sql
CREATE TABLE backup_devices (
  id TEXT PRIMARY KEY,
  name TEXT,
  public_key TEXT,
  transport_type TEXT,
  relationship TEXT,
  last_seen INTEGER,
  is_dht_node BOOLEAN DEFAULT FALSE,
  dht_address TEXT,
  last_backup_date INTEGER,
  backup_count INTEGER DEFAULT 0
);
```

**Deliverable**: Can backup to and restore from another physical device via BLE

---

### Phase 4: Conflict Resolution
**Goal**: Handle version conflicts gracefully

**Features:**
- Conflict detection using version vectors
- Conflict resolution UI
  - Show both versions side-by-side
  - Patient chooses correct version or merges
- Audit trail display
  - Show all changes with timestamps
  - Show which devices made changes
  - Show sync history
- Manual merge interface for complex conflicts

**Deliverable**: End-to-end POC complete with conflict handling

---

## Phase 5+: Future Enhancements (Post-POC)

### Additional Record Types
- Consultations (FHIR Encounter)
- Investigations (FHIR DiagnosticReport/Observation)
- Vitals
- Allergies
- Immunizations

### Advanced Features
- Clinical guidance (vaccination reminders, antenatal prompts)
- Multi-language support
- Biometric authentication
- NFC transport
- Photo attachments (lab results, X-rays)

### DHT Layer
- Hyperswarm integration
- Geographic node discovery
- Regional bootstrap nodes
- Optional internet-based redundancy
- "Sneakernet DHT" (epidemic broadcast model)

### EMR Integration
- SDK for third-party EMRs
- Standardized API
- Clinic device version of app

## Project Structure

```
open-medpass/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/
│   │   │   ├── index.tsx       # Home/Records list
│   │   │   ├── backup.tsx      # Backup management
│   │   │   └── settings.tsx    # Settings
│   │   ├── onboarding/
│   │   │   └── index.tsx       # Patient registration
│   │   ├── prescription/
│   │   │   ├── add.tsx         # Add prescription
│   │   │   └── [id].tsx        # View/edit prescription
│   │   └── _layout.tsx
│   ├── components/             # Reusable UI components
│   ├── features/
│   │   ├── patient/           # Patient identity
│   │   ├── prescriptions/     # Prescription logic
│   │   ├── sync/              # Sync protocol
│   │   │   ├── SyncManager.ts
│   │   │   ├── BackupBundle.ts
│   │   │   ├── ReplicationProtocol.ts
│   │   │   └── transports/
│   │   │       ├── IBackupTransport.ts
│   │   │       ├── MockTransport.ts
│   │   │       ├── BLETransport.ts
│   │   │       └── DHTTransport.ts (future)
│   │   ├── crypto/            # Encryption/signing
│   │   └── audit/             # Audit trail
│   ├── db/
│   │   ├── schema/
│   │   │   ├── patient.sql
│   │   │   ├── prescriptions.sql
│   │   │   └── replication.sql
│   │   ├── migrations/
│   │   └── database.ts
│   ├── types/                 # TypeScript types
│   └── utils/                 # Helpers
├── assets/
├── docs/
│   ├── mission-statement.md
│   └── poc-roadmap.md
└── package.json
```

## Success Criteria for POC

1. **Patient can onboard** with PIN protection
2. **Patient can manage prescriptions** (add, edit, view, list)
3. **Patient can backup to another device** via BLE
4. **Patient can restore from backup** if device lost
5. **Conflicts are detected and resolved** through UI
6. **Audit trail is maintained** and viewable
7. **All data remains on-device** (no cloud dependency)

## Non-Goals for POC

- Full FHIR validation
- Production-grade encryption
- Multi-language support
- Clinical guidance features
- EMR integration SDK
- NFC support
- DHT/internet sync
- Biometric authentication
- Advanced access controls
- HIPAA/GDPR compliance tooling

## Timeline Estimate

- **Phase 0**: 1 week
- **Phase 1**: 1-2 weeks
- **Phase 2**: 1 week
- **Phase 3**: 2 weeks
- **Phase 4**: 1 week

**Total**: ~6-7 weeks for demoable POC

## Key Risks & Mitigations

**Risk**: BLE reliability issues on different devices
- **Mitigation**: Start with MockTransport, extensive testing on multiple devices

**Risk**: Conflict resolution too complex for users
- **Mitigation**: Keep UI simple, most conflicts should be rare with patient-as-source-of-truth model

**Risk**: Hypercore React Native bindings immature
- **Mitigation**: Evaluate early, be prepared to roll custom sync protocol if needed

**Risk**: Performance with large medical histories
- **Mitigation**: Test with realistic data volumes, optimize SQLite queries

**Risk**: React Native BLE limitations
- **Mitigation**: Use mature `react-native-ble-plx` library, add native modules if needed

## Next Steps

1. Initialize Expo project
2. Set up SQLite database
3. Implement Phase 0: Patient onboarding
4. Begin Phase 1: Prescription CRUD

