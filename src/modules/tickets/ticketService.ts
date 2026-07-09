import { badRequest, forbidden, notFound } from '../../shared/errors';
import { auditRepository } from '../audit/auditRepository';
import { commentRepository } from '../comments/commentRepository';
import { slaService } from '../sla/slaService';
import { userRepository } from '../users/userRepository';
import { ticketRepository } from './ticketRepository';
import { TicketFilter, TicketPriority, TicketStatus } from './ticketTypes';

function ensureSameTenant(expectedTenantId: string, actualTenantId: string, entity: string): void {
  if (expectedTenantId !== actualTenantId) throw forbidden(`${entity} belongs to another tenant`);
}

export const ticketService = {
  create(input: {
    tenantId: string;
    customerId: string;
    title: string;
    description: string;
    priority: TicketPriority;
  }) {
    const customer = userRepository.findById(input.customerId);
    if (!customer) throw notFound('Customer not found');
    ensureSameTenant(input.tenantId, customer.tenantId, 'Customer');
    if (customer.role !== 'customer') throw badRequest('Ticket customer must have customer role');

    const ticket = ticketRepository.create({
      ...input,
      slaDueAt: slaService.calculateDueAt(input.priority)
    });
    auditRepository.record({ tenantId: ticket.tenantId, action: 'ticket.created', entityId: ticket.id });
    return ticket;
  },

  list(filter: TicketFilter) {
    return ticketRepository.list(filter).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  assign(input: { tenantId: string; ticketId: string; assigneeId: string; actorId?: string }) {
    const ticket = ticketRepository.findById(input.ticketId);
    if (!ticket) throw notFound('Ticket not found');
    ensureSameTenant(input.tenantId, ticket.tenantId, 'Ticket');
    if (ticket.status === 'closed') throw badRequest('Closed tickets cannot be reassigned');

    const assignee = userRepository.findById(input.assigneeId);
    if (!assignee) throw notFound('Assignee not found');
    ensureSameTenant(ticket.tenantId, assignee.tenantId, 'Assignee');
    if (assignee.role !== 'agent' && assignee.role !== 'admin') throw badRequest('Assignee must be an agent or admin');

    const updated = ticketRepository.save({ ...ticket, assigneeId: assignee.id });
    auditRepository.record({
      tenantId: ticket.tenantId,
      action: 'ticket.assigned',
      entityId: ticket.id,
      actorId: input.actorId,
      metadata: { assigneeId: assignee.id }
    });
    return updated;
  },

  changeStatus(input: { tenantId: string; ticketId: string; status: TicketStatus; actorId?: string }) {
    const ticket = ticketRepository.findById(input.ticketId);
    if (!ticket) throw notFound('Ticket not found');
    ensureSameTenant(input.tenantId, ticket.tenantId, 'Ticket');

    if (input.status === 'resolved' && !ticket.assigneeId) {
      throw badRequest('Resolving a ticket requires an assignee');
    }
    if (ticket.status === 'closed' && input.status === 'pending_customer') {
      throw badRequest('Closed tickets must be reopened to open before pending_customer');
    }

    const patch = { ...ticket, status: input.status };
    if (input.status === 'resolved') patch.resolvedAt = new Date();
    if (input.status === 'closed') patch.closedAt = new Date();
    if ((ticket.status === 'resolved' || ticket.status === 'closed') && input.status === 'open') {
      patch.resolvedAt = undefined;
      patch.closedAt = undefined;
      patch.reopenedAt = new Date();
      patch.slaDueAt = slaService.calculateDueAt(ticket.priority, patch.reopenedAt);
    }

    const updated = ticketRepository.save(patch);
    auditRepository.record({
      tenantId: ticket.tenantId,
      action: 'ticket.status_changed',
      entityId: ticket.id,
      actorId: input.actorId,
      metadata: { from: ticket.status, to: input.status }
    });
    return updated;
  },

  addComment(input: {
    tenantId: string;
    ticketId: string;
    authorId: string;
    body: string;
    internal?: boolean;
  }) {
    const ticket = ticketRepository.findById(input.ticketId);
    if (!ticket) throw notFound('Ticket not found');
    ensureSameTenant(input.tenantId, ticket.tenantId, 'Ticket');
    if (ticket.status === 'closed') throw badRequest('Closed tickets cannot receive comments');

    const author = userRepository.findById(input.authorId);
    if (!author) throw notFound('Author not found');
    ensureSameTenant(ticket.tenantId, author.tenantId, 'Author');
    if (input.internal && author.role === 'customer') throw forbidden('Customers cannot create internal comments');

    const comment = commentRepository.create({
      tenantId: ticket.tenantId,
      ticketId: ticket.id,
      authorId: author.id,
      body: input.body,
      internal: input.internal ?? false
    });
    auditRepository.record({
      tenantId: ticket.tenantId,
      action: 'ticket.comment_added',
      entityId: ticket.id,
      actorId: author.id,
      metadata: { internal: comment.internal }
    });
    return comment;
  }
};
