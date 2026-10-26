import { useCallback, useEffect, useRef, useState } from 'react';
import { getTrips } from '../api/trips';
import type { MbtaResponse, MbtaTripResource } from '../types/mbta';

export interface UseInfiniteTripsOptions {
  routeIds?: string[];
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Custom Hook untuk infinite scroll daftar perjalanan (trips) MBTA.
 */
export function useInfiniteTrips(options: UseInfiniteTripsOptions = {}) {
  const pageSize = options.pageSize ?? 20;
  const routeIds = options.routeIds ?? [];
  const routeIdsKey = routeIds.join(',');
  const hasRouteFilter = routeIds.length > 0;
  const isEnabled = options.enabled !== undefined ? options.enabled : hasRouteFilter;

  const [pages, setPages] = useState<MbtaResponse<MbtaTripResource[]>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isFetchingRef = useRef(false);

  // Ambil halaman pertama saat routeIds atau status enable berubah
  const fetchInitialPage = useCallback(async () => {
    const activeRouteIds = routeIdsKey ? routeIdsKey.split(',') : [];
    if (!isEnabled || activeRouteIds.length === 0) {
      setPages([]);
      setIsLoading(false);
      setHasNextPage(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);
    isFetchingRef.current = true;

    try {
      const res = await getTrips({ routeIds: activeRouteIds, limit: pageSize, offset: 0 });
      setPages([res]);
      const count = res.data?.length ?? 0;
      setHasNextPage(count >= pageSize && Boolean(res.links?.next));
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isEnabled, routeIdsKey, pageSize]);

  // Ambil halaman berikutnya saat scroll
  const fetchNextPage = useCallback(async () => {
    const activeRouteIds = routeIdsKey ? routeIdsKey.split(',') : [];
    if (!isEnabled || !hasNextPage || isFetchingRef.current || activeRouteIds.length === 0) return;

    isFetchingRef.current = true;
    setIsFetchingNextPage(true);

    try {
      const currentOffset = pages.reduce((sum, p) => sum + (p.data?.length ?? 0), 0);
      const res = await getTrips({ routeIds: activeRouteIds, limit: pageSize, offset: currentOffset });

      setPages((prev) => [...prev, res]);
      const count = res.data?.length ?? 0;
      setHasNextPage(count >= pageSize && Boolean(res.links?.next));
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsFetchingNextPage(false);
      isFetchingRef.current = false;
    }
  }, [isEnabled, hasNextPage, pages, routeIdsKey, pageSize]);

  useEffect(() => {
    fetchInitialPage();
  }, [fetchInitialPage]);

  return {
    data: { pages },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
    fetchNextPage,
    refetch: fetchInitialPage,
  };
}
