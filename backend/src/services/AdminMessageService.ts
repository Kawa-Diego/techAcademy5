import type { AdminUserMessageDto } from '@ecommerce/shared';
import { AppError } from '../errors/AppError';
import { prisma } from '../lib/prisma';

export class AdminMessageService {
  public async sendToUser(
    fromAdminId: string,
    toUserId: string,
    body: string
  ): Promise<AdminUserMessageDto> {
    const target = await prisma.user.findUnique({ where: { id: toUserId } });
    if (target === null) throw new AppError(404, 'User not found');

    const row = await prisma.adminUserMessage.create({
      data: {
        fromUserId: fromAdminId,
        toUserId,
        body,
      },
    });

    return {
      id: row.id,
      toUserId: row.toUserId,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
