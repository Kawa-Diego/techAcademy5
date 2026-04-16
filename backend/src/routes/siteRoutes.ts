import { Router } from 'express';
import { SiteController } from '../controllers/SiteController';
import { requireAuth } from '../middlewares/authMiddleware';

export const siteRoutes = (): Router => {
  const router = Router();
  const controller = new SiteController();
  router.get('/navigation', controller.getNavigation);
  router.get('/app-menu', requireAuth, controller.getAppMenu);
  return router;
};
