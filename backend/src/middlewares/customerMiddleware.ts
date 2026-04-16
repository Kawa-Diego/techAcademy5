import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

export const requireCustomer = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.authRole !== 'USER') {
    next(new AppError(403, 'Customer accounts only'));
    return;
  }
  next();
};
