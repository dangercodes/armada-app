import React, { useState } from 'react';
import type {
  MbtaRouteResource,
  MbtaTripResource,
  MbtaVehicleResource,
} from '../types/mbta';
import { StatusBadge } from './StatusBadge';
import {
  formatBearing,
  formatCoordinates,
  formatDateTime,
  formatRelativeTime,
  formatSpeed,
  getRawCoordinatesString,
  humanizeOccupancy,
  normalizeHexColor,
} from '../utils/formatters';

export interface VehicleCardProps {
  vehicle: MbtaVehicleResource;
  route?: MbtaRouteResource;
  trip?: MbtaTripResource;
  onClick?: (vehicle: MbtaVehicleResource) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  route,
  trip,
  onClick,
}) => {
  const [copied, setCopied] = useState(false);

  const { attributes, relationships } = vehicle;
  const label = attributes.label?.trim() || `ID: ${vehicle.id}`;
  const routeColor = normalizeHexColor(route?.attributes.color, '#0B3C8C');
  const routeTextColor = normalizeHexColor(route?.attributes.text_color, '#FFFFFF');
  const routeIdentifier =
    route?.attributes.short_name ||
    route?.attributes.long_name ||
    relationships.route?.data?.id ||
    'Rute Belum Ditugaskan';

  // Batasi panjang badge rute agar tidak bertabrakan dengan badge status armada
  const MAX_ROUTE_BADGE_LENGTH = 11;
  const isRouteTruncated = routeIdentifier.length > MAX_ROUTE_BADGE_LENGTH;
  const displayRouteIdentifier = isRouteTruncated
    ? `${routeIdentifier.slice(0, 10)}…`
    : routeIdentifier;

  const tripHeadsign =
    trip?.attributes.headsign ||
    (trip ? `Perjalanan #${trip.id}` : relationships.trip?.data?.id ? `Perjalanan #${relationships.trip.data.id}` : null);

  const coordinatesDisplay = formatCoordinates(attributes.latitude, attributes.longitude);
  const rawCoords = getRawCoordinatesString(attributes.latitude, attributes.longitude);

  const fullUpdateTime = formatDateTime(attributes.updated_at);
  const relativeUpdateTime = formatRelativeTime(attributes.updated_at);

  const occupancyText = humanizeOccupancy(attributes.occupancy_status);

  const handleCopyCoords = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rawCoords) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(rawCoords);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = rawCoords;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Abaikan error jika browser memblokir izin akses clipboard
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      onClick?.(vehicle);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Armada ${label}, Rute ${routeIdentifier}, Status ${attributes.current_status}`}
      onClick={() => onClick?.(vehicle)}
      onKeyDown={handleKeyDown}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300/80 hover:z-20 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6BD6] focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
    >
      {/* Garis aksen warna rute pada tepi kiri kartu */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl transition-colors"
        style={{ backgroundColor: routeColor }}
        aria-hidden="true"
      />

      {/* Kontainer isi kartu */}
      <div className="p-5 pl-6 flex-1 flex flex-col justify-between gap-4">
        {/* Bagian Header: Chip Rute & Badge Status */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
            {/* Badge Rute dengan Tooltip saat Hover */}
            <div className="relative group/route min-w-0 flex-shrink">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tracking-wide truncate max-w-[110px] sm:max-w-[125px] shadow-2xs cursor-help select-none"
                style={{
                  backgroundColor: routeColor,
                  color: routeTextColor,
                }}
                title={`Rute: ${routeIdentifier}`}
              >
                {displayRouteIdentifier}
              </span>

              {/* Tooltip Mengambang (Muncul saat kursor mengarah ke badge rute) */}
              <div
                role="tooltip"
                className="pointer-events-none absolute left-0 top-full mt-1.5 z-40 hidden group-hover/route:flex flex-col items-start bg-slate-900/95 text-white text-[11px] leading-tight py-1.5 px-2.5 rounded-lg shadow-xl border border-slate-700/80 backdrop-blur-xs whitespace-nowrap motion-safe:animate-fadeIn"
              >
                {/* Segitiga panah tooltip mengarah ke atas */}
                <div className="absolute left-3 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900/95" />
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Rute Lengkap
                </span>
                <span className="font-semibold text-white mt-0.5">
                  {routeIdentifier}
                </span>
              </div>
            </div>

            {/* Badge Status Armada */}
            <StatusBadge status={attributes.current_status} size="sm" className="shrink-0" />
          </div>

          {/* Label / Nama Armada */}
          <div className="mt-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0B3C8C] transition-colors tracking-tight">
                {label}
              </h3>
              <span
                className="text-xs font-semibold text-[#1E6BD6] opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5 shrink-0"
                aria-hidden="true"
              >
                Detail &rarr;
              </span>
            </div>

            {/* Tujuan Perjalanan (Trip Headsign) */}
            {tripHeadsign && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Tujuan:</span>
                <span className="font-semibold text-slate-800 truncate" title={`Tujuan: ${tripHeadsign}`}>
                  {tripHeadsign}
                </span>
              </div>
            )}

            {/* Nama Lengkap Koridor Rute (Maksimal 2 baris) */}
            {route?.attributes.long_name && (
              <p
                className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed"
                title={route.attributes.long_name}
              >
                {route.attributes.long_name}
              </p>
            )}
          </div>
        </div>

        {/* Bar Indikator Operasional (Kecepatan / Sudut Hadap / Keterisian) */}
        {(attributes.speed !== null || attributes.bearing !== null || occupancyText) && (
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            {attributes.speed !== null && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <span className="text-slate-400">Kecepatan:</span>
                <span title={formatSpeed(attributes.speed)}>
                  {(attributes.speed * 3.6).toFixed(1)} km/jam
                </span>
              </span>
            )}
            {attributes.bearing !== null && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400">Arah:</span>
                <span
                  className="font-mono text-slate-700"
                  title={formatBearing(attributes.bearing)}
                >
                  {attributes.bearing}&deg;
                </span>
              </span>
            )}
            {occupancyText && (
              <span className="truncate max-w-[150px] text-slate-600" title={occupancyText}>
                {occupancyText}
              </span>
            )}
          </div>
        )}

        {/* Bagian Bawah: Koordinat & Waktu Pembaruan Terakhir */}
        <div className="pt-3 border-t border-slate-100 text-xs flex flex-col gap-2">
          {/* Baris Koordinat dengan Aksi Salin */}
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-mono text-[11px] truncate" title={coordinatesDisplay}>
                {coordinatesDisplay}
              </span>
            </div>

            {rawCoords && (
              <button
                type="button"
                onClick={handleCopyCoords}
                className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-500 hover:text-[#0B3C8C] hover:bg-slate-100 transition-colors flex items-center gap-1 shrink-0"
                title="Salin koordinat GPS"
                aria-label={`Salin koordinat armada ${label}`}
              >
                {copied ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Tersalin!
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Salin
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Waktu Pembaruan Terakhir dengan Tooltip Waktu Lengkap */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Diperbarui</span>
            </span>
            <time
              dateTime={attributes.updated_at}
              title={fullUpdateTime}
              className="text-slate-600 font-medium hover:text-slate-900 transition-colors cursor-help"
            >
              {relativeUpdateTime}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
};
