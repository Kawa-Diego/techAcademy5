import type { Prisma, Product as DbProduct } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { PaginationQuery } from '@ecommerce/shared';
import type { ProductWithCategory } from '../mappers/publicProductMapper';

type CreateProductData = {
  readonly name: string;
  readonly description: string;
  readonly priceCents: number;
  readonly model3dUrl: string;
  readonly imageUrls: string[];
  readonly categoryId: string;
  readonly stockQuantity: number;
};

export class ProductModel {
  public async create(data: CreateProductData): Promise<DbProduct> {
    const payload: Prisma.ProductUncheckedCreateInput = {
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      model3dUrl: data.model3dUrl,
      categoryId: data.categoryId,
      imageUrls: [...data.imageUrls],
      stockQuantity: data.stockQuantity,
    };
    return prisma.product.create({ data: payload });
  }

  public async findById(id: string): Promise<DbProduct | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  public async findByIdWithCategory(
    id: string
  ): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { category: { select: { name: true } } },
    });
  }

  public async list(params: PaginationQuery): Promise<{
    rows: DbProduct[];
    total: number;
  }> {
    const skip = (params.page - 1) * params.pageSize;
    const [rows, total] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count(),
    ]);
    return { rows, total };
  }

  public async listWithCategory(
    params: PaginationQuery,
    filters?: { readonly categoryId?: string }
  ): Promise<{
    rows: ProductWithCategory[];
    total: number;
  }> {
    const skip = (params.page - 1) * params.pageSize;
    const where =
      filters?.categoryId !== undefined && filters.categoryId.length > 0
        ? { categoryId: filters.categoryId }
        : {};
    const [rows, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } },
      }),
      prisma.product.count({ where }),
    ]);
    return { rows, total };
  }

  public async update(
    id: string,
    data: CreateProductData
  ): Promise<DbProduct> {
    const payload: Prisma.ProductUncheckedUpdateInput = {
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      model3dUrl: data.model3dUrl,
      categoryId: data.categoryId,
      imageUrls: { set: [...data.imageUrls] },
      stockQuantity: data.stockQuantity,
    };
    return prisma.product.update({ where: { id }, data: payload });
  }

  public async delete(id: string): Promise<DbProduct> {
    return prisma.product.delete({ where: { id } });
  }
}
