// Category type
export type Category = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

// Create category payload type
export type CreateCategoryPayload = {
  readonly name: string;
  readonly description: string;
};

// Update category payload type
export type UpdateCategoryPayload = CreateCategoryPayload;
