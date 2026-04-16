import type { Product as DbProduct } from '@prisma/client';
import type { Product } from '@ecommerce/shared';

/** Compatível com client Prisma antes/depois do campo `imageUrls` no model. */
const readImageUrls = (row: DbProduct): string[] => {
  const r = row as DbProduct & { imageUrls?: string[] };
  return Array.isArray(r.imageUrls) ? [...r.imageUrls] : [];
};

export const toProduct = (row: DbProduct): Product => {
  const r = row as DbProduct & { stockQuantity?: number };
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    model3dUrl: row.model3dUrl,
    imageUrls: readImageUrls(row),
    categoryId: row.categoryId,
    stockQuantity: typeof r.stockQuantity === 'number' ? r.stockQuantity : 10,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};
