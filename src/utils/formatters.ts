import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id as indonesianLocale } from 'date-fns/locale';

/**
 * Formats a coordinate pair into a human-readable latitude/longitude string.
 * Gracefully handles null/undefined values.
 */
export function formatCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined,
): string {
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return 'Koordinat tidak tersedia';
  }

  const latDir = lat >= 0 ? 'LU' : 'LS';
  const lngDir = lng >= 0 ? 'BT' : 'BB';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Generates a clean comma-separated coordinates string for copying to clipboard.
 * Returns null if coordinates are unavailable.
 */
export function getRawCoordinatesString(
  lat: number | null | undefined,
  lng: number | null | undefined,
): string | null {
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return null;
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Formats an ISO date string to a relative time format in Indonesian (e.g. "2 menit yang lalu").
 */
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return 'Waktu tidak diketahui';
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: indonesianLocale,
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats an ISO date string to a full formatted timestamp for tooltips and accessibility.
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'Waktu tidak tersedia';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy, HH:mm:ss', {
      locale: indonesianLocale,
    });
  } catch {
    return dateString;
  }
}

/**
 * Converts MBTA hex color strings (which usually omit the '#') to valid CSS hex colors.
 */
export function normalizeHexColor(
  color?: string | null,
  fallback = '#0B3C8C',
): string {
  if (!color || typeof color !== 'string') return fallback;
  const trimmed = color.trim().replace(/^#/, '');
  if (/^[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
    return `#${trimmed}`;
  }
  return fallback;
}

/**
 * Formats raw vehicle status codes into friendly Indonesian strings.
 */
export function humanizeStatus(status?: string | null): string {
  if (!status) return 'Status Tidak Diketahui';

  switch (status.toUpperCase()) {
    case 'IN_TRANSIT_TO':
      return 'Sedang Berjalan';
    case 'STOPPED_AT':
      return 'Berhenti di Halte';
    case 'INCOMING_AT':
      return 'Mendekati Halte';
    default:
      // Fallback: title case formatted status
      return status
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

/**
 * Formats occupancy status into natural Indonesian strings.
 */
export function humanizeOccupancy(occupancy?: string | null): string | null {
  if (!occupancy) return null;
  switch (occupancy.toUpperCase()) {
    case 'MANY_SEATS_AVAILABLE':
      return 'Banyak kursi kosong';
    case 'FEW_SEATS_AVAILABLE':
      return 'Sedikit kursi kosong';
    case 'STANDING_ROOM_ONLY':
      return 'Hanya ruang berdiri';
    case 'CRUSHED_STANDING_ROOM_ONLY':
      return 'Penuh sesak';
    case 'FULL':
      return 'Armada penuh';
    case 'NOT_ACCEPTING_PASSENGERS':
      return 'Tidak melayani penumpang';
    default:
      return occupancy.replace(/_/g, ' ').toLowerCase();
  }
}
