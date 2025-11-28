import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { prescriptions, type Prescription, type NewPrescription } from '../../db/schema';
import { generateRecordId } from '../crypto/cryptoService';
import { addAuditLogEntry } from '../audit/auditService';

export interface CreatePrescriptionInput {
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  prescriberName: string;
  prescriberFacility: string;
  startDate: Date;
  notes?: string;
}

export interface UpdatePrescriptionInput {
  medication?: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  prescriberName?: string;
  prescriberFacility?: string;
  startDate?: Date;
  notes?: string;
  status?: 'active' | 'completed' | 'discontinued';
}

/**
 * Create a new prescription
 */
export async function createPrescription(input: CreatePrescriptionInput): Promise<Prescription> {
  const prescriptionId = await generateRecordId('prescription');
  const deviceId = await generateRecordId('device');

  const prescriptionData: NewPrescription = {
    id: prescriptionId,
    patient_id: input.patientId,
    medication: input.medication,
    dosage: input.dosage,
    frequency: input.frequency,
    duration_days: input.durationDays,
    prescriber_name: input.prescriberName,
    prescriber_facility: input.prescriberFacility,
    start_date: input.startDate.toISOString(),
    notes: input.notes,
    status: 'active',
    device_id: deviceId,
    version_vector: JSON.stringify({ [deviceId]: 1 }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = await db.insert(prescriptions).values(prescriptionData).returning();

  await addAuditLogEntry({
    recordType: 'prescription',
    recordId: prescriptionId,
    action: 'create',
  });

  console.log('✅ Prescription created:', result[0].id);
  return result[0];
}

/**
 * Get a specific prescription by ID
 */
export async function getPrescription(id: string): Promise<Prescription | null> {
  const result = await db.select().from(prescriptions).where(eq(prescriptions.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Get all prescriptions for a patient
 */
export async function getPrescriptions(patientId: string): Promise<Prescription[]> {
  return await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.patient_id, patientId))
    .orderBy(desc(prescriptions.created_at));
}

/**
 * Update a prescription
 */
export async function updatePrescription(
  id: string,
  updates: UpdatePrescriptionInput
): Promise<Prescription | null> {
  const updateData: Partial<Prescription> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.medication !== undefined) updateData.medication = updates.medication;
  if (updates.dosage !== undefined) updateData.dosage = updates.dosage;
  if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
  if (updates.durationDays !== undefined) updateData.duration_days = updates.durationDays;
  if (updates.prescriberName !== undefined) updateData.prescriber_name = updates.prescriberName;
  if (updates.prescriberFacility !== undefined) updateData.prescriber_facility = updates.prescriberFacility;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString();
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.status !== undefined) updateData.status = updates.status;

  const result = await db
    .update(prescriptions)
    .set(updateData)
    .where(eq(prescriptions.id, id))
    .returning();

  if (result[0]) {
    await addAuditLogEntry({
      recordType: 'prescription',
      recordId: id,
      action: 'update',
      changes: JSON.stringify(updates),
    });

    console.log('✅ Prescription updated:', id);
  }

  return result[0] || null;
}

/**
 * Update prescription status
 */
export async function updatePrescriptionStatus(
  id: string,
  status: 'active' | 'completed' | 'discontinued'
): Promise<Prescription | null> {
  return updatePrescription(id, { status });
}

/**
 * Delete a prescription
 */
export async function deletePrescription(id: string): Promise<boolean> {
  const result = await db.delete(prescriptions).where(eq(prescriptions.id, id)).returning();

  if (result[0]) {
    await addAuditLogEntry({
      recordType: 'prescription',
      recordId: id,
      action: 'delete',
    });

    console.log('✅ Prescription deleted:', id);
    return true;
  }

  return false;
}
