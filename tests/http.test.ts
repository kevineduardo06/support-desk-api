import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { resetTestData } from './reset';

describe('HTTP API', () => {
  beforeEach(resetTestData);

  it('creates a tenant, user and ticket through HTTP', async () => {
    const tenantResponse = await request(app).post('/tenants').send({ name: 'Globex' }).expect(201);
    const tenantId = tenantResponse.body.id;

    const customerResponse = await request(app)
      .post('/users')
      .send({ tenantId, name: 'Jane Customer', email: 'jane@globex.test', role: 'customer' })
      .expect(201);

    const ticketResponse = await request(app)
      .post('/tickets')
      .send({ tenantId, customerId: customerResponse.body.id, title: 'Login error', description: 'Cannot access account', priority: 'high' })
      .expect(201);

    expect(ticketResponse.body.status).toBe('open');
    expect(ticketResponse.body.tenantId).toBe(tenantId);
  });

  it('filters tickets by activeOnly', async () => {
    const tenant = await request(app).post('/tenants').send({ name: 'Umbrella' });
    const tenantId = tenant.body.id;
    const customer = await request(app).post('/users').send({ tenantId, name: 'Customer', email: 'c@umbrella.test', role: 'customer' });
    const agent = await request(app).post('/users').send({ tenantId, name: 'Agent', email: 'a@umbrella.test', role: 'agent' });
    const ticket = await request(app).post('/tickets').send({ tenantId, customerId: customer.body.id, title: 'Bug', description: 'Broken flow', priority: 'normal' });

    await request(app).patch(`/tickets/${ticket.body.id}/assign`).send({ tenantId, assigneeId: agent.body.id }).expect(200);
    await request(app).patch(`/tickets/${ticket.body.id}/status`).send({ tenantId, status: 'resolved' }).expect(200);

    const active = await request(app).get('/tickets').query({ tenantId, activeOnly: true }).expect(200);
    expect(active.body).toHaveLength(0);
  });

  it('returns tenant-scoped audit logs', async () => {
    const tenant = await request(app).post('/tenants').send({ name: 'Audit Co' });

    const response = await request(app).get('/audit').query({ tenantId: tenant.body.id }).expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tenantId: tenant.body.id, action: 'tenant.created' })
      ])
    );
  });
});
