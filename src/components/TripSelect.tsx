import React, { useLayoutEffect, useMemo, useRef } from 'react';
import Select, {
  components,
  type MenuListProps,
  type OptionProps,
  type MultiValueGenericProps,
  type MultiValueRemoveProps,
  type StylesConfig,
  type GroupBase,
} from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { useInfiniteTrips } from '../hooks/useInfiniteTrips';
import { getVehicles } from '../api/vehicles';
import type { MbtaTripResource } from '../types/mbta';

export interface TripOption {
  value: string;
  label: string;
  trip?: MbtaTripResource;
  routeId?: string;
  isActive?: boolean;
}

export interface TripSelectProps {
  selectedRouteIds: string[];
  selectedTripIds: string[];
  onChange: (tripIds: string[]) => void;
  selectedTripsMap?: Map<string, MbtaTripResource>;
  disabled?: boolean;
}

const tripOptionCache = new Map<string, TripOption>();

function getOrCreateTripOption(trip: MbtaTripResource, isActive = false): TripOption {
  const existing = tripOptionCache.get(trip.id);
  if (existing && existing.trip === trip && existing.isActive === isActive) {
    return existing;
  }
  const headsign = trip.attributes.headsign?.trim();
  const name = trip.attributes.name?.trim();
  const fallbackLabel = `Perjalanan #${trip.id}`;
  const label = headsign || name || fallbackLabel;
  const routeId = trip.relationships?.route?.data?.id;

  const opt: TripOption = {
    value: trip.id,
    label,
    trip,
    routeId,
    isActive,
  };
  tripOptionCache.set(trip.id, opt);
  return opt;
}

interface CustomSelectProps {
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  isLoading?: boolean;
  hasRouteSelected?: boolean;
}

const CustomMenuList = (props: MenuListProps<TripOption, true>) => {
  const selectProps = props.selectProps as unknown as CustomSelectProps;
  const isFetchingNextPage = Boolean(selectProps.isFetchingNextPage);
  const hasNextPage = Boolean(selectProps.hasNextPage);
  const isLoading = Boolean(selectProps.isLoading);
  const hasRouteSelected = Boolean(selectProps.hasRouteSelected);

  const listElRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number>(0);

  // Preserve user's scroll position and container element on scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    listElRef.current = e.currentTarget;
    scrollPosRef.current = e.currentTarget.scrollTop;
    if (props.innerProps?.onScroll) {
      props.innerProps.onScroll(e);
    }
  };

  // Restore scroll position before paint if an option update caused scrollTop to drop to 0
  useLayoutEffect(() => {
    const el = listElRef.current;
    if (el && scrollPosRef.current > 0 && el.scrollTop < scrollPosRef.current) {
      el.scrollTop = scrollPosRef.current;
    }
  });

  return (
    <components.MenuList
      {...props}
      innerProps={{
        ...props.innerProps,
        onScroll: handleScroll,
      }}
    >
      {props.children}
      {isFetchingNextPage && (
        <div
          role="status"
          className="py-2.5 px-3 flex items-center justify-center gap-2 text-xs text-[#F5B400] bg-amber-50/70 border-t border-slate-100 font-medium text-amber-900"
        >
          <svg className="w-3.5 h-3.5 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Memuat perjalanan berikutnya...</span>
        </div>
      )}
      {!hasNextPage && !isLoading && hasRouteSelected && (props.options?.length ?? 0) > 0 && (
        <div className="py-2 text-center text-[11px] text-slate-400 bg-slate-50/70 border-t border-slate-100">
          Semua perjalanan telah dimuat ({props.options?.length})
        </div>
      )}
    </components.MenuList>
  );
};

// Custom Option rendering with active status pill, headsign, direction, route badge, and wheelchair icon
const CustomOption = (props: OptionProps<TripOption, true, GroupBase<TripOption>>) => {
  const trip = props.data.trip;
  const headsign =
    trip?.attributes.headsign?.trim() ||
    trip?.attributes.name?.trim() ||
    props.data.label ||
    `Perjalanan #${props.data.value}`;

  const directionLabel =
    trip?.attributes.direction_id === 0
      ? 'Arah 0 (Outbound)'
      : trip?.attributes.direction_id === 1
        ? 'Arah 1 (Inbound)'
        : null;

  const routeId = props.data.routeId || trip?.relationships?.route?.data?.id;
  const isActive = props.data.isActive;

  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between gap-2 py-0.5 w-full">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-800 truncate">
              {headsign}
            </span>
            {routeId && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-[#1E6BD6] border border-blue-200">
                {routeId}
              </span>
            )}
            {/* Real-time active status badge */}
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Beroperasi
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Jadwal
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            {directionLabel && <span>{directionLabel}</span>}
            <span>&bull;</span>
            <span className="font-mono">ID: {props.data.value}</span>
            {trip?.attributes.wheelchair_accessible === 1 && (
              <>
                <span>&bull;</span>
                <span className="text-emerald-600 font-medium">♿ Aksesibel</span>
              </>
            )}
          </div>
        </div>

        {props.isSelected && (
          <svg className="w-4 h-4 text-[#1E6BD6] shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </components.Option>
  );
};

// Custom MultiValue label inside the input field
const CustomMultiValueLabel = (props: MultiValueGenericProps<TripOption, true, GroupBase<TripOption>>) => {
  const headsign = props.data.label;
  const routeId = props.data.routeId;
  const isActive = props.data.isActive;

  return (
    <components.MultiValueLabel {...props}>
      <div className="flex items-center gap-1.5 py-0.5">
        {isActive ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Trip sedang aktif berjalan" />
        ) : (
          <svg className="w-3 h-3 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="font-semibold text-slate-800 truncate max-w-[130px]">
          {headsign}
        </span>
        {routeId && (
          <span className="text-[9px] font-mono px-1 rounded bg-slate-200 text-slate-700">
            {routeId}
          </span>
        )}
      </div>
    </components.MultiValueLabel>
  );
};

// Custom MultiValue remove button
const CustomMultiValueRemove = (props: MultiValueRemoveProps<TripOption, true>) => {
  return (
    <components.MultiValueRemove {...props}>
      <span className="text-slate-400 hover:text-rose-600 font-bold px-1 transition text-sm leading-none">
        &times;
      </span>
    </components.MultiValueRemove>
  );
};

// Stable components configuration passed to react-select
const tripSelectComponents = {
  MenuList: CustomMenuList,
  Option: CustomOption,
  MultiValueLabel: CustomMultiValueLabel,
  MultiValueRemove: CustomMultiValueRemove,
};

const customStyles: StylesConfig<TripOption, true> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#1E6BD6' : '#E2E8F0',
    borderRadius: '0.75rem',
    padding: '2px 4px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(30, 107, 214, 0.15)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#1E6BD6' : '#CBD5E1',
    },
    minHeight: '44px',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease-in-out',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '260px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    margin: '2px 0',
    backgroundColor: state.isSelected
      ? '#EFF6FF'
      : state.isFocused
        ? '#F8FAFC'
        : 'transparent',
    color: '#1E293B',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#DBEAFE',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#FEF3C7',
    borderRadius: '0.5rem',
    border: '1px solid #FDE68A',
    padding: '1px 3px',
  }),
};

export const TripSelect: React.FC<TripSelectProps> = ({
  selectedRouteIds,
  selectedTripIds,
  onChange,
  selectedTripsMap,
  disabled = false,
}) => {
  const hasRouteSelected = selectedRouteIds.length > 0;

  // 1. Fetch live active trips on the selected routes (trips currently with active vehicles on the road)
  const activeTripsQuery = useQuery({
    queryKey: ['mbta', 'activeTripsForRoutes', selectedRouteIds],
    queryFn: async ({ signal }) => {
      if (selectedRouteIds.length === 0) return [];
      const res = await getVehicles(
        {
          routeIds: selectedRouteIds,
          include: ['trip'],
          limit: 100,
        },
        signal,
      );
      const list: MbtaTripResource[] = [];
      const seen = new Set<string>();
      for (const inc of res.included ?? []) {
        if (inc.type === 'trip' && !seen.has(inc.id)) {
          seen.add(inc.id);
          list.push(inc as MbtaTripResource);
        }
      }
      return list;
    },
    enabled: hasRouteSelected,
    staleTime: 1000 * 30, // 30s cache
  });

  const activeTripIdsSet = useMemo(() => {
    const set = new Set<string>();
    for (const t of activeTripsQuery.data ?? []) {
      set.add(t.id);
    }
    return set;
  }, [activeTripsQuery.data]);

  // 2. Fetch paginated schedule trips via infinite scrolling
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteTrips({
    routeIds: selectedRouteIds,
    pageSize: 20,
    enabled: hasRouteSelected,
  });

  // Map of all known trip resources (from selected map, active trips, and loaded pages)
  const tripsMap = useMemo(() => {
    const map = new Map<string, MbtaTripResource>();
    if (selectedTripsMap) {
      selectedTripsMap.forEach((trip, id) => {
        map.set(id, trip);
      });
    }
    if (activeTripsQuery.data) {
      for (const trip of activeTripsQuery.data) {
        map.set(trip.id, trip);
      }
    }
    if (data?.pages) {
      for (const page of data.pages) {
        for (const trip of page.data ?? []) {
          map.set(trip.id, trip);
        }
      }
    }
    return map;
  }, [selectedTripsMap, activeTripsQuery.data, data]);

  // Flatten and store all pages into TripOption array with stable object caching
  const loadedOptions = useMemo(() => {
    const list: TripOption[] = [];
    if (data?.pages) {
      for (const page of data.pages) {
        for (const trip of page.data ?? []) {
          const isActive = activeTripIdsSet.has(trip.id);
          list.push(getOrCreateTripOption(trip, isActive));
        }
      }
    }
    return list;
  }, [data, activeTripIdsSet]);

  // Merge options: Selected trips first, then currently ACTIVE trips, then all scheduled trips
  const options = useMemo(() => {
    const map = new Map<string, TripOption>();

    // 1. Always include selected trips first
    for (const id of selectedTripIds) {
      const trip = tripsMap.get(id);
      const isActive = activeTripIdsSet.has(id);
      if (trip) {
        map.set(id, getOrCreateTripOption(trip, isActive));
      } else {
        const fallbackOpt: TripOption = {
          value: id,
          label: `Perjalanan #${id}`,
          isActive,
        };
        map.set(id, fallbackOpt);
      }
    }

    // 2. Pinned Active Trips (trips that actually have vehicles on the road right now!)
    if (activeTripsQuery.data) {
      for (const trip of activeTripsQuery.data) {
        if (!map.has(trip.id)) {
          map.set(trip.id, getOrCreateTripOption(trip, true));
        }
      }
    }

    // 3. Add all loaded schedule options from /trips
    for (const opt of loadedOptions) {
      if (!map.has(opt.value)) {
        map.set(opt.value, opt);
      }
    }

    return Array.from(map.values());
  }, [selectedTripIds, tripsMap, activeTripsQuery.data, activeTripIdsSet, loadedOptions]);

  // Construct current value array for react-select
  const selectValue = useMemo(() => {
    return selectedTripIds.map((id) => {
      const found = options.find((opt) => opt.value === id);
      if (found) return found;

      const trip = tripsMap.get(id);
      const isActive = activeTripIdsSet.has(id);
      if (trip) return getOrCreateTripOption(trip, isActive);

      return {
        value: id,
        label: `Perjalanan #${id}`,
        isActive,
      };
    });
  }, [selectedTripIds, options, tripsMap, activeTripIdsSet]);

  // Custom filter function for searching trips by headsign, name, trip ID, or route
  const filterTripOption = (
    candidate: { label: string; value: string; data: TripOption },
    input: string,
  ) => {
    if (!input) return true;
    const query = input.toLowerCase().trim();
    const trip = candidate.data.trip;
    const headsign = trip?.attributes.headsign?.toLowerCase() || '';
    const name = trip?.attributes.name?.toLowerCase() || '';
    const id = candidate.data.value.toLowerCase();
    const routeId = candidate.data.routeId?.toLowerCase() || '';
    return headsign.includes(query) || name.includes(query) || id.includes(query) || routeId.includes(query);
  };

  const activeTripCount = activeTripsQuery.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor="trip-multi-select"
          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <span>Filter Perjalanan (Trip)</span>
        </label>
        <div className="flex items-center gap-1.5">
          {hasRouteSelected && activeTripCount > 0 && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
              {activeTripCount} Aktif di Jalan
            </span>
          )}
          {selectedTripIds.length > 0 && (
            <span className="text-[11px] font-semibold text-[#0B3C8C]">
              {selectedTripIds.length} dipilih
            </span>
          )}
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Gagal memuat daftar perjalanan ({error?.message || 'Error jaringan'})</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 transition shrink-0 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <Select<TripOption, true>
          inputId="trip-multi-select"
          isMulti
          isSearchable
          isDisabled={disabled || !hasRouteSelected}
          isLoading={isLoading || activeTripsQuery.isLoading}
          options={options}
          value={selectValue}
          filterOption={filterTripOption}
          onChange={(newVal) => {
            const ids = newVal.map((item) => item.value);
            onChange(ids);
          }}
          onMenuScrollToBottom={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          placeholder={
            !hasRouteSelected
              ? 'Pilih rute armada di atas terlebih dahulu...'
              : 'Cari atau pilih tujuan perjalanan armada...'
          }
          noOptionsMessage={({ inputValue }) =>
            !hasRouteSelected
              ? 'Pilih rute armada terlebih dahulu'
              : inputValue
                ? `Tidak ada perjalanan cocok dengan "${inputValue}"`
                : 'Tidak ada perjalanan tersedia untuk rute terpilih'
          }
          loadingMessage={() => 'Memuat perjalanan dari MBTA...'}
          components={tripSelectComponents}
          styles={customStyles}
          closeMenuOnSelect={false}
          aria-label="Pilih perjalanan armada multi-select"
          {...({
            isFetchingNextPage,
            hasNextPage,
            hasRouteSelected,
          } as Record<string, unknown>)}
        />
      )}
    </div>
  );
};
