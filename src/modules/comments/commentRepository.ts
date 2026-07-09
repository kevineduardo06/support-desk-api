import { nextId } from '../../shared/id';
import { TicketComment } from './commentTypes';

const comments: TicketComment[] = [];

export const commentRepository = {
  create(input: { tenantId: string; ticketId: string; authorId: string; body: string; internal: boolean }): TicketComment {
    const comment: TicketComment = {
      id: nextId('comment'),
      tenantId: input.tenantId,
      ticketId: input.ticketId,
      authorId: input.authorId,
      body: input.body,
      internal: input.internal,
      createdAt: new Date()
    };
    comments.push(comment);
    return comment;
  },

  listByTicket(tenantId: string, ticketId: string): TicketComment[] {
    return comments.filter(comment => comment.tenantId === tenantId && comment.ticketId === ticketId);
  },

  clear(): void {
    comments.length = 0;
  }
};
