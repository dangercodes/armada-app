/**
 * Utility functions for MBTA pagination calculation and navigation.
 * 
 * Strategy for MBTA API Total Count:
 * MBTA V3 API does not provide a direct `meta.total` count.
 * However, it provides JSON:API links (`links.last`).
 * 1. Extract `page[offset]` from `links.last`.
 * 2. Fetch the last page with `page[limit]=pageSize&page[offset]=lastOffset`
 *    to count exact remaining items on the final page.
 * 3. Total records = `lastOffset + lastPageItemCount`.
 * 4. Total pages = `Math.ceil(totalRecords / pageSize)`.
 * 
 * If `links.last` is missing or cannot be parsed, total is treated as unknown (null)
 * without fabricating a false count.
 */

/**
 * Extracts the `page[offset]` query parameter from an MBTA pagination link URL.
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
    // Relative or incomplete URL fallback with regex
    const match = url.match(/(?:page%5Boffset%5D|page\[offset\])=(\d+)/);
    if (match) {
      const val = match[1];
      const parsedNum = parseInt(val, 10);
      return Number.isNaN(parsedNum) ? null : parsedNum;
    }
  }
  return null;
}

/**
 * Calculates page offset for API request.
 * Formula: Math.max(0, (currentPage - 1) * pageSize)
 */
export function calculateOffset(page: number, pageSize: number): number {
  if (page <= 1 || pageSize <= 0) return 0;
  return (page - 1) * pageSize;
}

/**
 * Calculates total pages based on total records and page size.
 * Formula: Math.ceil(totalRecords / pageSize)
 * Returns null if totalRecords cannot be determined.
 */
export function calculateTotalPages(
  totalRecords: number | null | undefined,
  pageSize: number,
): number | null {
  if (totalRecords === null || totalRecords === undefined) return null;
  if (pageSize <= 0) return 1;
  if (totalRecords === 0) return 1;
  return Math.max(1, Math.ceil(totalRecords / pageSize));
}

/**
 * Legacy offset-based total page estimation: Math.floor(lastOffset / limit) + 1.
 */
export function calculateTotalPagesFromLastOffset(lastOffset: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.floor(lastOffset / limit) + 1;
}

/**
 * Formats the data range display string.
 * Example outputs:
 * - "Menampilkan 11–20 dari 42 data"
 * - "Menampilkan 1–10 data" (when total is unknown)
 * - "Tidak ada data" (when currentCount is 0)
 */
export function formatDataRange(
  currentOffset: number,
  currentCount: number,
  totalCount?: number | null,
): string {
  if (currentCount === 0) {
    return totalCount === 0 ? 'Menampilkan 0 data' : 'Tidak ada data';
  }

  const start = currentOffset + 1;
  const end = currentOffset + currentCount;

  if (totalCount !== undefined && totalCount !== null && totalCount > 0) {
    return `Menampilkan ${start}–${end} dari ${totalCount} data`;
  }

  return `Menampilkan ${start}–${end} data`;
}

/**
 * Generates an array of page numbers with compact ellipsis for pagination navigation.
 * Designed to maintain a stable, compact layout on both desktop and mobile screens.
 * 
 * Example for 10 pages:
 * - Page 1 -> [1, 2, 3, 4, 5, '...', 10]
 * - Page 5 -> [1, '...', 4, 5, 6, '...', 10]
 * - Page 10 -> [1, '...', 6, 7, 8, 9, 10]
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | '...')[] {
  if (totalPages <= 1) {
    return [1];
  }

  // When total pages is 7 or less, show all numbers without ellipsis
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the start: show first 5 pages, ellipsis, last page
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // Near the end: show first page, ellipsis, last 5 pages
  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // In the middle: show first, ellipsis, current - 1, current, current + 1, ellipsis, last
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}
