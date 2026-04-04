process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters!';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public';
}
// Os testes de integração usam Prisma em memória (test/mocks/inMemoryPrisma.ts); PostgreSQL não é necessário para `npm test`.
