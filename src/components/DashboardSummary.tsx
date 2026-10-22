import React from 'react';
import type { MbtaVehicleResource } from '../types/mbta';
import bannerTj from '../assets/banner-tj.jpg';

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
      {/* 21st.dev-inspired Cinematic Hero Banner with Transjakarta Official Backdrop */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-900/10 bg-[#031126] text-white min-h-[260px] sm:min-h-[290px] flex items-center">
        {/* Background Image: Transjakarta Bus Window & Logo Banner */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={bannerTj}
            alt="Transjakarta Connecting The Life of Jakarta"
            className="w-full h-full object-cover object-[center_30%] opacity-90 transition-transform duration-1000 ease-out hover:scale-105"
            loading="eager"
          />
          {/* Multi-layer Gradient Overlays for Extreme Contrast, Legibility & Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#031126] via-[#051C3D]/95 via-45% to-[#0B254E]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b18]/95 via-transparent to-black/40" />

          {/* Ambient Radial Glowing Orbs for Modern Glow Aesthetics */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Badges, Title, Slogan, and Micro-tags */}
          <div className="space-y-3.5 max-w-2xl">
            {/* Main Headline with Gradient Glow */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Pemantauan Armada{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-white">
                Real-Time
              </span>{' '}
              Transjakarta
            </h1>

            {/* Description with Transjakarta Motto */}
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl font-normal">
              Sistem telemetri terpadu untuk memantau pergerakan bus, ketepatan kedatangan di halte, dan kelancaran koridor Transjakarta —{' '}
              <em className="text-sky-200 font-semibold not-italic">
                &ldquo;Connecting the Life of Jakarta&rdquo;
              </em>.
            </p>

            {/* Micro Feature Highlights */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300 font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                Sinkronisasi 30 Detik
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                Pelacakan Posisi GPS
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                Status Peron &amp; Halte
              </span>
            </div>
          </div>

          {/* Right Column: Modern Glassmorphic Live Metric Card */}
          <div className="shrink-0 lg:w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/35 transition-all">
            {/* Subtle card glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between text-xs mb-2">
              <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
                Total Armada Jaringan
              </span>
            </div>

            <div className="relative z-10 my-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {isLoading ? '...' : (totalFleetEstimate ?? loadedCount)}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  unit armada
                </span>
              </div>
              <p className="text-[11px] text-slate-300/80 mt-1">
                Beroperasi aktif di seluruh koridor jaringan
              </p>
            </div>

            <div className="relative z-10 pt-3 mt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300">
              <span>Dimuat di halaman:</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                {isLoading ? '...' : loadedCount} armada
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Sedang Berjalan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Sedang Berjalan
            </span>
            <span className="w-2 h-2 rounded-full bg-[#1E6BD6] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isLoading ? '-' : inTransitCount}
            </span>
            <span className="text-[11px] font-bold text-[#1E6BD6] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Berhenti di Halte
            </span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isLoading ? '-' : stoppedCount}
            </span>
            <span className="text-[11px] font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Mendekati Halte
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F5B400] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isLoading ? '-' : incomingCount}
            </span>
            <span className="text-[11px] font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 truncate">
              Rute Terlayani
            </span>
            <span className="w-2 h-2 rounded-full bg-[#0B3C8C] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isLoading ? '-' : uniqueRoutesCount}
            </span>
            <span className="text-[11px] font-bold text-[#0B3C8C] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {otherStatusCount > 0 ? `+${otherStatusCount} status lain` : 'Rute aktif'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            Rute aktif di halaman ini
          </p>
        </div>
      </div>
    </section>
  );
};
