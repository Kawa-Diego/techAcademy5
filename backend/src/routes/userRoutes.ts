import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { requireAdmin } from '../middlewares/adminMiddleware';
import { requireAuth } from '../middlewares/authMiddleware';

export const userRoutes = (): Router => {
  const router = Router();
  const controller = new UserController();
  router.get('/me', requireAuth, controller.findAll);
  router.patch('/me', requireAuth, controller.update);
  router.put('/me', requireAuth, controller.update);
  router.delete('/me', requireAuth, controller.delete);
  router.get('/carts', requireAuth, requireAdmin, controller.listCarts);
  router.get('/', requireAuth, requireAdmin, controller.get);
  router.get('/:id/cart', requireAuth, requireAdmin, controller.getUserCart);
  router.post('/:id/messages', requireAuth, requireAdmin, controller.postUserMessage);
  router.get('/:id', requireAuth, requireAdmin, controller.getById);
  router.put('/:id', requireAuth, requireAdmin, controller.put);
  router.delete('/:id', requireAuth, requireAdmin, controller.deleteById);
  return router;
};
