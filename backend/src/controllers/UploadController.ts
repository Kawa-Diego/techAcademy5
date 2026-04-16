import type { Response } from 'express';
import type { Request } from 'express';
import { asyncRoute } from '../utils/asyncRoute';

export class UploadController {
  public readonly postImages = asyncRoute(async (req: Request, res: Response) => {
    const files = req.files;
    if (!Array.isArray(files) || files.length === 0) {
      res.status(400).json({ message: 'Envie ao menos uma imagem' });
      return;
    }
    const urls = files.map((f) => `/uploads/products/${f.filename}`);
    res.status(201).json({ urls });
  });
}
