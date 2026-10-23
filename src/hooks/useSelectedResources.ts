import { useQuery } from '@tanstack/react-query';
import { getRoutes } from '../api/routes';
import { getTrips } from '../api/trips';
import { mbtaKeys } from '../api/queryClient';
import type { MbtaRouteResource, MbtaTripResource } from '../types/mbta';

export interface UseSelectedResourcesOptions {
  routeIds: string[];
  tripIds: string[];
}

export function useSelectedResources({ routeIds, tripIds }: UseSelectedResourcesOptions) {
  const routesQuery = useQuery({
    queryKey: mbtaKeys.routeList({ ids: routeIds }),
    queryFn: ({ signal }) => getRoutes({ ids: routeIds }, signal),
    enabled: routeIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  const tripsQuery = useQuery({
    queryKey: mbtaKeys.tripList({ tripIds }),
    queryFn: ({ signal }) => getTrips({ tripIds }, signal),
    enabled: tripIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const routesMap = new Map<string, MbtaRouteResource>();
  for (const r of routesQuery.data?.data ?? []) {
    routesMap.set(r.id, r);
  }

  const tripsMap = new Map<string, MbtaTripResource>();
  for (const t of tripsQuery.data?.data ?? []) {
    tripsMap.set(t.id, t);
  }

  return {
    routesMap,
    tripsMap,
    isLoading: (routeIds.length > 0 && routesQuery.isLoading) || (tripIds.length > 0 && tripsQuery.isLoading),
    isError: routesQuery.isError || tripsQuery.isError,
  };
}
