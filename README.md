# Open Medpass - Digital Health Passport

A lightweight, offline-first mobile app that allows patients to securely carry, share, and update their medical records anywhere in the world without relying on the cloud.

## Mission

To build a sovereign, peer-to-peer health data network that empowers patients in Low and Middle Income Countries (LMICs) to own and control their medical data, even in environments with internet fragmentation or limited connectivity.

See [docs/mission-statement.md](docs/mission-statement.md) for full background and [docs/poc-roadmap.md](docs/poc-roadmap.md) for development plan.

## Current Status: Phase 1 Complete ✅

### ✅ Phase 0: Foundation & Identity
- Patient onboarding with PIN protection
- Device registration with UUID generation
- SQLite database initialization
- Recovery question system

### ✅ Phase 1: Prescription Management
- CRUD operations for prescriptions
- FHIR-inspired data model
- Audit trail logging
- Version vectors for future sync
- Status tracking (active/completed/discontinued)

### 🚧 In Progress
- Phase 2: Sync foundation with MockTransport
- Phase 3: BLE device-to-device transfer
- Phase 4: Conflict resolution UI

## Tech Stack

- **Framework**: React Native with Expo (Development Builds)
- **Navigation**: Expo Router (file-based)
- **Database**: SQLite (expo-sqlite)
- **Crypto**: expo-crypto
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web (limited functionality)
npm run web
```

### First Run

1. Launch the app
2. Complete patient onboarding:
   - Enter your name
   - (Optional) National ID
   - Create a 6-digit PIN
   - Answer a recovery question
3. Start adding prescriptions!

## Project Structure

```
src/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Prescriptions list
│   │   ├── backup.tsx       # Backup (coming soon)
│   │   └── settings.tsx     # Settings
│   ├── onboarding/          # Patient registration
│   ├── prescription/        # Add/edit prescriptions
│   └── _layout.tsx          # Root layout
├── components/              # Reusable UI components
├── features/                # Feature-specific logic
│   ├── patient/            # Patient identity
│   ├── prescriptions/      # Prescription CRUD
│   ├── audit/              # Audit logging
│   └── sync/               # Sync protocol (WIP)
├── db/                      # Database layer
│   ├── schema/             # SQL schemas
│   └── database.ts         # DB initialization
├── types/                   # TypeScript types
└── utils/                   # Helper functions
```

## Features

### Patient Identity
- Secure PIN-based authentication
- Device-specific identity
- Recovery question system
- No cloud storage - all data stays on device

### Prescription Management
- Add prescriptions with:
  - Medication name (from preset list or custom)
  - Dosage and frequency
  - Duration
  - Prescriber information
  - Notes
- Edit existing prescriptions
- Update status (active/completed/discontinued)
- View prescription history
- Soft delete (preserves audit trail)

### Data Model
- FHIR R4-inspired schemas
- Sync-ready metadata (device IDs, version vectors)
- Audit trail for all changes
- Prepared for future peer-to-peer sync

## Development Roadmap

See [docs/poc-roadmap.md](docs/poc-roadmap.md) for detailed roadmap.

**Phase 2** (Next): Sync Foundation
- Transport abstraction layer
- MockTransport for testing
- Backup bundle format
- QR code handshake

**Phase 3**: BLE Transfer
- Device-to-device backup via Bluetooth
- Community backup registry
- Restore from backup

**Phase 4**: Conflict Resolution
- Version conflict detection
- Manual merge UI
- Audit trail viewer

**Phase 5+**: Future Enhancements
- Additional record types (consultations, investigations)
- Clinical guidance
- NFC support
- DHT-based optional internet sync

## Architecture Decisions

### Why Offline-First?
Internet connectivity in LMICs is unreliable. Patients need access to their medical records even without connectivity.

### Why No Cloud?
Data sovereignty concerns and infrastructure complexity in managing deployments across dozens of countries with varying regulations.

### Why Peer-to-Peer?
Distributed backups to trusted community members (family, friends, clinics) provide redundancy without cloud dependency.

### Why React Native?
Rapid iteration for POC, good offline-first ecosystem, with escape hatches to native code for BLE/crypto if needed.

## Security Notes (POC)

⚠️ **This is a POC, not production-ready:**

- PIN hashing uses SHA-256 (production needs bcrypt/argon2)
- Key generation is simplified (production needs proper asymmetric crypto)
- No encryption at rest yet (production needs AES-256)
- Recovery mechanism is basic

**For production:** Implement proper cryptography, key management, and security audits.

## License

See [LICENSE](LICENSE) file.

## Contributing

This is currently a proof-of-concept. Contributions welcome once we reach Phase 4.

## Contact

For questions about the project or to get involved, see the mission statement for context.

---

Built with ❤️ for healthcare sovereignty in LMICs

