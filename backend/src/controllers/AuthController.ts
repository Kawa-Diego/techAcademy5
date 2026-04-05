import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { AuthService } from '../services/AuthService';
import { asyncRoute } from '../utils/asyncRoute';
import { getJsonBody } from '../utils/httpBody';
import {
  parseChangePasswordBody,
  parseForgotPasswordBody,
  parseLoginBody,
  parseRegisterBody,
} from '../validators/parseAuth';

const userId = (req: { authUserId?: string }): string => {
  const id = req.authUserId;
  if (!id) throw new AppError(401, 'Not authenticated');
  return id;
};

export class AuthController {
  private readonly auth = new AuthService();

  public readonly get = asyncRoute(async (req: Request, res) => {
    const role = req.authRole;
    if (role === undefined) throw new AppError(401, 'Not authenticated');
    this.ok(res, { ok: true, service: 'auth', role });
  });

  public readonly postRegister = asyncRoute(async (req, res) => {
    const body = parseRegisterBody(getJsonBody(req));
    const created = await this.auth.register(body);
    this.created(res, created);
  });

  public readonly postLogin = asyncRoute(async (req, res) => {
    const body = parseLoginBody(getJsonBody(req));
    const result = await this.auth.login(body);
    this.ok(res, result);
  });

  public readonly postForgotPassword = asyncRoute(async (req, res) => {
    const body = parseForgotPasswordBody(getJsonBody(req));
    await this.auth.resetPasswordByEmail(body.email, body.newPassword);
    this.noContent(res);
  });

  public readonly put = asyncRoute(async (req, res) => {
    const uid = userId(req);
    const body = parseChangePasswordBody(getJsonBody(req));
    await this.auth.changePassword(uid, {
      current: body.currentPassword,
      next: body.newPassword,
    });
    this.noContent(res);
  });

  public readonly delete = asyncRoute(async (_req, res) => {
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
