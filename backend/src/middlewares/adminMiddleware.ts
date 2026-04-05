import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.authRole !== 'ADMIN') {
    next(new AppError(403, 'Administrators only'));
    return;
  }
  next();
};
