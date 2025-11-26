import { Patient } from '../../types';
import { query, queryOne, execute } from '../../db/database';
import { generateUUID, hashString, generateKeyPair, now } from '../crypto/cryptoService';

/**
 * Check if a patient exists in the database
 */
export async function hasPatient(): Promise<boolean> {
  const result = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM patient'
  );
  return (result?.count ?? 0) > 0;
}

/**
 * Get the current patient
 */
export async function getPatient(): Promise<Patient | null> {
  const row = await queryOne<any>(
    'SELECT * FROM patient LIMIT 1'
  );
  
  if (!row) return null;
  
  return {
    id: row.id,
    deviceId: row.device_id,
    publicKey: row.public_key,
    name: row.name,
    nationalId: row.national_id,
    pinHash: row.pin_hash,
    recoveryQuestion: row.recovery_question,
    recoveryAnswerHash: row.recovery_answer_hash,
    createdAt: row.created_at,
    lastModified: row.last_modified,
  };
}

/**
 * Create a new patient
 */
export async function createPatient(data: {
  name: string;
  nationalId?: string;
  pin: string;
  recoveryQuestion: string;
  recoveryAnswer: string;
}): Promise<Patient> {
  // Generate IDs and keys
  const patientId = generateUUID();
  const deviceId = generateUUID();
  const { publicKey } = generateKeyPair();
  
  // Hash sensitive data
  const pinHash = await hashString(data.pin);
  const recoveryAnswerHash = await hashString(data.recoveryAnswer.toLowerCase().trim());
  
  const timestamp = now();
  
  // Insert into database
  await execute(
    `INSERT INTO patient (
      id, device_id, public_key, name, national_id, 
      pin_hash, recovery_question, recovery_answer_hash,
      created_at, last_modified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      patientId,
      deviceId,
      publicKey,
      data.name,
      data.nationalId || null,
      pinHash,
      data.recoveryQuestion,
      recoveryAnswerHash,
      timestamp,
      timestamp,
    ]
  );
  
  return {
    id: patientId,
    deviceId,
    publicKey,
    name: data.name,
    nationalId: data.nationalId,
    pinHash,
    recoveryQuestion: data.recoveryQuestion,
    recoveryAnswerHash,
    createdAt: timestamp,
    lastModified: timestamp,
  };
}

/**
 * Verify a PIN
 */
export async function verifyPin(pin: string): Promise<boolean> {
  const patient = await getPatient();
  if (!patient) return false;
  
  const pinHash = await hashString(pin);
  return pinHash === patient.pinHash;
}

/**
 * Verify a recovery answer
 */
export async function verifyRecoveryAnswer(answer: string): Promise<boolean> {
  const patient = await getPatient();
  if (!patient) return false;
  
  const answerHash = await hashString(answer.toLowerCase().trim());
  return answerHash === patient.recoveryAnswerHash;
}

