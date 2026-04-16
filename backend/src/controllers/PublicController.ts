import type { Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { ProductService } from '../services/ProductService';
import { asyncRoute } from '../utils/asyncRoute';
import { parsePagination } from '../utils/pagination';

export class PublicController {
  private readonly products = new ProductService();
  private readonly categories = new CategoryService();

  public readonly listCategories = asyncRoute(async (_req, res: Response) => {
    const data = await this.categories.listAllPublic();
    res.status(200).json({ data });
  });

  public readonly listProducts = asyncRoute(async (req, res: Response) => {
    const q = parsePagination(req.query as Record<string, string | undefined>);
    const raw = req.query['categoria'] ?? req.query['categoryId'];
    const categoryId =
      typeof raw === 'string' && raw.length > 0 ? raw : undefined;
    const result = await this.products.listPublic(q, categoryId);
    res.status(200).json(result);
  });

  public readonly getProduct = asyncRoute(async (req, res: Response) => {
    const row = await this.products.getByIdPublic(req.params['id'] ?? '');
    res.status(200).json(row);
  });
}
