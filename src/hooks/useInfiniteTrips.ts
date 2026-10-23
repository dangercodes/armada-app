import { useInfiniteQuery } from '@tanstack/react-query';
import { getTrips } from '../api/trips';
import { mbtaKeys } from '../api/queryClient';
import { parseOffsetFromUrl } from '../utils/pagination';
import type { MbtaResponse, MbtaTripResource } from '../types/mbta';

export interface UseInfiniteTripsOptions {
  routeIds?: string[];
  pageSize?: number;
  enabled?: boolean;
}

export function useInfiniteTrips(options: UseInfiniteTripsOptions = {}) {
  const pageSize = options.pageSize ?? 20;
  const routeIds = options.routeIds ?? [];
  const hasRouteFilter = routeIds.length > 0;
  const isQueryEnabled = options.enabled !== undefined ? options.enabled : hasRouteFilter;

  return useInfiniteQuery<MbtaResponse<MbtaTripResource[]>, Error>({
    queryKey: mbtaKeys.tripInfinite({ routeIds, pageSize }),
    queryFn: async ({ pageParam = 0, signal }) => {
      const offset = typeof pageParam === 'number' ? pageParam : 0;
      return getTrips(
        {
          routeIds,
          limit: pageSize,
          offset,
        },
        signal,
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If last page had fewer items than pageSize, we reached the end
      if (!lastPage.data || lastPage.data.length < pageSize) {
        return undefined;
      }

      // Try parsing next offset from JSON:API links.next
      if (lastPage.links?.next) {
        const nextOffset = parseOffsetFromUrl(lastPage.links.next);
        if (nextOffset !== null) {
          return nextOffset;
        }
      }

      // Fallback calculation: page number * pageSize
      return allPages.length * pageSize;
    },
    enabled: isQueryEnabled,
    staleTime: 1000 * 60 * 2, // 2 min cache
    gcTime: 1000 * 60 * 10,
  });
}
