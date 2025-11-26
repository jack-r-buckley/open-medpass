This proposal outlines some background thinking behind the Digital Health Passport (Open Medpass) and should guide early development.

# Problem Statement

Many EMRs, particularly those used in Low and Middle Income Countries (LMICs) globally connected internet and a predictable regulatory environment — both of which are eroding.

The domination of the internet by a few Global North companies and increasing poliical extremism means that LMIC governments are responding with policy changes emphasising data sovereignty and technological independence.

This will lead medtech scale-ups to an infrastructure cliff: managing patient data across dozens of sovereign territories, each with its own, rapidly changing, rules on data residency, encryption, and interoperability. This adds cost, compliance risk, and technical complexity that could soon outpace their ability to adapt.

# Internet Fragmentation

### Resources:

- [https://pulse.internetsociety.org/blog/a-new-chapter-in-internet-fragmentation](https://pulse.internetsociety.org/blog/a-new-chapter-in-internet-fragmentation)
- [https://www.ifri.org/sites/default/files/migrated_files/documents/atoms/files/ifri_nocetti_internet_fragmentation_february_2024.pdf](https://www.ifri.org/sites/default/files/migrated_files/documents/atoms/files/ifri_nocetti_internet_fragmentation_february_2024.pdf)

### Internet Fragmentation is on the up

The global interconnectivity we take for granted might not last forever. Geopolitical, technological and environmental factors all play a role:

- States are increasingly turning from open cooperation to sanctions, tarriffs, and other controls on technology and providers.
- Deep sea cable systems and data centers may increasingly become targets of intentional sabotage due to growing political and environmental instability, and growing wealth inequality.
- If the world turns to new technologies like Low-earth Orbit (LEO) satellites for connectivity, there's no guarantee that access will be evenly or equitably distributed.
- Data integrity is reliant on internal corporate decisions. What if AWS pivots to a strategy of charging higher-value clients more for the server space they already have - can we and our customers keep up with that?

LMICs already have the worst connectivity - in an increasingly fragmented internet, they stand to lose the most.

### Data sovereignty

If your personal health data is stored in a data center in Europe or the U.S., there's an inherent risk. You and your government have no sovereign control over it. LMICs may increasingly decide to legislate that problem away.

Several EMRs facing this problem currently have solved it by splitting their data into multiple nationally-hosted Cloud providers to obey data sovereignty legislation. How does this work at scale?

- Can we keep up with govt policy changes in 5, 10, 20 operation countries?
- What if the national cloud providers go out of business?
- How many engineers will we need to maintain a system that deploys into all these different infrastructure providers?

If patient data is stored _with the patient_, and backups on other devices around their communities (clinics, family/friend backups, local govt devices), then sovereignty is baked into the architecture, not bolted on by policy.

# The project

The **Digital Health Passport (DHP)** is a lightweight, offline-first app that allows patients to securely carry, share and update their medical records anywhere in the world without relying on the cloud.

It stores an encrypted, FHIR-compliant medical record and shares this device-to-device over **NFC** or **Bluetooth**.

Connection is securely established through QR-code scanning or NFC tap. Backups are then stored with clinics, friends and family, local govt offices or corner stores in case you lose or break your phone.

Designed to integrate with any EMR through a minimal, open SDK, it’s the backbone for a **sovereign, peer-to-peer health data network** that can survive internet fragmentation, connectivity loss and empower patients across LMICs.
ß
The DHP also provides local **clinical guidance** based on stored records — such as vaccination reminders or antenatal care prompts. Patients don't just own their data, they get a suite of lightweight tools to query it in an easily understandable way, even when totally offline.

# POC


A demoable POC product focuses on the offline-first record transfer, and skimps out on most of the extensive security/cryptography elements that would be necessary for a productionised version.

Features are as follows:

- A simple EMR front-end app with React Native, building via Expo for Android, iOS (Open Medpass), with Prescriptions, Consultations and Investigations.
- FHIR-consistent data schema with CRUD operations.
- Simple identity onboarding - enter name, national ID, 6-digit PIN and recovery questions.
- Open Medpass operates data transfer with clinic devices via BLE after QR code scanning handshake to allow updating of records at practise.
- Visible audit trail showing when records were shared, received and updated.
- Open Medpass packages, encrypts and transfers your health record to other devices via BLE for backup purposes.
