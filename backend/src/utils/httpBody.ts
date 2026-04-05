import type { Request } from 'express';
import { AppError } from '../errors/AppError';

export const getJsonBody = (req: Request): object => {
  const { body } = req;
  if (typeof body !== 'object' || body === null) {
    throw new AppError(400, 'Invalid JSON');
  }
  return body;
};
