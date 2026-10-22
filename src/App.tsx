import { useMemo, useRef, useState } from 'react';
import { useVehicles } from './hooks/useVehicles';
import {
  AppHeader,
  DashboardSummary,
  EmptyState,
  ErrorState,
  FilterToolbarPlaceholder,
  Pagination,
  VehicleGrid,
} from './components';
import { createIncludedLookup } from './utils/lookup';
import type { MbtaVehicleResource } from './types/mbta';

export default function App() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [selectedVehicleNotice, setSelectedVehicleNotice] = useState<string | null>(null);

  const vehicleSectionRef = useRef<HTMLDivElement>(null);

  // Fetch paginated vehicles with server-side page[limit] and page[offset]
  const vehiclesQuery = useVehicles({
    page: currentPage,
    pageSize,
    include: ['route', 'trip', 'stop'],
  });

  // Index included resources (routes, trips, stops) for O(1) card lookups
  const { routes, trips } = useMemo(() => {
    return createIncludedLookup(vehiclesQuery.data?.included);
  }, [vehiclesQuery.data?.included]);

  // Reset to page 1 whenever page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Safe page change with boundary checks
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (vehiclesQuery.totalPages !== null && newPage > vehiclesQuery.totalPages) return;
    setCurrentPage(newPage);

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
    currentPage > vehiclesQuery.totalPages
  ) {
    setCurrentPage(vehiclesQuery.totalPages);
  }

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
              className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              &times;
            </button>
          </div>
        )}

        {/* 2 & 3. Hero Introduction & Live Metrics Summary */}
        <DashboardSummary
          vehicles={vehiclesQuery.data?.data ?? []}
          totalFleetEstimate={vehiclesQuery.totalRecords}
          isLoading={vehiclesQuery.isLoading}
        />

        {/* 4. Filter Toolbar Placeholder (Phase 4) */}
        <FilterToolbarPlaceholder />

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
                <span>Memperbarui data armada halaman {currentPage}...</span>
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
            <EmptyState onRefresh={() => vehiclesQuery.refetch()} />
          ) : (
            <div
              className={`transition-opacity duration-200 ${vehiclesQuery.isPlaceholderData ? 'opacity-70 pointer-events-none' : 'opacity-100'
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
          currentPage={currentPage}
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
    </div>
  );
}
