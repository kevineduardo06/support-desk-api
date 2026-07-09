import { nextId } from '../../shared/id';
import { Ticket, TicketFilter, TicketPriority, TicketStatus } from './ticketTypes';

const tickets = new Map<string, Ticket>();

export const ticketRepository = {
  create(input: {
    tenantId: string;
    customerId: string;
    title: string;
    description: string;
    priority: TicketPriority;
    slaDueAt: Date;
  }): Ticket {
    const date = new Date();
    const ticket: Ticket = {
      id: nextId('ticket'),
      tenantId: input.tenantId,
      customerId: input.customerId,
      title: input.title,
      description: input.description,
      status: 'open',
      priority: input.priority,
      slaDueAt: input.slaDueAt,
      createdAt: date,
      updatedAt: date
    };
    tickets.set(ticket.id, ticket);
    return ticket;
  },

  findById(id: string): Ticket | undefined {
    return tickets.get(id);
  },

  save(ticket: Ticket): Ticket {
    const updated = { ...ticket, updatedAt: new Date() };
    tickets.set(updated.id, updated);
    return updated;
  },

  list(filter: TicketFilter): Ticket[] {
    return Array.from(tickets.values()).filter(ticket => {
      if (ticket.tenantId !== filter.tenantId) return false;
      if (filter.status && ticket.status !== filter.status) return false;
      if (filter.priority && ticket.priority !== filter.priority) return false;
      if (filter.assigneeId && ticket.assigneeId !== filter.assigneeId) return false;
      if (filter.activeOnly && ['resolved', 'closed'].includes(ticket.status)) return false;
      return true;
    });
  },

  clear(): void {
    tickets.clear();
  }
};
