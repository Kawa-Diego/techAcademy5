import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma, resetInMemoryPrisma } from '../mocks/inMemoryPrisma';
import {
  MOCK_CPFS,
  MOCK_EMAILS,
  MOCK_PRODUCT,
  MOCK_STRONG_PASSWORD,
  NON_EXISTENT_PRODUCT_ID,
} from '../fixtures/ecommerceFixtures';
import { seedTestWorld, type SeededWorld } from '../helpers/seedTestWorld';

vi.mock('../../src/lib/prisma', async () => {
  const mod = await import('../mocks/inMemoryPrisma');
  return { prisma: mod.prisma };
});

/**
 * Extended scenarios: invalid payloads (expect 4xx), ACL, refunds, stock consistency.
 * Uses shared fixtures + seedTestWorld (in-memory DB).
 */
describe('API — extended scenarios (fixtures + negative paths)', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('auth & registration validation', () => {
    const app = createApp();

    it('rejects login with wrong password (401, business: invalid credentials)', async () => {
      resetInMemoryPrisma();
      await request(app).post('/auth/register').send({
        name: 'L',
        email: 'loginfail@fixture.test',
        password: MOCK_STRONG_PASSWORD,
        cpf: MOCK_CPFS.alice,
      });
      const res = await request(app).post('/auth/login').send({
        email: 'loginfail@fixture.test',
        password: 'WrongPass9!',
      });
      expect(res.status).toBe(401);
      expect(String(res.body.message ?? '')).toMatch(/credential/i);
    });

    it('rejects login for unknown email (401)', async () => {
      const res = await request(app).post('/auth/login').send({
        email: MOCK_EMAILS.ghost,
        password: MOCK_STRONG_PASSWORD,
      });
      expect(res.status).toBe(401);
    });

    it('rejects duplicate email on register (409)', async () => {
      resetInMemoryPrisma();
      const body = {
        name: 'Dup',
        email: 'dup@fixture.test',
        password: MOCK_STRONG_PASSWORD,
        cpf: MOCK_CPFS.admin,
      };
      const first = await request(app).post('/auth/register').send(body);
      expect(first.status).toBe(201);
      const second = await request(app).post('/auth/register').send({
        ...body,
        cpf: MOCK_CPFS.bob,
      });
      expect(second.status).toBe(409);
      expect(String(second.body.message ?? '')).toMatch(/email|registered/i);
    });

    it('rejects invalid CPF checksum (400)', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Bad CPF',
        email: 'badcpf@fixture.test',
        password: MOCK_STRONG_PASSWORD,
        cpf: '11111111111',
      });
      expect(res.status).toBe(400);
      expect(String(res.body.message ?? '')).toMatch(/cpf/i);
    });

    it('rejects weak password on register (400)', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Weak',
        email: 'weak@fixture.test',
        password: 'short',
        cpf: MOCK_CPFS.bob,
      });
      expect(res.status).toBe(400);
    });
  });

  describe('orders — validation & stock', () => {
    let world: SeededWorld;

    beforeAll(async () => {
      world = await seedTestWorld();
    });

    it('rejects POST /orders without token (401)', async () => {
      const res = await request(world.app).post('/orders').send({
        items: [{ productId: world.productId, quantity: 1 }],
      });
      expect(res.status).toBe(401);
    });

    it('rejects customer order with empty items (400)', async () => {
      const res = await request(world.app)
        .post('/orders')
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({ notes: '', items: [] });
      expect(res.status).toBe(400);
    });

    it('rejects order for unknown product id (404)', async () => {
      const res = await request(world.app)
        .post('/orders')
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({
          items: [{ productId: NON_EXISTENT_PRODUCT_ID, quantity: 1 }],
        });
      expect(res.status).toBe(404);
      expect(String(res.body.message ?? '')).toMatch(/product/i);
    });

    it('rejects order when quantity exceeds stock (400)', async () => {
      const res = await request(world.app)
        .post('/orders')
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({
          items: [{ productId: world.productId, quantity: MOCK_PRODUCT.stockQuantity + 50 }],
        });
      expect(res.status).toBe(400);
      expect(String(res.body.message ?? '')).toMatch(/stock/i);
    });
  });

  describe('public catalog', () => {
    it('returns 404 for unknown product id', async () => {
      const world = await seedTestWorld();
      const res = await request(world.app).get(
        `/public/products/${NON_EXISTENT_PRODUCT_ID}`
      );
      expect(res.status).toBe(404);
    });
  });

  describe('order ACL (customer cannot read other user order)', () => {
    it('returns 403 when Bob GETs Alice order by id', async () => {
      const world = await seedTestWorld();
      const created = await request(world.app)
        .post('/orders')
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({
          notes: 'Alice order',
          items: [{ productId: world.productId, quantity: 1 }],
        });
      expect(created.status).toBe(201);
      const orderId = created.body.id as string;

      const res = await request(world.app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${world.bobToken}`);
      expect(res.status).toBe(403);
      expect(String(res.body.message ?? '')).toMatch(/denied|access/i);
    });
  });

  describe('refund flow & business rules', () => {
    it('customer requests refund, admin confirms, stock restored; duplicate request fails', async () => {
      const world = await seedTestWorld();
      const stockBefore = (
        await request(world.app)
          .get(`/products/${world.productId}`)
          .set('Authorization', `Bearer ${world.adminToken}`)
      ).body.stockQuantity as number;

      const created = await request(world.app)
        .post('/orders')
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({
          notes: 'Refund test',
          items: [{ productId: world.productId, quantity: 2 }],
        });
      expect(created.status).toBe(201);
      const orderId = created.body.id as string;
      const itemId = created.body.items[0].id as string;

      const afterOrder = (
        await request(world.app)
          .get(`/products/${world.productId}`)
          .set('Authorization', `Bearer ${world.adminToken}`)
      ).body.stockQuantity as number;
      expect(afterOrder).toBe(stockBefore - 2);

      const req1 = await request(world.app)
        .post(`/orders/${orderId}/items/${itemId}/refund-request`)
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({ confirm: true });
      expect(req1.status).toBe(200);

      const dupReq = await request(world.app)
        .post(`/orders/${orderId}/items/${itemId}/refund-request`)
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({ confirm: true });
      expect(dupReq.status).toBe(400);
      expect(String(dupReq.body.message ?? '')).toMatch(/already requested|refund/i);

      const userConfirm = await request(world.app)
        .post(`/orders/${orderId}/items/${itemId}/refund-confirm`)
        .set('Authorization', `Bearer ${world.aliceToken}`);
      expect(userConfirm.status).toBe(403);

      const adminConfirm = await request(world.app)
        .post(`/orders/${orderId}/items/${itemId}/refund-confirm`)
        .set('Authorization', `Bearer ${world.adminToken}`);
      expect(adminConfirm.status).toBe(200);

      const afterRefund = (
        await request(world.app)
          .get(`/products/${world.productId}`)
          .set('Authorization', `Bearer ${world.adminToken}`)
      ).body.stockQuantity as number;
      expect(afterRefund).toBe(stockBefore);
    });

    it('admin cannot confirm refund if customer never requested (400)', async () => {
      const world = await seedTestWorld();
      const created = await request(world.app)
        .post('/orders')
        .set('Authorization', `Bearer ${world.aliceToken}`)
        .send({
          notes: 'No refund req',
          items: [{ productId: world.productId, quantity: 1 }],
        });
      expect(created.status).toBe(201);
      const orderId = created.body.id as string;
      const itemId = created.body.items[0].id as string;

      const res = await request(world.app)
        .post(`/orders/${orderId}/items/${itemId}/refund-confirm`)
        .set('Authorization', `Bearer ${world.adminToken}`);
      expect(res.status).toBe(400);
      expect(String(res.body.message ?? '')).toMatch(/refund|request/i);
    });
  });

  describe('admin catalog validation', () => {
    it('rejects category with empty name (400)', async () => {
      const world = await seedTestWorld();
      const res = await request(world.app)
        .post('/categories')
        .set('Authorization', `Bearer ${world.adminToken}`)
        .send({ name: '', description: 'x' });
      expect(res.status).toBe(400);
    });

    it('rejects product without images (400)', async () => {
      const world = await seedTestWorld();
      const res = await request(world.app)
        .post('/products')
        .set('Authorization', `Bearer ${world.adminToken}`)
        .send({
          name: 'No imgs',
          description: 'x',
          priceCents: 100,
          model3dUrl: 'https://example.com/m.glb',
          categoryId: world.categoryId,
          imageUrls: [],
          stockQuantity: 1,
        });
      expect(res.status).toBe(400);
    });
  });
});
