import type { Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { asyncRoute } from '../utils/asyncRoute';
import { getJsonBody } from '../utils/httpBody';
import { parsePagination } from '../utils/pagination';
import {
  parseCategoryBody,
  parseCategoryUpdateBody,
} from '../validators/parseCategory';

export class CategoryController {
  private readonly categories = new CategoryService();

  public readonly get = asyncRoute(async (req, res) => {
    const q = parsePagination(req.query as Record<string, string | undefined>);
    const result = await this.categories.list(q);
    this.ok(res, result);
  });

  public readonly getById = asyncRoute(async (req, res) => {
    const row = await this.categories.getById(req.params['id'] ?? '');
    this.ok(res, row);
  });

  public readonly post = asyncRoute(async (req, res) => {
    const body = parseCategoryBody(getJsonBody(req));
    const row = await this.categories.create(body);
    this.created(res, row);
  });

  public readonly put = asyncRoute(async (req, res) => {
    const body = parseCategoryUpdateBody(getJsonBody(req));
    const row = await this.categories.update(req.params['id'] ?? '', body);
    this.ok(res, row);
  });

  public readonly delete = asyncRoute(async (req, res) => {
    await this.categories.delete(req.params['id'] ?? '');
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
