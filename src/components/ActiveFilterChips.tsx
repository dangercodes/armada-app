import React from 'react';
import type { MbtaRouteResource, MbtaTripResource } from '../types/mbta';

export interface ActiveFilterChipsProps {
  selectedRouteIds: string[];
  selectedTripIds: string[];
  routesMap: Map<string, MbtaRouteResource>;
  tripsMap: Map<string, MbtaTripResource>;
  onRemoveRoute: (routeId: string) => void;
  onRemoveTrip: (tripId: string) => void;
  onResetFilters: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  selectedRouteIds,
  selectedTripIds,
  routesMap,
  tripsMap,
  onRemoveRoute,
  onRemoveTrip,
  onResetFilters,
}) => {
  const totalActive = selectedRouteIds.length + selectedTripIds.length;
  if (totalActive === 0) return null;

  return (
    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
        Filter Aktif:
      </span>

      {/* Route Chips */}
      {selectedRouteIds.map((id) => {
        const route = routesMap.get(id);
        const hexColor = route?.attributes.color ? `#${route.attributes.color}` : '#1E6BD6';
        const label =
          route?.attributes.short_name && route?.attributes.long_name
            ? `${route.attributes.short_name} - ${route.attributes.long_name}`
            : route?.attributes.long_name || route?.attributes.short_name || `Rute ${id}`;

        return (
          <span
            key={`route-chip-${id}`}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs group hover:bg-blue-100/70 transition"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 border border-black/10"
              style={{ backgroundColor: hexColor }}
            />
            <span className="font-semibold text-slate-800">Rute:</span>
            <span className="truncate max-w-[160px]" title={label}>
              {label}
            </span>
            <button
              type="button"
              onClick={() => onRemoveRoute(id)}
              className="text-blue-500 hover:text-rose-600 rounded p-0.5 hover:bg-rose-100/60 transition cursor-pointer flex items-center justify-center shrink-0 ml-0.5"
              aria-label={`Hapus filter rute ${label}`}
              title={`Hapus filter rute ${label}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        );
      })}

      {/* Trip Chips */}
      {selectedTripIds.map((id) => {
        const trip = tripsMap.get(id);
        const headsign =
          trip?.attributes.headsign?.trim() ||
          trip?.attributes.name?.trim() ||
          `Perjalanan #${id}`;

        return (
          <span
            key={`trip-chip-${id}`}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-950 border border-amber-200/90 shadow-2xs group hover:bg-amber-100/70 transition"
          >
            <svg
              className="w-3 h-3 text-amber-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-slate-800">Trip:</span>
            <span className="truncate max-w-[160px]" title={headsign}>
              {headsign}
            </span>
            <button
              type="button"
              onClick={() => onRemoveTrip(id)}
              className="text-amber-700 hover:text-rose-600 rounded p-0.5 hover:bg-rose-100/60 transition cursor-pointer flex items-center justify-center shrink-0 ml-0.5"
              aria-label={`Hapus filter perjalanan ${headsign}`}
              title={`Hapus filter perjalanan ${headsign}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        );
      })}

      {/* Reset Filters Action Button */}
      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 transition shadow-2xs cursor-pointer ml-auto"
        title="Hapus semua filter yang aktif"
      >
        <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Atur Ulang Semua ({totalActive})</span>
      </button>
    </div>
  );
};
