import { useCallback, useEffect, useRef, useState } from 'react';
import { getVehicles } from '../api/vehicles';
import { calculateTotalPages, parseOffsetFromUrl } from '../utils/pagination';
import type { MbtaResponse, MbtaVehicleResource, VehicleQueryParams } from '../types/mbta';

/**
 * Custom Hook untuk mengambil data armada MBTA dengan pagination server-side.
 */
export function useVehicles(params: VehicleQueryParams = {}) {
  const effectiveLimit = params.pageSize ?? params.limit ?? 8;
  const effectivePage =
    params.page ??
    (params.offset !== undefined ? Math.floor(params.offset / effectiveLimit) + 1 : 1);
  const effectiveOffset =
    params.offset !== undefined ? params.offset : (effectivePage - 1) * effectiveLimit;

  // 1. State Awal
  const [data, setData] = useState<MbtaResponse<MbtaVehicleResource[]> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number>(0);

  // State untuk kalkulasi paginasi server-side
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isTotalLoading, setIsTotalLoading] = useState<boolean>(false);
  const [lastOffset, setLastOffset] = useState<number | null>(null);

  // Cache lokal ringan untuk hasil perhitungan halaman terakhir
  const lastPageCacheRef = useRef<Map<string, number>>(new Map());

  // Kunci primitif stabil untuk memutus infinite loop re-render
  const routeIdsKey = (params.routeIds || []).join(',');
  const tripIdsKey = (params.tripIds || []).join(',');
  const includeKey = (params.include || []).join(',');

  // 2. Fungsi Async untuk mengambil data armada dari REST API
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setIsFetching(true);
    setError(null);

    const queryParams: VehicleQueryParams = {
      page: effectivePage,
      pageSize: effectiveLimit,
      limit: effectiveLimit,
      offset: effectiveOffset,
      routeIds: routeIdsKey ? routeIdsKey.split(',') : undefined,
      tripIds: tripIdsKey ? tripIdsKey.split(',') : undefined,
      include: includeKey ? includeKey.split(',') : undefined,
    };

    try {
      const res = await getVehicles(queryParams);
      setData(res);
      setDataUpdatedAt(Date.now());

      const currentCount = res.data?.length ?? 0;
      const hasNext = Boolean(res.links?.next);
      const parsedLastOffset = parseOffsetFromUrl(res.links?.last);
      setLastOffset(parsedLastOffset);

      // Skenario A: Data kosong pada halaman 1
      if (effectiveOffset === 0 && currentCount === 0 && !hasNext) {
        setTotalRecords(0);
        setTotalPages(0);
        setIsTotalLoading(false);
      }
      // Skenario B: Seluruh data muat di satu halaman atau akhir data tanpa link 'last'
      else if (!res.links?.last && !hasNext) {
        const total = effectiveOffset + currentCount;
        setTotalRecords(total);
        setTotalPages(calculateTotalPages(total, effectiveLimit));
        setIsTotalLoading(false);
      }
      // Skenario C: Sedang berada di halaman terakhir
      else if (parsedLastOffset !== null && effectiveOffset === parsedLastOffset) {
        const total = parsedLastOffset + currentCount;
        setTotalRecords(total);
        setTotalPages(calculateTotalPages(total, effectiveLimit));
        setIsTotalLoading(false);
      }
      // Skenario D: Hitung total dari offset halaman terakhir + jumlah sisa item
      else if (parsedLastOffset !== null) {
        const cacheKey = `${effectiveLimit}-${parsedLastOffset}-${routeIdsKey}-${tripIdsKey}`;
        if (lastPageCacheRef.current.has(cacheKey)) {
          const cachedCount = lastPageCacheRef.current.get(cacheKey)!;
          const total = parsedLastOffset + cachedCount;
          setTotalRecords(total);
          setTotalPages(calculateTotalPages(total, effectiveLimit));
          setIsTotalLoading(false);
        } else {
          setIsTotalLoading(true);
          try {
            const lastRes = await getVehicles({
              limit: effectiveLimit,
              offset: parsedLastOffset,
              routeIds: routeIdsKey ? routeIdsKey.split(',') : undefined,
              tripIds: tripIdsKey ? tripIdsKey.split(',') : undefined,
            });
            const lastCount = lastRes.data?.length ?? 0;
            lastPageCacheRef.current.set(cacheKey, lastCount);
            const total = parsedLastOffset + lastCount;
            setTotalRecords(total);
            setTotalPages(calculateTotalPages(total, effectiveLimit));
          } catch {
            // Jika request terakhir gagal, biarkan state sebelumnya
          } finally {
            setIsTotalLoading(false);
          }
        }
      } else {
        setTotalRecords(null);
        setTotalPages(null);
        setIsTotalLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [
    effectivePage,
    effectiveLimit,
    effectiveOffset,
    routeIdsKey,
    tripIdsKey,
    includeKey,
  ]);

  // 3. Lifecycle hook: panggil fetch otomatis saat filter atau nomor halaman berubah
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // 4. Kembalikan state dan fungsi aksi
  return {
    data,
    isLoading,
    isFetching,
    isError: Boolean(error),
    error,
    refetch: fetchVehicles,
    dataUpdatedAt,
    page: effectivePage,
    pageSize: effectiveLimit,
    offset: effectiveOffset,
    totalRecords,
    totalPages,
    isTotalLoading,
    lastOffset,
    hasNextPage: Boolean(data?.links?.next),
    hasPrevPage: Boolean(data?.links?.prev) || effectivePage > 1,
    isPlaceholderData: false,
  };
}
