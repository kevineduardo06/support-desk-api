import { slaService } from '../sla/slaService';
import { ticketRepository } from '../tickets/ticketRepository';
import { TicketPriority, TicketStatus } from '../tickets/ticketTypes';

const statuses: TicketStatus[] = ['open', 'pending_customer', 'resolved', 'closed'];
const priorities: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];

export const reportService = {
  tenantSummary(tenantId: string, at: Date = new Date()) {
    const tickets = ticketRepository.list({ tenantId });
    const byStatus = Object.fromEntries(statuses.map(status => [status, 0])) as Record<TicketStatus, number>;
    const byPriority = Object.fromEntries(priorities.map(priority => [priority, 0])) as Record<TicketPriority, number>;

    let breached = 0;
    for (const ticket of tickets) {
      byStatus[ticket.status] += 1;
      byPriority[ticket.priority] += 1;
      if (slaService.isBreached(ticket.slaDueAt, ticket.resolvedAt, at)) breached += 1;
    }

    return {
      tenantId,
      totalTickets: tickets.length,
      activeTickets: tickets.filter(ticket => ticket.status !== 'resolved' && ticket.status !== 'closed').length,
      breachedSlaTickets: breached,
      byStatus,
      byPriority
    };
  }
};
