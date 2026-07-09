import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { auditRepository } from './modules/audit/auditRepository';
import { reportService } from './modules/reports/reportService';
import { tenantService } from './modules/tenants/tenantService';
import { ticketService } from './modules/tickets/ticketService';
import { userService } from './modules/users/userService';
import { AppError } from './shared/errors';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/tenants', (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(2) }).parse(req.body);
    res.status(201).json(tenantService.create(body.name));
  } catch (error) {
    next(error);
  }
});

app.post('/users', (req, res, next) => {
  try {
    const body = z.object({
      tenantId: z.string(),
      name: z.string().min(2),
      email: z.string(),
      role: z.enum(['customer', 'agent', 'admin'])
    }).parse(req.body);
    res.status(201).json(userService.create(body));
  } catch (error) {
    next(error);
  }
});

app.post('/tickets', (req, res, next) => {
  try {
    const body = z.object({
      tenantId: z.string(),
      customerId: z.string(),
      title: z.string().min(3),
      description: z.string().min(3),
      priority: z.enum(['low', 'normal', 'high', 'urgent'])
    }).parse(req.body);
    res.status(201).json(ticketService.create(body));
  } catch (error) {
    next(error);
  }
});

app.get('/tickets', (req, res, next) => {
  try {
    const query = z.object({
      tenantId: z.string(),
      status: z.enum(['open', 'pending_customer', 'resolved', 'closed']).optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      assigneeId: z.string().optional(),
      activeOnly: z.coerce.boolean().optional()
    }).parse(req.query);
    res.json(ticketService.list(query));
  } catch (error) {
    next(error);
  }
});

app.patch('/tickets/:id/assign', (req, res, next) => {
  try {
    const body = z.object({ tenantId: z.string(), assigneeId: z.string(), actorId: z.string().optional() }).parse(req.body);
    res.json(ticketService.assign({ ...body, ticketId: req.params.id }));
  } catch (error) {
    next(error);
  }
});

app.patch('/tickets/:id/status', (req, res, next) => {
  try {
    const body = z.object({
      tenantId: z.string(),
      status: z.enum(['open', 'pending_customer', 'resolved', 'closed']),
      actorId: z.string().optional()
    }).parse(req.body);
    res.json(ticketService.changeStatus({ ...body, ticketId: req.params.id }));
  } catch (error) {
    next(error);
  }
});

app.post('/tickets/:id/comments', (req, res, next) => {
  try {
    const body = z.object({
      tenantId: z.string(),
      authorId: z.string(),
      body: z.string().min(1),
      internal: z.boolean().optional()
    }).parse(req.body);
    res.status(201).json(ticketService.addComment({ ...body, ticketId: req.params.id }));
  } catch (error) {
    next(error);
  }
});

app.get('/reports/tenant/:tenantId/summary', (req, res) => {
  res.json(reportService.tenantSummary(req.params.tenantId));
});

app.get('/audit', (req, res, next) => {
  try {
    const query = z.object({ tenantId: z.string() }).parse(req.query);
    res.json(auditRepository.listByTenant(query.tenantId));
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', issues: error.issues });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  res.status(500).json({ message: 'Internal server error' });
});
