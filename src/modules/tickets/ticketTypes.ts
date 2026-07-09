export type TicketStatus = 'open' | 'pending_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  tenantId: string;
  customerId: string;
  assigneeId?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaDueAt: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  reopenedAt?: Date;
}

export interface TicketFilter {
  tenantId: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  activeOnly?: boolean;
}
