import React from 'react';
import { useCountUp, type UseCountUpOptions } from '../hooks/useCountUp';

export interface AnimatedCounterProps extends Omit<UseCountUpOptions, 'fallback'> {
  fallback?: string;
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

/**
 * Komponen AnimatedCounter
 * 
 * Menampilkan animasi angka yang bertambah secara halus:
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  isLoading = false,
  duration = 900,
  startValue = 0,
  loadingMax = 100,
  fallback = '-',
  formatter,
  className = '',
  prefix,
  suffix,
}) => {
  const { formattedText, isCounting } = useCountUp({
    value,
    isLoading,
    duration,
    startValue,
    loadingMax,
    fallback,
    formatter,
  });

  return (
    <span
      className={`inline-flex items-baseline tabular-nums transition-opacity duration-300 ${isCounting ? 'opacity-85 animate-pulse' : 'opacity-100'
        } ${className}`}
      aria-live="polite"
    >
      {prefix}
      <span>{formattedText}</span>
      {suffix}
    </span>
  );
};
