import React from 'react';

export const FilterToolbarPlaceholder: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Placeholder label */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1E6BD6]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filter Armada
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Placeholder Fase 4
          </span>
        </div>

        {/* Mock Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Route Filter Mock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 select-none">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Semua Rute (Pilih Ganda)</span>
          </div>

          {/* Trip Filter Mock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 select-none">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Semua Perjalanan (Infinite Scroll)</span>
          </div>

          {/* Reset Button Mock */}
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-100 cursor-not-allowed select-none"
          >
            Atur Ulang
          </button>
        </div>
      </div>
    </div>
  );
};
