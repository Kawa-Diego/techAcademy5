import type { Response } from 'express';
import { ProductService } from '../services/ProductService';
import { asyncRoute } from '../utils/asyncRoute';
import { getJsonBody } from '../utils/httpBody';
import { parsePagination } from '../utils/pagination';
import {
  parseProductBody,
  parseProductUpdateBody,
} from '../validators/parseProduct';

export class ProductController {
  private readonly products = new ProductService();

  public readonly get = asyncRoute(async (req, res) => {
    const q = parsePagination(req.query as Record<string, string | undefined>);
    const result = await this.products.list(q);
    this.ok(res, result);
  });

  public readonly getById = asyncRoute(async (req, res) => {
    const row = await this.products.getById(req.params['id'] ?? '');
    this.ok(res, row);
  });

  public readonly post = asyncRoute(async (req, res) => {
    const body = parseProductBody(getJsonBody(req));
    const row = await this.products.create(body);
    this.created(res, row);
  });

  public readonly put = asyncRoute(async (req, res) => {
    const body = parseProductUpdateBody(getJsonBody(req));
    const row = await this.products.update(req.params['id'] ?? '', body);
    this.ok(res, row);
  });

  public readonly delete = asyncRoute(async (req, res) => {
    await this.products.delete(req.params['id'] ?? '');
    this.noContent(res);
  });

  private ok(res: Response, data: object): void {
    res.status(200).json(data);
  }

  private created(res: Response, data: object): void {
    res.status(201).json(data);
  }

  private noContent(res: Response): void {
    res.status(204).send();
  }
}
