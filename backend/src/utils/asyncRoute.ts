import type { NextFunction, Request, Response } from 'express';

export type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncRoute = (fn: AsyncController) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
};
