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
import { useInfiniteRoutes } from '../hooks/useInfiniteRoutes';
import type { MbtaRouteResource } from '../types/mbta';

export interface RouteOption {
  value: string;
  label: string;
  route?: MbtaRouteResource;
}

export interface RouteSelectProps {
  selectedRouteIds: string[];
  onChange: (routeIds: string[]) => void;
  selectedRoutesMap?: Map<string, MbtaRouteResource>;
  disabled?: boolean;
}

const routeOptionCache = new Map<string, RouteOption>();

function getOrCreateRouteOption(route: MbtaRouteResource): RouteOption {
  const existing = routeOptionCache.get(route.id);
  if (existing && existing.route === route) {
    return existing;
  }
  const shortName = route.attributes.short_name?.trim();
  const longName = route.attributes.long_name?.trim();
  const label =
    shortName && longName
      ? `${shortName} - ${longName}`
      : longName || shortName || route.id;

  const opt: RouteOption = {
    value: route.id,
    label,
    route,
  };
  routeOptionCache.set(route.id, opt);
  return opt;
}

interface CustomSelectProps {
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  isLoading?: boolean;
}

const CustomMenuList = (props: MenuListProps<RouteOption, true>) => {
  const selectProps = props.selectProps as unknown as CustomSelectProps;
  const isFetchingNextPage = Boolean(selectProps.isFetchingNextPage);
  const hasNextPage = Boolean(selectProps.hasNextPage);
  const isLoading = Boolean(selectProps.isLoading);

  const listElRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number>(0);


  // Menjaga posisi scroll pengguna saat event scroll berlangsung
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    listElRef.current = e.currentTarget;
    scrollPosRef.current = e.currentTarget.scrollTop;
    if (props.innerProps?.onScroll) {
      props.innerProps.onScroll(e);
    }
  };

  // Pulihkan posisi scroll sebelum proses render jika penambahan opsi mereset scrollTop ke 0
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
          className="py-2.5 px-3 flex items-center justify-center gap-2 text-xs text-[#1E6BD6] bg-blue-50/70 border-t border-slate-100 font-medium"
        >
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Memuat rute berikutnya...</span>
        </div>
      )}
      {!hasNextPage && !isLoading && (props.options?.length ?? 0) > 0 && (
        <div className="py-2 text-center text-[11px] text-slate-400 bg-slate-50/70 border-t border-slate-100">
          Semua rute telah dimuat ({props.options?.length})
        </div>
      )}
    </components.MenuList>
  );
};

// Render opsi rute kustom dengan badge warna rute, nama pendek, dan nama panjang
const CustomOption = (props: OptionProps<RouteOption, true, GroupBase<RouteOption>>) => {
  const route = props.data.route;
  const hexColor = route?.attributes.color ? `#${route.attributes.color}` : '#1E6BD6';
  const textColor = route?.attributes.text_color ? `#${route.attributes.text_color}` : '#FFFFFF';
  const shortName = route?.attributes.short_name?.trim();
  const longName = route?.attributes.long_name?.trim() || props.data.label;

  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2.5 py-0.5">
        {/* Badge / Pill Warna Rute */}
        <span
          className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight shrink-0 shadow-2xs flex items-center justify-center min-w-[32px] text-center"
          style={{ backgroundColor: hexColor, color: textColor }}
        >
          {shortName || route?.id || props.data.value}
        </span>

        {/* Nama & ID Rute */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-slate-800 truncate">
            {longName}
          </span>
          {shortName && longName && (
            <span className="text-[10px] text-slate-400 truncate">
              Rute ID: {route?.id || props.data.value}
            </span>
          )}
        </div>

        {/* Indikator centang rute terpilih */}
        {props.isSelected && (
          <svg className="w-4 h-4 text-[#1E6BD6] shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </components.Option>
  );
};

// Label MultiValue kustom di dalam input field
const CustomMultiValueLabel = (props: MultiValueGenericProps<RouteOption, true, GroupBase<RouteOption>>) => {
  const route = props.data.route;
  const hexColor = route?.attributes.color ? `#${route.attributes.color}` : '#1E6BD6';
  const label = route?.attributes.short_name || route?.attributes.long_name || props.data.value;

  return (
    <components.MultiValueLabel {...props}>
      <div className="flex items-center gap-1.5 py-0.5">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
          style={{ backgroundColor: hexColor }}
        />
        <span className="font-semibold text-slate-800 truncate max-w-[130px]">
          {label}
        </span>
      </div>
    </components.MultiValueLabel>
  );
};

// Tombol hapus MultiValue kustom
const CustomMultiValueRemove = (props: MultiValueRemoveProps<RouteOption, true>) => {
  return (
    <components.MultiValueRemove {...props}>
      <span className="text-slate-400 hover:text-rose-600 font-bold px-1 transition text-sm leading-none">
        &times;
      </span>
    </components.MultiValueRemove>
  );
};

// Konfigurasi komponen stabil untuk react-select
const routeSelectComponents = {
  MenuList: CustomMenuList,
  Option: CustomOption,
  MultiValueLabel: CustomMultiValueLabel,
  MultiValueRemove: CustomMultiValueRemove,
};

const customStyles: StylesConfig<RouteOption, true> = {
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
    backgroundColor: '#F1F5F9',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    padding: '1px 3px',
  }),
};

export const RouteSelect: React.FC<RouteSelectProps> = ({
  selectedRouteIds,
  onChange,
  selectedRoutesMap,
  disabled = false,
}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteRoutes({ pageSize: 20 });

  // Peta (Map) seluruh data resource rute (dari rute terpilih dan halaman yang sudah dimuat)
  const routesMap = useMemo(() => {
    const map = new Map<string, MbtaRouteResource>();
    if (selectedRoutesMap) {
      selectedRoutesMap.forEach((route, id) => {
        map.set(id, route);
      });
    }
    if (data?.pages) {
      for (const page of data.pages) {
        for (const route of page.data ?? []) {
          map.set(route.id, route);
        }
      }
    }
    return map;
  }, [selectedRoutesMap, data]);

  // Ratakan dan simpan seluruh halaman ke dalam array RouteOption dengan cache objek yang stabil
  const loadedOptions = useMemo(() => {
    const list: RouteOption[] = [];
    if (data?.pages) {
      for (const page of data.pages) {
        for (const route of page.data ?? []) {
          list.push(getOrCreateRouteOption(route));
        }
      }
    }
    return list;
  }, [data]);

  // Gabungkan opsi yang dimuat dengan opsi terpilih untuk memastikan item terpilih tidak hilang saat scroll
  const options = useMemo(() => {
    const map = new Map<string, RouteOption>();

    // 1. Selalu sertakan rute terpilih di urutan paling atas
    for (const id of selectedRouteIds) {
      const route = routesMap.get(id);
      if (route) {
        map.set(id, getOrCreateRouteOption(route));
      } else {
        const fallbackOpt: RouteOption = {
          value: id,
          label: `Rute ${id}`,
        };
        map.set(id, fallbackOpt);
      }
    }

    // 2. Tambahkan semua opsi yang dimuat dari API
    for (const opt of loadedOptions) {
      map.set(opt.value, opt);
    }

    return Array.from(map.values());
  }, [selectedRouteIds, routesMap, loadedOptions]);

  // Bentuk array nilai terpilih saat ini untuk react-select
  const selectValue = useMemo(() => {
    return selectedRouteIds.map((id) => {
      const found = options.find((opt) => opt.value === id);
      if (found) return found;

      const route = routesMap.get(id);
      if (route) return getOrCreateRouteOption(route);

      return {
        value: id,
        label: `Rute ${id}`,
      };
    });
  }, [selectedRouteIds, options, routesMap]);

  // Fungsi filter pencarian rute berdasarkan short_name, long_name, atau ID rute
  const filterRouteOption = (
    candidate: { label: string; value: string; data: RouteOption },
    input: string,
  ) => {
    if (!input) return true;
    const query = input.toLowerCase().trim();
    const route = candidate.data.route;
    const shortName = route?.attributes.short_name?.toLowerCase() || '';
    const longName = route?.attributes.long_name?.toLowerCase() || '';
    const id = candidate.data.value.toLowerCase();
    return shortName.includes(query) || longName.includes(query) || id.includes(query);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor="route-multi-select"
          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <span>Filter Rute</span>
        </label>
        {selectedRouteIds.length > 0 && (
          <span className="text-[11px] font-semibold text-[#1E6BD6]">
            {selectedRouteIds.length} dipilih
          </span>
        )}
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Gagal memuat daftar rute ({error?.message || 'Error jaringan'})</span>
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
        <Select<RouteOption, true>
          inputId="route-multi-select"
          isMulti
          isSearchable
          isDisabled={disabled}
          isLoading={isLoading}
          options={options}
          value={selectValue}
          filterOption={filterRouteOption}
          onChange={(newVal) => {
            const ids = newVal.map((item) => item.value);
            onChange(ids);
          }}
          onMenuScrollToBottom={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          placeholder="Cari atau pilih rute armada..."
          noOptionsMessage={({ inputValue }) =>
            inputValue ? `Tidak ada rute yang cocok dengan "${inputValue}"` : 'Tidak ada rute tersedia'
          }
          loadingMessage={() => 'Memuat rute dari MBTA...'}
          components={routeSelectComponents}
          styles={customStyles}
          closeMenuOnSelect={false}
          aria-label="Pilih rute armada multi-select"
          {...({
            isFetchingNextPage,
            hasNextPage,
          } as Record<string, unknown>)}
        />
      )}
    </div>
  );
};
