export type AuditAction =
  | 'tenant.created'
  | 'user.created'
  | 'ticket.created'
  | 'ticket.assigned'
  | 'ticket.status_changed'
  | 'ticket.comment_added';

export interface AuditLog {
  id: string;
  tenantId: string;
  action: AuditAction;
  entityId: string;
  actorId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
