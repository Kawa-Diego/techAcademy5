import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../../src/app';
import { prisma, resetInMemoryPrisma } from '../mocks/inMemoryPrisma';
import {
  MOCK_CATEGORY,
  MOCK_CPFS,
  MOCK_EMAILS,
  MOCK_PRODUCT,
  MOCK_STRONG_PASSWORD,
} from '../fixtures/ecommerceFixtures';

export type SeededWorld = {
  readonly app: Express;
  readonly adminToken: string;
  readonly aliceToken: string;
  readonly bobToken: string;
  readonly aliceId: string;
  readonly bobId: string;
  readonly categoryId: string;
  readonly productId: string;
};

/**
 * Resets the in-memory store and seeds: ADMIN + two USERs, one category, one product.
 */
export async function seedTestWorld(): Promise<SeededWorld> {
  resetInMemoryPrisma();
  const app = createApp();

  await request(app).post('/auth/register').send({
    name: 'Fixture Admin',
    email: MOCK_EMAILS.admin,
    password: MOCK_STRONG_PASSWORD,
    cpf: MOCK_CPFS.admin,
  });
  const adminRow = await prisma.user.findUnique({
    where: { email: MOCK_EMAILS.admin },
  });
  if (adminRow === null) throw new Error('seed: admin not created');
  await prisma.user.update({
    where: { id: (adminRow as { id: string }).id },
    data: { role: 'ADMIN' },
  });

  const adminLogin = await request(app).post('/auth/login').send({
    email: MOCK_EMAILS.admin,
    password: MOCK_STRONG_PASSWORD,
  });
  if (adminLogin.status !== 200) throw new Error('seed: admin login failed');
  const adminToken = adminLogin.body.token as string;

  const catRes = await request(app)
    .post('/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(MOCK_CATEGORY);
  if (catRes.status !== 201) throw new Error('seed: category failed');
  const categoryId = catRes.body.id as string;

  const prodRes = await request(app)
    .post('/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      ...MOCK_PRODUCT,
      categoryId,
    });
  if (prodRes.status !== 201) throw new Error('seed: product failed');
  const productId = prodRes.body.id as string;

  await request(app).post('/auth/register').send({
    name: 'Alice',
    email: MOCK_EMAILS.alice,
    password: MOCK_STRONG_PASSWORD,
    cpf: MOCK_CPFS.alice,
  });
  const aliceLogin = await request(app).post('/auth/login').send({
    email: MOCK_EMAILS.alice,
    password: MOCK_STRONG_PASSWORD,
  });
  if (aliceLogin.status !== 200) throw new Error('seed: alice login failed');
  const aliceToken = aliceLogin.body.token as string;
  const aliceId = aliceLogin.body.user.id as string;

  await request(app).post('/auth/register').send({
    name: 'Bob',
    email: MOCK_EMAILS.bob,
    password: MOCK_STRONG_PASSWORD,
    cpf: MOCK_CPFS.bob,
  });
  const bobLogin = await request(app).post('/auth/login').send({
    email: MOCK_EMAILS.bob,
    password: MOCK_STRONG_PASSWORD,
  });
  if (bobLogin.status !== 200) throw new Error('seed: bob login failed');
  const bobToken = bobLogin.body.token as string;
  const bobId = bobLogin.body.user.id as string;

  return {
    app,
    adminToken,
    aliceToken,
    bobToken,
    aliceId,
    bobId,
    categoryId,
    productId,
  };
}
