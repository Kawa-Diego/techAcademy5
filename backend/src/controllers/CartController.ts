import type { Response } from 'express';
import type { Order } from '@ecommerce/shared';
import { CartService } from '../services/CartService';
import { asyncRoute } from '../utils/asyncRoute';
import { getJsonBody } from '../utils/httpBody';
import {
  parseCartCheckoutBody,
  parseCartUpsertBody,
} from '../validators/parseCart';
import { AppError } from '../errors/AppError';

export class CartController {
  private readonly cart = new CartService();

  public readonly get = asyncRoute(async (req, res) => {
    const uid = this.userId(req);
    const row = await this.cart.getMyCart(uid);
    this.ok(res, row);
  });

  public readonly postItem = asyncRoute(async (req, res) => {
    const uid = this.userId(req);
    const body = parseCartUpsertBody(getJsonBody(req));
    const row = await this.cart.upsertItem(uid, body);
    this.ok(res, row);
  });

  public readonly deleteItem = asyncRoute(async (req, res) => {
    const uid = this.userId(req);
    const productId = req.params['productId'] ?? '';
    const row = await this.cart.removeItem(uid, productId);
    this.ok(res, row);
  });

  public readonly postCheckout = asyncRoute(async (req, res) => {
    const uid = this.userId(req);
    const body = parseCartCheckoutBody(getJsonBody(req));
    const notes = body.notes ?? '';
    const order: Order = await this.cart.checkout(uid, notes);
    res.status(201).json(order);
  });

  private userId(req: { authUserId?: string }): string {
    const id = req.authUserId;
    if (!id) throw new AppError(401, 'Not authenticated');
    return id;
  }

  private ok(res: Response, data: object): void {
    res.status(200).json(data);
  }
}
