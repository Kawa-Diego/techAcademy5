import type { User as DbUser } from '@prisma/client';
import type { UserPublic, UserRole } from '@ecommerce/shared';

const mapRole = (role: DbUser['role']): UserRole => {
  if (role === 'ADMIN') return 'ADMIN';
  return 'USER';
};

export const toUserPublic = (user: DbUser): UserPublic => ({
  id: user.id,
  name: user.name,
  email: user.email,
  cpf: user.cpf,
  role: mapRole(user.role),
  createdAt: user.createdAt.toISOString(),
});
