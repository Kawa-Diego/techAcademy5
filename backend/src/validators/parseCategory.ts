import { z } from 'zod';
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

const fail = (error: z.ZodError): never => {
  const first = error.issues[0];
  throw new AppError(400, first?.message ?? 'Payload inválido');
};

export const parseCategoryBody = (body: object): CreateCategoryPayload => {
  const parsed = schema.safeParse(body);
  if (parsed.success) {
    const { name, description } = parsed.data;
    return { name, description };
  }
  return fail(parsed.error);
};

export const parseCategoryUpdateBody = (body: object): UpdateCategoryPayload => {
  return parseCategoryBody(body);
};
