import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const expoDb = SQLite.openDatabaseSync('openmedpass.db');
export const db = drizzle(expoDb, { schema });

/**
 * Initialize database (runs migrations)
 */
export async function initDatabase(): Promise<void> {
  try {
    // Create tables if they don't exist
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        national_id TEXT,
        pin_hash TEXT NOT NULL,
        recovery_question TEXT NOT NULL,
        recovery_answer_hash TEXT NOT NULL,
        device_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL REFERENCES patients(id),
        medication TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration_days INTEGER NOT NULL,
        prescriber_name TEXT NOT NULL,
        prescriber_facility TEXT NOT NULL,
        start_date TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        device_id TEXT NOT NULL,
        version_vector TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        record_type TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL,
        changes TEXT,
        device_id TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `);

    // Create indexes for better query performance
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_type, record_id);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Reset database (DEV ONLY)
 */
export async function resetDatabase(): Promise<void> {
  expoDb.execSync('DROP TABLE IF EXISTS audit_logs;');
  expoDb.execSync('DROP TABLE IF EXISTS prescriptions;');
  expoDb.execSync('DROP TABLE IF EXISTS patients;');
  await initDatabase();
  console.log('🗑️ Database reset complete');
}
