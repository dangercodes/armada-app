import React from 'react';
import type {
  MbtaRouteResource,
  MbtaTripResource,
  MbtaVehicleResource,
} from '../types/mbta';
import { VehicleCard } from './VehicleCard';
import { VehicleCardSkeleton } from './VehicleCardSkeleton';

export interface VehicleGridProps {
  vehicles: MbtaVehicleResource[];
  routes?: Map<string, MbtaRouteResource>;
  trips?: Map<string, MbtaTripResource>;
  isLoading?: boolean;
  skeletonCount?: number;
  onVehicleClick?: (vehicle: MbtaVehicleResource) => void;
}

export const VehicleGrid: React.FC<VehicleGridProps> = ({
  vehicles,
  routes = new Map(),
  trips = new Map(),
  isLoading = false,
  skeletonCount = 8,
  onVehicleClick,
}) => {
  if (isLoading) {
    return (
      <section
        aria-label="Memuat armada"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
      >
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <VehicleCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </section>
    );
  }

  return (
    <section
      aria-label="Daftar armada aktif"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
    >
      {vehicles.map((vehicle) => {
        const routeId = vehicle.relationships.route?.data?.id;
        const tripId = vehicle.relationships.trip?.data?.id;

        const route = routeId ? routes.get(routeId) : undefined;
        const trip = tripId ? trips.get(tripId) : undefined;

        return (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            route={route}
            trip={trip}
            onClick={onVehicleClick}
          />
        );
      })}
    </section>
  );
};
