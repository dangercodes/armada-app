/**
 * Mengambil nilai query parameter page[offset] dari URL tautan navigasi MBTA.
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
    // Fallback URL relatif atau tidak lengkap menggunakan regex
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
 * Menghitung offset data untuk request ke API.
 * Rumus: Math.max(0, (currentPage - 1) * pageSize)
 */
export function calculateOffset(page: number, pageSize: number): number {
  if (page <= 1 || pageSize <= 0) return 0;
  return (page - 1) * pageSize;
}

/**
 * Menghitung total halaman berdasarkan total data dan jumlah per halaman.
 * Rumus: Math.ceil(totalRecords / pageSize)
 * Mengembalikan null jika total data belum diketahui.
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
 * Estimasi total halaman berdasarkan offset halaman terakhir: Math.floor(lastOffset / limit) + 1.
 */
export function calculateTotalPagesFromLastOffset(lastOffset: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.floor(lastOffset / limit) + 1;
}

/**
 * Memformat teks informasi rentang data (contoh: "Menampilkan 1–8 dari 120 data").
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
 * Menghasilkan array nomor halaman dengan ellipsis ringkas (...) untuk navigasi tombol halaman.
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | '...')[] {
  if (totalPages <= 1) {
    return [1];
  }

  // Jika total halaman <= 7, tampilkan seluruh nomor tanpa tanda ellipsis
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Posisi di dekat awal: tampilkan 5 halaman pertama, ellipsis, halaman terakhir
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // Posisi di dekat akhir: tampilkan halaman pertama, ellipsis, 5 halaman terakhir
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

  // Posisi di tengah: tampilkan halaman pertama, ellipsis, halaman aktif +/- 1, ellipsis, halaman terakhir
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
