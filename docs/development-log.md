# Open Medpass Development Log

## Session 1: Foundation & Core Features (Nov 26, 2025)

### Completed: Phase 0 & Phase 1 ✅

#### Phase 0: Foundation & Identity
**Goal**: Establish patient identity and device registration

**What we built:**
- ✅ Expo project with TypeScript and Expo Router
- ✅ SQLite database with full schema:
  - Patient table (identity, PIN, recovery)
  - Prescriptions table (FHIR-inspired with sync metadata)
  - Version vectors table (for future conflict resolution)
  - Audit log table (provenance tracking)
  - Backup devices table (for P2P sync)
- ✅ Patient onboarding flow:
  - Name and national ID input
  - 6-digit PIN creation with confirmation
  - Recovery question system
  - UUID generation for patient and device IDs
  - SHA-256 PIN hashing
- ✅ Crypto utilities:
  - UUID generation
  - String hashing (SHA-256)
  - Simple key pair generation
- ✅ Database service layer with query helpers

**Files created:**
- `src/app/index.tsx` - Splash screen with DB initialization
- `src/app/onboarding/index.tsx` - Patient registration
- `src/app/_layout.tsx` - Root navigation layout
- `src/db/database.ts` - SQLite initialization and helpers
- `src/db/schema/*.sql` - Database schemas
- `src/features/patient/patientService.ts` - Patient CRUD operations
- `src/utils/crypto.ts` - Cryptographic utilities
- `src/types/index.ts` - TypeScript type definitions

---

#### Phase 1: Prescription Management
**Goal**: Full CRUD for prescriptions with sync-ready data model

**What we built:**
- ✅ Prescription service layer:
  - Create, read, update, delete operations
  - Status management (active/completed/discontinued)
  - Audit trail logging for all changes
  - Version tracking for future sync
- ✅ Tab-based navigation:
  - Records tab (prescription list)
  - Backup tab (placeholder for Phase 2)
  - Settings tab (patient info viewer)
- ✅ Prescription list view:
  - Card-based display with status badges
  - Pull to refresh
  - Empty state with instructions
  - Floating action button to add prescriptions
- ✅ Add prescription screen:
  - Medication picker with preset drugs (8 common LMIC medications)
  - Custom medication option
  - Dosage and frequency selectors
  - Duration input
  - Prescriber information
  - Notes field
  - Form validation
- ✅ Edit/view prescription screen:
  - View mode with all details
  - Status toggle buttons
  - Edit mode with inline forms
  - Delete with confirmation
  - Timestamps display
- ✅ Audit service:
  - Automatic logging of all changes
  - Query audit history by record
  - Device ID tracking

**Files created:**
- `src/app/(tabs)/_layout.tsx` - Tab navigation
- `src/app/(tabs)/index.tsx` - Prescription list
- `src/app/(tabs)/backup.tsx` - Backup placeholder
- `src/app/(tabs)/settings.tsx` - Settings screen
- `src/app/prescription/add.tsx` - Add prescription form
- `src/app/prescription/[id].tsx` - View/edit prescription
- `src/features/prescriptions/prescriptionService.ts` - Prescription CRUD
- `src/features/audit/auditService.ts` - Audit logging

**Sample medications included:**
1. Artemisinin-based Combination Therapy (Malaria)
2. Amoxicillin 500mg
3. Paracetamol 500mg
4. Oral Rehydration Salts
5. Ibuprofen 400mg
6. Metronidazole 400mg
7. Coartem (Artemether/Lumefantrine)
8. Albendazole 400mg

---

### Technical Decisions Made

1. **React Native + Expo Development Builds**
   - Rationale: Fast iteration, cross-platform, can add native modules later
   - Trade-off: May need native code for BLE, but acceptable for POC

2. **Expo Router (file-based routing)**
   - Rationale: Modern, type-safe, easier to understand
   - Structure: Stack navigation with modal presentations

3. **SQLite for storage**
   - Rationale: ACID transactions, relations, offline-first
   - Location: App's private directory, encrypted at rest (future)

4. **Sync-ready schema from day 1**
   - Every record has: device_id, version, is_deleted
   - Version vectors table prepared
   - Audit log captures all changes
   - This prevents painful migrations later

5. **Patient as source of truth**
   - Clinics only ADD records, never update
   - Patient device handles merge conflicts
   - Simplifies conflict resolution significantly

6. **Soft deletes**
   - is_deleted flag instead of actual deletion
   - Preserves audit trail
   - Enables sync even for deleted items

---

### Data Model

#### Patient
```typescript
{
  id: UUID
  deviceId: UUID
  publicKey: string (simplified for POC)
  name: string
  nationalId?: string
  pinHash: SHA256
  recoveryQuestion: string
  recoveryAnswerHash: SHA256
  createdAt: timestamp
  lastModified: timestamp
}
```

#### Prescription (FHIR MedicationRequest-inspired)
```typescript
{
  id: UUID
  patientId: UUID
  medicationCode?: string (e.g., "AMOX")
  medicationDisplay: string (e.g., "Amoxicillin")
  dosage: string (e.g., "500mg")
  frequency: string (e.g., "Twice daily")
  durationDays?: number
  prescriberName?: string
  prescriberId?: string
  notes?: string
  status: 'active' | 'completed' | 'discontinued'
  
  // Sync metadata
  deviceId: UUID
  version: number (incremented on each change)
  createdAt: timestamp
  lastModified: timestamp
  isDeleted: boolean
}
```

#### Audit Log Entry
```typescript
{
  id: UUID
  timestamp: number
  deviceId: UUID
  action: 'create' | 'update' | 'delete' | 'sync' | 'restore'
  recordType: 'patient' | 'prescription' | ...
  recordId: UUID
  changes?: JSON string
}
```

---

### Dependencies Installed

```json
{
  "expo": "~54.0.25",
  "expo-router": "^6.0.15",
  "expo-sqlite": "^16.0.9",
  "expo-crypto": "^15.0.7",
  "@types/fhir": "^0.0.41",
  "react-native-qrcode-svg": "^6.3.20",
  "@react-native-picker/picker": "^latest",
  "@expo/vector-icons": "^latest"
}
```

---

### What's Working

- ✅ Patient can onboard with PIN
- ✅ Patient can add prescriptions
- ✅ Patient can view prescriptions
- ✅ Patient can edit prescriptions
- ✅ Patient can change prescription status
- ✅ Patient can delete prescriptions (soft delete)
- ✅ All changes are audit logged
- ✅ Version tracking is in place for future sync
- ✅ Database is structured for P2P replication

---

### Next Steps: Phase 2 - Sync Foundation

**Upcoming work:**
1. Transport abstraction interface (`IBackupTransport`)
2. MockTransport implementation for testing
3. Backup bundle format and serialization
4. QR code generation for device handshake
5. QR code scanning
6. Bundle encryption (simplified for POC)
7. Test backup/restore flow with MockTransport

**Estimated time**: 1 week

---

### Testing the App

```bash
# Start dev server
npm start

# On first launch:
1. Complete onboarding form
2. Create a 6-digit PIN (e.g., 123456)
3. Answer recovery question

# Test prescription CRUD:
1. Tap + button to add prescription
2. Select medication (e.g., Paracetamol)
3. Fill in dosage, frequency
4. Save
5. Tap prescription card to view/edit
6. Try changing status
7. Try editing details
8. Try deleting

# Verify database:
- All data persists on app restart
- PIN required on restart (future feature)
```

---

### Known Limitations (POC)

1. No encryption at rest yet
2. PIN not enforced on app restart (coming in Phase 2)
3. No biometric auth (future)
4. Simple SHA-256 hashing (production needs bcrypt)
5. No actual sync yet (Phase 2-3)
6. No conflict resolution UI yet (Phase 4)
7. Single patient per device (reasonable for POC)

---

### Code Quality

- ✅ No linter errors
- ✅ TypeScript strict mode
- ✅ Consistent naming conventions
- ✅ Separation of concerns (services, UI, DB)
- ✅ Reusable database utilities
- ✅ Proper error handling with user-friendly alerts
- ✅ Loading states and activity indicators

---

### Performance Notes

- SQLite queries are indexed (patient_id, status)
- Lazy loading prescription list (only active records)
- Soft deletes prevent permanent data loss
- Audit log capped at 100 most recent entries for now

---

## Next Session: Phase 2

When ready to continue:
1. Implement `IBackupTransport` interface
2. Create MockTransport with in-memory peer simulation
3. Build BackupBundle format
4. Add QR code generation/scanning
5. Test full backup/restore cycle without BLE

This will validate the sync protocol before we tackle the complexity of real Bluetooth connections in Phase 3.

