import { z } from 'zod';
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterUserPayload,
  UpdateUserPayload,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { zodNonEmptyDisplayName } from './nameField';

const registerSchema = z.object({
  name: zodNonEmptyDisplayName,
  email: z.string().min(1).transform((s) => s.trim()),
  password: z.string().min(1),
  cpf: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().min(1).transform((s) => s.trim()),
  password: z.string().min(1),
});

const updateSchema = z.object({
  name: zodNonEmptyDisplayName,
  password: z.string().min(1),
  cpf: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1),
  newPassword: z.string().min(1),
});

const fail = (error: z.ZodError): never => {
  const first = error.issues[0];
  const msg = first?.message ?? 'Payload inválido';
  throw new AppError(400, msg);
};

export const parseRegisterBody = (body: object): RegisterUserPayload => {
  const parsed = registerSchema.safeParse(body);
  if (parsed.success) {
    const { name, email, password, cpf } = parsed.data;
    return { name, email, password, cpf };
  }
  return fail(parsed.error);
};

export const parseLoginBody = (body: object): LoginPayload => {
  const parsed = loginSchema.safeParse(body);
  if (parsed.success) {
    const { email, password } = parsed.data;
    return { email, password };
  }
  return fail(parsed.error);
};

export const parseUpdateUserBody = (body: object): UpdateUserPayload => {
  const parsed = updateSchema.safeParse(body);
  if (parsed.success) {
    const { name, password, cpf } = parsed.data;
    return { name, password, cpf };
  }
  return fail(parsed.error);
};

export type ChangePasswordPayload = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

export const parseChangePasswordBody = (
  body: object
): ChangePasswordPayload => {
  const parsed = changePasswordSchema.safeParse(body);
  if (parsed.success) {
    const { currentPassword, newPassword } = parsed.data;
    return { currentPassword, newPassword };
  }
  return fail(parsed.error);
};

export const parseForgotPasswordBody = (
  body: object
): ForgotPasswordPayload => {
  const parsed = forgotPasswordSchema.safeParse(body);
  if (parsed.success) {
    const { email, newPassword } = parsed.data;
    return { email, newPassword };
  }
  return fail(parsed.error);
};
