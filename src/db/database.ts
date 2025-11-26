import * as SQLite from 'expo-sqlite';
import {
  PATIENT_SCHEMA,
  PRESCRIPTIONS_SCHEMA,
  REPLICATION_SCHEMA,
} from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('openmedpass.db');
    
    // Initialize tables
    await db.execAsync(PATIENT_SCHEMA);
    await db.execAsync(PRESCRIPTIONS_SCHEMA);
    await db.execAsync(REPLICATION_SCHEMA);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

// Utility function to execute queries safely
export async function query<T>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync<T>(sql, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Utility function for single row queries
export async function queryOne<T>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<T>(sql, params);
    return result ?? null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Utility function for insert/update/delete
export async function execute(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  const database = getDatabase();
  try {
    const result = await database.runAsync(sql, params);
    return result;
  } catch (error) {
    console.error('Execute error:', error);
    throw error;
  }
}

/**
 * Drop all tables and reinitialize (DEV ONLY)
 * WARNING: This will delete ALL data including patient identity
 */
export async function resetDatabase(): Promise<void> {
  const database = getDatabase();
  
  try {
    console.log('Resetting database...');
    
    // Drop all tables in reverse dependency order
    await database.execAsync(`
      DROP TABLE IF EXISTS prescriptions;
      DROP TABLE IF EXISTS version_vectors;
      DROP TABLE IF EXISTS audit_log;
      DROP TABLE IF EXISTS backup_devices;
      DROP TABLE IF EXISTS patient;
    `);
    
    console.log('Tables dropped');
    
    // Reinitialize all schemas
    await database.execAsync(PATIENT_SCHEMA);
    await database.execAsync(PRESCRIPTIONS_SCHEMA);
    await database.execAsync(REPLICATION_SCHEMA);
    
    console.log('Database reset complete');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}

