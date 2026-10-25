import { mbtaFetch } from './client';
import type {
  MbtaResponse,
  MbtaTripResource,
  TripQueryParams,
} from '../types/mbta';

/**
 * Fetches transit trips from MBTA /trips endpoint.
 */
export async function getTrips(
  params: TripQueryParams = {},
  signal?: AbortSignal,
): Promise<MbtaResponse<MbtaTripResource[]>> {
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
    queryParams['filter[id]'] = params.tripIds.join(',');
  }
  if (params.directionId !== undefined) {
    queryParams['filter[direction_id]'] = params.directionId;
  }

  return mbtaFetch<MbtaResponse<MbtaTripResource[]>>('/trips', {
    params: queryParams,
    signal,
  });
}

/**
 * Fetches a single trip by ID.
 */
export async function getTripById(
  id: string,
  signal?: AbortSignal,
): Promise<MbtaResponse<MbtaTripResource>> {
  return mbtaFetch<MbtaResponse<MbtaTripResource>>(
    `/trips/${encodeURIComponent(id)}`,
    {
      signal,
    },
  );
}
