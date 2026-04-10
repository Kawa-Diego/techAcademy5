import type { OrderStatus } from '@ecommerce/shared';

/** Statuses where order lines and totals must not be changed via generic admin edit/delete. */
export const TERMINAL_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  'CANCELLED',
  'REFUNDED',
  'CLOSED',
]);

export const canMutateOrder = (status: string): boolean =>
  !TERMINAL_ORDER_STATUSES.has(status as OrderStatus);

export const hasRefundActivity = (
  items: ReadonlyArray<{
    readonly refundRequestedAt: Date | null;
    readonly refundConfirmedAt: Date | null;
  }>
): boolean =>
  items.some(
    (i) => i.refundRequestedAt !== null || i.refundConfirmedAt !== null
  );

export const allOrderLinesRefundConfirmed = (
  items: ReadonlyArray<{ readonly refundConfirmedAt: Date | null }>
): boolean =>
  items.length > 0 && items.every((i) => i.refundConfirmedAt !== null);
