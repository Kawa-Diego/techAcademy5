import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const writeAuditLog = async (
  userId: string | null,
  action: string,
  details?: Prisma.InputJsonValue
): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      details: details === undefined ? undefined : details,
    },
  });
};
