/* eslint-disable no-magic-numbers 
This is a utility function to parse the pagination query parameters from the request.
It clamps the page and pageSize values to the minimum and maximum values.
It returns a PaginationQuery object with the page and pageSize values.
*/

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
  readonly q?: string;
}): PaginationQuery => {
  const page = asPageInt(query.page, 1, 1_000_000);
  const pageSize = asPageInt(query.pageSize, 10, 100);
  const raw = query.q?.trim() ?? '';
  const search = raw.length > 0 ? raw.slice(0, 200) : undefined;
  return { page, pageSize, search };
};
