import type { Product as DbProduct } from '@prisma/client';
import type { PublicProduct } from '@ecommerce/shared';
import { toProduct } from './productMapper';

export type ProductWithCategory = DbProduct & {
  readonly category: { readonly name: string };
};

/** `outOfStock` só reflete `stockQuantity` no banco (compra e reembolso confirmado atualizam esse valor). */
export const toPublicProduct = (row: ProductWithCategory): PublicProduct => {
  const base = toProduct(row);
  return {
    ...base,
    categoryName: row.category.name,
    outOfStock: base.stockQuantity <= 0,
  };
};
