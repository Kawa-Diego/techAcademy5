export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED' | 'REFUNDED' | 'CLOSED';
export type OrderItem = {
    readonly id: string;
    readonly productId: string;
    readonly quantity: number;
    readonly unitPriceCents: number;
    readonly refundRequestedAt: string | null;
    readonly refundConfirmedAt: string | null;
    readonly productName?: string;
};
export type Order = {
    readonly id: string;
    readonly status: OrderStatus;
    readonly notes: string;
    readonly items: readonly OrderItem[];
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly userId?: string | null;
    readonly userName?: string | null;
    readonly userEmail?: string | null;
};
export type CreateOrderItemPayload = {
    readonly productId: string;
    readonly quantity: number;
};
export type CreateOrderPayload = {
    readonly status: OrderStatus;
    readonly notes: string;
    readonly items: readonly CreateOrderItemPayload[];
};
export type UpdateOrderPayload = CreateOrderPayload;
export type CustomerCreateOrderPayload = {
    readonly notes?: string;
    readonly items: readonly CreateOrderItemPayload[];
};
export type RefundRequestPayload = {
    readonly confirm: boolean;
};
export type OrderUserProductSummary = {
    readonly productId: string;
    readonly productName: string;
    readonly totalQuantity: number;
};
export type OrderUserSummary = {
    readonly userId: string | null;
    readonly userName: string;
    readonly userEmail: string | null;
    readonly orderCount: number;
    readonly products: readonly OrderUserProductSummary[];
};
export type OrdersSummaryResponse = {
    readonly entries: readonly OrderUserSummary[];
};
