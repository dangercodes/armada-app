import { mbtaFetch } from './client';
import type {
  MbtaIncludedResource,
  MbtaResponse,
  MbtaVehicleResource,
  VehicleQueryParams,
} from '../types/mbta';

export async function getVehicles(
  params: VehicleQueryParams = {},
  signal?: AbortSignal,
): Promise<MbtaResponse<MbtaVehicleResource[], MbtaIncludedResource>> {
  const queryParams: Record<string, string | number | undefined> = {};

  const effectiveLimit = params.pageSize ?? params.limit;
  const effectiveOffset =
    params.page !== undefined && effectiveLimit !== undefined
      ? Math.max(0, (params.page - 1) * effectiveLimit)
      : params.offset;

  if (effectiveLimit !== undefined) {
    queryParams['page[limit]'] = effectiveLimit;
  }
  if (effectiveOffset !== undefined) {
    queryParams['page[offset]'] = effectiveOffset;
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
