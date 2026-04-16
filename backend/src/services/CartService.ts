import type {
  CartItemLine,
  CartResponse,
  CartUpsertItemPayload,
  Order,
  UserCartSummary,
} from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { prisma } from '../lib/prisma';
import { OrderService } from './OrderService';

type CartWithItems = {
  readonly id: string;
  readonly items: ReadonlyArray<{
    readonly quantity: number;
    readonly product: {
      readonly id: string;
      readonly name: string;
      readonly priceCents: number;
      readonly stockQuantity: number;
      readonly imageUrls: readonly string[];
    };
  }>;
};

export class CartService {
  private readonly orders = new OrderService();

  private mapToResponse(cart: CartWithItems | null): CartResponse {
    if (cart === null || cart.items.length === 0) {
      return { items: [], lineCount: 0, itemQuantityTotal: 0 };
    }
    const items: CartItemLine[] = cart.items.map((row) => ({
      productId: row.product.id,
      quantity: row.quantity,
      productName: row.product.name,
      priceCents: row.product.priceCents,
      stockQuantity: row.product.stockQuantity,
      imageUrls: [...row.product.imageUrls],
    }));
    const itemQuantityTotal = items.reduce((s, i) => s + i.quantity, 0);
    return {
      items,
      lineCount: items.length,
      itemQuantityTotal,
    };
  }

  private async ensureCart(userId: string): Promise<{ id: string }> {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      select: { id: true },
    });
  }

  public async getMyCart(userId: string): Promise<CartResponse> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                stockQuantity: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });
    return this.mapToResponse(cart);
  }

  public async upsertItem(
    userId: string,
    payload: CartUpsertItemPayload
  ): Promise<CartResponse> {
    const cart = await this.ensureCart(userId);
    if (payload.quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId: payload.productId },
      });
      return this.getMyCart(userId);
    }

    const product = await prisma.product.findUnique({
      where: { id: payload.productId },
    });
    if (product === null) throw new AppError(404, 'Product not found');
    if (payload.quantity > product.stockQuantity) {
      throw new AppError(400, 'Quantity exceeds available stock');
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: payload.productId,
        },
      },
      create: {
        cartId: cart.id,
        productId: payload.productId,
        quantity: payload.quantity,
      },
      update: { quantity: payload.quantity },
    });

    return this.getMyCart(userId);
  }

  public async removeItem(
    userId: string,
    productId: string
  ): Promise<CartResponse> {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart === null) return this.getMyCart(userId);
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return this.getMyCart(userId);
  }

  public async checkout(userId: string, notes: string): Promise<Order> {
    return this.orders.checkoutFromCart(userId, notes);
  }

  public async listCartSummariesForAdmin(): Promise<UserCartSummary[]> {
    const carts = await prisma.cart.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return carts
      .filter((c) => c.items.length > 0)
      .map((c) => ({
        userId: c.user.id,
        userName: c.user.name,
        userEmail: c.user.email,
        lineCount: c.items.length,
        itemQuantityTotal: c.items.reduce((s, i) => s + i.quantity, 0),
      }));
  }

  public async getCartForUserAsAdmin(targetUserId: string): Promise<CartResponse> {
    const cart = await prisma.cart.findUnique({
      where: { userId: targetUserId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                stockQuantity: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });
    return this.mapToResponse(cart);
  }
}
