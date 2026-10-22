/**
 * Utility functions for MBTA pagination calculation.
 * 
 * Since MBTA V3 API does not provide a total count directly in meta,
 * the last page offset is extracted from the 'last' link URL.
 */

/**
 * Extracts the page[offset] query value from an MBTA pagination link.
 */
export function parseOffsetFromUrl(url?: string | null): number | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const offset = parsed.searchParams.get('page[offset]');
    if (offset !== null) {
      const parsedNum = parseInt(offset, 10);
      return Number.isNaN(parsedNum) ? null : parsedNum;
    }
  } catch {
    // If relative or incomplete URL, parse regex fallback
    const match = url.match(/page%5Boffset%5D=(\d+)|page\[offset\]=(\d+)/);
    if (match) {
      const val = match[1] || match[2];
      return parseInt(val, 10);
    }
  }
  return null;
}

/**
 * Calculates total pages based on the offset of the last page and the current limit.
 * Formula: Math.floor(lastOffset / limit) + 1
 */
export function calculateTotalPages(lastOffset: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.floor(lastOffset / limit) + 1;
}

/**
 * Formats data range display string (e.g. "Menampilkan 1-5 dari 615 data")
 */
export function formatDataRange(
  currentOffset: number,
  currentCount: number,
  totalCount?: number | null,
): string {
  if (currentCount === 0) {
    return 'Tidak ada data';
  }

  const start = currentOffset + 1;
  const end = currentOffset + currentCount;

  if (totalCount !== undefined && totalCount !== null && totalCount > 0) {
    return `Menampilkan ${start}–${end} dari ${totalCount} data`;
  }

  return `Menampilkan ${start}–${end} data`;
}
