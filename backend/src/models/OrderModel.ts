import type { Prisma } from '@prisma/client';
import type { Order as DbOrder, OrderItem as DbOrderItem } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { PaginationQuery } from '@ecommerce/shared';

type ItemInput = {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
};

type CreateOrderData = {
  readonly status: string;
  readonly notes: string;
  readonly userId: string | null;
  readonly items: readonly ItemInput[];
};

type UpdateOrderFullData = {
  readonly status: string;
  readonly notes: string;
  readonly items: readonly ItemInput[];
};

const createManyItems = (
  tx: Prisma.TransactionClient,
  orderId: string,
  items: readonly ItemInput[]
): Promise<DbOrderItem[]> => {
  return Promise.all(
    items.map((item) =>
      tx.orderItem.create({
        data: { orderId, ...item },
      })
    )
  );
};

export class OrderModel {
  public async create(data: CreateOrderData): Promise<{
    order: DbOrder;
    items: DbOrderItem[];
  }> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          status: data.status,
          notes: data.notes,
          userId: data.userId,
        },
      });
      const items = await createManyItems(tx, order.id, data.items);
      return { order, items };
    });
  }

  public async findById(id: string): Promise<DbOrder | null> {
    return prisma.order.findUnique({ where: { id } });
  }

  public async findItems(orderId: string): Promise<
    Array<
      DbOrderItem & {
        readonly product: { readonly name: string };
      }
    >
  > {
    return prisma.orderItem.findMany({
      where: { orderId },
      include: { product: { select: { name: true } } },
    });
  }

  public async list(params: PaginationQuery): Promise<{
    rows: DbOrder[];
    total: number;
  }> {
    const skip = (params.page - 1) * params.pageSize;
    const [rows, total] = await prisma.$transaction([
      prisma.order.findMany({
        skip,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
    ]);
    return { rows, total };
  }

  public async delete(id: string): Promise<DbOrder> {
    return prisma.order.delete({ where: { id } });
  }

  public async updateFull(
    id: string,
    data: UpdateOrderFullData
  ): Promise<{ order: DbOrder; items: DbOrderItem[] }> {
    return prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      const order = await tx.order.update({
        where: { id },
        data: { status: data.status, notes: data.notes },
      });
      const items = await createManyItems(tx, order.id, data.items);
      return { order, items };
    });
  }
}
