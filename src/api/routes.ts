import { mbtaFetch } from './client';
import type {
  MbtaResponse,
  MbtaRouteResource,
  RouteQueryParams,
} from '../types/mbta';

/**
 * Fetches transit routes from MBTA /routes endpoint.
 *
 * Supports pagination, type filters, route IDs, and sorting.
 */
export async function getRoutes(
  params: RouteQueryParams = {},
  signal?: AbortSignal,
): Promise<MbtaResponse<MbtaRouteResource[]>> {
  const queryParams: Record<string, string | number | undefined> = {};

  if (params.limit !== undefined) {
    queryParams['page[limit]'] = params.limit;
  }
  if (params.offset !== undefined) {
    queryParams['page[offset]'] = params.offset;
  }
  if (params.types && params.types.length > 0) {
    queryParams['filter[type]'] = params.types.join(',');
  }
  if (params.ids && params.ids.length > 0) {
    queryParams['filter[id]'] = params.ids.join(',');
  }
  if (params.sort) {
    queryParams['sort'] = params.sort;
  }

  return mbtaFetch<MbtaResponse<MbtaRouteResource[]>>('/routes', {
    params: queryParams,
    signal,
  });
}

/**
 * Fetches a single route by ID.
 */
export async function getRouteById(
  id: string,
  signal?: AbortSignal,
): Promise<MbtaResponse<MbtaRouteResource>> {
  return mbtaFetch<MbtaResponse<MbtaRouteResource>>(
    `/routes/${encodeURIComponent(id)}`,
    {
      signal,
    },
  );
}
