import React from 'react';

export interface PaginationPlaceholderProps {
  currentCount: number;
  totalEstimate?: number | null;
}

export const PaginationPlaceholder: React.FC<PaginationPlaceholderProps> = ({
  currentCount,
  totalEstimate,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Range Display & Badge */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-600 font-medium">
          Menampilkan 1–{currentCount} {totalEstimate ? `dari ~${totalEstimate} armada` : 'armada'}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#1E6BD6] border border-blue-200">
          Placeholder Fase 3
        </span>
      </div>

      {/* Mock Controls */}
      <div className="flex items-center gap-3 text-xs">
        {/* Per page mock */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Tampilkan:</span>
          <span className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700">
            {currentCount > 0 ? currentCount : 12} per halaman
          </span>
        </div>

        {/* Buttons mock */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-medium cursor-not-allowed select-none"
          >
            &larr; Sebelumnya
          </button>
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-medium cursor-not-allowed select-none"
          >
            Berikutnya &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
