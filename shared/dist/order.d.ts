export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
export type OrderItem = {
    readonly id: string;
    readonly productId: string;
    readonly quantity: number;
    readonly unitPriceCents: number;
    readonly refundRequestedAt: string | null;
    readonly refundConfirmedAt: string | null;
    /** Preenchido nas respostas da API quando o item inclui o produto. */
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
/** Pedido feito pelo cliente na vitrine (status sempre PENDING no servidor). */
export type CustomerCreateOrderPayload = {
    readonly notes?: string;
    readonly items: readonly CreateOrderItemPayload[];
};
export type RefundRequestPayload = {
    readonly confirm: boolean;
};
/** Resumo de um produto agregado nos pedidos de um usuário */
export type OrderUserProductSummary = {
    readonly productId: string;
    readonly productName: string;
    readonly totalQuantity: number;
};
/** Quantos pedidos o usuário fez e quais produtos (quantidades somadas) */
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
