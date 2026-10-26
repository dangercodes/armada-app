import React from 'react';
import { formatDateTime } from '../utils/formatters';
import logoTj from '../assets/logo-tj.png';

export interface AppHeaderProps {
  lastUpdated?: Date | null;
  isFetching?: boolean;
  onRefresh?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  lastUpdated,
  isFetching = false,
  onRefresh,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs backdrop-blur-xs bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Judul Aplikasi */}
        <div className="flex items-center gap-3">
          {/* Logo Resmi Transjakarta */}
          <img
            src={logoTj}
            alt="Transjakarta"
            className="h-9 sm:h-11 w-auto object-contain select-none shrink-0"
          />

          <div className="border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Sistem Manajemen Armada
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Pemantauan & Pelacakan Armada Real-Time
            </p>
          </div>
        </div>

        {/* Bar Pembaruan & Status Sinkronisasi */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Waktu Sinkronisasi Terakhir */}
          {lastUpdated && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Sinkronisasi Terakhir
              </span>
              <span
                className="text-xs text-slate-700 font-mono"
                title={formatDateTime(lastUpdated.toISOString())}
              >
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Tombol Muat Ulang Manual */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition shadow-2xs hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6BD6] focus-visible:ring-offset-2"
              title="Muat ulang data armada"
              aria-label="Muat ulang data armada"
            >
              <svg
                className={`w-3.5 h-3.5 text-slate-500 ${isFetching ? 'motion-safe:animate-spin text-[#1E6BD6]' : ''
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">
                {isFetching ? 'Memuat...' : 'Muat Ulang'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
