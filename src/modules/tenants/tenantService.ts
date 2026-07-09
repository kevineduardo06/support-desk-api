import { auditRepository } from '../audit/auditRepository';
import { tenantRepository } from './tenantRepository';

export const tenantService = {
  create(name: string) {
    const tenant = tenantRepository.create(name);
    auditRepository.record({ tenantId: tenant.id, action: 'tenant.created', entityId: tenant.id });
    return tenant;
  }
};
