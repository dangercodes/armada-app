import { useInfiniteQuery } from '@tanstack/react-query';
import { getRoutes } from '../api/routes';
import { mbtaKeys } from '../api/queryClient';
import { parseOffsetFromUrl } from '../utils/pagination';
import type { MbtaResponse, MbtaRouteResource } from '../types/mbta';

export interface UseInfiniteRoutesOptions {
  pageSize?: number;
  enabled?: boolean;
}

export function useInfiniteRoutes(options: UseInfiniteRoutesOptions = {}) {
  const pageSize = options.pageSize ?? 20;

  return useInfiniteQuery<MbtaResponse<MbtaRouteResource[]>, Error>({
    queryKey: mbtaKeys.routeInfinite({ pageSize }),
    queryFn: async ({ pageParam = 0, signal }) => {
      const offset = typeof pageParam === 'number' ? pageParam : 0;
      return getRoutes(
        {
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
    enabled: options.enabled !== undefined ? options.enabled : true,
    staleTime: 1000 * 60 * 5, // 5 min cache (route network changes infrequently)
    gcTime: 1000 * 60 * 15,
  });
}
