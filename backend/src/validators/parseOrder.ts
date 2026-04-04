import { z } from 'zod';
import type {
  CreateOrderPayload,
  CustomerCreateOrderPayload,
  RefundRequestPayload,
  UpdateOrderPayload,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';

const statusEnum = z.enum(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']);

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const schema = z.object({
  status: statusEnum,
  notes: z.string(),
  items: z.array(itemSchema).min(1),
});

const fail = (error: z.ZodError): never => {
  const first = error.issues[0];
  throw new AppError(400, first?.message ?? 'Payload inválido');
};

export const parseOrderBody = (body: object): CreateOrderPayload => {
  const parsed = schema.safeParse(body);
  if (parsed.success) {
    const { status, notes, items } = parsed.data;
    return { status, notes, items };
  }
  return fail(parsed.error);
};

export const parseOrderUpdateBody = (body: object): UpdateOrderPayload => {
  return parseOrderBody(body);
};

const customerSchema = z.object({
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export const parseCustomerOrderBody = (body: object): CustomerCreateOrderPayload => {
  const parsed = customerSchema.safeParse(body);
  if (parsed.success) {
    return { notes: parsed.data.notes, items: parsed.data.items };
  }
  return fail(parsed.error);
};

const refundSchema = z.object({
  confirm: z.literal(true),
});

export const parseRefundRequestBody = (body: object): RefundRequestPayload => {
  const parsed = refundSchema.safeParse(body);
  if (parsed.success) return parsed.data;
  return fail(parsed.error);
};
