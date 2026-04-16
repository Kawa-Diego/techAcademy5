import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import type { UserRole } from '@ecommerce/shared';

type RowUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  cpf: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

type RowCategory = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

type RowProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  model3dUrl: string;
  imageUrls: string[];
  stockQuantity: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

type RowOrder = {
  id: string;
  status: string;
  notes: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type RowOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  refundRequestedAt: Date | null;
  refundConfirmedAt: Date | null;
};

type RowAuditLog = {
  id: string;
  userId: string | null;
  action: string;
  details: Prisma.JsonValue;
  createdAt: Date;
};

type Store = {
  users: RowUser[];
  categories: RowCategory[];
  products: RowProduct[];
  orders: RowOrder[];
  orderItems: RowOrderItem[];
  auditLogs: RowAuditLog[];
};

const ts = (): Date => new Date();

const emptyStore = (): Store => ({
  users: [],
  categories: [],
  products: [],
  orders: [],
  orderItems: [],
  auditLogs: [],
});

let store: Store = emptyStore();

/** Zera dados mockados entre suítes de teste. */
export const resetInMemoryPrisma = (): void => {
  store = emptyStore();
};

const sortDescCreated = <T extends { createdAt: Date }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

const sortAscName = <T extends { name: string }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

export type InMemoryPrismaClient = {
  $disconnect: () => Promise<void>;
  $transaction: <T>(
    arg: Promise<T>[] | ((tx: InMemoryPrismaClient) => Promise<T>)
  ) => Promise<T | T[]>;
  user: Record<string, (...args: unknown[]) => Promise<unknown>>;
  category: Record<string, (...args: unknown[]) => Promise<unknown>>;
  product: Record<string, (...args: unknown[]) => Promise<unknown>>;
  order: Record<string, (...args: unknown[]) => Promise<unknown>>;
  orderItem: Record<string, (...args: unknown[]) => Promise<unknown>>;
  auditLog: Record<string, (...args: unknown[]) => Promise<unknown>>;
};

function createClient(): InMemoryPrismaClient {
  const client: InMemoryPrismaClient = {
    $disconnect: async () => Promise.resolve(),
    $transaction: async (arg) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg) as Promise<unknown>;
      }
      return arg(client);
    },
    user: {},
    category: {},
    product: {},
    order: {},
    orderItem: {},
    auditLog: {},
  };

  client.user = {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const row: RowUser = {
        id: randomUUID(),
        name: String(data['name']),
        email: String(data['email']).trim(),
        passwordHash: String(data['passwordHash']),
        cpf: String(data['cpf']),
        role: (data['role'] as UserRole | undefined) ?? 'USER',
        createdAt: ts(),
        updatedAt: ts(),
      };
      store.users.push(row);
      return { ...row };
    },
    findUnique: async ({ where }: { where: Record<string, string> }) => {
      const u = store.users.find((r) => {
        if ('id' in where) return r.id === where['id'];
        if ('email' in where) return r.email === String(where['email']).trim();
        if ('cpf' in where) return r.cpf === where['cpf'];
        return false;
      });
      return u !== undefined ? { ...u } : null;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => {
      const idx = store.users.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('User not found');
      const cur = store.users[idx];
      if (cur === undefined) throw new Error('User not found');
      const next: RowUser = {
        ...cur,
        ...data,
        role: (data['role'] as UserRole | undefined) ?? cur.role,
        updatedAt: ts(),
      };
      store.users[idx] = next;
      return { ...next };
    },
    findMany: async (args: {
      skip?: number;
      take?: number;
      orderBy?: { createdAt?: 'desc' | 'asc' };
      where?: {
        OR?: ReadonlyArray<{
          name?: { contains: string; mode?: string };
          email?: { contains: string; mode?: string };
        }>;
      };
    }) => {
      let rows =
        args.orderBy?.createdAt === 'asc'
          ? [...store.users].sort(
              (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            )
          : sortDescCreated(store.users);
      if (args.where?.OR !== undefined) {
        rows = rows.filter((u) =>
          args.where!.OR!.some((clause) => {
            const n = clause.name?.contains?.toLowerCase() ?? '';
            const e = clause.email?.contains?.toLowerCase() ?? '';
            if (n.length > 0 && u.name.toLowerCase().includes(n)) return true;
            if (e.length > 0 && u.email.toLowerCase().includes(e)) return true;
            return false;
          })
        );
      }
      const skip = args.skip ?? 0;
      const take = args.take ?? rows.length;
      return rows.slice(skip, skip + take).map((r) => ({ ...r }));
    },
    count: async (args?: {
      where?: {
        OR?: ReadonlyArray<{
          name?: { contains: string; mode?: string };
          email?: { contains: string; mode?: string };
        }>;
      };
    }) => {
      if (args?.where?.OR !== undefined) {
        return store.users.filter((u) =>
          args.where!.OR!.some((clause) => {
            const n = clause.name?.contains?.toLowerCase() ?? '';
            const e = clause.email?.contains?.toLowerCase() ?? '';
            if (n.length > 0 && u.name.toLowerCase().includes(n)) return true;
            if (e.length > 0 && u.email.toLowerCase().includes(e)) return true;
            return false;
          })
        ).length;
      }
      return store.users.length;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = store.users.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('User not found');
      const [removed] = store.users.splice(idx, 1);
      if (removed === undefined) throw new Error('User not found');
      for (const o of store.orders) {
        if (o.userId === where.id) o.userId = null;
      }
      for (const a of store.auditLogs) {
        if (a.userId === where.id) a.userId = null;
      }
      return { ...removed };
    },
    deleteMany: async () => {
      const n = store.users.length;
      store.users = [];
      return { count: n };
    },
  };

  client.category = {
    create: async ({ data }: { data: { name: string; description: string } }) => {
      const row: RowCategory = {
        id: randomUUID(),
        name: data.name,
        description: data.description,
        createdAt: ts(),
        updatedAt: ts(),
      };
      store.categories.push(row);
      return { ...row };
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      const c = store.categories.find((r) => r.id === where.id);
      return c !== undefined ? { ...c } : null;
    },
    findMany: async (args: {
      skip?: number;
      take?: number;
      orderBy?: { name?: 'asc'; createdAt?: 'desc' };
    }) => {
      let rows =
        args.orderBy?.name === 'asc'
          ? sortAscName(store.categories)
          : sortDescCreated(store.categories);
      const skip = args.skip ?? 0;
      const take = args.take ?? rows.length;
      return rows.slice(skip, skip + take).map((r) => ({ ...r }));
    },
    count: async (opts?: { where?: { categoryId?: string } }) => {
      if (opts?.where?.categoryId !== undefined) {
        return store.products.filter(
          (p) => p.categoryId === opts.where?.categoryId
        ).length;
      }
      return store.categories.length;
    },
    update: async () => {
      throw new Error('category.update not implemented in mock');
    },
    delete: async () => {
      throw new Error('category.delete not implemented in mock');
    },
    deleteMany: async () => {
      const n = store.categories.length;
      store.categories = [];
      return { count: n };
    },
  };

  client.product = {
    create: async ({
      data,
    }: {
      data: {
        name: string;
        description: string;
        priceCents: number;
        model3dUrl: string;
        imageUrls: string[];
        categoryId: string;
        stockQuantity: number;
      };
    }) => {
      const row: RowProduct = {
        id: randomUUID(),
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        model3dUrl: data.model3dUrl,
        imageUrls: [...data.imageUrls],
        stockQuantity: data.stockQuantity,
        categoryId: data.categoryId,
        createdAt: ts(),
        updatedAt: ts(),
      };
      store.products.push(row);
      return { ...row };
    },
    findUnique: async (args: {
      where: { id: string };
      include?: { category: { select: { name: boolean } } };
    }) => {
      const p = store.products.find((r) => r.id === args.where.id);
      if (p === undefined) return null;
      const base = { ...p };
      if (args.include?.category !== undefined) {
        const cat = store.categories.find((c) => c.id === p.categoryId);
        return { ...base, category: { name: cat?.name ?? '?' } };
      }
      return base;
    },
    findMany: async (args: {
      where?: { categoryId?: string };
      skip?: number;
      take?: number;
      orderBy?: { createdAt?: 'desc' };
      include?: { category: { select: { name: boolean } } };
    }) => {
      let rows = store.products.filter((p) =>
        args.where?.categoryId !== undefined
          ? p.categoryId === args.where.categoryId
          : true
      );
      rows = sortDescCreated(rows);
      const skip = args.skip ?? 0;
      const take = args.take ?? rows.length;
      const slice = rows.slice(skip, skip + take);
      if (args.include?.category !== undefined) {
        return slice.map((p) => {
          const cat = store.categories.find((c) => c.id === p.categoryId);
          return { ...p, category: { name: cat?.name ?? '?' } };
        });
      }
      return slice.map((p) => ({ ...p }));
    },
    count: async (opts?: { where?: { categoryId?: string } }) => {
      if (opts?.where?.categoryId !== undefined) {
        return store.products.filter(
          (p) => p.categoryId === opts.where?.categoryId
        ).length;
      }
      return store.products.length;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => {
      const idx = store.products.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('Product not found');
      const cur = store.products[idx];
      if (cur === undefined) throw new Error('Product not found');
      let stock = cur.stockQuantity;
      const sq = data['stockQuantity'];
      if (typeof sq === 'object' && sq !== null) {
        const o = sq as { decrement?: number; increment?: number };
        if (o.decrement !== undefined) stock -= o.decrement;
        if (o.increment !== undefined) stock += o.increment;
      } else if (typeof sq === 'number') {
        stock = sq;
      }
      const next: RowProduct = {
        ...cur,
        stockQuantity: stock,
        updatedAt: ts(),
        ...(data['name'] !== undefined ? { name: String(data['name']) } : {}),
        ...(data['description'] !== undefined
          ? { description: String(data['description']) }
          : {}),
        ...(data['priceCents'] !== undefined
          ? { priceCents: Number(data['priceCents']) }
          : {}),
        ...(data['model3dUrl'] !== undefined
          ? { model3dUrl: String(data['model3dUrl']) }
          : {}),
        ...(data['categoryId'] !== undefined
          ? { categoryId: String(data['categoryId']) }
          : {}),
      };
      const imgSet = data['imageUrls'] as { set?: string[] } | undefined;
      if (imgSet?.set !== undefined) {
        next.imageUrls = [...imgSet.set];
      }
      store.products[idx] = next;
      return { ...next };
    },
    delete: async () => {
      throw new Error('product.delete not implemented in mock');
    },
    deleteMany: async () => {
      const n = store.products.length;
      store.products = [];
      return { count: n };
    },
  };

  client.order = {
    create: async ({
      data,
    }: {
      data: {
        status: string;
        notes: string;
        userId: string | null;
      };
    }) => {
      const row: RowOrder = {
        id: randomUUID(),
        status: data.status,
        notes: data.notes,
        userId: data.userId,
        createdAt: ts(),
        updatedAt: ts(),
      };
      store.orders.push(row);
      return { ...row };
    },
    findUnique: async (args: {
      where: { id: string };
      include?: {
        user?: { select: { id: boolean; name: boolean; email: boolean } };
      };
    }) => {
      const o = store.orders.find((r) => r.id === args.where.id);
      if (o === undefined) return null;
      const base = { ...o };
      if (args.include?.user !== undefined) {
        const u =
          o.userId === null
            ? null
            : store.users.find((x) => x.id === o.userId);
        return {
          ...base,
          user:
            u !== undefined
              ? { id: u.id, name: u.name, email: u.email }
              : null,
        };
      }
      return base;
    },
    findMany: async (args: {
      where?: { userId?: string };
      skip?: number;
      take?: number;
      orderBy?: { createdAt?: 'desc' };
      include?: {
        user?: { select: { id: boolean; name: boolean; email: boolean } };
        items?: {
          include?: { product?: { select: { id: boolean; name: boolean } } };
        };
      };
    }) => {
      let rows = store.orders.filter((o) =>
        args.where?.userId !== undefined
          ? o.userId === args.where.userId
          : true
      );
      rows = sortDescCreated(rows);
      const skip = args.skip ?? 0;
      const take = args.take ?? rows.length;
      return rows.slice(skip, skip + take).map((o) => {
        let out: Record<string, unknown> = { ...o };
        if (args.include?.user !== undefined) {
          const u =
            o.userId === null
              ? null
              : store.users.find((x) => x.id === o.userId);
          out = {
            ...out,
            user:
              u !== undefined
                ? { id: u.id, name: u.name, email: u.email }
                : null,
          };
        }
        if (args.include?.items?.include?.product !== undefined) {
          const items = store.orderItems
            .filter((it) => it.orderId === o.id)
            .map((it) => {
              const pr = store.products.find((p) => p.id === it.productId);
              return {
                ...it,
                product: {
                  id: pr?.id ?? it.productId,
                  name: pr?.name ?? '?',
                },
              };
            });
          out = { ...out, items };
        }
        return out;
      });
    },
    count: async (opts?: { where?: { userId?: string } }) =>
      store.orders.filter((o) =>
        opts?.where?.userId !== undefined
          ? o.userId === opts.where.userId
          : true
      ).length,
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: { status?: string; notes?: string };
    }) => {
      const idx = store.orders.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('Order not found');
      const cur = store.orders[idx];
      if (cur === undefined) throw new Error('Order not found');
      const next: RowOrder = { ...cur, ...data, updatedAt: ts() };
      store.orders[idx] = next;
      return { ...next };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = store.orders.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('Order not found');
      const [removed] = store.orders.splice(idx, 1);
      if (removed === undefined) throw new Error('Order not found');
      store.orderItems = store.orderItems.filter((it) => it.orderId !== where.id);
      return { ...removed };
    },
    deleteMany: async () => {
      const n = store.orders.length;
      store.orders = [];
      store.orderItems = [];
      return { count: n };
    },
  };

  client.orderItem = {
    create: async ({
      data,
    }: {
      data: {
        orderId: string;
        productId: string;
        quantity: number;
        unitPriceCents: number;
      };
    }) => {
      const row: RowOrderItem = {
        id: randomUUID(),
        orderId: data.orderId,
        productId: data.productId,
        quantity: data.quantity,
        unitPriceCents: data.unitPriceCents,
        refundRequestedAt: null,
        refundConfirmedAt: null,
      };
      store.orderItems.push(row);
      return { ...row };
    },
    findMany: async (args: {
      where: { orderId: string };
      include?: { product: { select: { name: boolean } } };
    }) => {
      const items = store.orderItems.filter(
        (it) => it.orderId === args.where.orderId
      );
      if (args.include?.product !== undefined) {
        return items.map((it) => {
          const pr = store.products.find((p) => p.id === it.productId);
          return { ...it, product: { name: pr?.name ?? '?' } };
        });
      }
      return items.map((it) => ({ ...it }));
    },
    findFirst: async (args: { where: { id?: string; orderId?: string } }) => {
      const it = store.orderItems.find((r) => {
        if (args.where.id !== undefined && r.id !== args.where.id) return false;
        if (
          args.where.orderId !== undefined &&
          r.orderId !== args.where.orderId
        ) {
          return false;
        }
        return true;
      });
      return it !== undefined ? { ...it } : null;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: { refundRequestedAt?: Date | null; refundConfirmedAt?: Date | null };
    }) => {
      const idx = store.orderItems.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('OrderItem not found');
      const cur = store.orderItems[idx];
      if (cur === undefined) throw new Error('OrderItem not found');
      const next = { ...cur, ...data };
      store.orderItems[idx] = next;
      return { ...next };
    },
    deleteMany: async (args?: { where?: { orderId?: string } }) => {
      if (args?.where?.orderId !== undefined) {
        const before = store.orderItems.length;
        store.orderItems = store.orderItems.filter(
          (it) => it.orderId !== args.where?.orderId
        );
        return { count: before - store.orderItems.length };
      }
      const n = store.orderItems.length;
      store.orderItems = [];
      return { count: n };
    },
  };

  client.auditLog = {
    create: async ({
      data,
    }: {
      data: {
        userId: string | null;
        action: string;
        details?: Prisma.InputJsonValue;
      };
    }) => {
      const row: RowAuditLog = {
        id: randomUUID(),
        userId: data.userId,
        action: data.action,
        details: data.details ?? null,
        createdAt: ts(),
      };
      store.auditLogs.push(row);
      return { ...row };
    },
  };

  return client;
}

export const prisma = createClient();
