import type { Response } from 'express';
import type { UserRole } from '@ecommerce/shared';
import { OrderService } from '../services/OrderService';
import { asyncRoute } from '../utils/asyncRoute';
import { getJsonBody } from '../utils/httpBody';
import { parsePagination } from '../utils/pagination';
import {
  parseCustomerOrderBody,
  parseOrderBody,
  parseOrderUpdateBody,
  parseRefundRequestBody,
} from '../validators/parseOrder';

export class OrderController {
  private readonly orders = new OrderService();

  public readonly getSummary = asyncRoute(async (req, res) => {
    const uid = req.authUserId;
    const role = req.authRole;
    if (uid === undefined || role === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await this.orders.listSummary(uid, role as UserRole);
    this.ok(res, result);
  });

  public readonly get = asyncRoute(async (req, res) => {
    const uid = req.authUserId;
    const role = req.authRole;
    if (uid === undefined || role === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const q = parsePagination(req.query as Record<string, string | undefined>);
    const result = await this.orders.list(q, role as UserRole, uid);
    this.ok(res, result);
  });

  public readonly getById = asyncRoute(async (req, res) => {
    const uid = req.authUserId;
    const role = req.authRole;
    if (uid === undefined || role === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const row = await this.orders.getById(
      req.params['id'] ?? '',
      role as UserRole,
      uid
    );
    this.ok(res, row);
  });

  public readonly post = asyncRoute(async (req, res) => {
    const uid = req.authUserId;
    const role = req.authRole;
    if (uid === undefined || role === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (role === 'USER') {
      const body = parseCustomerOrderBody(getJsonBody(req));
      const row = await this.orders.createCustomer(body, uid);
      this.created(res, row);
      return;
    }
    const body = parseOrderBody(getJsonBody(req));
    const row = await this.orders.create(body, uid);
    this.created(res, row);
  });

  public readonly postRefundRequest = asyncRoute(async (req, res) => {
    const uid = req.authUserId;
    if (uid === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    parseRefundRequestBody(getJsonBody(req));
    const orderId = req.params['orderId'] ?? '';
    const itemId = req.params['itemId'] ?? '';
    const row = await this.orders.requestRefund(orderId, itemId, uid);
    this.ok(res, row);
  });

  public readonly postRefundConfirm = asyncRoute(async (req, res) => {
    const uid = req.authUserId;
    if (uid === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const orderId = req.params['orderId'] ?? '';
    const itemId = req.params['itemId'] ?? '';
    const row = await this.orders.confirmRefund(orderId, itemId, uid);
    this.ok(res, row);
  });

  public readonly put = asyncRoute(async (req, res) => {
    const body = parseOrderUpdateBody(getJsonBody(req));
    const row = await this.orders.update(
      req.params['id'] ?? '',
      body,
      req.authUserId ?? null
    );
    this.ok(res, row);
  });

  public readonly delete = asyncRoute(async (req, res) => {
    await this.orders.delete(
      req.params['id'] ?? '',
      req.authUserId ?? null
    );
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
