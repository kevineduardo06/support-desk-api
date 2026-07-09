import { nextId } from '../../shared/id';
import { AuditAction, AuditLog } from './auditTypes';

const logs: AuditLog[] = [];

export const auditRepository = {
  record(input: {
    tenantId: string;
    action: AuditAction;
    entityId: string;
    actorId?: string;
    metadata?: Record<string, unknown>;
  }): AuditLog {
    const log: AuditLog = {
      id: nextId('audit'),
      tenantId: input.tenantId,
      action: input.action,
      entityId: input.entityId,
      actorId: input.actorId,
      metadata: input.metadata ?? {},
      createdAt: new Date()
    };
    logs.push(log);
    return log;
  },

  listByTenant(tenantId: string): AuditLog[] {
    return logs.filter(log => log.tenantId === tenantId);
  },

  clear(): void {
    logs.length = 0;
  }
};
