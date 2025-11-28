import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../db';
import { audit_logs, type AuditLog, type NewAuditLog } from '../../db/schema';
import { generateRecordId } from '../crypto/cryptoService';

export interface AuditLogInput {
  recordType: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  changes?: string;
}

/**
 * Add an audit log entry
 */
export async function addAuditLogEntry(input: AuditLogInput): Promise<AuditLog> {
  const auditId = await generateRecordId('audit');
  const deviceId = await generateRecordId('device');

  const auditData: NewAuditLog = {
    id: auditId,
    record_type: input.recordType,
    record_id: input.recordId,
    action: input.action,
    changes: input.changes,
    device_id: deviceId,
    timestamp: new Date().toISOString(),
  };

  const result = await db.insert(audit_logs).values(auditData).returning();
  return result[0];
}

/**
 * Get audit logs for a specific record
 */
export async function getAuditLogs(recordType: string, recordId: string): Promise<AuditLog[]> {
  return await db
    .select()
    .from(audit_logs)
    .where(and(eq(audit_logs.record_type, recordType), eq(audit_logs.record_id, recordId)))
    .orderBy(desc(audit_logs.timestamp));
}
