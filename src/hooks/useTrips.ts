import { useQuery } from '@tanstack/react-query';
import { getTrips } from '../api/trips';
import { mbtaKeys } from '../api/queryClient';
import type { TripQueryParams } from '../types/mbta';

export interface UseTripsOptions {
  enabled?: boolean;
}

export function useTrips(
  params: TripQueryParams = {},
  options: UseTripsOptions = {},
) {
  // MBTA requires at least one filter on /trips. By default, only enable if route or trip filter is supplied.
  const hasFilter = Boolean(
    (params.routeIds && params.routeIds.length > 0) ||
      (params.tripIds && params.tripIds.length > 0),
  );

  return useQuery({
    queryKey: mbtaKeys.tripList(params),
    queryFn: ({ signal }) => getTrips(params, signal),
    enabled: options.enabled !== undefined ? options.enabled : hasFilter,
  });
}
