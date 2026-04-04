import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { requireAdmin } from '../middlewares/adminMiddleware';
import { requireAuth } from '../middlewares/authMiddleware';

export const productRoutes = (): Router => {
  const router = Router();
  const controller = new ProductController();
  router.use(requireAuth);
  router.get('/', controller.get);
  router.get('/:id', controller.getById);
  router.post('/', requireAdmin, controller.post);
  router.put('/:id', requireAdmin, controller.put);
  router.delete('/:id', requireAdmin, controller.delete);
  return router;
};
