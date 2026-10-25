import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/vehicles';
import { mbtaKeys } from '../api/queryClient';
import { calculateTotalPages, parseOffsetFromUrl } from '../utils/pagination';
import type { VehicleQueryParams } from '../types/mbta';

export interface UseVehicleTotalCountOptions {
  lastUrl?: string | null;
  currentOffset: number;
  currentCount: number;
  pageSize: number;
  routeIds?: string[];
  tripIds?: string[];
  hasNextPage?: boolean;
}

/**
 * Calculates exact total records and total pages using MBTA JSON:API pagination links.
 * 
 * Strategy:
 * 1. Read `links.last` from response.
 * 2. Parse the final page's `page[offset]`.
 * 3. If currently viewing the last page, use currentCount directly (no network call).
 * 4. If on another page, fetch the last page (limit=pageSize, offset=lastOffset) to get exact item count.
 * 5. Total records = lastOffset + lastPageItemCount.
 * 6. Total pages = Math.ceil(totalRecords / pageSize).
 * 7. Results are cached via TanStack Query to eliminate redundant requests.
 * 8. If links.last is missing and hasNextPage is true, total is kept as null without guessing.
 */
export function useVehicleTotalCount({
  lastUrl,
  currentOffset,
  currentCount,
  pageSize,
  routeIds,
  tripIds,
  hasNextPage = false,
}: UseVehicleTotalCountOptions) {
  const lastOffset = parseOffsetFromUrl(lastUrl);

  // Case 1: Empty dataset on page 1 with no next link
  const isDirectEmpty = currentOffset === 0 && currentCount === 0 && !hasNextPage;

  // Case 2: Entire dataset fits on a single page or end of dataset reached without 'last' link
  const isSinglePageOrEndWithoutLast = !lastUrl && !hasNextPage;

  // Case 3: User is currently on the last page
  const isOnLastPage = lastOffset !== null && currentOffset === lastOffset;

  // Should we fetch the final page to count its remainder items?
  const shouldFetchLastPage =
    !isDirectEmpty &&
    !isSinglePageOrEndWithoutLast &&
    !isOnLastPage &&
    lastOffset !== null;

  const lastPageQuery = useQuery({
    queryKey: mbtaKeys.vehicleLastPage({
      pageSize,
      lastOffset: lastOffset ?? 0,
      routeIds,
      tripIds,
    }),
    queryFn: async ({ signal }) => {
      // Lightweight fetch: no heavy include relationships needed for counting
      const res = await getVehicles(
        {
          limit: pageSize,
          offset: lastOffset ?? 0,
          routeIds,
          tripIds,
        },
        signal,
      );
      return res.data?.length ?? 0;
    },
    enabled: shouldFetchLastPage,
    staleTime: 1000 * 60, // 60s cache
    gcTime: 1000 * 60 * 5, // 5 min
  });

  const totalRecords: number | null = (() => {
    if (isDirectEmpty) return 0;
    if (isSinglePageOrEndWithoutLast) return currentOffset + currentCount;
    if (isOnLastPage && lastOffset !== null) return lastOffset + currentCount;
    if (lastOffset !== null) {
      return lastPageQuery.data !== undefined ? lastOffset + lastPageQuery.data : null;
    }
    // Missing last link on multi-page data: cannot determine exact total
    return null;
  })();

  const totalPages = calculateTotalPages(totalRecords, pageSize);

  return {
    totalRecords,
    totalPages,
    isTotalLoading: shouldFetchLastPage && lastPageQuery.isLoading,
    lastOffset,
  };
}

/**
 * Hook to fetch paginated MBTA vehicles with full server-side pagination support.
 * 
 * - Includes page, pageSize, filters, and relationships in the TanStack query key.
 * - Uses placeholderData: keepPreviousData to ensure seamless page transitions without a blank grid.
 * - Integrates exact total record and total page computation.
 */
export function useVehicles(params: VehicleQueryParams = {}) {
  const effectiveLimit = params.pageSize ?? params.limit ?? 10;
  const effectivePage =
    params.page ??
    (params.offset !== undefined ? Math.floor(params.offset / effectiveLimit) + 1 : 1);
  const effectiveOffset =
    params.offset !== undefined ? params.offset : (effectivePage - 1) * effectiveLimit;

  // Normalized query parameters containing page, pageSize, limit, offset, and filters
  const queryParams: VehicleQueryParams = {
    ...params,
    page: effectivePage,
    pageSize: effectiveLimit,
    limit: effectiveLimit,
    offset: effectiveOffset,
  };

  const query = useQuery({
    queryKey: mbtaKeys.vehicleList(queryParams),
    queryFn: ({ signal }) => getVehicles(queryParams, signal),
    placeholderData: keepPreviousData,
  });

  const totalInfo = useVehicleTotalCount({
    lastUrl: query.data?.links?.last,
    currentOffset: effectiveOffset,
    currentCount: query.data?.data?.length ?? 0,
    pageSize: effectiveLimit,
    routeIds: params.routeIds,
    tripIds: params.tripIds,
    hasNextPage: Boolean(query.data?.links?.next),
  });

  return {
    ...query,
    page: effectivePage,
    pageSize: effectiveLimit,
    offset: effectiveOffset,
    totalRecords: totalInfo.totalRecords,
    totalPages: totalInfo.totalPages,
    isTotalLoading: totalInfo.isTotalLoading,
    lastOffset: totalInfo.lastOffset,
    hasNextPage: Boolean(query.data?.links?.next),
    hasPrevPage: Boolean(query.data?.links?.prev) || effectivePage > 1,
  };
}
