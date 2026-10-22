import { useQuery } from '@tanstack/react-query';
import { getRoutes } from '../api/routes';
import { mbtaKeys } from '../api/queryClient';
import type { RouteQueryParams } from '../types/mbta';

export interface UseRoutesOptions {
  enabled?: boolean;
}

export function useRoutes(
  params: RouteQueryParams = {},
  options: UseRoutesOptions = {},
) {
  return useQuery({
    queryKey: mbtaKeys.routeList(params),
    queryFn: ({ signal }) => getRoutes(params, signal),
    enabled: options.enabled,
  });
}
