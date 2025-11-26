import { Prescription } from '../../types';
import { query, execute } from '../../db/database';
import { generateUUID, now } from '../crypto/cryptoService';
import { getPatient } from '../patient/patientService';
import { logAudit } from '../audit/auditService';

/**
 * Get all active prescriptions for the current patient
 */
export async function getPrescriptions(): Promise<Prescription[]> {
  const patient = await getPatient();
  if (!patient) throw new Error('No patient found');

  const rows = await query<any>(
    `SELECT * FROM prescriptions 
     WHERE patient_id = ? AND is_deleted = 0 
     ORDER BY created_at DESC`,
    [patient.id]
  );

  return rows.map(row => ({
    id: row.id,
    patientId: row.patient_id,
    medicationCode: row.medication_code,
    medicationDisplay: row.medication_display,
    dosage: row.dosage,
    frequency: row.frequency,
    durationDays: row.duration_days,
    prescriberName: row.prescriber_name,
    prescriberId: row.prescriber_id,
    notes: row.notes,
    status: row.status,
    deviceId: row.device_id,
    version: row.version,
    createdAt: row.created_at,
    lastModified: row.last_modified,
    isDeleted: row.is_deleted === 1,
  }));
}

/**
 * Get a single prescription by ID
 */
export async function getPrescription(id: string): Promise<Prescription | null> {
  const rows = await query<any>(
    'SELECT * FROM prescriptions WHERE id = ?',
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    patientId: row.patient_id,
    medicationCode: row.medication_code,
    medicationDisplay: row.medication_display,
    dosage: row.dosage,
    frequency: row.frequency,
    durationDays: row.duration_days,
    prescriberName: row.prescriber_name,
    prescriberId: row.prescriber_id,
    notes: row.notes,
    status: row.status,
    deviceId: row.device_id,
    version: row.version,
    createdAt: row.created_at,
    lastModified: row.last_modified,
    isDeleted: row.is_deleted === 1,
  };
}

/**
 * Create a new prescription
 */
export async function createPrescription(data: {
  medicationCode?: string;
  medicationDisplay: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  prescriberName?: string;
  prescriberId?: string;
  notes?: string;
}): Promise<Prescription> {
  const patient = await getPatient();
  if (!patient) throw new Error('No patient found');

  const prescriptionId = generateUUID();
  const timestamp = now();

  await execute(
    `INSERT INTO prescriptions (
      id, patient_id, medication_code, medication_display,
      dosage, frequency, duration_days, prescriber_name,
      prescriber_id, notes, status, device_id, version,
      created_at, last_modified, is_deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      prescriptionId,
      patient.id,
      data.medicationCode || null,
      data.medicationDisplay,
      data.dosage,
      data.frequency,
      data.durationDays || null,
      data.prescriberName || null,
      data.prescriberId || null,
      data.notes || null,
      'active',
      patient.deviceId,
      1,
      timestamp,
      timestamp,
      0,
    ]
  );

  // Log audit trail
  await logAudit({
    action: 'create',
    recordType: 'prescription',
    recordId: prescriptionId,
    changes: JSON.stringify(data),
  });

  return {
    id: prescriptionId,
    patientId: patient.id,
    medicationCode: data.medicationCode,
    medicationDisplay: data.medicationDisplay,
    dosage: data.dosage,
    frequency: data.frequency,
    durationDays: data.durationDays,
    prescriberName: data.prescriberName,
    prescriberId: data.prescriberId,
    notes: data.notes,
    status: 'active',
    deviceId: patient.deviceId,
    version: 1,
    createdAt: timestamp,
    lastModified: timestamp,
    isDeleted: false,
  };
}

/**
 * Update an existing prescription
 */
export async function updatePrescription(
  id: string,
  data: Partial<Prescription>
): Promise<void> {
  const patient = await getPatient();
  if (!patient) throw new Error('No patient found');

  const existing = await getPrescription(id);
  if (!existing) throw new Error('Prescription not found');

  const timestamp = now();
  const newVersion = existing.version + 1;

  await execute(
    `UPDATE prescriptions 
     SET medication_code = ?, medication_display = ?, dosage = ?,
         frequency = ?, duration_days = ?, prescriber_name = ?,
         prescriber_id = ?, notes = ?, status = ?,
         version = ?, last_modified = ?
     WHERE id = ?`,
    [
      data.medicationCode ?? existing.medicationCode ?? null,
      data.medicationDisplay ?? existing.medicationDisplay,
      data.dosage ?? existing.dosage,
      data.frequency ?? existing.frequency,
      data.durationDays ?? existing.durationDays ?? null,
      data.prescriberName ?? existing.prescriberName ?? null,
      data.prescriberId ?? existing.prescriberId ?? null,
      data.notes ?? existing.notes ?? null,
      data.status ?? existing.status,
      newVersion,
      timestamp,
      id,
    ]
  );

  // Log audit trail
  await logAudit({
    action: 'update',
    recordType: 'prescription',
    recordId: id,
    changes: JSON.stringify(data),
  });
}

/**
 * Soft delete a prescription
 */
export async function deletePrescription(id: string): Promise<void> {
  const existing = await getPrescription(id);
  if (!existing) throw new Error('Prescription not found');

  const timestamp = now();
  const newVersion = existing.version + 1;

  await execute(
    `UPDATE prescriptions 
     SET is_deleted = 1, version = ?, last_modified = ?
     WHERE id = ?`,
    [newVersion, timestamp, id]
  );

  // Log audit trail
  await logAudit({
    action: 'delete',
    recordType: 'prescription',
    recordId: id,
  });
}

/**
 * Update prescription status
 */
export async function updatePrescriptionStatus(
  id: string,
  status: 'active' | 'completed' | 'discontinued'
): Promise<void> {
  await updatePrescription(id, { status });
}

