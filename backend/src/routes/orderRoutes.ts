import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { requireAdmin } from '../middlewares/adminMiddleware';
import { requireAuth } from '../middlewares/authMiddleware';

export const orderRoutes = (): Router => {
  const router = Router();
  const controller = new OrderController();
  router.use(requireAuth);
  router.get('/summary', controller.getSummary);
  router.get('/', controller.get);
  router.post(
    '/:orderId/items/:itemId/refund-request',
    controller.postRefundRequest
  );
  router.post(
    '/:orderId/items/:itemId/refund-confirm',
    requireAdmin,
    controller.postRefundConfirm
  );
  router.get('/:id', controller.getById);
  router.post('/', controller.post);
  router.put('/:id', requireAdmin, controller.put);
  router.delete('/:id', requireAdmin, controller.delete);
  return router;
};
