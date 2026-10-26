import { useEffect, useState } from 'react';
import { getRoutes } from '../api/routes';
import { getTrips } from '../api/trips';
import type { MbtaRouteResource, MbtaTripResource } from '../types/mbta';

export interface UseSelectedResourcesOptions {
  routeIds: string[];
  tripIds: string[];
}

/**
 * Custom Hook untuk memuat resource terpilih (routes & trips) agar label chip filter langsung tampil.
 */
export function useSelectedResources({ routeIds, tripIds }: UseSelectedResourcesOptions) {
  const [routesMap, setRoutesMap] = useState<Map<string, MbtaRouteResource>>(new Map());
  const [tripsMap, setTripsMap] = useState<Map<string, MbtaTripResource>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const routeIdsKey = routeIds.join(',');
  const tripIdsKey = tripIds.join(',');

  useEffect(() => {
    let isMounted = true;
    async function loadResources() {
      const activeRouteIds = routeIdsKey ? routeIdsKey.split(',') : [];
      const activeTripIds = tripIdsKey ? tripIdsKey.split(',') : [];

      if (activeRouteIds.length === 0 && activeTripIds.length === 0) {
        if (isMounted) {
          setRoutesMap(new Map());
          setTripsMap(new Map());
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setIsError(false);

      try {
        const routesPromise =
          activeRouteIds.length > 0 ? getRoutes({ ids: activeRouteIds }) : Promise.resolve(null);
        const tripsPromise =
          activeTripIds.length > 0 ? getTrips({ tripIds: activeTripIds }) : Promise.resolve(null);
        const [routesRes, tripsRes] = await Promise.all([routesPromise, tripsPromise]);

        if (isMounted) {
          if (routesRes?.data) {
            const map = new Map<string, MbtaRouteResource>();
            for (const r of routesRes.data) {
              map.set(r.id, r);
            }
            setRoutesMap(map);
          }
          if (tripsRes?.data) {
            const map = new Map<string, MbtaTripResource>();
            for (const t of tripsRes.data) {
              map.set(t.id, t);
            }
            setTripsMap(map);
          }
        }
      } catch {
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadResources();

    return () => {
      isMounted = false;
    };
  }, [routeIdsKey, tripIdsKey]);

  return {
    routesMap,
    tripsMap,
    isLoading,
    isError,
  };
}
