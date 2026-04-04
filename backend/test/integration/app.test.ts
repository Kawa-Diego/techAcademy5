import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';

const validCpf = '39053344705';
const strongPass = 'SenhaForte1!';

describe('API e-commerce', () => {
  const app = createApp();

  it('GET /site/navigation retorna menu público', async () => {
    const res = await request(app).get('/site/navigation');
    expect(res.status).toBe(200);
    expect(res.body.brand?.path).toBe('/');
    expect(Array.isArray(res.body.nav)).toBe(true);
    expect(res.body.nav.length).toBeGreaterThan(0);
  });

  it('GET /public/categories retorna lista', async () => {
    const res = await request(app).get('/public/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  let adminToken = '';
  let userToken = '';
  let categoryId = '';
  let productId = '';

  beforeAll(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post('/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: strongPass,
      cpf: validCpf,
    });

    const adminRow = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });
    if (adminRow === null) throw new Error('usuário admin não criado');
    await prisma.user.update({
      where: { id: adminRow.id },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app).post('/auth/login').send({
      email: 'admin@example.com',
      password: strongPass,
    });
    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.token as string;
    expect(adminLogin.body.user.role).toBe('ADMIN');

    await request(app).post('/auth/register').send({
      name: 'Cliente',
      email: 'user@example.com',
      password: strongPass,
      cpf: '52998224725',
    });

    const userLogin = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: strongPass,
    });
    expect(userLogin.status).toBe(200);
    userToken = userLogin.body.token as string;
    expect(userLogin.body.user.role).toBe('USER');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejeita GET /auth/status sem token', async () => {
    const res = await request(app).get('/auth/status');
    expect(res.status).toBe(401);
  });

  it('usuário comum não cria categoria (403)', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'X', description: 'Y' });
    expect(res.status).toBe(403);
  });

  it('admin cria categoria', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cat', description: 'Desc' });
    expect(res.status).toBe(201);
    categoryId = res.body.id as string;
  });

  it('usuário comum não lista categorias (403)', async () => {
    const res = await request(app)
      .get('/categories?page=1&pageSize=10')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('admin lista categorias', async () => {
    const res = await request(app)
      .get('/categories?page=1&pageSize=10')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /public/products sem autenticação', async () => {
    const res = await request(app).get('/public/products?page=1&pageSize=10');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('usuário comum não cria produto (403)', async () => {
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Cubo',
        description: 'M',
        priceCents: 100,
        model3dUrl: 'https://example.com/m.glb',
        categoryId,
      });
    expect(res.status).toBe(403);
  });

  it('admin cria produto', async () => {
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Cubo 3D',
        description: 'Modelo',
        priceCents: 1999,
        model3dUrl: 'https://example.com/m.glb',
        imageUrls: ['https://example.com/img1.jpg'],
        categoryId,
      });
    expect(res.status).toBe(201);
    productId = res.body.id as string;
  });

  it('cliente cria pedido autenticado', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'PENDING',
        notes: 'Pedido teste',
        items: [{ productId, quantity: 2 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.items.length).toBe(1);
  });

  it('usuário comum não lista todos os usuários (403)', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('admin lista usuários', async () => {
    const res = await request(app)
      .get('/users?page=1&pageSize=10')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('redefine senha por e-mail em /auth/forgot-password', async () => {
    const newPass = 'OutraSenha2@';
    const res = await request(app).post('/auth/forgot-password').send({
      email: 'user@example.com',
      newPassword: newPass,
    });
    expect(res.status).toBe(204);
    const login = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: newPass,
    });
    expect(login.status).toBe(200);
  });

  it('forgot-password com e-mail inexistente retorna 404', async () => {
    const res = await request(app).post('/auth/forgot-password').send({
      email: 'naoexiste@example.com',
      newPassword: strongPass,
    });
    expect(res.status).toBe(404);
  });

  it('cliente atualiza o próprio perfil em /users/me', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Cliente Dois',
        password: strongPass,
        cpf: '52998224725',
      });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cliente Dois');
  });
});
