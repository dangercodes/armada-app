import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  MbtaRouteResource,
  MbtaStopResource,
  MbtaTripResource,
  MbtaVehicleResource,
} from '../types/mbta';
import { getVehicleById } from '../api/vehicles';
import { createIncludedLookup } from '../utils/lookup';
import { StatusBadge } from './StatusBadge';
import { VehicleMap } from './VehicleMap';
import { VehicleModalSkeleton } from './VehicleModalSkeleton';
import {
  formatBearing,
  formatCoordinates,
  formatDateTime,
  formatDirection,
  formatRelativeTime,
  formatRevenue,
  formatSpeed,
  formatStopSequence,
  getRawCoordinatesString,
  humanizeOccupancy,
  normalizeHexColor,
} from '../utils/formatters';

export interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: MbtaVehicleResource | null;
  initialRoute?: MbtaRouteResource;
  initialTrip?: MbtaTripResource;
  initialStop?: MbtaStopResource;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  initialRoute,
  initialTrip,
  initialStop,
}) => {
  const [copied, setCopied] = useState(false);
  const [prevVehicleId, setPrevVehicleId] = useState<string | null>(null);
  const [isOpeningSkeleton, setIsOpeningSkeleton] = useState(false);
  const [isRefreshingSkeleton, setIsRefreshingSkeleton] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Sinkronkan state skeleton saat modal dibuka atau armada yang dituju berganti
  const currentVehicleId = isOpen ? (vehicle?.id ?? null) : null;
  if (currentVehicleId !== prevVehicleId) {
    setPrevVehicleId(currentVehicleId);
    if (isOpen) {
      setIsOpeningSkeleton(true);
    } else {
      setIsOpeningSkeleton(false);
      setIsRefreshingSkeleton(false);
    }
  }

  // Tutup animasi skeleton setelah 500ms
  useEffect(() => {
    if (isOpen && isOpeningSkeleton) {
      const timer = setTimeout(() => {
        setIsOpeningSkeleton(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isOpeningSkeleton]);

  // Periksa apakah ada relasi yang hilang sehingga perlu fetch /vehicles/{id}?include=route,trip,stop
  const routeId = vehicle?.relationships.route?.data?.id;
  const tripId = vehicle?.relationships.trip?.data?.id;
  const stopId = vehicle?.relationships.stop?.data?.id;

  const hasMissingRelationships = Boolean(
    (routeId && !initialRoute) ||
    (tripId && !initialTrip) ||
    (stopId && !initialStop),
  );

  const shouldFetchDetails = Boolean(isOpen && vehicle && hasMissingRelationships);

  const [detailData, setDetailData] = useState<import('../types/mbta').MbtaResponse<MbtaVehicleResource> | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailError, setIsDetailError] = useState(false);

  const vehicleId = vehicle?.id;

  const fetchDetail = useCallback(async () => {
    if (!vehicleId) return;
    setIsDetailLoading(true);
    setIsDetailError(false);
    try {
      const res = await getVehicleById(vehicleId, ['route', 'trip', 'stop']);
      setDetailData(res);
    } catch {
      setIsDetailError(true);
    } finally {
      setIsDetailLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (shouldFetchDetails) {
      fetchDetail();
    } else {
      setDetailData(null);
    }
  }, [shouldFetchDetails, fetchDetail]);

  // Handler tombol refresh manual: memicu refetch API secara live dan menampilkan skeleton
  const handleManualRefresh = async () => {
    setIsRefreshingSkeleton(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await Promise.all([fetchDetail(), minDelay]);
    } finally {
      setIsRefreshingSkeleton(false);
    }
  };

  // Resolusi data relasi: gunakan data hasil fetch jika ada, fallback ke initial props
  const { resolvedRoute, resolvedTrip, resolvedStop } = useMemo(() => {
    if (detailData) {
      const lookup = createIncludedLookup(detailData.included);
      return {
        resolvedRoute: (routeId ? lookup.routes.get(routeId) : undefined) || initialRoute,
        resolvedTrip: (tripId ? lookup.trips.get(tripId) : undefined) || initialTrip,
        resolvedStop: (stopId ? lookup.stops.get(stopId) : undefined) || initialStop,
      };
    }
    return {
      resolvedRoute: initialRoute,
      resolvedTrip: initialTrip,
      resolvedStop: initialStop,
    };
  }, [detailData, routeId, tripId, stopId, initialRoute, initialTrip, initialStop]);

  // Gunakan data armada terbaru jika hasil detail lebih mutakhir
  const effectiveVehicle = detailData?.data || vehicle;

  // Manajemen Aksesibilitas Fokus & Kunci Scroll Halaman
  useEffect(() => {
    if (!isOpen) return;

    // Rekam elemen yang sebelumnya aktif agar fokus bisa dikembalikan saat modal ditutup
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Kunci scroll halaman belakang
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Berikan fokus awal ke tombol tutup setelah modal tampil
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    // Event handler keyboard: Escape untuk menutup dan Tab focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      // Kembalikan fokus secara asynchronous agar tidak memproses sisa event mouse/keyboard
      requestAnimationFrame(() => {
        previousActiveElement?.focus?.();
      });
    };
  }, [isOpen, onClose]);

  if (!isOpen || !effectiveVehicle) {
    return null;
  }

  const { attributes, relationships } = effectiveVehicle;
  const label = attributes.label?.trim() || `ID: ${effectiveVehicle.id}`;
  const routeColor = normalizeHexColor(resolvedRoute?.attributes.color, '#0B3C8C');
  const routeTextColor = normalizeHexColor(resolvedRoute?.attributes.text_color, '#FFFFFF');

  const routeShortName = resolvedRoute?.attributes.short_name;
  const routeLongName = resolvedRoute?.attributes.long_name;
  const routeDisplayName =
    routeShortName && routeLongName
      ? `${routeShortName} • ${routeLongName}`
      : routeShortName || routeLongName || relationships.route?.data?.id || 'Tidak tersedia';

  const tripHeadsign = resolvedTrip?.attributes.headsign || 'Tidak tersedia';
  const tripDirection = formatDirection(
    resolvedTrip?.attributes.direction_id ?? attributes.direction_id,
  );

  const rawCoordinates = getRawCoordinatesString(attributes.latitude, attributes.longitude);
  const formattedCoords = formatCoordinates(attributes.latitude, attributes.longitude);

  const handleCopyCoords = async () => {
    if (!rawCoordinates) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(rawCoordinates);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = rawCoordinates;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Abaikan error saat menyalin ke clipboard
    }
  };

  const occupancyDisplay = humanizeOccupancy(attributes.occupancy_status) || 'Tidak tersedia';
  const speedDisplay = formatSpeed(attributes.speed);
  const bearingDisplay = formatBearing(attributes.bearing);
  const stopSeqDisplay = formatStopSequence(attributes.current_stop_sequence);
  const revenueDisplay = formatRevenue(attributes.revenue);

  // Rincian Halte
  const stopName = resolvedStop?.attributes.name || 'Tidak tersedia';
  const stopDescription = resolvedStop?.attributes.description;
  const stopPlatform = resolvedStop?.attributes.platform_name;
  const stopMunicipality = resolvedStop?.attributes.municipality;

  // Daftar gerbong (carriages) jika tersedia dari API
  const carriages = Array.isArray(attributes.carriages) ? attributes.carriages : null;

  // Tampilkan loading skeleton selama delay awal (500ms), refresh manual, atau fetch detail berlangsung
  const showSkeleton = isOpeningSkeleton || isRefreshingSkeleton || isDetailLoading;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-modal-title"
      aria-describedby="vehicle-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto isolate"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      {/* 1. Lapisan latar belakang (Backdrop overlay) */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity motion-safe:animate-fadeIn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* 2. Jendela Dialog Modal */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] motion-safe:animate-scaleUp z-10"
      >
        {/* Strip Header Atas dengan Warna Aksen Rute */}
        <div className="h-2 w-full" style={{ backgroundColor: routeColor }} />

        {/* Header Modal */}
        <header className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs"
              style={{ backgroundColor: routeColor, color: routeTextColor }}
            >
              {routeShortName || 'TJ'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="vehicle-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  Armada {label}
                </h2>
                <StatusBadge status={attributes.current_status} />
              </div>
              <p id="vehicle-modal-desc" className="text-xs text-slate-500 truncate mt-0.5">
                Rute: <strong className="text-slate-700">{routeDisplayName}</strong> &bull; Terakhir diperbarui{' '}
                <span title={formatDateTime(attributes.updated_at)}>
                  {formatRelativeTime(attributes.updated_at)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={showSkeleton}
              aria-label="Perbarui telemetri armada live"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
              title="Muat ulang posisi GPS dan status live dari MBTA API"
            >
              <svg
                className={`w-3.5 h-3.5 text-[#1E6BD6] ${showSkeleton ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Perbarui Live</span>
            </button>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              aria-label="Tutup detail armada"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6BD6]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {isDetailError && (
          <div className="bg-rose-50 px-6 py-2 border-b border-rose-100 flex items-center justify-between text-xs text-rose-800">
            <span>Gagal memperbarui rincian relasi. Menampilkan data yang tersedia.</span>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="text-rose-700 font-semibold underline hover:text-rose-900 cursor-pointer ml-2"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Konten Dialog Modal: Jika sedang memuat data, tampilkan Skeleton beranimasi */}
        {showSkeleton ? (
          <VehicleModalSkeleton />
        ) : (
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KOLOM KIRI: Informasi Lengkap Armada (7 Kolom pada Desktop) */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Kartu Posisi GPS & Waktu */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#1E6BD6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Posisi &amp; Waktu Telemetri
                  </span>
                  {rawCoordinates && (
                    <button
                      type="button"
                      onClick={handleCopyCoords}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E6BD6] hover:text-[#0B3C8C] bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Salin Koordinat
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Latitude &amp; Longitude</span>
                    <p className="font-mono font-semibold text-slate-800 text-xs truncate">
                      {formattedCoords}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Waktu Update Terakhir</span>
                    <p className="font-medium text-slate-800 text-xs">
                      {formatDateTime(attributes.updated_at)}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      ({formatRelativeTime(attributes.updated_at)})
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Rincian Rute, Perjalanan (Trip), & Halte (Stop) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Informasi Layanan &amp; Perjalanan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Rute Info */}
                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block mb-1">Jalur / Rute Armada</span>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: routeColor }}
                      />
                      <strong className="text-slate-800 font-semibold truncate">
                        {resolvedRoute?.attributes.long_name || routeDisplayName}
                      </strong>
                    </div>
                    {resolvedRoute?.attributes.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        {resolvedRoute.attributes.description}
                      </p>
                    )}
                  </div>

                  {/* Trip Info */}
                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 block mb-1">Tujuan / Headsign</span>
                    <strong className="text-slate-800 font-semibold block text-xs truncate">
                      {tripHeadsign}
                    </strong>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <span>Arah:</span>
                      <span className="font-medium text-slate-700">{tripDirection}</span>
                    </div>
                    {resolvedTrip?.id && (
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        ID Trip: {resolvedTrip.id}
                      </span>
                    )}
                  </div>
                </div>

                {/* Halte Info */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">Informasi Halte Terkait (Stop)</span>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-slate-800 font-semibold text-xs block">
                        {stopName}
                      </strong>
                      {stopDescription && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {stopDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                        {stopPlatform && (
                          <span>Peron: <strong className="text-slate-700">{stopPlatform}</strong></span>
                        )}
                        {stopMunicipality && (
                          <span>Wilayah: <strong className="text-slate-700">{stopMunicipality}</strong></span>
                        )}
                        {relationships.stop?.data?.id && (
                          <span className="font-mono text-[10px] text-slate-400">ID Halte: {relationships.stop.data.id}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Parameter Teknis & Dinamika Kendaraan */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Parameter Operasional &amp; Telemetri
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Kecepatan (Speed)</span>
                    <strong className="text-slate-800 font-semibold block text-xs">{speedDisplay}</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Arah Hadap (Bearing)</span>
                    <strong className="text-slate-800 font-semibold block text-xs">{bearingDisplay}</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Urutan Halte</span>
                    <strong className="text-slate-800 font-semibold block text-xs">{stopSeqDisplay}</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Tingkat Kepadatan</span>
                    <strong className="text-slate-800 font-semibold block text-xs truncate">
                      {occupancyDisplay}
                    </strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Status Komersial</span>
                    <strong className="text-slate-800 font-semibold block text-xs truncate">
                      {revenueDisplay}
                    </strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Aksesibilitas</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {resolvedTrip?.attributes.wheelchair_accessible === 1 ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">♿ Kursi Roda</span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Standar</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gerbong / Carriages (jika tersedia dari API) */}
              {carriages && carriages.length > 0 && (
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">Rangkaian Gerbong ({carriages.length} Gerbong)</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {carriages.map((c: unknown, idx: number) => {
                      const carriage = c as { label?: string; occupancy_status?: string };
                      return (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[11px] shadow-2xs"
                        >
                          Gerbong {carriage.label || idx + 1}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* KOLOM KANAN: Peta Interaktif Leaflet (5 Kolom pada Desktop) */}
            <div className="lg:col-span-5 flex flex-col min-h-[340px] lg:min-h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Peta Posisi Real-Time
                </span>
                <span className="text-[10px] text-slate-400">
                  {attributes.bearing !== null && attributes.bearing !== undefined
                    ? `Posisi armada & arah hadap (${attributes.bearing}\u00B0)`
                    : 'Posisi GPS armada'}
                </span>
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden min-h-[320px]">
                <VehicleMap
                  latitude={attributes.latitude}
                  longitude={attributes.longitude}
                  bearing={attributes.bearing}
                  label={label}
                  status={attributes.current_status}
                  routeColor={routeColor}
                  routeShortName={routeShortName}
                  updatedAt={attributes.updated_at}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Modal */}
        <footer className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 text-xs text-slate-500 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6BD6]"
          >
            Tutup
          </button>
        </footer>
      </div>
    </div>
  );
};
