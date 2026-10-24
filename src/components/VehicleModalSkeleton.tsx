import React from 'react';

export const VehicleModalSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Memuat rincian armada..."
      className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse select-none"
    >
      {/* LEFT COLUMN: Vehicle Details Skeleton (7 Columns) */}
      <div className="lg:col-span-7 space-y-5">
        {/* 1. Posisi GPS & Waktu Card */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-slate-200 rounded-md" />
            <div className="h-6 w-24 bg-slate-200/70 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-2">
              <div className="h-3 w-28 bg-slate-200/70 rounded" />
              <div className="h-4 w-36 bg-slate-300 rounded" />
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-2">
              <div className="h-3 w-32 bg-slate-200/70 rounded" />
              <div className="h-4 w-40 bg-slate-300 rounded" />
            </div>
          </div>
        </div>

        {/* 2. Rute, Trip, & Halte Skeleton */}
        <div className="space-y-3">
          <div className="h-3.5 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="h-3 w-24 bg-slate-200/70 rounded" />
              <div className="h-4 w-32 bg-slate-300 rounded" />
              <div className="h-3 w-full bg-slate-200/60 rounded" />
            </div>
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="h-3 w-24 bg-slate-200/70 rounded" />
              <div className="h-4 w-36 bg-slate-300 rounded" />
              <div className="h-3 w-28 bg-slate-200/60 rounded" />
            </div>
          </div>

          {/* Halte Card Skeleton */}
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70 space-y-2">
            <div className="h-3 w-36 bg-slate-200/70 rounded" />
            <div className="h-4 w-48 bg-slate-300 rounded" />
            <div className="h-3 w-3/4 bg-slate-200/60 rounded" />
            <div className="flex gap-3 pt-1">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>
          </div>
        </div>

        {/* 3. Parameter Teknis Grid Skeleton */}
        <div className="space-y-3">
          <div className="h-3.5 w-44 bg-slate-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                <div className="h-2.5 w-16 bg-slate-200/70 rounded" />
                <div className="h-4 w-20 bg-slate-300 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Leaflet Map Skeleton (5 Columns) */}
      <div className="lg:col-span-5 flex flex-col min-h-[340px] lg:min-h-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200/70 rounded" />
        </div>

        <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200/80 min-h-[320px] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center shadow-2xs">
            <svg
              className="w-7 h-7 text-slate-400 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="h-3.5 w-32 bg-slate-300 rounded" />
          <div className="h-3 w-44 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
};
