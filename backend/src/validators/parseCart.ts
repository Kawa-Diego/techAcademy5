import { z } from 'zod';
import type { CartCheckoutPayload, CartUpsertItemPayload } from '@ecommerce/shared';
import { AppError } from '../errors/AppError';

const upsertSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0),
});

const checkoutSchema = z.object({
  notes: z.string().optional(),
});

const fail = (error: z.ZodError): never => {
  const first = error.issues[0];
  throw new AppError(400, first?.message ?? 'Invalid payload');
};

export const parseCartUpsertBody = (body: object): CartUpsertItemPayload => {
  const parsed = upsertSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  return fail(parsed.error);
};

export const parseCartCheckoutBody = (body: object): CartCheckoutPayload => {
  const parsed = checkoutSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  return fail(parsed.error);
};

const messageSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const parseAdminUserMessageBody = (body: object): { body: string } => {
  const parsed = messageSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  return fail(parsed.error);
};
