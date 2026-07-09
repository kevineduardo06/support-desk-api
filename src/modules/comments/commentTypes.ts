export interface TicketComment {
  id: string;
  tenantId: string;
  ticketId: string;
  authorId: string;
  body: string;
  internal: boolean;
  createdAt: Date;
}
