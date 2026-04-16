import type { Category as DbCategory } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { PaginationQuery } from '@ecommerce/shared';

type CreateCategoryData = {
  readonly name: string;
  readonly description: string;
};

export class CategoryModel {
  public async create(data: CreateCategoryData): Promise<DbCategory> {
    return prisma.category.create({ data: { ...data } });
  }

  public async findById(id: string): Promise<DbCategory | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  public async listAllByName(): Promise<DbCategory[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async list(params: PaginationQuery): Promise<{
    rows: DbCategory[];
    total: number;
  }> {
    const skip = (params.page - 1) * params.pageSize;
    const [rows, total] = await prisma.$transaction([
      prisma.category.findMany({
        skip,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.count(),
    ]);
    return { rows, total };
  }

  public async update(
    id: string,
    data: CreateCategoryData
  ): Promise<DbCategory> {
    return prisma.category.update({ where: { id }, data: { ...data } });
  }

  public async delete(id: string): Promise<DbCategory> {
    return prisma.category.delete({ where: { id } });
  }
}
