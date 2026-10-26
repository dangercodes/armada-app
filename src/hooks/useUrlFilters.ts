import { useCallback, useEffect, useState } from 'react';

export interface UrlFilters {
  routeIds: string[];
  tripIds: string[];
  page: number;
  pageSize: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 8;
const VALID_PAGE_SIZES = [8, 12, 16, 20, 24, 32];

export function parseUrlFilters(): UrlFilters {
  if (typeof window === 'undefined') {
    return {
      routeIds: [],
      tripIds: [],
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }

  const params = new URLSearchParams(window.location.search);

  // Parsing parameter rute (mendukung ?routes= dan ?route=)
  const routesParam = params.get('routes') || params.get('route') || '';
  const routeIds = routesParam
    ? routesParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    : [];

  // Parsing parameter perjalanan (mendukung ?trips= dan ?trip=)
  const tripsParam = params.get('trips') || params.get('trip') || '';
  const tripIds = tripsParam
    ? tripsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    : [];

  // Parsing nomor halaman (harus bilangan bulat >= 1)
  const pageParam = parseInt(params.get('page') || '1', 10);
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : DEFAULT_PAGE;

  // Parsing ukuran halaman (harus salah satu dari opsi valid: 8, 12, 16, 20, 24, 32)
  const pageSizeParam = parseInt(params.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);
  const pageSize = VALID_PAGE_SIZES.includes(pageSizeParam)
    ? pageSizeParam
    : DEFAULT_PAGE_SIZE;

  return { routeIds, tripIds, page, pageSize };
}

/**
 * Mengubah filter saat ini menjadi string URL query parameters.
 */
export function serializeUrlFilters(filters: UrlFilters): string {
  const params = new URLSearchParams();

  if (filters.routeIds.length > 0) {
    params.set('routes', filters.routeIds.join(','));
  }
  if (filters.tripIds.length > 0) {
    params.set('trips', filters.tripIds.join(','));
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('pageSize', String(filters.pageSize));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function useUrlFilters() {
  const [filters, setFilters] = useState<UrlFilters>(() => parseUrlFilters());

  // Sinkronkan state ke URL browser setiap kali filter berubah
  const syncToBrowserUrl = useCallback((nextFilters: UrlFilters, replace = false) => {
    const newQuery = serializeUrlFilters(nextFilters);
    const newUrl = `${window.location.pathname}${newQuery}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (newUrl !== currentUrl) {
      if (replace) {
        window.history.replaceState(nextFilters, '', newUrl);
      } else {
        window.history.pushState(nextFilters, '', newUrl);
      }
    }
  }, []);

  // Mendengarkan tombol Back / Forward pada browser (event popstate)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlFilters();
      setFilters(parsed);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handler untuk memperbarui state dan URL browser
  const setRouteIds = useCallback(
    (newRouteIds: string[]) => {
      setFilters((prev) => {
        const next: UrlFilters = {
          ...prev,
          routeIds: newRouteIds,
          page: 1, // Reset kembali ke halaman 1 saat filter rute berubah
        };
        syncToBrowserUrl(next, false);
        return next;
      });
    },
    [syncToBrowserUrl],
  );

  const setTripIds = useCallback(
    (newTripIds: string[]) => {
      setFilters((prev) => {
        const next: UrlFilters = {
          ...prev,
          tripIds: newTripIds,
          page: 1, // Reset kembali ke halaman 1 saat filter trip berubah
        };
        syncToBrowserUrl(next, false);
        return next;
      });
    },
    [syncToBrowserUrl],
  );

  const setPage = useCallback(
    (newPage: number) => {
      setFilters((prev) => {
        if (prev.page === newPage) return prev;
        const next: UrlFilters = {
          ...prev,
          page: newPage,
        };
        syncToBrowserUrl(next, false);
        return next;
      });
    },
    [syncToBrowserUrl],
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setFilters((prev) => {
        if (prev.pageSize === newPageSize) return prev;
        const next: UrlFilters = {
          ...prev,
          pageSize: newPageSize,
          page: 1, // Reset kembali ke halaman 1 saat ukuran halaman berubah
        };
        syncToBrowserUrl(next, false);
        return next;
      });
    },
    [syncToBrowserUrl],
  );

  const resetFilters = useCallback(() => {
    setFilters((prev) => {
      const next: UrlFilters = {
        ...prev,
        routeIds: [],
        tripIds: [],
        page: 1,
      };
      syncToBrowserUrl(next, false);
      return next;
    });
  }, [syncToBrowserUrl]);

  return {
    routeIds: filters.routeIds,
    tripIds: filters.tripIds,
    page: filters.page,
    pageSize: filters.pageSize,
    setRouteIds,
    setTripIds,
    setPage,
    setPageSize,
    resetFilters,
  };
}
