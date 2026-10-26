import { useCallback, useEffect, useState } from 'react';
import { getTrips } from '../api/trips';
import type { MbtaResponse, MbtaTripResource, TripQueryParams } from '../types/mbta';

export interface UseTripsOptions {
  enabled?: boolean;
}

/**
 * Custom Hook untuk mengambil daftar perjalanan (trips) MBTA dari REST API.
 */
export function useTrips(
  params: TripQueryParams = {},
  options: UseTripsOptions = {},
) {
  const [data, setData] = useState<MbtaResponse<MbtaTripResource[]> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // MBTA mewajibkan minimal satu filter untuk endpoint /trips
  const hasFilter = Boolean(
    (params.routeIds && params.routeIds.length > 0) ||
    (params.tripIds && params.tripIds.length > 0),
  );
  const isEnabled = options.enabled !== undefined ? options.enabled : hasFilter;
  const paramsKey = JSON.stringify(params);

  const fetchTrips = useCallback(async () => {
    if (!isEnabled) {
      setData(null);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const parsedParams = paramsKey ? (JSON.parse(paramsKey) as TripQueryParams) : {};
      const res = await getTrips(parsedParams);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, paramsKey]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchTrips,
  };
}
