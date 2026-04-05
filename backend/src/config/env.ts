import { AppError } from '../errors/AppError';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value || value.length === 0) {
    throw new AppError(500, `Missing environment variable: ${key}`);
  }
  return value;
};

export const getJwtSecret = (): string => required('JWT_SECRET');
export const getPort = (): number => Number(process.env.PORT ?? '3333');
