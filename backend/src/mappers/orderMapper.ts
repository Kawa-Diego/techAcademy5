import type { OrderItem as DbOrderItem, Order as DbOrder } from '@prisma/client';
import type { Order, OrderItem, OrderStatus } from '@ecommerce/shared';

type ItemRow = DbOrderItem & {
  readonly product?: { readonly name: string };
};

const toItem = (row: ItemRow): OrderItem => ({
  id: row.id,
  productId: row.productId,
  quantity: row.quantity,
  unitPriceCents: row.unitPriceCents,
  refundRequestedAt: row.refundRequestedAt?.toISOString() ?? null,
  refundConfirmedAt: row.refundConfirmedAt?.toISOString() ?? null,
  ...(row.product !== undefined
    ? { productName: row.product.name }
    : {}),
});

type OrderExtras = {
  readonly userId: string | null;
  readonly userName: string | null;
  readonly userEmail: string | null;
};

export const toOrder = (
  row: DbOrder,
  items: DbOrderItem[],
  extras?: OrderExtras
): Order => {
  const base: Order = {
    id: row.id,
    status: row.status as OrderStatus,
    notes: row.notes,
    items: items.map(toItem),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
  if (extras === undefined) return base;
  return {
    ...base,
    userId: extras.userId,
    userName: extras.userName,
    userEmail: extras.userEmail,
  };
};
