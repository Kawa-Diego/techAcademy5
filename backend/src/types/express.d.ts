import type { UserRole } from '@ecommerce/shared';

export {};

declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
      authRole?: UserRole;
    }
  }
}
