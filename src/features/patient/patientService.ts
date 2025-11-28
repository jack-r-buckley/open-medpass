import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { patients, type Patient, type NewPatient } from '../../db/schema';
import { generateRecordId, hashPin } from '../crypto/cryptoService';

export interface CreatePatientInput {
  name: string;
  nationalId?: string;
  pin: string;
  recoveryQuestion: string;
  recoveryAnswer: string;
}

/**
 * Create a new patient record
 */
export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const deviceId = await generateRecordId('patient');
  
  const patientData: NewPatient = {
    id: deviceId,
    name: input.name,
    national_id: input.nationalId,
    pin_hash: await hashPin(input.pin),
    recovery_question: input.recoveryQuestion,
    recovery_answer_hash: await hashPin(input.recoveryAnswer.toLowerCase().trim()),
    device_id: deviceId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = await db.insert(patients).values(patientData).returning();
  
  console.log('✅ Patient created:', result[0].id);
  return result[0];
}

/**
 * Get the patient record (should only be one)
 */
export async function getPatient(): Promise<Patient | null> {
  const result = await db.select().from(patients).limit(1);
  return result[0] || null;
}

/**
 * Check if a patient exists
 */
export async function hasPatient(): Promise<boolean> {
  const patient = await getPatient();
  return patient !== null;
}

/**
 * Verify PIN
 */
export async function verifyPin(pin: string): Promise<boolean> {
  const patient = await getPatient();
  if (!patient) {
    return false;
  }

  const pinHash = await hashPin(pin);
  return pinHash === patient.pin_hash;
}

/**
 * Update patient PIN
 */
export async function updatePatientPin(oldPin: string, newPin: string): Promise<boolean> {
  const isValid = await verifyPin(oldPin);
  if (!isValid) {
    return false;
  }

  const patient = await getPatient();
  if (!patient) {
    return false;
  }

  const newPinHash = await hashPin(newPin);
  await db
    .update(patients)
    .set({
      pin_hash: newPinHash,
      updated_at: new Date().toISOString(),
    })
    .where(eq(patients.id, patient.id));

  console.log('✅ PIN updated');
  return true;
}

/**
 * Verify recovery answer
 */
export async function verifyRecoveryAnswer(answer: string): Promise<boolean> {
  const patient = await getPatient();
  if (!patient) {
    return false;
  }

  const answerHash = await hashPin(answer.toLowerCase().trim());
  return answerHash === patient.recovery_answer_hash;
}
