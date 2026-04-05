import { z } from 'zod';
import type { CreateProductPayload, UpdateProductPayload } from '@ecommerce/shared';
import { AppError } from '../errors/AppError';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  model3dUrl: z.string().min(1),
  categoryId: z.string().min(1),
  imageUrls: z.array(z.string().min(1)).min(1, 'Provide at least one image'),
  stockQuantity: z.number().int().min(0),
});

const fail = (error: z.ZodError): never => {
  const first = error.issues[0];
  throw new AppError(400, first?.message ?? 'Invalid payload');
};

export const parseProductBody = (body: object): CreateProductPayload => {
  const parsed = schema.safeParse(body);
  if (parsed.success) {
    const {
      name,
      description,
      priceCents,
      model3dUrl,
      categoryId,
      imageUrls,
      stockQuantity,
    } = parsed.data;
    return {
      name,
      description,
      priceCents,
      model3dUrl,
      categoryId,
      imageUrls,
      stockQuantity,
    };
  }
  return fail(parsed.error);
};

export const parseProductUpdateBody = (body: object): UpdateProductPayload => {
  return parseProductBody(body);
};
