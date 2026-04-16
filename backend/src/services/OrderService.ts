import type { Order as DbOrder, OrderItem as DbOrderItem } from '@prisma/client';
import type {
  CreateOrderPayload,
  CustomerCreateOrderPayload,
  Order,
  OrdersSummaryResponse,
  OrderUserSummary,
  PaginatedResult,
  PaginationQuery,
  UpdateOrderPayload,
  UserRole,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { prisma } from '../lib/prisma';
import {
  allOrderLinesRefundConfirmed,
  canMutateOrder,
  hasRefundActivity,
} from '../domain/orderStateMachine';
import { toOrder } from '../mappers/orderMapper';
import { OrderModel } from '../models/OrderModel';
import { buildPaginated } from '../utils/paginated';
import { writeAuditLog } from './auditLogService';

type ResolvedItem = {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
};

export class OrderService {
  private readonly orders = new OrderModel();

  public async list(
    pagination: PaginationQuery,
    role: UserRole,
    authUserId: string
  ): Promise<PaginatedResult<Order>> {
    const where = role === 'ADMIN' ? {} : { userId: authUserId };
    const skip = (pagination.page - 1) * pagination.pageSize;
    const [rows, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    const data: Order[] = [];
    for (const row of rows) {
      const items = await this.orders.findItems(row.id);
      data.push(
        toOrder(row, items, {
          userId: row.userId,
          userName: row.user?.name ?? null,
          userEmail: row.user?.email ?? null,
        })
      );
    }
    return buildPaginated(data, total, pagination.page, pagination.pageSize);
  }

  public async getById(
    id: string,
    role: UserRole,
    authUserId: string
  ): Promise<Order> {
    const row = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (row === null) throw new AppError(404, 'Order not found');
    if (role !== 'ADMIN' && row.userId !== authUserId) {
      throw new AppError(403, 'Access denied');
    }
    const items = await this.orders.findItems(id);
    return toOrder(row, items, {
      userId: row.userId,
      userName: row.user?.name ?? null,
      userEmail: row.user?.email ?? null,
    });
  }

  public async create(
    body: CreateOrderPayload,
    userId: string
  ): Promise<Order> {
    return this.placeOrderWithStock({
      status: body.status,
      notes: body.notes,
      items: body.items,
      orderUserId: userId,
      auditAction: 'ORDER_CREATED_ADMIN',
      auditDetails: { status: body.status, itemCount: body.items.length },
      actingUserId: userId,
    });
  }

  public async createCustomer(
    body: CustomerCreateOrderPayload,
    userId: string
  ): Promise<Order> {
    return this.placeOrderWithStock({
      status: 'PENDING',
      notes: body.notes ?? '',
      items: body.items,
      orderUserId: userId,
      auditAction: 'ORDER_PLACED_CUSTOMER',
      auditDetails: { itemCount: body.items.length },
      actingUserId: userId,
    });
  }

  /** Creates order from DB cart lines, decrements stock, clears cart (single transaction). */
  public async checkoutFromCart(
    userId: string,
    notes: string
  ): Promise<Order> {
    const bundle = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
      if (cart === null || cart.items.length === 0) {
        throw new AppError(400, 'Cart is empty');
      }

      const resolved: ResolvedItem[] = [];
      for (const line of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
        });
        if (product === null) throw new AppError(404, 'Product not found');
        if (product.stockQuantity < line.quantity) {
          throw new AppError(400, 'Product out of stock');
        }
        resolved.push({
          productId: product.id,
          quantity: line.quantity,
          unitPriceCents: product.priceCents,
        });
      }

      const order = await tx.order.create({
        data: {
          status: 'PENDING',
          notes,
          userId,
        },
      });

      for (const r of resolved) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: r.productId,
            quantity: r.quantity,
            unitPriceCents: r.unitPriceCents,
          },
        });
        await tx.product.update({
          where: { id: r.productId },
          data: { stockQuantity: { decrement: r.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      const actor = await tx.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: 'ORDER_FROM_CART',
          details: {
            orderId: order.id,
            itemCount: resolved.length,
            actorEmail: actor?.email ?? null,
          },
        },
      });

      return { order };
    });

    const itemsWithProduct = await this.orders.findItems(bundle.order.id);
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    return toOrder(bundle.order, itemsWithProduct, {
      userId: bundle.order.userId,
      userName: u?.name ?? null,
      userEmail: u?.email ?? null,
    });
  }

  private async placeOrderWithStock(params: {
    readonly status: string;
    readonly notes: string;
    readonly items: readonly { productId: string; quantity: number }[];
    readonly orderUserId: string;
    readonly auditAction: string;
    readonly auditDetails: Readonly<
      Record<string, string | number | boolean | null>
    >;
    readonly actingUserId: string;
  }): Promise<Order> {
    const bundle = await prisma.$transaction(async (tx) => {
      const resolved: ResolvedItem[] = [];
      for (const item of params.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (product === null) throw new AppError(404, 'Product not found');
        if (product.stockQuantity < item.quantity) {
          throw new AppError(400, 'Product out of stock');
        }
        resolved.push({
          productId: product.id,
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
        });
      }

      const order = await tx.order.create({
        data: {
          status: params.status,
          notes: params.notes,
          userId: params.orderUserId,
        },
      });

      for (const r of resolved) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: r.productId,
            quantity: r.quantity,
            unitPriceCents: r.unitPriceCents,
          },
        });
        await tx.product.update({
          where: { id: r.productId },
          data: { stockQuantity: { decrement: r.quantity } },
        });
      }

      const actor = await tx.user.findUnique({
        where: { id: params.actingUserId },
        select: { email: true },
      });
      await tx.auditLog.create({
        data: {
          userId: params.actingUserId,
          action: params.auditAction,
          details: {
            ...params.auditDetails,
            orderId: order.id,
            actorEmail: actor?.email ?? null,
          },
        },
      });

      return { order };
    });

    const itemsWithProduct = await this.orders.findItems(bundle.order.id);
    const u = await prisma.user.findUnique({
      where: { id: params.orderUserId },
      select: { id: true, name: true, email: true },
    });
    return toOrder(bundle.order, itemsWithProduct, {
      userId: bundle.order.userId,
      userName: u?.name ?? null,
      userEmail: u?.email ?? null,
    });
  }

  public async listSummary(
    authUserId: string,
    role: UserRole
  ): Promise<OrdersSummaryResponse> {
    if (role === 'ADMIN') {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { entries: this.aggregateOrdersByUser(orders) };
    }

    const orders = await prisma.order.findMany({
      where: { userId: authUserId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length === 0) {
      const u = await prisma.user.findUnique({
        where: { id: authUserId },
        select: { id: true, name: true, email: true },
      });
      if (u === null) return { entries: [] };
      return {
        entries: [
          {
            userId: u.id,
            userName: u.name,
            userEmail: u.email,
            orderCount: 0,
            products: [],
          },
        ],
      };
    }

    return { entries: this.aggregateOrdersByUser(orders) };
  }

  private aggregateOrdersByUser(
    orders: Array<{
      userId: string | null;
      user: { id: string; name: string; email: string } | null;
      items: Array<{
        product: { id: string; name: string };
        quantity: number;
      }>;
    }>
  ): OrderUserSummary[] {
    const map = new Map<string | null, Array<(typeof orders)[number]>>();
    for (const o of orders) {
      const k = o.userId;
      const arr = map.get(k) ?? [];
      arr.push(o);
      map.set(k, arr);
    }

    const entries: OrderUserSummary[] = [];
    for (const [userId, userOrders] of map) {
      const productMap = new Map<string, { name: string; qty: number }>();
      for (const ord of userOrders) {
        for (const it of ord.items) {
          const cur = productMap.get(it.product.id) ?? {
            name: it.product.name,
            qty: 0,
          };
          cur.qty += it.quantity;
          productMap.set(it.product.id, cur);
        }
      }

      const first = userOrders[0];
      const user = first.user;
      const orderCount = userOrders.length;

      entries.push({
        userId,
        userName:
          userId === null
            ? 'Orders with no linked user'
            : (user?.name ?? 'User'),
        userEmail: user?.email ?? null,
        orderCount,
        products: [...productMap.entries()]
          .map(([productId, v]) => ({
            productId,
            productName: v.name,
            totalQuantity: v.qty,
          }))
          .sort((a, b) =>
            a.productName.localeCompare(b.productName, 'en')
          ),
      });
    }

    entries.sort((a, b) => {
      if (a.userId === null) return 1;
      if (b.userId === null) return -1;
      return a.userName.localeCompare(b.userName, 'en');
    });

    return entries;
  }

  public async update(
    id: string,
    body: UpdateOrderPayload,
    actingUserId: string | null
  ): Promise<Order> {
    const existing = await this.requireOrder(id);
    if (!canMutateOrder(existing.status)) {
      throw new AppError(400, 'Order cannot be edited in its current status');
    }
    const oldItems = await this.orders.findItems(id);
    if (hasRefundActivity(oldItems)) {
      throw new AppError(
        400,
        'Cannot edit order with refund activity; use refund flows instead'
      );
    }
    const bundle = await prisma.$transaction(async (tx) => {
      for (const oi of oldItems) {
        await tx.product.update({
          where: { id: oi.productId },
          data: { stockQuantity: { increment: oi.quantity } },
        });
      }

      const resolved: ResolvedItem[] = [];
      for (const item of body.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (product === null) throw new AppError(404, 'Product not found');
        if (product.stockQuantity < item.quantity) {
          throw new AppError(400, 'Product out of stock');
        }
        resolved.push({
          productId: product.id,
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
        });
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } });
      const order = await tx.order.update({
        where: { id },
        data: { status: body.status, notes: body.notes },
      });

      const newItems: DbOrderItem[] = [];
      for (const r of resolved) {
        const line = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: r.productId,
            quantity: r.quantity,
            unitPriceCents: r.unitPriceCents,
          },
        });
        newItems.push(line);
        await tx.product.update({
          where: { id: r.productId },
          data: { stockQuantity: { decrement: r.quantity } },
        });
      }

      return { order, items: newItems };
    });

    const actor =
      actingUserId !== null
        ? await prisma.user.findUnique({
            where: { id: actingUserId },
            select: { email: true },
          })
        : null;
    await writeAuditLog(actingUserId, 'ORDER_UPDATED_ADMIN', {
      orderId: id,
      status: body.status,
      actorEmail: actor?.email ?? null,
    });

    const fresh = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (fresh === null) throw new AppError(404, 'Order not found');
    const itemsWithProduct = await this.orders.findItems(id);
    return toOrder(fresh, itemsWithProduct, {
      userId: fresh.userId,
      userName: fresh.user?.name ?? null,
      userEmail: fresh.user?.email ?? null,
    });
  }

  public async delete(
    id: string,
    actingUserId: string | null
  ): Promise<void> {
    const order = await this.requireOrder(id);
    if (!canMutateOrder(order.status)) {
      throw new AppError(400, 'Order cannot be deleted in its current status');
    }
    const items = await this.orders.findItems(id);
    if (hasRefundActivity(items)) {
      throw new AppError(
        400,
        'Cannot delete order with refund activity; resolve refunds first'
      );
    }
    const ownerRow = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    const actor =
      actingUserId !== null
        ? await prisma.user.findUnique({
            where: { id: actingUserId },
            select: { email: true },
          })
        : null;
    await prisma.$transaction(async (tx) => {
      for (const oi of items) {
        await tx.product.update({
          where: { id: oi.productId },
          data: { stockQuantity: { increment: oi.quantity } },
        });
      }
      await tx.order.delete({ where: { id } });
    });
    await writeAuditLog(actingUserId, 'ORDER_DELETED', {
      orderId: id,
      ownerEmail: ownerRow?.user?.email ?? null,
      actorEmail: actor?.email ?? null,
    });
  }

  public async requestRefund(
    orderId: string,
    itemId: string,
    userId: string
  ): Promise<Order> {
    const row = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (row === null) throw new AppError(404, 'Order not found');
    if (row.userId !== userId) throw new AppError(403, 'Access denied');

    const item = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (item === null) throw new AppError(404, 'Item not found');
    if (item.refundConfirmedAt !== null) {
      throw new AppError(400, 'Refund already confirmed for this item');
    }
    if (item.refundRequestedAt !== null) {
      throw new AppError(400, 'Refund already requested for this item');
    }

    await prisma.orderItem.update({
      where: { id: itemId },
      data: { refundRequestedAt: new Date() },
    });

    await writeAuditLog(userId, 'REFUND_REQUESTED', {
      orderId,
      orderItemId: itemId,
      productId: item.productId,
      customerEmail: row.user?.email ?? null,
    });

    const items = await this.orders.findItems(orderId);
    return toOrder(row, items, {
      userId: row.userId,
      userName: row.user?.name ?? null,
      userEmail: row.user?.email ?? null,
    });
  }

  public async confirmRefund(
    orderId: string,
    itemId: string,
    adminUserId: string
  ): Promise<Order> {
    const row = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (row === null) throw new AppError(404, 'Order not found');

    const item = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (item === null) throw new AppError(404, 'Item not found');

    if (item.refundConfirmedAt !== null) {
      const itemsDone = await this.orders.findItems(orderId);
      const freshDone = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
      if (freshDone === null) throw new AppError(404, 'Order not found');
      return toOrder(freshDone, itemsDone, {
        userId: freshDone.userId,
        userName: freshDone.user?.name ?? null,
        userEmail: freshDone.user?.email ?? null,
      });
    }

    if (item.refundRequestedAt === null) {
      throw new AppError(400, 'No refund request for this item');
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: itemId },
        data: { refundConfirmedAt: new Date() },
      });
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });
      const lines = await tx.orderItem.findMany({ where: { orderId } });
      if (allOrderLinesRefundConfirmed(lines)) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'REFUNDED' },
        });
      }
    });

    const adminActor = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });
    await writeAuditLog(adminUserId, 'REFUND_CONFIRMED', {
      orderId,
      orderItemId: itemId,
      productId: item.productId,
      quantity: item.quantity,
      customerEmail: row.user?.email ?? null,
      adminEmail: adminActor?.email ?? null,
    });

    const items = await this.orders.findItems(orderId);
    const fresh = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (fresh === null) throw new AppError(404, 'Order not found');
    return toOrder(fresh, items, {
      userId: fresh.userId,
      userName: fresh.user?.name ?? null,
      userEmail: fresh.user?.email ?? null,
    });
  }

  private async requireOrder(id: string): Promise<DbOrder> {
    const row = await this.orders.findById(id);
    if (!row) throw new AppError(404, 'Order not found');
    return row;
  }
}
