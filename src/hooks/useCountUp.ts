import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  /** Nilai target akhir untuk animasi berhitung */
  value: number | null | undefined;
  /** Status apakah data sedang diambil dari jaringan */
  isLoading?: boolean;
  /** Durasi animasi transisi dalam milidetik (default: 900ms) */
  duration?: number;
  /** Nilai awal sebelum animasi dimulai (default: 0) */
  startValue?: number;
  /** Nilai maksimum indikator ticker saat sedang memuat (default: 100) */
  loadingMax?: number;
  /** Teks fallback jika nilai bernilai null/undefined dan tidak sedang memuat (default: '-') */
  fallback?: string;
  /** Fungsi pemformat teks angka kustom (default: toLocaleString('id-ID')) */
  formatter?: (val: number) => string;
}

/**
 * Custom React hook untuk animasi penambahan angka yang halus dan berkinerja tinggi.
 * 
 * Fitur:
 * 1. Efek ticker hitung aktif saat data sedang dimuat (`isLoading === true`).
 * 2. Transisi ease-out cubic yang mulus saat data selesai dimuat.
 * 3. Menghormati pengaturan aksesibilitas sistem (`prefers-reduced-motion`).
 * 4. Menggunakan `requestAnimationFrame` untuk render 60fps / 120fps tanpa patah-patah.
 */
export function useCountUp({
  value,
  isLoading = false,
  duration = 900,
  startValue = 0,
  loadingMax = 100,
  fallback = '-',
  formatter = (val: number) => val.toLocaleString('id-ID'),
}: UseCountUpOptions) {
  const [displayNumber, setDisplayNumber] = useState<number | null>(() => {
    if (isLoading) return startValue;
    return typeof value === 'number' ? value : null;
  });

  const currentValueRef = useRef<number>(displayNumber ?? startValue);
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // Jika pengguna mengaktifkan reduced-motion, matikan seluruh animasi
    if (isReducedMotion) {
      return;
    }

    // --- KASUS 1: Data sedang dimuat (Loading) ---
    // Jalankan animasi hitungan simulasi dinamis agar indikator metrik terasa hidup
    if (isLoading) {
      let active = true;
      const tickInterval = 45; // ms per tick

      const intervalId = setInterval(() => {
        if (!active) return;
        const current = currentValueRef.current;
        // Langkah cepat di awal, melambat saat mendekati batas loadingMax
        const step = Math.max(1, Math.ceil((loadingMax - current) * 0.14));
        const next = current + step;

        if (next < loadingMax) {
          currentValueRef.current = next;
          setDisplayNumber(next);
        } else {
          // Fluktuasi dinamis saat mencapai batas loadingMax
          const fluctuation =
            loadingMax +
            Math.floor(
              Math.sin(Date.now() / 240) * (loadingMax > 20 ? 4 : 1),
            );
          currentValueRef.current = fluctuation;
          setDisplayNumber(fluctuation);
        }
      }, tickInterval);

      return () => {
        active = false;
        clearInterval(intervalId);
      };
    }

    // --- KASUS 2: Selesai memuat atau tidak sedang memuat ---
    if (typeof value !== 'number') {
      currentValueRef.current = 0;
      const rafId = requestAnimationFrame(() => {
        setDisplayNumber(null);
      });
      return () => cancelAnimationFrame(rafId);
    }

    // Animasi ease-out menuju nilai target
    const startVal = currentValueRef.current;
    const targetVal = value;

    // Jika nilai saat ini sudah sama dengan target, langsung pasang tanpa animasi
    if (startVal === targetVal) {
      const rafId = requestAnimationFrame(() => {
        setDisplayNumber(targetVal);
      });
      return () => cancelAnimationFrame(rafId);
    }

    let rafId: number;
    let startTime: number | null = null;

    // Rumus cubic ease-out: 1 - (1 - t)^3
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = Math.round(startVal + (targetVal - startVal) * easedProgress);
      currentValueRef.current = current;
      setDisplayNumber(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        currentValueRef.current = targetVal;
        setDisplayNumber(targetVal);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [value, isLoading, duration, loadingMax, isReducedMotion]);

  // Jika pengguna menyalakan prefers-reduced-motion, tampilkan nilai langsung tanpa animasi
  const effectiveNumber = isReducedMotion
    ? (isLoading ? null : (typeof value === 'number' ? value : null))
    : displayNumber;

  const formattedText =
    effectiveNumber !== null ? formatter(effectiveNumber) : fallback;

  return {
    rawNumber: effectiveNumber,
    formattedText,
    isCounting: isLoading,
  };
}
