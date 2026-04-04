export type Category = {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly createdAt: string;
    readonly updatedAt: string;
};
export type CreateCategoryPayload = {
    readonly name: string;
    readonly description: string;
};
export type UpdateCategoryPayload = CreateCategoryPayload;
