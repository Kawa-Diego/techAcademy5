import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authRoutes } from './routes/authRoutes';
import { categoryRoutes } from './routes/categoryRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { productRoutes } from './routes/productRoutes';
import { publicRoutes } from './routes/publicRoutes';
import { siteRoutes } from './routes/siteRoutes';
import { uploadRoutes } from './routes/uploadRoutes';
import { userRoutes } from './routes/userRoutes';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'))
  );
  app.use('/public', publicRoutes());
  app.use('/upload', uploadRoutes());
  app.use('/site', siteRoutes());
  app.use('/auth', authRoutes());
  app.use('/users', userRoutes());
  app.use('/categories', categoryRoutes());
  app.use('/products', productRoutes());
  app.use('/orders', orderRoutes());
  app.use(errorMiddleware);
  return app;
};
