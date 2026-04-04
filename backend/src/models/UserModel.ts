import type { User as DbUser } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { PaginationQuery } from '@ecommerce/shared';

type CreateUserData = {
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly cpf: string;
};

type UpdateProfileData = {
  readonly name: string;
  readonly passwordHash: string;
  readonly cpf: string;
};

export class UserModel {
  public async create(data: CreateUserData): Promise<DbUser> {
    return prisma.user.create({ data: { ...data } });
  }

  public async findByEmail(email: string): Promise<DbUser | null> {
    return prisma.user.findUnique({ where: { email: email.trim() } });
  }

  public async findById(id: string): Promise<DbUser | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  public async findByCpf(cpf: string): Promise<DbUser | null> {
    return prisma.user.findUnique({ where: { cpf } });
  }

  public async list(params: PaginationQuery): Promise<{
    rows: DbUser[];
    total: number;
  }> {
    const skip = (params.page - 1) * params.pageSize;
    const [rows, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { rows, total };
  }

  public async updateProfile(
    id: string,
    data: UpdateProfileData
  ): Promise<DbUser> {
    return prisma.user.update({ where: { id }, data: { ...data } });
  }

  public async deleteById(id: string): Promise<DbUser> {
    return prisma.user.delete({ where: { id } });
  }
}
