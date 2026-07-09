import { nextId } from '../../shared/id';
import { User, UserRole } from './userTypes';

const users = new Map<string, User>();

export const userRepository = {
  create(input: { tenantId: string; name: string; email: string; role: UserRole }): User {
    const user: User = {
      id: nextId('user'),
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      role: input.role,
      active: true,
      createdAt: new Date()
    };
    users.set(user.id, user);
    return user;
  },

  findById(id: string): User | undefined {
    return users.get(id);
  },

  listByTenant(tenantId: string): User[] {
    return Array.from(users.values()).filter(user => user.tenantId === tenantId);
  },

  clear(): void {
    users.clear();
  }
};
