import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireCustomer } from '../middlewares/customerMiddleware';

export const cartRoutes = (): Router => {
  const router = Router();
  const controller = new CartController();
  router.use(requireAuth);
  router.use(requireCustomer);
  router.get('/', controller.get);
  router.post('/items', controller.postItem);
  router.delete('/items/:productId', controller.deleteItem);
  router.post('/checkout', controller.postCheckout);
  return router;
};
