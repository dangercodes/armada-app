import { useCallback, useEffect, useState } from 'react';
import { getRoutes } from '../api/routes';
import type { MbtaResponse, MbtaRouteResource, RouteQueryParams } from '../types/mbta';

export interface UseRoutesOptions {
  enabled?: boolean;
}

/**
 * Custom Hook untuk mengambil daftar rute MBTA dari REST API.
 */
export function useRoutes(
  params: RouteQueryParams = {},
  options: UseRoutesOptions = {},
) {
  const [data, setData] = useState<MbtaResponse<MbtaRouteResource[]> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isEnabled = options.enabled !== undefined ? options.enabled : true;
  const paramsKey = JSON.stringify(params);

  const fetchRoutes = useCallback(async () => {
    if (!isEnabled) return;
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const parsedParams = paramsKey ? (JSON.parse(paramsKey) as RouteQueryParams) : {};
      const res = await getRoutes(parsedParams);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, paramsKey]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchRoutes,
  };
}
