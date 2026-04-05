export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export type OrderItem = {
  readonly id: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
  readonly refundRequestedAt: string | null;
  readonly refundConfirmedAt: string | null;
  // Filled in the API responses when the item includes the product
  readonly productName?: string;
};

// Order type
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

// Create order item payload type
export type CreateOrderItemPayload = {
  readonly productId: string;
  readonly quantity: number;
};

// Create order payload type
export type CreateOrderPayload = {
  readonly status: OrderStatus;
  readonly notes: string;
  readonly items: readonly CreateOrderItemPayload[];
};

// Update order payload type
export type UpdateOrderPayload = CreateOrderPayload;

// Customer create order payload type
export type CustomerCreateOrderPayload = {
  readonly notes?: string;
  readonly items: readonly CreateOrderItemPayload[];
};

// Refund request payload type
export type RefundRequestPayload = {
  readonly confirm: boolean;
};

// Order user product summary type
export type OrderUserProductSummary = {
  readonly productId: string;
  readonly productName: string;
  readonly totalQuantity: number;
};

// Order user summary type
export type OrderUserSummary = {
  readonly userId: string | null;
  readonly userName: string;
  readonly userEmail: string | null;
  readonly orderCount: number;
  readonly products: readonly OrderUserProductSummary[];
};

// Orders summary response type
export type OrdersSummaryResponse = {
  readonly entries: readonly OrderUserSummary[];
};
