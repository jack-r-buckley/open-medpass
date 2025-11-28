import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  national_id: text('national_id'),
  pin_hash: text('pin_hash').notNull(),
  recovery_question: text('recovery_question').notNull(),
  recovery_answer_hash: text('recovery_answer_hash').notNull(),
  device_id: text('device_id').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey(),
  patient_id: text('patient_id').notNull().references(() => patients.id),
  medication: text('medication').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  duration_days: integer('duration_days').notNull(),
  prescriber_name: text('prescriber_name').notNull(),
  prescriber_facility: text('prescriber_facility').notNull(),
  start_date: text('start_date').notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['active', 'completed', 'discontinued'] }).notNull().default('active'),
  device_id: text('device_id').notNull(),
  version_vector: text('version_vector').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const audit_logs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  record_type: text('record_type').notNull(),
  record_id: text('record_id').notNull(),
  action: text('action', { enum: ['create', 'update', 'delete'] }).notNull(),
  changes: text('changes'),
  device_id: text('device_id').notNull(),
  timestamp: text('timestamp').notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

export type AuditLog = typeof audit_logs.$inferSelect;
export type NewAuditLog = typeof audit_logs.$inferInsert;
