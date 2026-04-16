import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { ensureUploadsDirs, getUploadsRoot } from '../config/paths';

ensureUploadsDirs();
const dir = path.join(getUploadsRoot(), 'products');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadProductImages = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});
