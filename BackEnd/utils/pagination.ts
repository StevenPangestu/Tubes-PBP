import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(req: Request, defaultLimit: number = 10): PaginationParams {
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || defaultLimit;
  const offset = page * limit;

  return { page, limit, offset };
}

export function calculateHasMore(totalCount: number, page: number, limit: number): boolean {
  return (page + 1) * limit < totalCount;
}
