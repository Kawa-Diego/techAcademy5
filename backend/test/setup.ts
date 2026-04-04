process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters!';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public';
}
