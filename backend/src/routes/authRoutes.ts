import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middlewares/authMiddleware';

export const authRoutes = (): Router => {
  const router = Router();
  const controller = new AuthController();
  router.get('/status', requireAuth, controller.get);
  router.post('/register', controller.postRegister);
  router.post('/login', controller.postLogin);
  router.post('/forgot-password', controller.postForgotPassword);
  router.put('/password', requireAuth, controller.put);
  router.delete('/logout', requireAuth, controller.delete);
  return router;
};
