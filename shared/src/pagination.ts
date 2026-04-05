// Paginated meta type for pagination
export type PaginatedMeta = {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
};

// Paginated result type for pagination
export type PaginatedResult<T> = {
  readonly data: readonly T[];
  readonly meta: PaginatedMeta;
};

// Pagination query type for pagination
export type PaginationQuery = {
  readonly page: number;
  readonly pageSize: number;
};
