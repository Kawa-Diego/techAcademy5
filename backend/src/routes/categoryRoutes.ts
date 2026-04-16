import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { requireAdmin } from '../middlewares/adminMiddleware';
import { requireAuth } from '../middlewares/authMiddleware';

export const categoryRoutes = (): Router => {
  const router = Router();
  const controller = new CategoryController();
  router.use(requireAuth);
  router.get('/', requireAdmin, controller.get);
  router.get('/:id', requireAdmin, controller.getById);
  router.post('/', requireAdmin, controller.post);
  router.put('/:id', requireAdmin, controller.put);
  router.delete('/:id', requireAdmin, controller.delete);
  return router;
};
