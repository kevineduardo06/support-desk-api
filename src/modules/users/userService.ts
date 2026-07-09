import { badRequest, notFound } from '../../shared/errors';
import { auditRepository } from '../audit/auditRepository';
import { tenantRepository } from '../tenants/tenantRepository';
import { userRepository } from './userRepository';
import { UserRole } from './userTypes';

export const userService = {
  create(input: { tenantId: string; name: string; email: string; role: UserRole }) {
    if (!tenantRepository.findById(input.tenantId)) throw notFound('Tenant not found');
    if (!input.email.includes('@')) throw badRequest('Invalid email');

    const user = userRepository.create(input);
    auditRepository.record({ tenantId: user.tenantId, action: 'user.created', entityId: user.id });
    return user;
  }
};
