import { beforeEach, describe, expect, it } from 'vitest';
import { reportService } from '../src/modules/reports/reportService';
import { tenantService } from '../src/modules/tenants/tenantService';
import { ticketService } from '../src/modules/tickets/ticketService';
import { userService } from '../src/modules/users/userService';
import { resetTestData } from './reset';

function seedTenant() {
  const tenant = tenantService.create('Acme Support');
  const customer = userService.create({ tenantId: tenant.id, name: 'Customer One', email: 'customer@acme.test', role: 'customer' });
  const agent = userService.create({ tenantId: tenant.id, name: 'Agent One', email: 'agent@acme.test', role: 'agent' });
  return { tenant, customer, agent };
}

describe('ticketService', () => {
  beforeEach(resetTestData);

  it('creates tickets with SLA based on priority', () => {
    const { tenant, customer } = seedTenant();
    const ticket = ticketService.create({
      tenantId: tenant.id,
      customerId: customer.id,
      title: 'Payment failed',
      description: 'Customer cannot pay invoice',
      priority: 'urgent'
    });

    expect(ticket.status).toBe('open');
    expect(ticket.slaDueAt.getTime()).toBeGreaterThan(ticket.createdAt.getTime());
  });

  it('prevents assigning a ticket to an agent from another tenant', () => {
    const { tenant, customer } = seedTenant();
    const otherTenant = tenantService.create('Other Tenant');
    const otherAgent = userService.create({ tenantId: otherTenant.id, name: 'Other Agent', email: 'agent@other.test', role: 'agent' });
    const ticket = ticketService.create({ tenantId: tenant.id, customerId: customer.id, title: 'Issue', description: 'Needs help', priority: 'normal' });

    expect(() => ticketService.assign({ tenantId: tenant.id, ticketId: ticket.id, assigneeId: otherAgent.id })).toThrow('Assignee belongs to another tenant');
  });

  it('requires an assignee before resolving a ticket', () => {
    const { tenant, customer } = seedTenant();
    const ticket = ticketService.create({ tenantId: tenant.id, customerId: customer.id, title: 'Issue', description: 'Needs help', priority: 'normal' });

    expect(() => ticketService.changeStatus({ tenantId: tenant.id, ticketId: ticket.id, status: 'resolved' })).toThrow('Resolving a ticket requires an assignee');
  });

  it('allows assigned tickets to be resolved and counted in reports', () => {
    const { tenant, customer, agent } = seedTenant();
    const ticket = ticketService.create({ tenantId: tenant.id, customerId: customer.id, title: 'Issue', description: 'Needs help', priority: 'high' });

    ticketService.assign({ tenantId: tenant.id, ticketId: ticket.id, assigneeId: agent.id });
    ticketService.changeStatus({ tenantId: tenant.id, ticketId: ticket.id, status: 'resolved' });

    const summary = reportService.tenantSummary(tenant.id);
    expect(summary.byStatus.resolved).toBe(1);
    expect(summary.activeTickets).toBe(0);
  });

  it('reopens a resolved ticket and recalculates SLA', () => {
    const { tenant, customer, agent } = seedTenant();
    const ticket = ticketService.create({ tenantId: tenant.id, customerId: customer.id, title: 'Issue', description: 'Needs help', priority: 'normal' });
    const originalSla = ticket.slaDueAt.getTime();

    ticketService.assign({ tenantId: tenant.id, ticketId: ticket.id, assigneeId: agent.id });
    ticketService.changeStatus({ tenantId: tenant.id, ticketId: ticket.id, status: 'resolved' });
    const reopened = ticketService.changeStatus({ tenantId: tenant.id, ticketId: ticket.id, status: 'open' });

    expect(reopened.resolvedAt).toBeUndefined();
    expect(reopened.reopenedAt).toBeInstanceOf(Date);
    expect(reopened.slaDueAt.getTime()).toBeGreaterThanOrEqual(originalSla);
  });

  it('blocks comments on closed tickets', () => {
    const { tenant, customer, agent } = seedTenant();
    const ticket = ticketService.create({ tenantId: tenant.id, customerId: customer.id, title: 'Issue', description: 'Needs help', priority: 'low' });

    ticketService.assign({ tenantId: tenant.id, ticketId: ticket.id, assigneeId: agent.id });
    ticketService.changeStatus({ tenantId: tenant.id, ticketId: ticket.id, status: 'resolved' });
    ticketService.changeStatus({ tenantId: tenant.id, ticketId: ticket.id, status: 'closed' });

    expect(() => ticketService.addComment({ tenantId: tenant.id, ticketId: ticket.id, authorId: agent.id, body: 'Follow up' })).toThrow('Closed tickets cannot receive comments');
  });

  it('prevents customers from creating internal comments', () => {
    const { tenant, customer } = seedTenant();
    const ticket = ticketService.create({ tenantId: tenant.id, customerId: customer.id, title: 'Issue', description: 'Needs help', priority: 'normal' });

    expect(() => ticketService.addComment({ tenantId: tenant.id, ticketId: ticket.id, authorId: customer.id, body: 'Secret', internal: true })).toThrow('Customers cannot create internal comments');
  });
});
