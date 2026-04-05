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
export type CreateProductPayload = {
    readonly name: string;
    readonly description: string;
    readonly priceCents: number;
    readonly model3dUrl: string;
    readonly imageUrls: readonly string[];
    readonly categoryId: string;
    readonly stockQuantity: number;
};
export type PublicProduct = Product & {
    readonly categoryName: string;
    readonly outOfStock: boolean;
};
export type UpdateProductPayload = CreateProductPayload;
