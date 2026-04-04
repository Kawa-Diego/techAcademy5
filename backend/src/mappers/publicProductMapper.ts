import type { Product as DbProduct } from '@prisma/client';
import type { PublicProduct } from '@ecommerce/shared';
import { toProduct } from './productMapper';

export type ProductWithCategory = DbProduct & {
  readonly category: { readonly name: string };
};

export const toPublicProduct = (
  row: ProductWithCategory,
  ctx: { readonly catalogProductCount: number }
): PublicProduct => {
  const base = toProduct(row);
  return {
    ...base,
    categoryName: row.category.name,
    outOfStock:
      ctx.catalogProductCount === 1 || base.stockQuantity <= 0,
  };
};
