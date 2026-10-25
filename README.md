# Transjakarta — Sistem Manajemen Armada (Fleet Management Dashboard)

Aplikasi web dashboard pemantauan armada transportasi real-time berbasis **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack Query v5**, dan **Leaflet**. Sistem ini mengintegrasikan data telemetri publik dari **MBTA V3 REST API** (JSON:API format) yang disajikan dengan identitas visual resmi bertema **Transjakarta** (*"Connecting the Life of Jakarta"*).

---

## Daftar Isi
- [1. Ringkasan Proyek](#1-ringkasan-proyek)
- [2. Fitur Utama & Kepatuhan PRD](#2-fitur-utama--kepatuhan-prd)
- [3. Teknologi & Pustaka (Tech Stack)](#3-teknologi--pustaka-tech-stack)
- [4. Prasyarat & Instalasi](#4-prasyarat--instalasi)
- [5. Konfigurasi Lingkungan (Environment Variables)](#5-konfigurasi-lingkungan-environment-variables)
- [6. Skrip Perintah (Scripts & Commands)](#6-skrip-perintah-scripts--commands)
- [7. Integrasi REST API MBTA V3](#7-integrasi-rest-api-mbta-v3)
- [8. Strategi Paginasi Server-Side](#8-strategi-paginasi-server-side)
- [9. Perilaku Filter & Sinkronisasi URL (Deep Linking)](#9-perilaku-filter--sinkronisasi-url-deep-linking)
- [10. Aksesibilitas (WCAG 2.1 AA) & Responsivitas](#10-aksesibilitas-wcag-21-aa--responsivitas)
- [11. Batasan API yang Diketahui (Known API Limitations)](#11-batasan-api-yang-diketahui-known-api-limitations)
- [12. Panduan Deployment Produksi](#12-panduan-deployment-produksi)

---

## 1. Ringkasan Proyek

Aplikasi **Sistem Manajemen Armada** dirancang untuk operator dashboard transportasi publik guna memantau posisi, kecepatan, arah hadap (*bearing*), peron/halte pemberhentian, serta status operasional kendaraan di jalan raya secara real-time.

### Karakteristik Desain & Identitas Visual
- **Nuansa Resmi Transjakarta:** Palet warna primer biru tua (`#0B3C8C`), aksen biru aktif (`#1E6BD6`), kuning armada (`#F5B400`), dan latar kanvas bersih (`#F5F8FC`).
- **Modern & Interaktif:** Efek glassmorphism pada hero banner, animasi angka bertingkat (*count-up telemetry*), lencana status berdenyut (*pulsing indicator*), dan kartu armada berbayang halus.
- **Integritas Data:** Data yang tidak tersedia dari sensor telemetri tidak pernah direkayasa (*no fabricated data*), melainkan disajikan dengan label informatif *"Tidak tersedia"*.

---

## 2. Fitur Utama & Kepatuhan PRD

| Modul | Kebutuhan PRD | Deskripsi Implementasi |
| :--- | :--- | :--- |
| **Grid Kartu Armada** | FR-1, FR-2 | Menampilkan label kendaraan, lencana status (`IN_TRANSIT_TO`, `STOPPED_AT`, `INCOMING_AT`), koordinat geodetik lintang/bujur dengan aksi salin satu klik, waktu pembaruan relatif & absolut, kecepatan metrik (km/jam), sudut hadap (*bearing*), dan aksen warna rute resmi. |
| **Paginasi Server-Side** | FR-3 | Rentang data dinamis (contoh: *"Menampilkan 1–8 dari 450 data"*), pilihan ukuran per halaman kelipatan 4 (`8, 12, 16, 20, 24, 32`) agar tata letak grid kartu 4 kolom selalu terisi penuh rapi, kalkulasi total halaman dan total armada berbasis link `last`, serta navigasi tombol aman batas. |
| **Filter Multi-Select Rute** | FR-4, FR-6 | Dropdown multi-pilih dengan infinite scroll otomatis (lazy load 20 rute per halaman), chip rute dengan warna MBTA, pencarian teks, dan filter chip yang dapat dihapus individual. |
| **Filter Multi-Select Trip** | FR-5, FR-6 | Dropdown multi-pilih trip berelasi rute. Dilengkapi fitur *Active Trip Pinning* (trip dengan armada aktif di jalan raya disematkan di posisi teratas berlabel `🟢 Beroperasi`). |
| **Detail Modal & Peta** | FR-7, FR-8, FR-9 | Modal detail 2 kolom responsif: data lengkap armada, rute, trip, halte peron, okupansi, dan peta interaktif Leaflet dengan marker bus kustom SVG yang panah arahnya berputar mengikuti derajat *bearing*. |
| **Loading & Error States** | FR-10 | Kerangka skeleton 2 kolom pada modal dan grid kartu, penanganan status kosong kontekstual, serta penanganan error komprehensif (400, 401, 403, 429, 500, Network Failure) dengan tombol *Coba Lagi*. |
| **Sinkronisasi URL** | FR-11 | Penyimpanan state dua arah pada query URL (`?routes=...&trips=...&page=...&pageSize=...`). Mendukung *deep linking*, pembagian tautan langsung, serta navigasi Back/Forward browser (*popstate*). |
| **Pembaruan Live** | FR-12 | Tombol *Muat Ulang* pada header utama dan tombol *Perbarui Live* pada modal detail armada untuk mengambil data telemetri detik terkini dari server. |

---

## 3. Teknologi & Pustaka (Tech Stack)

| Kategori | Teknologi | Versi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Framework UI** | React | `19.3.1` | Komponen fungsional modern & Hooks standar React 19 |
| **Bahasa** | TypeScript | `~6.0.3` | Konfigurasi tipe ketat (*strict mode*), bebas tipe `any` |
| **Build Tool** | Vite | `8.3.5` | Pembangunan cepat dengan Rolldown chunk splitting |
| **Styling** | Tailwind CSS v4 | `4.3.3` | Menggunakan `@tailwindcss/vite` engine terbaru |
| **Server State & Cache** | TanStack Query | `5.104.5` | Paginasi `keepPreviousData`, infinite scroll, caching 30 detik |
| **Peta Interaktif** | Leaflet & React-Leaflet | `1.9.4` & `5.0.0` | OpenStreetMap TileLayer, custom SVG DivIcon |
| **Komponen Dropdown** | react-select | `5.10.2` | Multi-select dengan virtualisasi scroll & kontrol keyboard |
| **Manipulasi Waktu** | date-fns | `4.4.0` | Pemformat tanggal lokal Indonesia (`id`) & waktu relatif |

---

## 4. Prasyarat & Instalasi

### Prasyarat Sistem
- **Node.js:** Versi `20.19.0+` atau `22.12.0+` (disarankan Node.js LTS).
- **Package Manager:** `npm` versi `9+` atau yang kompatibel.

### Langkah Instalasi
1. Clone repositori ke komputer lokal Anda:
   ```bash
   git clone https://github.com/dangercodes/armada-app.git
   cd armada-app
   ```
2. Pasang seluruh dependensi proyek:
   ```bash
   npm install
   ```
3. Siapkan berkas konfigurasi lingkungan:
   ```bash
   cp .env.example .env
   ```

---

## 5. Konfigurasi Lingkungan (Environment Variables)

Aplikasi dapat langsung berjalan tanpa API key untuk mode penjelajahan publik. Namun, MBTA membatasi kuota IP tanpa autentikasi hingga **20 request/menit**. Untuk pemantauan operasional intensif, daftarkan kunci gratis untuk meningkatkan kuota menjadi **1.000 request/menit**.

| Variabel | Tipe | Wajib? | Nilai Bawaan | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_MBTA_API_KEY` | `string` | Opsional | `""` (kosong) | Kunci autentikasi MBTA V3 API. Daftarkan secara instan di [MBTA Portal](https://api-v3.mbta.com/register). Dikirimkan otomatis via header `x-api-key`. |

> **Catatan Keamanan:** Berkas `.env` telah tercantum dalam `.gitignore` sehingga tidak akan terunggah ke repositori publik. Selalu gunakan `.env.example` sebagai referensi templat variabel lingkungan.

---

## 6. Skrip Perintah (Scripts & Commands)

Jalankan perintah berikut melalui terminal:

```bash
# 1. Menjalankan server pengembangan lokal (Vite HMR)
npm run dev

# 2. Menjalankan pemeriksaan linter (ESLint 10 dengan aturan React 19)
npm run lint

# 3. Menjalankan kompilasi TypeScript dan pembuatan bundle produksi
npm run build

# 4. Menjalankan pratinjau hasil build produksi secara lokal
npm run preview
```

---

## 7. Integrasi REST API MBTA V3

Aplikasi berkomunikasi langsung dengan REST API publik MBTA:
- **Base URL:** `https://api-v3.mbta.com`
- **Format Respons:** Spesifikasi [JSON:API v1.0](https://jsonapi.org/)

### Endpoint yang Digunakan

1. **`GET /vehicles`**
   - **Parameter:** `page[limit]`, `page[offset]`, `filter[route]`, `filter[trip]`, `include=route,trip,stop`
   - **Fungsi:** Mengambil daftar armada telemetri live dengan relasi terkait.
2. **`GET /routes`**
   - **Parameter:** `page[limit]=20`, `page[offset]=...`
   - **Fungsi:** Mengisi dropdown filter rute dengan infinite scroll bertahap.
3. **`GET /trips`**
   - **Parameter:** `filter[route]=<route_ids>`, `page[limit]=20`, `page[offset]=...`
   - **Fungsi:** Mengisi dropdown filter perjalanan berdasarkan rute yang dipilih.
4. **`GET /vehicles/:id`**
   - **Parameter:** `include=route,trip,stop`
   - **Fungsi:** Mengambil data telemetri live paling mutakhir saat modal detail armada dibuka atau diperbarui.

### Resolusi Relasi Berkecepatan Tinggi ($\mathcal{O}(1)$ Lookup)
Respons JSON:API mengembalikan objek relasi di dalam array `included`. Melalui fungsi utilitas `createIncludedLookup`, array tersebut dipetakan ke dalam struktur `Map<string, Resource>` dengan format kunci `${type}:${id}`. Pendekatan ini memungkinkan pencarian relasi rute, trip, dan halte untuk setiap kartu armada dieksekusi dalam kompleksitas waktu konstan $\mathcal{O}(1)$ tanpa pencarian berulang $\mathcal{O}(n)$.

---

## 8. Strategi Paginasi Server-Side

API MBTA tidak menyediakan kolom `meta.total` atau jumlah data keseluruhan secara langsung pada respons `/vehicles`. Untuk menghitung total data dan jumlah halaman secara akurat:

1. **Pemanfaatan Link `links.last`:** Klien membaca offset halaman terakhir dari URL `links.last` (contoh: `page[offset]=450`).
2. **Hitungan Presisi Item Terakhir:**
   - Jika pengguna sedang berada di halaman terakhir, jumlah item saat ini langsung digunakan tanpa panggilan jaringan tambahan.
   - Jika pengguna berada di halaman lain, query paralel ringan memanggil halaman terakhir untuk menghitung sisa item di halaman tersebut.
   - **Rumus Total Data:** $\text{totalRecords} = \text{offset}_{\text{last}} + \text{itemCount}_{\text{last}}$.
   - **Rumus Total Halaman:** $\text{totalPages} = \lceil \text{totalRecords} / \text{pageSize} \rceil$.
3. **Pilihan Ukuran Halaman:** Pengguna dapat memilih `8, 12, 16, 20, 24, 32` data per halaman (kelipatan 4 untuk menjaga grid responsif 4 kolom selalu terisi penuh). Nilai default adalah `8`.
4. **Pencegahan Kedipan (*Flicker-Free*):** Menggunakan `placeholderData: keepPreviousData` pada TanStack Query sehingga kartu armada halaman sebelumnya tetap ditampilkan dengan indikator halus saat data halaman baru diunduh.

---

## 9. Perilaku Filter & Sinkronisasi URL (Deep Linking)

Seluruh parameter dashboard tersinkronisasi dua arah ke query URL peramban:

$$\text{Format URL: } \texttt{/?routes=Red,1\&trips=78978556\&page=1\&pageSize=8}$$

### Aturan Alur Filter:
1. **Multi-Pilih:** Filter rute dan trip mendukung banyak pilihan sekaligus yang dikirim ke API sebagai daftar dipisah tanda koma (`filter[route]=Red,Blue`).
2. **Reset Otomatis ke Halaman 1:** Menambah rute, menghapus rute, memilih trip, atau mengubah ukuran halaman secara otomatis mengembalikan tampilan ke **Halaman 1** guna mencegah *out-of-bounds error*.
3. **Penyematan Cerdas Trip Aktif (*Active Trip Pinning*):** Untuk mengatasi kesenjangan antara jadwal statis GTFS 24 jam dan bus fisik di jalan, trip yang memiliki armada aktif otomatis disematkan di posisi teratas dropdown dengan badge `🟢 Beroperasi`.
4. **Dukungan Riwayat Peramban:** Navigasi tombol *Back* dan *Forward* browser ditangani secara mulus melalui listener `popstate` tanpa memicu *reload* halaman.

---

## 10. Aksesibilitas (WCAG 2.1 AA) & Responsivitas

### Aksesibilitas (A11y)
- **Semantik WAI-ARIA:** Elemen modal memiliki atribut `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, dan `aria-describedby`.
- **Keyboard Navigation & Focus Trap:** Navigasi tombol `Tab` dan `Shift+Tab` terkunci aman di dalam modal saat terbuka. Tombol `Escape` menutup modal secara instan.
- **Focus Restoration:** Setelah modal ditutup, fokus keyboard dikembalikan secara presisi ke kartu armada pemicu.
- **Kontras & Focus Ring:** Kontras warna memenuhi rasio standar WCAG AA dengan *ring outline* biru yang terlihat jelas pada navigasi keyboard.
- **Dukungan Mode Hemat Gerak (*Prefers Reduced Motion*):** Jika preferensi hemat gerak aktif pada sistem operasi pengguna, seluruh animasi transisi dan *count-up ticker* dinonaktifkan secara otomatis.

### Uji Responsivitas Perangkat
Aplikasi telah diuji dan dioptimalkan pada berbagai dimensi layar:
- **360px & 390px (Mobile):** Grid 1 kolom, bilah filter bertumpuk rapi tanpa overflow horizontal, tombol paginasi ringkas.
- **768px (Tablet):** Grid 2 kolom, tata letak filter berdampingan.
- **1024px (Laptop):** Grid 3 kolom, modal detail 2 kolom (telemetri di kiri, peta di kanan).
- **1440px+ (Desktop):** Grid 4 kolom maksimal, layout lapang dengan visual kontras tinggi.

---

## 11. Batasan API yang Diketahui (Known API Limitations)

1. **Restriksi Endpoint `/trips`:** Endpoint MBTA `/trips` menolak permintaan tanpa filter dengan kode status `HTTP 400 Bad Request`. Oleh karena itu, dropdown trip dikunci hingga pengguna memilih minimal satu rute.
2. **Jadwal GTFS vs Armada Live:** MBTA mengembalikan ratusan jadwal perjalanan sepanjang hari pada `/trips`. Jika pengguna memilih trip di luar jam operasional aktifnya, daftar armada akan kosong. Aplikasi memberikan edukasi kontekstual pada tampilan kosong (*EmptyState*) untuk memilih trip berlabel *Beroperasi*.
3. **Relasi Kosong (*Nullable Relationships*):** Sebagian armada tidak melaporkan relasi `trip` atau `stop` saat berstatus non-revenue/masuk depot. Aplikasi menangani data null ini secara anggun dengan teks *"Tidak tersedia"*.
4. **Koordinat GPS Kosong:** Jika unit armada tidak memancarkan koordinat GPS, peta Leaflet menampilkan panel pemberitahuan khusus *"Peta Tidak Tersedia"* tanpa memicu galat runtime Leaflet.

---

## 12. Panduan Deployment Produksi

Aplikasi dibangun sebagai Static Single Page Application (SPA). Folder `dist/` hasil eksekusi `npm run build` dapat langsung dihosting pada platform hosting statis modern:

### Opsi 1: Vercel / Netlify
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Tambahkan `VITE_MBTA_API_KEY` pada menu pengaturan dashboard hosting.
- **Single Page App Rewrite:**
  - *Netlify:* Berkas `public/_redirects` berisi `/*  /index.html  200`.
  - *Vercel:* Konfigurasi `vercel.json` dengan rewrite rute `"/(.*)": "/index.html"`.

### Opsi 2: Nginx / Docker
Contoh blok server Nginx untuk melayani SPA dengan *caching* statis teroptimasi:

```nginx
server {
    listen 80;
    server_name armada.transjakarta.co.id;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (hashed chunks) for 1 year
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

*Dikembangkan untuk Operasional Transportasi Publik Transjakarta — 2026.*
