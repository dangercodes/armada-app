import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../api/vehicles';
import { mbtaKeys } from '../api/queryClient';
import type { VehicleQueryParams } from '../types/mbta';

export function useVehicles(params: VehicleQueryParams = {}) {
  return useQuery({
    queryKey: mbtaKeys.vehicleList(params),
    queryFn: ({ signal }) => getVehicles(params, signal),
  });
}
