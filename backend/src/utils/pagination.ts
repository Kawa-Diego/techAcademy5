import type { PaginationQuery } from '@ecommerce/shared';

const clamp = (n: number, min: number, max: number): number => {
  if (n < min) return min;
  if (n > max) return max;
  return n;
};

const asPageInt = (
  raw: string | undefined,
  fallback: number,
  max: number
): number => {
  const n = Number(raw ?? String(fallback));
  if (!Number.isFinite(n)) return fallback;
  return clamp(Math.trunc(n), 1, max);
};

export const parsePagination = (query: {
  readonly page?: string;
  readonly pageSize?: string;
}): PaginationQuery => {
  const page = asPageInt(query.page, 1, 1_000_000);
  const pageSize = asPageInt(query.pageSize, 10, 100);
  return { page, pageSize };
};
