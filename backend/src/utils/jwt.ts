import jwt from 'jsonwebtoken';
import type { UserRole } from '@ecommerce/shared';
import { getJwtSecret } from '../config/env';

export type JwtPayload = {
  readonly sub: string;
  readonly role: UserRole;
};

const readSub = (decoded: object): string => {
  const subRaw = Reflect.get(decoded, 'sub');
  if (typeof subRaw !== 'string') throw new Error('Token inválido');
  return subRaw;
};

const readRole = (decoded: object): UserRole => {
  const roleRaw = Reflect.get(decoded, 'role');
  if (roleRaw === 'USER' || roleRaw === 'ADMIN') return roleRaw;
  throw new Error('Token inválido');
};

export const signUserToken = (userId: string, role: UserRole): string => {
  const secret = getJwtSecret();
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: '8h' });
};

export const verifyUserToken = (token: string): JwtPayload => {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string') throw new Error('Token inválido');
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Token inválido');
  }
  return { sub: readSub(decoded), role: readRole(decoded) };
};
