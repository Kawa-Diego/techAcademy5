import { AppError } from '../errors/AppError';

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/u;

export const assertValidEmail = (email: string): void => {
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new AppError(400, 'E-mail inválido');
  }
};
