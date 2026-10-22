import { QueryClient } from '@tanstack/react-query';
import { MbtaApiError } from './client';
import type { RouteQueryParams, TripQueryParams, VehicleQueryParams } from '../types/mbta';

/**
 * Standardized query key factory for consistent caching and invalidation across the app.
 */
export const mbtaKeys = {
  all: ['mbta'] as const,
  vehicles: () => [...mbtaKeys.all, 'vehicles'] as const,
  vehicleList: (params: VehicleQueryParams) =>
    [...mbtaKeys.vehicles(), 'list', params] as const,
  vehicleDetail: (id: string) =>
    [...mbtaKeys.vehicles(), 'detail', id] as const,
  routes: () => [...mbtaKeys.all, 'routes'] as const,
  routeList: (params: RouteQueryParams) =>
    [...mbtaKeys.routes(), 'list', params] as const,
  routeDetail: (id: string) =>
    [...mbtaKeys.routes(), 'detail', id] as const,
  trips: () => [...mbtaKeys.all, 'trips'] as const,
  tripList: (params: TripQueryParams) =>
    [...mbtaKeys.trips(), 'list', params] as const,
  tripDetail: (id: string) =>
    [...mbtaKeys.trips(), 'detail', id] as const,
};

/**
 * Shared QueryClient instance configured with production-grade defaults:
 * - 30s stale time to balance real-time fleet freshness with rate limits
 * - 5m garbage collection
 * - Smart retries that abort on client errors (400, 401, 403, 404)
 * - Window focus refetch disabled to conserve quota
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (error instanceof MbtaApiError) {
          if (
            error.status === 400 ||
            error.status === 401 ||
            error.status === 403 ||
            error.status === 404
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
