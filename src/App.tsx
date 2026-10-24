import { useMemo, useRef, useState } from 'react';
import { useVehicles } from './hooks/useVehicles';
import { useUrlFilters } from './hooks/useUrlFilters';
import {
  AppHeader,
  DashboardSummary,
  EmptyState,
  ErrorState,
  FilterToolbar,
  Pagination,
  VehicleGrid,
  VehicleModal,
} from './components';
import { createIncludedLookup } from './utils/lookup';
import type { MbtaVehicleResource } from './types/mbta';

export default function App() {
  // Synchronized state with URL query parameters (?routes=...&trips=...&page=...&pageSize=...)
  const {
    routeIds,
    tripIds,
    page,
    pageSize,
    setRouteIds,
    setTripIds,
    setPage,
    setPageSize,
    resetFilters,
  } = useUrlFilters();

  const [selectedVehicle, setSelectedVehicle] = useState<MbtaVehicleResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastClosedTimeRef = useRef<number>(0);
  const vehicleSectionRef = useRef<HTMLDivElement>(null);

  // Fetch paginated vehicles with server-side page[limit], page[offset], and route/trip filters
  const vehiclesQuery = useVehicles({
    page,
    pageSize,
    routeIds: routeIds.length > 0 ? routeIds : undefined,
    tripIds: tripIds.length > 0 ? tripIds : undefined,
    include: ['route', 'trip', 'stop'],
  });

  // Index included resources (routes, trips, stops) for O(1) card lookups
  const { routes, trips, stops } = useMemo(() => {
    return createIncludedLookup(vehiclesQuery.data?.included);
  }, [vehiclesQuery.data?.included]);

  // Handle page size change with automatic reset to page 1
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  // Safe page change with boundary checks
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (vehiclesQuery.totalPages !== null && newPage > vehiclesQuery.totalPages) return;
    setPage(newPage);

    // Smooth scroll back to vehicle section for optimal user navigation
    if (vehicleSectionRef.current) {
      const topOffset = vehicleSectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  };

  // Prevent navigation to invalid pages when total count changes
  if (
    vehiclesQuery.totalPages !== null &&
    vehiclesQuery.totalPages > 0 &&
    page > vehiclesQuery.totalPages
  ) {
    setPage(vehiclesQuery.totalPages);
  }

  const lastUpdatedDate = vehiclesQuery.dataUpdatedAt
    ? new Date(vehiclesQuery.dataUpdatedAt)
    : null;

  const handleCloseModal = () => {
    lastClosedTimeRef.current = Date.now();
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleVehicleClick = (vehicle: MbtaVehicleResource) => {
    // Prevent phantom click-through (ghost click) on underlying cards immediately after closing modal
    if (Date.now() - lastClosedTimeRef.current < 400) {
      return;
    }
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const selectedRoute = selectedVehicle?.relationships.route?.data?.id
    ? routes.get(selectedVehicle.relationships.route.data.id)
    : undefined;

  const selectedTrip = selectedVehicle?.relationships.trip?.data?.id
    ? trips.get(selectedVehicle.relationships.trip.data.id)
    : undefined;

  const selectedStop = selectedVehicle?.relationships.stop?.data?.id
    ? stops.get(selectedVehicle.relationships.stop.data.id)
    : undefined;

  const hasActiveFilters = routeIds.length > 0 || tripIds.length > 0;

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

        {/* 2 & 3. Hero Introduction & Live Metrics Summary */}
        <DashboardSummary
          vehicles={vehiclesQuery.data?.data ?? []}
          totalFleetEstimate={vehiclesQuery.totalRecords}
          isLoading={vehiclesQuery.isLoading}
          isTotalLoading={vehiclesQuery.isTotalLoading}
        />

        {/* 4. Multi-Select Route & Trip Filters (Phase 4) */}
        <FilterToolbar
          selectedRouteIds={routeIds}
          onRouteIdsChange={setRouteIds}
          selectedTripIds={tripIds}
          onTripIdsChange={setTripIds}
          onResetFilters={resetFilters}
          isFetchingVehicles={vehiclesQuery.isFetching}
        />

        {/* Anchor reference for smooth pagination scrolling */}
        <div ref={vehicleSectionRef} className="scroll-mt-20">
          {/* Subtle Fetching Indicator during page transitions when previous data is kept */}
          {vehiclesQuery.isFetching && !vehiclesQuery.isLoading && (
            <div
              role="status"
              aria-live="polite"
              className="mb-3 bg-blue-50/90 border border-blue-200/90 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-[#0B3C8C] shadow-2xs motion-safe:animate-fadeIn"
            >
              <div className="flex items-center gap-2.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E6BD6] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E6BD6]" />
                </span>
                <span>Memperbarui data armada halaman {page}...</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                page[limit]={pageSize}&amp;page[offset]={vehiclesQuery.offset}
              </span>
            </div>
          )}

          {/* 5. Responsive Vehicle Card Grid with Loading / Error / Empty states */}
          {vehiclesQuery.isLoading ? (
            <VehicleGrid
              vehicles={[]}
              isLoading={true}
              skeletonCount={pageSize}
            />
          ) : vehiclesQuery.isError ? (
            <ErrorState
              error={vehiclesQuery.error}
              onRetry={() => vehiclesQuery.refetch()}
            />
          ) : !vehiclesQuery.data?.data || vehiclesQuery.data.data.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="Tidak Ada Armada Sesuai Filter"
                description={
                  tripIds.length > 0
                    ? "Tidak ada kendaraan fisik yang sedang aktif beroperasi di jalan raya untuk jadwal perjalanan (trip) yang dipilih. Pada MBTA, daftar trip mencakup seluruh jadwal 24 jam, sedangkan armada hanya muncul saat kendaraan sedang berjalan. Silakan pilih opsi berlabel '● Sedang Berjalan' di dropdown untuk melihat kendaraan aktif."
                    : "Tidak ditemukan armada aktif yang cocok dengan kombinasi filter rute atau perjalanan yang dipilih. Silakan ubah filter atau atur ulang."
                }
                onRefresh={resetFilters}
              />
            ) : (
              <EmptyState onRefresh={() => vehiclesQuery.refetch()} />
            )
          ) : (
            <div
              className={`transition-opacity duration-200 ${
                vehiclesQuery.isPlaceholderData ? 'opacity-70 pointer-events-none' : 'opacity-100'
              }`}
            >
              <VehicleGrid
                vehicles={vehiclesQuery.data.data}
                routes={routes}
                trips={trips}
                onVehicleClick={handleVehicleClick}
              />
            </div>
          )}
        </div>

        {/* 6. Fully Functional Server-Side Pagination Component (Phase 3) */}
        <Pagination
          currentPage={page}
          totalPages={vehiclesQuery.totalPages}
          pageSize={pageSize}
          totalRecords={vehiclesQuery.totalRecords}
          currentCount={vehiclesQuery.data?.data?.length ?? 0}
          pageSizeOptions={[8, 12, 24, 48]}
          isFetching={vehiclesQuery.isFetching}
          isTotalLoading={vehiclesQuery.isTotalLoading}
          hasNextPage={vehiclesQuery.hasNextPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Transjakarta - Sistem Manajemen Armada</span>
          <span>Sistem Monitoring Operasional &bull; React 19 &bull; Vite &bull; Tailwind CSS v4</span>
        </div>
      </footer>

      {/* 7. Accessible Vehicle Detail Modal with Interactive Leaflet Map (Phase 5) */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vehicle={selectedVehicle}
        initialRoute={selectedRoute}
        initialTrip={selectedTrip}
        initialStop={selectedStop}
      />
    </div>
  );
}
