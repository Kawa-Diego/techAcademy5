import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { verifyUserToken } from '../utils/jwt';

const readBearer = (header: string | undefined): string => {
  if (!header) throw new AppError(401, 'Token ausente');
  const [kind, token] = header.split(' ');
  if (kind !== 'Bearer' || !token) throw new AppError(401, 'Token ausente');
  return token;
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = readBearer(req.headers.authorization);
    const payload = verifyUserToken(token);
    req.authUserId = payload.sub;
    req.authRole = payload.role;
    next();
  } catch {
    next(new AppError(401, 'Não autorizado'));
  }
};
