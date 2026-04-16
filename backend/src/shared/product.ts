// Product type 
export type Product = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priceCents: number;
  readonly model3dUrl: string;
  readonly imageUrls: readonly string[];
  readonly categoryId: string;
  readonly stockQuantity: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

// Create product payload type
export type CreateProductPayload = {
  readonly name: string;
  readonly description: string;
  readonly priceCents: number;
  readonly model3dUrl: string;
  readonly imageUrls: readonly string[];
  readonly categoryId: string;
  readonly stockQuantity: number;
};

// Public product type
export type PublicProduct = Product & {
  readonly categoryName: string;
  // Out of stock flag
  readonly outOfStock: boolean;
};

// Update product payload type
export type UpdateProductPayload = CreateProductPayload;
