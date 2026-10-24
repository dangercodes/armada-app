import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  /** The final target number to count towards */
  value: number | null | undefined;
  /** Whether data is currently loading / fetching from network */
  isLoading?: boolean;
  /** Duration of the ease-out animation in milliseconds (default: 900ms) */
  duration?: number;
  /** Initial starting value on mount before any counting begins (default: 0) */
  startValue?: number;
  /** Maximum number to count towards while loading (simulated ticker) (default: 100) */
  loadingMax?: number;
  /** Fallback string if value is null/undefined and not loading (default: '-') */
  fallback?: string;
  /** Optional custom formatter function (default: toLocaleString('id-ID')) */
  formatter?: (val: number) => string;
}

/**
 * Custom React hook for high-performance, smooth animated number counting.
 * 
 * Features:
 * 1. Active simulated counting ticker while `isLoading === true`.
 * 2. Ease-out cubic animation to the resolved `value` when data arrives.
 * 3. Smooth transition between value changes (e.g. filtering, pagination, refresh).
 * 4. Respects `prefers-reduced-motion` for accessibility.
 * 5. Uses `requestAnimationFrame` for stutter-free 60fps / 120fps rendering.
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
  const isReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    // If user prefers reduced motion, bypass all animations
    if (isReducedMotion.current) {
      if (isLoading) {
        setDisplayNumber(null);
      } else {
        setDisplayNumber(typeof value === 'number' ? value : null);
        currentValueRef.current = typeof value === 'number' ? value : 0;
      }
      return;
    }

    // --- CASE 1: Data is currently loading ---
    // Run an active simulated counting animation so the user sees telemetry counting live
    if (isLoading) {
      let active = true;
      const tickInterval = 45; // ms per tick

      const intervalId = setInterval(() => {
        if (!active) return;
        const current = currentValueRef.current;
        // Fast step when far, decelerating as it approaches loadingMax
        const step = Math.max(1, Math.ceil((loadingMax - current) * 0.14));
        const next = current + step;

        if (next < loadingMax) {
          currentValueRef.current = next;
          setDisplayNumber(next);
        } else {
          // Subtle breathing / live fluctuation when it reaches loadingMax
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

    // --- CASE 2: Finished loading or not loading ---
    if (typeof value !== 'number') {
      setDisplayNumber(null);
      return;
    }

    // Ease-out animation to the target value
    const startVal = currentValueRef.current;
    const targetVal = value;

    // If already at target value, snap and done
    if (startVal === targetVal) {
      setDisplayNumber(targetVal);
      return;
    }

    let rafId: number;
    let startTime: number | null = null;

    // Cubic ease-out: 1 - (1 - t)^3
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
  }, [value, isLoading, duration, loadingMax]);

  const formattedText =
    displayNumber !== null ? formatter(displayNumber) : fallback;

  return {
    rawNumber: displayNumber,
    formattedText,
    isCounting: isLoading,
  };
}
