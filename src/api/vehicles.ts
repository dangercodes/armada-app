import { mbtaFetch } from './client';
import type {
  MbtaIncludedResource,
  MbtaResponse,
  MbtaVehicleResource,
  VehicleQueryParams,
} from '../types/mbta';

/**
 * Fetches vehicles from MBTA /vehicles endpoint.
 *
 * Supports pagination, route/trip filters, and included relationships (route, trip, stop).
 */
export async function getVehicles(
  params: VehicleQueryParams = {},
  signal?: AbortSignal,
): Promise<MbtaResponse<MbtaVehicleResource[], MbtaIncludedResource>> {
  const queryParams: Record<string, string | number | undefined> = {};

  if (params.limit !== undefined) {
    queryParams['page[limit]'] = params.limit;
  }
  if (params.offset !== undefined) {
    queryParams['page[offset]'] = params.offset;
  }
  if (params.routeIds && params.routeIds.length > 0) {
    queryParams['filter[route]'] = params.routeIds.join(',');
  }
  if (params.tripIds && params.tripIds.length > 0) {
    queryParams['filter[trip]'] = params.tripIds.join(',');
  }
  if (params.include && params.include.length > 0) {
    queryParams['include'] = params.include.join(',');
  }

  return mbtaFetch<MbtaResponse<MbtaVehicleResource[], MbtaIncludedResource>>(
    '/vehicles',
    {
      params: queryParams,
      signal,
    },
  );
}

/**
 * Fetches a single vehicle by ID.
 */
export async function getVehicleById(
  id: string,
  include: string[] = ['route', 'trip', 'stop'],
  signal?: AbortSignal,
): Promise<MbtaResponse<MbtaVehicleResource, MbtaIncludedResource>> {
  const params: Record<string, string> = {};
  if (include.length > 0) {
    params['include'] = include.join(',');
  }

  return mbtaFetch<MbtaResponse<MbtaVehicleResource, MbtaIncludedResource>>(
    `/vehicles/${encodeURIComponent(id)}`,
    {
      params,
      signal,
    },
  );
}
