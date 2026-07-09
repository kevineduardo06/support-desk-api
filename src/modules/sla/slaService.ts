import { addHours } from '../../shared/date';
import { TicketPriority } from '../tickets/ticketTypes';

const priorityHours: Record<TicketPriority, number> = {
  low: 72,
  normal: 24,
  high: 8,
  urgent: 2
};

export const slaService = {
  calculateDueAt(priority: TicketPriority, from: Date = new Date()): Date {
    return addHours(from, priorityHours[priority]);
  },

  isBreached(slaDueAt: Date, resolvedAt?: Date, at: Date = new Date()): boolean {
    if (resolvedAt) return resolvedAt.getTime() > slaDueAt.getTime();
    return at.getTime() > slaDueAt.getTime();
  }
};
