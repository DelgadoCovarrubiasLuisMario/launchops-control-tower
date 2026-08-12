import { AuditEvent } from '../models/database.js';

type AuditInput = {
  actor: string;
  action: string;
  target: string;
  organizationId: number;
  severity?: 'info' | 'warning' | 'danger';
  metadata?: Record<string, unknown>;
};

export async function writeAuditEvent(input: AuditInput) {
  return AuditEvent.create({
    actor: input.actor,
    action: input.action,
    target: input.target,
    organizationId: input.organizationId,
    severity: input.severity ?? 'info',
    metadata: input.metadata ?? {}
  });
}
