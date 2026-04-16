export type CartItemLine = {
  readonly productId: string;
  readonly quantity: number;
  readonly productName: string;
  readonly priceCents: number;
  readonly stockQuantity: number;
  readonly imageUrls: readonly string[];
};

export type CartResponse = {
  readonly items: readonly CartItemLine[];
  readonly lineCount: number;
  readonly itemQuantityTotal: number;
};

export type CartUpsertItemPayload = {
  readonly productId: string;
  readonly quantity: number;
};

export type CartCheckoutPayload = {
  readonly notes?: string;
};

export type UserCartSummary = {
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly lineCount: number;
  readonly itemQuantityTotal: number;
};

export type AdminUserMessagePayload = {
  readonly body: string;
};

export type AdminUserMessageDto = {
  readonly id: string;
  readonly toUserId: string;
  readonly body: string;
  readonly createdAt: string;
};
