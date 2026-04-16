import type { Category as DbCategory } from '@prisma/client';
import type { Category } from '@ecommerce/shared';

export const toCategory = (row: DbCategory): Category => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
