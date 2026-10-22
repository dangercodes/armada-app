import React from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak Ada Armada Ditemukan',
  description = 'Saat ini tidak ada armada aktif yang dilaporkan pada rute ini. Periksa koneksi Anda atau muat ulang data armada.',
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1E6BD6] flex items-center justify-center mb-4 shadow-2xs">
        <svg
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B3C8C] hover:bg-[#1E6BD6] transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6BD6] focus-visible:ring-offset-2"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Muat Ulang Data Armada
        </button>
      )}
    </div>
  );
};
