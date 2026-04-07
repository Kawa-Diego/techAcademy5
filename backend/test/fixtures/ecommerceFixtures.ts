/**
 * Mock data for integration tests (in-memory Prisma — no real DB).
 * CPFs are valid per project checksum rules; passwords meet strong policy.
 */
export const MOCK_STRONG_PASSWORD = 'SenhaForte1!';

/** Distinct valid CPFs (digits only) — one per registered user in a suite. */
export const MOCK_CPFS = {
  admin: '39053344705',
  alice: '52998224725',
  bob: '86288366757',
} as const;

export const MOCK_EMAILS = {
  admin: 'admin@fixture.test',
  alice: 'alice@fixture.test',
  bob: 'bob@fixture.test',
  ghost: 'noone@fixture.test',
} as const;

/** Random UUID that must not exist in the empty/minimal store. */
export const NON_EXISTENT_PRODUCT_ID = '00000000-0000-4000-8000-000000000001';

export const MOCK_CATEGORY = {
  name: 'Fixture category',
  description: 'Category for automated tests',
} as const;

export const MOCK_PRODUCT = {
  name: 'Fixture cube',
  description: '3D model for tests',
  priceCents: 2500,
  model3dUrl: 'https://cdn.fixture.test/models/cube.glb',
  imageUrls: ['https://cdn.fixture.test/img/cube.jpg'],
  stockQuantity: 10,
} as const;
