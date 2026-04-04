import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { requireAdmin } from '../middlewares/adminMiddleware';
import { requireAuth } from '../middlewares/authMiddleware';
import { uploadProductImages } from '../utils/uploadProductImages';

export const uploadRoutes = (): Router => {
  const router = Router();
  const controller = new UploadController();
  router.post(
    '/images',
    requireAuth,
    requireAdmin,
    uploadProductImages.array('images', 12),
    controller.postImages
  );
  return router;
};
