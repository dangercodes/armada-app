import React from 'react';
import type { MbtaVehicleResource } from '../types/mbta';

export interface DashboardSummaryProps {
  vehicles: MbtaVehicleResource[];
  totalFleetEstimate?: number | null;
  isLoading?: boolean;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  vehicles,
  totalFleetEstimate,
  isLoading = false,
}) => {
  const loadedCount = vehicles.length;

  const inTransitCount = vehicles.filter(
    (v) => v.attributes.current_status === 'IN_TRANSIT_TO',
  ).length;

  const stoppedCount = vehicles.filter(
    (v) => v.attributes.current_status === 'STOPPED_AT',
  ).length;

  const incomingCount = vehicles.filter(
    (v) => v.attributes.current_status === 'INCOMING_AT',
  ).length;

  const otherStatusCount = loadedCount - (inTransitCount + stoppedCount + incomingCount);

  // Distinct active routes on this page
  const uniqueRoutesCount = new Set(
    vehicles.map((v) => v.relationships.route?.data?.id).filter(Boolean),
  ).size;

  return (
    <section aria-label="Ringkasan metrik dashboard" className="space-y-4">
      {/* Hero Description Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B3C8C] text-xs font-bold tracking-wide uppercase mb-2">
            Operasional Armada
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pemantauan Armada Aktif
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Informasi posisi terkini, status perjalanan, dan rute armada bus secara langsung.
          </p>
        </div>

        {/* Fleet Count Callout */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4 text-left md:text-right shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Dimuat di Halaman
          </span>
          <div className="flex items-baseline md:justify-end gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-[#0B3C8C]">
              {isLoading ? '...' : loadedCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              armada
            </span>
          </div>
          {totalFleetEstimate !== undefined && totalFleetEstimate !== null && (
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ~{totalFleetEstimate} total di seluruh jaringan
            </span>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Sedang Berjalan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Sedang Berjalan
            </span>
            <span className="w-2 h-2 rounded-full bg-[#1E6BD6]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">
              {isLoading ? '-' : inTransitCount}
            </span>
            <span className="text-[11px] font-medium text-[#1E6BD6] bg-blue-50 px-2 py-0.5 rounded">
              {loadedCount > 0
                ? `${Math.round((inTransitCount / loadedCount) * 100)}%`
                : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            Bergerak antar halte/koridor
          </p>
        </div>

        {/* Metric 2: Berhenti di Halte */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Berhenti di Halte
            </span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">
              {isLoading ? '-' : stoppedCount}
            </span>
            <span className="text-[11px] font-medium text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded">
              {loadedCount > 0
                ? `${Math.round((stoppedCount / loadedCount) * 100)}%`
                : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            Menaikkan/menurunkan penumpang
          </p>
        </div>

        {/* Metric 3: Mendekati Halte */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Mendekati Halte
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F5B400]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">
              {isLoading ? '-' : incomingCount}
            </span>
            <span className="text-[11px] font-medium text-[#B45309] bg-amber-50 px-2 py-0.5 rounded">
              {loadedCount > 0
                ? `${Math.round((incomingCount / loadedCount) * 100)}%`
                : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            Segera tiba di peron/halte
          </p>
        </div>

        {/* Metric 4: Rute Terlayani */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Rute Terlayani
            </span>
            <span className="w-2 h-2 rounded-full bg-[#0B3C8C]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">
              {isLoading ? '-' : uniqueRoutesCount}
            </span>
            <span className="text-[11px] font-medium text-[#0B3C8C] bg-slate-100 px-2 py-0.5 rounded">
              {otherStatusCount > 0 ? `+${otherStatusCount} status lain` : 'Rute aktif'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            Rute aktif di halaman ini
          </p>
        </div>
      </div>

      {/* Note distinguishing page-level metrics from fleet totals */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-blue-50/60 border border-blue-100/80 rounded-xl px-4 py-2">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#1E6BD6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Metrik mencerminkan data yang dimuat saat ini ({loadedCount} armada). Data jaringan lengkap dapat diakses via navigasi halaman.</span>
        </span>
        <span className="hidden sm:inline-block font-medium text-slate-600">
          Data Feed API V3
        </span>
      </div>
    </section>
  );
};
