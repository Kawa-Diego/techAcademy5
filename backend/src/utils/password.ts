import { AppError } from '../errors/AppError';

const hasUpper = (p: string): boolean => /[A-Z]/u.test(p);
const hasLower = (p: string): boolean => /[a-z]/u.test(p);
const hasDigit = (p: string): boolean => /[0-9]/u.test(p);
const hasSpecial = (p: string): boolean => /[^A-Za-z0-9]/u.test(p);

export const assertStrongPassword = (password: string): void => {
  if (password.length < 8) {
    throw new AppError(400, 'Weak password: at least 8 characters');
  }
  if (!hasUpper(password)) {
    throw new AppError(400, 'Weak password: include an uppercase letter');
  }
  if (!hasLower(password)) {
    throw new AppError(400, 'Weak password: include a lowercase letter');
  }
  if (!hasDigit(password)) {
    throw new AppError(400, 'Weak password: include a number');
  }
  if (!hasSpecial(password)) {
    throw new AppError(400, 'Weak password: include a special character');
  }
};
