import React from 'react';
import { MbtaApiError } from '../api/client';

export interface ErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'Gagal Memuat Data Armada',
}) => {
  const isMbtaError = error instanceof MbtaApiError;
  const status = isMbtaError ? error.status : null;
  const isRateLimit = isMbtaError ? error.isRateLimit : false;

  return (
    <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 mb-2">
        {status ? `Error HTTP ${status}` : 'Kendala Koneksi'}
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
        {error?.message || 'Terjadi kendala saat berkomunikasi dengan server API.'}
      </p>

      {isRateLimit && (
        <p className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mb-4 max-w-sm">
          Tips: Server API membatasi request IP tanpa autentikasi hingga 20 req/menit. Anda dapat mengonfigurasi <code className="font-mono text-amber-900">VITE_MBTA_API_KEY</code> pada file <code className="font-mono text-amber-900">.env</code> untuk meningkatkan kuota menjadi 1.000 req/menit.
        </p>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
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
          Coba Lagi
        </button>
      )}
    </div>
  );
};
