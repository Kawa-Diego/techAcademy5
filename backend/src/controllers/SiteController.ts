import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { SiteService } from '../services/SiteService';
import { asyncRoute } from '../utils/asyncRoute';
import type { UserRole } from '@ecommerce/shared';

export class SiteController {
  private readonly site = new SiteService();

  public readonly getNavigation = asyncRoute(async (_req, res: Response) => {
    res.status(200).json(this.site.getPublicNavigation());
  });

  public readonly getAppMenu = asyncRoute(async (req: Request, res: Response) => {
    const role = req.authRole;
    if (role === undefined) throw new AppError(401, 'Não autenticado');
    res.status(200).json(this.site.getAppMenu(role as UserRole));
  });
}
