import { nextId } from '../../shared/id';
import { Tenant } from './tenantTypes';

const tenants = new Map<string, Tenant>();

export const tenantRepository = {
  create(name: string): Tenant {
    const tenant: Tenant = { id: nextId('tenant'), name, createdAt: new Date() };
    tenants.set(tenant.id, tenant);
    return tenant;
  },

  findById(id: string): Tenant | undefined {
    return tenants.get(id);
  },

  clear(): void {
    tenants.clear();
  }
};
