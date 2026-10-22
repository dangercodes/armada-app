import { useMemo, useState } from 'react';
import { useVehicles } from './hooks/useVehicles';
import {
  AppHeader,
  DashboardSummary,
  EmptyState,
  ErrorState,
  FilterToolbarPlaceholder,
  PaginationPlaceholder,
  VehicleGrid,
} from './components';
import { createIncludedLookup } from './utils/lookup';
import { parseOffsetFromUrl } from './utils/pagination';
import type { MbtaVehicleResource } from './types/mbta';

export default function App() {
  const [selectedVehicleNotice, setSelectedVehicleNotice] = useState<string | null>(null);

  // Fetch live vehicle data (12 items for balanced 1/2/3/4-col responsive grid)
  const vehiclesQuery = useVehicles({
    limit: 12,
    offset: 0,
    include: ['route', 'trip', 'stop'],
  });

  // Index included resources (routes, trips, stops) for O(1) card lookups
  const { routes, trips } = useMemo(() => {
    return createIncludedLookup(vehiclesQuery.data?.included);
  }, [vehiclesQuery.data?.included]);

  // Estimate total fleet size from the JSON:API 'last' link offset
  const totalFleetEstimate = useMemo(() => {
    const lastOffset = parseOffsetFromUrl(vehiclesQuery.data?.links?.last);
    if (lastOffset === null) return null;
    return lastOffset + (vehiclesQuery.data?.data?.length ?? 12);
  }, [vehiclesQuery.data?.links?.last, vehiclesQuery.data?.data?.length]);

  const lastUpdatedDate = vehiclesQuery.dataUpdatedAt
    ? new Date(vehiclesQuery.dataUpdatedAt)
    : null;

  const handleVehicleClick = (vehicle: MbtaVehicleResource) => {
    const label = vehicle.attributes.label?.trim() || `ID: ${vehicle.id}`;
    setSelectedVehicleNotice(
      `Kendaraan "${label}" dipilih. Modal detail armada lengkap dengan peta Leaflet interaktif akan aktif di Phase 5.`,
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-slate-800 flex flex-col font-sans antialiased selection:bg-[#1E6BD6]/20">
      {/* 1. Compact Application Header */}
      <AppHeader
        lastUpdated={lastUpdatedDate}
        isFetching={vehiclesQuery.isFetching}
        onRefresh={() => vehiclesQuery.refetch()}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Interactive Notice Toast when a vehicle card is clicked */}
        {selectedVehicleNotice && (
          <div
            role="status"
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-[#0B3C8C] shadow-xs motion-safe:animate-fadeIn"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#1E6BD6] shrink-0" />
              <p className="font-medium">{selectedVehicleNotice}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVehicleNotice(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded"
              aria-label="Tutup notifikasi"
            >
              &times;
            </button>
          </div>
        )}

        {/* 2 & 3. Hero Introduction & Live Metrics Summary */}
        <DashboardSummary
          vehicles={vehiclesQuery.data?.data ?? []}
          totalFleetEstimate={totalFleetEstimate}
          isLoading={vehiclesQuery.isLoading}
        />

        {/* 4. Filter Toolbar Placeholder (Phase 4) */}
        <FilterToolbarPlaceholder />

        {/* 5. Responsive Vehicle Card Grid with Loading / Error / Empty states */}
        {vehiclesQuery.isLoading ? (
          <VehicleGrid
            vehicles={[]}
            isLoading={true}
            skeletonCount={8}
          />
        ) : vehiclesQuery.isError ? (
          <ErrorState
            error={vehiclesQuery.error}
            onRetry={() => vehiclesQuery.refetch()}
          />
        ) : !vehiclesQuery.data?.data || vehiclesQuery.data.data.length === 0 ? (
          <EmptyState onRefresh={() => vehiclesQuery.refetch()} />
        ) : (
          <VehicleGrid
            vehicles={vehiclesQuery.data.data}
            routes={routes}
            trips={trips}
            onVehicleClick={handleVehicleClick}
          />
        )}

        {/* 6. Pagination Placeholder (Phase 3) */}
        <PaginationPlaceholder
          currentCount={vehiclesQuery.data?.data?.length ?? 0}
          totalEstimate={totalFleetEstimate}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Transjakarta - Sistem Manajemen Armada &bull; Phase 2</span>
          <span>Sistem Monitoring Operasional &bull; React 19 &bull; Vite &bull; Tailwind CSS v4</span>
        </div>
      </footer>
    </div>
  );
}
