import React from 'react';
import { formatDataRange, generatePageNumbers } from '../utils/pagination';

export interface PaginationProps {
  /** Nomor halaman yang sedang aktif (dimulai dari indeks 1) */
  currentPage: number;
  /** Total halaman hasil kalkulasi, atau null jika belum dapat ditentukan */
  totalPages: number | null;
  /** Jumlah data yang ditampilkan per halaman (contoh: 8, 12, 16, 20, 24, 32) */
  pageSize: number;
  /** Total seluruh data armada dalam jaringan, atau null jika belum diketahui */
  totalRecords: number | null;
  /** Jumlah item data yang saat ini dimuat pada halaman aktif */
  currentCount: number;
  /** Daftar opsi ukuran halaman yang didukung */
  pageSizeOptions?: number[];
  /** Status apakah query latar belakang atau transisi halaman sedang aktif */
  isFetching?: boolean;
  /** Status apakah kalkulasi total data sedang berlangsung di latar belakang */
  isTotalLoading?: boolean;
  /** Status apakah terdapat halaman berikutnya */
  hasNextPage?: boolean;
  /** Fungsi callback saat pengguna berpindah nomor halaman */
  onPageChange: (newPage: number) => void;
  /** Fungsi callback saat pengguna mengubah ukuran halaman (mereset ke halaman 1) */
  onPageSizeChange: (newPageSize: number) => void;
  /** Kelas CSS tambahan opsional */
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  currentCount,
  pageSizeOptions = [8, 12, 16, 20, 24, 32],
  isFetching = false,
  isTotalLoading = false,
  hasNextPage = false,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const currentOffset = Math.max(0, (currentPage - 1) * pageSize);
  const dataRangeText = formatDataRange(currentOffset, currentCount, totalRecords);

  // Tentukan status batas tombol navigasi (halaman pertama / terakhir)
  const isFirstPage = currentPage <= 1;
  const isLastPage =
    totalPages !== null ? currentPage >= totalPages : !hasNextPage;
  const isNavDisabled = currentCount === 0 && (totalRecords === 0 || totalRecords === null);

  // Buat tata letak tombol halaman ringkas (maksimal 7 item dengan ellipsis)
  const effectiveTotalPages = totalPages ?? (hasNextPage ? currentPage + 1 : currentPage);
  const pageItems = generatePageNumbers(currentPage, effectiveTotalPages);

  const effectivePageSizeOptions = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4 transition-all duration-200 ${className}`}
      aria-label="Kontrol navigasi halaman"
    >
      {/* 1. Informasi Rentang Halaman & Total Data */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full lg:w-auto">
        <span
          className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight"
          aria-live="polite"
        >
          {dataRangeText}
        </span>

        {/* Badge / Status Total Halaman */}
        {totalPages !== null && totalPages > 0 ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
            Halaman {currentPage} dari {totalPages}
          </span>
        ) : isTotalLoading ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#1E6BD6] border border-blue-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E6BD6] animate-ping" />
            Menghitung total...
          </span>
        ) : null}
      </div>

      {/* 2. Grup Kontrol Navigasi & Pemilihan Ukuran Halaman */}
      <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full lg:w-auto">
        {/* Pemilih Ukuran Halaman */}
        <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
          <label htmlFor="pagination-page-size" className="font-medium shrink-0">
            Tampilkan:
          </label>
          <div className="relative">
            <select
              id="pagination-page-size"
              aria-label="Pilih jumlah armada per halaman"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isFetching}
              className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1E6BD6]/30 focus:border-[#1E6BD6] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {effectivePageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per halaman
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Tombol Navigasi Halaman Beraksesibilitas */}
        <nav
          aria-label="Navigasi halaman armada"
          role="navigation"
          className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center overflow-x-auto py-0.5"
        >
          {/* Tombol Halaman Sebelumnya */}
          <button
            type="button"
            aria-label="Ke halaman sebelumnya"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage || isNavDisabled}
            className={`inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl text-xs font-semibold transition-all duration-150 select-none ${
              isFirstPage || isNavDisabled
                ? 'bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 active:scale-95 shadow-2xs'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Tombol Nomor Halaman */}
          <div className="flex items-center gap-1">
            {pageItems.map((item, index) => {
              if (item === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    aria-hidden="true"
                    className="w-7 sm:w-8 h-9 flex items-center justify-center text-slate-400 select-none text-xs font-bold"
                  >
                    &hellip;
                  </span>
                );
              }

              const isCurrent = item === currentPage;

              return (
                <button
                  key={`page-${item}`}
                  type="button"
                  aria-label={
                    isCurrent
                      ? `Halaman aktif, halaman ${item}`
                      : `Buka halaman ${item}`
                  }
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onPageChange(item)}
                  disabled={isNavDisabled}
                  className={`min-w-8 sm:min-w-9 h-9 px-2 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 select-none ${
                    isCurrent
                      ? 'bg-[#0B3C8C] text-white shadow-xs scale-100 ring-2 ring-[#0B3C8C]/20'
                      : 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 active:scale-95'
                  } ${isNavDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Tombol Halaman Berikutnya */}
          <button
            type="button"
            aria-label="Ke halaman berikutnya"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage || isNavDisabled}
            className={`inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl text-xs font-semibold transition-all duration-150 select-none ${
              isLastPage || isNavDisabled
                ? 'bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 active:scale-95 shadow-2xs'
            }`}
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
};
