import { useEffect, useMemo, useRef, useState } from 'react';
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

const VEHICLE_INCLUDES = ['route', 'trip', 'stop'];

export default function App() {
  // State tersinkronisasi dengan parameter URL (?routes=...&trips=...&page=...&pageSize=...)
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
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const lastClosedTimeRef = useRef<number>(0);
  const vehicleSectionRef = useRef<HTMLDivElement>(null);

  // Ambil data armada berpaginasi dengan server-side page[limit], page[offset], serta filter rute/trip
  const vehiclesQuery = useVehicles({
    page,
    pageSize,
    routeIds: routeIds.length > 0 ? routeIds : undefined,
    tripIds: tripIds.length > 0 ? tripIds : undefined,
    include: VEHICLE_INCLUDES,
  });

  // Handler refresh manual dashboard: memicu refetch API dan menampilkan skeleton kartu
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 600));
    try {
      await Promise.all([vehiclesQuery.refetch(), minDelay]);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const isGridLoading = vehiclesQuery.isLoading || isManualRefreshing;

  // Indeks data relasi (rute, trip, halte) untuk lookup cepat kartu dengan kompleksitas O(1)
  const { routes, trips, stops } = useMemo(() => {
    return createIncludedLookup(vehiclesQuery.data?.included);
  }, [vehiclesQuery.data?.included]);

  // Menangani perubahan ukuran halaman dan otomatis reset ke halaman 1
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  // Navigasi halaman yang aman dengan validasi batas halaman
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (vehiclesQuery.totalPages !== null && newPage > vehiclesQuery.totalPages) return;
    setPage(newPage);

    // Scroll halus kembali ke bagian kartu armada saat ganti halaman
    if (vehicleSectionRef.current) {
      const topOffset = vehicleSectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  };

  // Mencegah posisi halaman melebihi total halaman yang tersedia saat filter berubah
  useEffect(() => {
    if (
      vehiclesQuery.totalPages !== null &&
      vehiclesQuery.totalPages > 0 &&
      page > vehiclesQuery.totalPages
    ) {
      setPage(vehiclesQuery.totalPages);
    }
  }, [vehiclesQuery.totalPages, page, setPage]);

  const lastUpdatedDate = vehiclesQuery.dataUpdatedAt
    ? new Date(vehiclesQuery.dataUpdatedAt)
    : null;

  const handleCloseModal = () => {
    lastClosedTimeRef.current = Date.now();
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleVehicleClick = (vehicle: MbtaVehicleResource) => {
    // Mencegah klik tembus (ghost click) pada kartu di bawah modal sesaat setelah modal ditutup
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
      {/* 1. Header Aplikasi Kompak */}
      <AppHeader
        lastUpdated={lastUpdatedDate}
        isFetching={vehiclesQuery.isFetching || isManualRefreshing}
        onRefresh={handleManualRefresh}
      />

      {/* Kontainer Utama Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* 2 & 3. Banner Hero & Ringkasan Metrik Operasional Langsung */}
        <DashboardSummary
          vehicles={vehiclesQuery.data?.data ?? []}
          totalFleetEstimate={vehiclesQuery.totalRecords}
          isLoading={isGridLoading}
          isTotalLoading={vehiclesQuery.isTotalLoading}
        />

        {/* 4. Filter Multi-Pilih Rute & Perjalanan */}
        <FilterToolbar
          selectedRouteIds={routeIds}
          onRouteIdsChange={setRouteIds}
          selectedTripIds={tripIds}
          onTripIdsChange={setTripIds}
          onResetFilters={resetFilters}
          isFetchingVehicles={vehiclesQuery.isFetching || isManualRefreshing}
        />

        {/* Referensi jangkar untuk scroll halus paginasi */}
        <div ref={vehicleSectionRef} className="scroll-mt-20">
          {/* Indikator sinkronisasi halus saat transisi data antar halaman */}
          {vehiclesQuery.isFetching && !vehiclesQuery.isLoading && !isManualRefreshing && (
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

          {/* 5. Grid Kartu Armada Responsif dengan status Loading / Error / Kosong */}
          {isGridLoading ? (
            <VehicleGrid
              vehicles={[]}
              isLoading={true}
              skeletonCount={pageSize}
            />
          ) : vehiclesQuery.isError ? (
            <ErrorState
              error={vehiclesQuery.error}
              onRetry={handleManualRefresh}
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

        {/* 6. Komponen Paginasi Server-Side Lengkap */}
        <Pagination
          currentPage={page}
          totalPages={vehiclesQuery.totalPages}
          pageSize={pageSize}
          totalRecords={vehiclesQuery.totalRecords}
          currentCount={vehiclesQuery.data?.data?.length ?? 0}
          pageSizeOptions={[8, 12, 16, 20, 24, 32]}
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

      {/* 7. Modal Detail Armada Beraksesibilitas dengan Peta Interaktif Leaflet */}
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
