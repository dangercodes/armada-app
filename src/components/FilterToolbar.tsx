import React from 'react';
import { RouteSelect } from './RouteSelect';
import { TripSelect } from './TripSelect';
import { ActiveFilterChips } from './ActiveFilterChips';
import { useSelectedResources } from '../hooks/useSelectedResources';

export interface FilterToolbarProps {
  selectedRouteIds: string[];
  onRouteIdsChange: (routeIds: string[]) => void;
  selectedTripIds: string[];
  onTripIdsChange: (tripIds: string[]) => void;
  onResetFilters: () => void;
  isFetchingVehicles?: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  selectedRouteIds,
  onRouteIdsChange,
  selectedTripIds,
  onTripIdsChange,
  onResetFilters,
  isFetchingVehicles = false,
}) => {
  // Resolve resource metadata for selected items (names, colors, headsigns)
  const { routesMap, tripsMap } = useSelectedResources({
    routeIds: selectedRouteIds,
    tripIds: selectedTripIds,
  });

  const totalActiveFilters = selectedRouteIds.length + selectedTripIds.length;

  const handleRemoveRoute = (routeIdToRemove: string) => {
    const updated = selectedRouteIds.filter((id) => id !== routeIdToRemove);
    onRouteIdsChange(updated);
  };

  const handleRemoveTrip = (tripIdToRemove: string) => {
    const updated = selectedTripIds.filter((id) => id !== tripIdToRemove);
    onTripIdsChange(updated);
  };

  return (
    <section
      aria-label="Filter armada transportasi"
      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* 1. Header Toolbar Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Filter Armada &bull; Rute &amp; Perjalanan
          </h2>
          {totalActiveFilters > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#0B3C8C] border border-blue-200">
              {totalActiveFilters} Filter Aktif
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Semua Armada Ditampilkan
            </span>
          )}
        </div>

        {/* Action Button: Reset Filters in Header */}
        <div className="flex items-center gap-2">
          {isFetchingVehicles && (
            <div className="flex items-center gap-1.5 text-xs text-[#1E6BD6] font-medium mr-2">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="hidden sm:inline">Menyinkronkan...</span>
            </div>
          )}

        </div>
      </div>

      {/* 2. Responsive 2-Column Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Route Dropdown Selector */}
        <RouteSelect
          selectedRouteIds={selectedRouteIds}
          onChange={onRouteIdsChange}
          selectedRoutesMap={routesMap}
        />

        {/* Trip Dropdown Selector */}
        <TripSelect
          selectedRouteIds={selectedRouteIds}
          selectedTripIds={selectedTripIds}
          onChange={onTripIdsChange}
          selectedTripsMap={tripsMap}
        />
      </div>

      {/* 3. Removable Chips Row */}
      <ActiveFilterChips
        selectedRouteIds={selectedRouteIds}
        selectedTripIds={selectedTripIds}
        routesMap={routesMap}
        tripsMap={tripsMap}
        onRemoveRoute={handleRemoveRoute}
        onRemoveTrip={handleRemoveTrip}
        onResetFilters={onResetFilters}
      />
    </section>
  );
};
