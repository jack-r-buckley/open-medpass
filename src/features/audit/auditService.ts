import { AuditLogEntry } from '../../types';
import { query, execute } from '../../db/database';
import { generateUUID, now } from '../../utils/crypto';
import { getPatient } from '../patient/patientService';

/**
 * Log an audit entry
 */
export async function logAudit(data: {
  action: 'create' | 'update' | 'delete' | 'sync' | 'restore';
  recordType: 'patient' | 'prescription' | 'consultation' | 'investigation';
  recordId: string;
  changes?: string;
}): Promise<void> {
  const patient = await getPatient();
  if (!patient) return; // Silently fail if no patient (shouldn't happen)

  const auditId = generateUUID();
  const timestamp = now();

  await execute(
    `INSERT INTO audit_log (
      id, timestamp, device_id, action, record_type, record_id, changes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      auditId,
      timestamp,
      patient.deviceId,
      data.action,
      data.recordType,
      data.recordId,
      data.changes || null,
    ]
  );
}

/**
 * Get audit log entries for a specific record
 */
export async function getAuditLog(
  recordType: string,
  recordId: string
): Promise<AuditLogEntry[]> {
  const rows = await query<any>(
    `SELECT * FROM audit_log 
     WHERE record_type = ? AND record_id = ?
     ORDER BY timestamp DESC`,
    [recordType, recordId]
  );

  return rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    deviceId: row.device_id,
    action: row.action,
    recordType: row.record_type,
    recordId: row.record_id,
    changes: row.changes,
  }));
}

/**
 * Get all audit log entries
 */
export async function getAllAuditLogs(): Promise<AuditLogEntry[]> {
  const rows = await query<any>(
    'SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 100'
  );

  return rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    deviceId: row.device_id,
    action: row.action,
    recordType: row.record_type,
    recordId: row.record_id,
    changes: row.changes,
  }));
}

