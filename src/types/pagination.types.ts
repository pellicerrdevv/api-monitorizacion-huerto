export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  next: string | null;
  prev: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
