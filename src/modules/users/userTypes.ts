export type UserRole = 'customer' | 'agent' | 'admin';

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}
