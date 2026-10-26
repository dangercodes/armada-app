import { useCallback, useEffect, useRef, useState } from 'react';
import { getRoutes } from '../api/routes';
import type { MbtaResponse, MbtaRouteResource } from '../types/mbta';

export interface UseInfiniteRoutesOptions {
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Custom Hook untuk infinite scroll rute MBTA.
 */
export function useInfiniteRoutes(options: UseInfiniteRoutesOptions = {}) {
  const pageSize = options.pageSize ?? 20;
  const isEnabled = options.enabled !== undefined ? options.enabled : true;

  const [pages, setPages] = useState<MbtaResponse<MbtaRouteResource[]>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isEnabled);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isFetchingRef = useRef(false);

  // Ambil halaman pertama
  const fetchInitialPage = useCallback(async () => {
    if (!isEnabled) {
      setPages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);
    isFetchingRef.current = true;

    try {
      const res = await getRoutes({ limit: pageSize, offset: 0 });
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
  }, [isEnabled, pageSize]);

  // Ambil halaman berikutnya saat scroll ke bawah
  const fetchNextPage = useCallback(async () => {
    if (!isEnabled || !hasNextPage || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsFetchingNextPage(true);

    try {
      const currentOffset = pages.reduce((sum, p) => sum + (p.data?.length ?? 0), 0);
      const res = await getRoutes({ limit: pageSize, offset: currentOffset });

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
  }, [isEnabled, hasNextPage, pages, pageSize]);

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
