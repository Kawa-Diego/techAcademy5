import type { Response } from 'express';
import { AppError } from '../errors/AppError';
import { UserService } from '../services/UserService';
import { asyncRoute } from '../utils/asyncRoute';
import { getJsonBody } from '../utils/httpBody';
import { parsePagination } from '../utils/pagination';
import { parseUpdateUserBody } from '../validators/parseAuth';

export class UserController {
  private readonly users = new UserService();

  public readonly get = asyncRoute(async (req, res) => {
    const q = parsePagination(req.query as Record<string, string | undefined>);
    const result = await this.users.list(q);
    this.ok(res, result);
  });

  public readonly getById = asyncRoute(async (req, res) => {
    const id = req.params['id'] ?? '';
    const row = await this.users.getByIdAny(id);
    this.ok(res, row);
  });

  public readonly findAll = asyncRoute(async (req, res) => {
    const row = await this.users.getMe(this.userId(req));
    this.ok(res, row);
  });

  public readonly put = asyncRoute(async (req, res) => {
    const id = req.params['id'] ?? '';
    const body = parseUpdateUserBody(getJsonBody(req));
    const row = await this.users.updateAny(id, body);
    this.ok(res, row);
  });

  public readonly update = asyncRoute(async (req, res) => {
    const authId = this.userId(req);
    const body = parseUpdateUserBody(getJsonBody(req));
    const row = await this.users.updateSelf(authId, body);
    this.ok(res, row);
  });

  public readonly delete = asyncRoute(async (req, res) => {
    await this.users.deleteSelf(this.userId(req));
    this.noContent(res);
  });

  public readonly deleteById = asyncRoute(async (req, res) => {
    const id = req.params['id'] ?? '';
    await this.users.deleteAny(id);
    this.noContent(res);
  });

  private userId(req: { authUserId?: string }): string {
    const id = req.authUserId;
    if (!id) throw new AppError(401, 'Não autenticado');
    return id;
  }

  private ok(res: Response, data: object): void {
    res.status(200).json(data);
  }

  private noContent(res: Response): void {
    res.status(204).send();
  }
}
