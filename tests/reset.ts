import { auditRepository } from '../src/modules/audit/auditRepository';
import { commentRepository } from '../src/modules/comments/commentRepository';
import { tenantRepository } from '../src/modules/tenants/tenantRepository';
import { ticketRepository } from '../src/modules/tickets/ticketRepository';
import { userRepository } from '../src/modules/users/userRepository';
import { resetIds } from '../src/shared/id';

export function resetTestData(): void {
  auditRepository.clear();
  commentRepository.clear();
  ticketRepository.clear();
  userRepository.clear();
  tenantRepository.clear();
  resetIds();
}
