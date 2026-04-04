export type PaginatedMeta = {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
};
export type PaginatedResult<T> = {
    readonly data: readonly T[];
    readonly meta: PaginatedMeta;
};
export type PaginationQuery = {
    readonly page: number;
    readonly pageSize: number;
};
