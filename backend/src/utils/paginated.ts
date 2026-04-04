import type { PaginatedResult } from '@ecommerce/shared';

export const buildPaginated = <T>(
  data: readonly T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { data, meta: { page, pageSize, total, totalPages } };
};
