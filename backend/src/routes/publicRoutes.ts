import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';

export const publicRoutes = (): Router => {
  const router = Router();
  const controller = new PublicController();
  router.get('/categories', controller.listCategories);
  router.get('/products', controller.listProducts);
  router.get('/products/:id', controller.getProduct);
  return router;
};
