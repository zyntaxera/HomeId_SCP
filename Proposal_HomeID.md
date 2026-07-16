# Dokumen Penawaran & Spesifikasi Teknis: HomeID App

## 1. Teknologi yang Digunakan (Tech Stack)

Aplikasi ini dibangun menggunakan tumpukan teknologi modern (Modern Web Stack) yang fokus pada kecepatan, interaktivitas, dan skalabilitas.

*   **Framework Utama:** Next.js 14+ (React.js)
    *   *Alasan:* Standar industri saat ini untuk aplikasi web. Sangat cepat, mendukung Server-Side Rendering (SSR) untuk performa maksimal, dan sangat skalabel.
*   **Bahasa Pemrograman:** TypeScript
    *   *Alasan:* Menjamin kualitas kode dengan sistem tipe statis (mengurangi bug hingga 30% saat masa pengembangan) dan sangat maintainable untuk proyek jangka panjang.
*   **Desain Antarmuka (UI/UX):** Tailwind CSS & Framer Motion
    *   *Alasan:* Tailwind memungkinkan pembuatan desain UI yang sleek, modern, dan responsif di semua perangkat secara instan. Framer Motion memberikan animasi mikro (micro-interactions) yang membuat aplikasi terasa premium dan hidup.
*   **Manajemen Status (State Management):** Zustand
    *   *Alasan:* Jauh lebih ringan dan cepat dibandingkan Redux. Cocok untuk mengelola data real-time seperti status Pelanggan, Port, dan Provider.
*   **Sistem Peta Geospasial (GIS):** Leaflet.js & React-Leaflet
    *   *Alasan:* Library pemetaan open-source interaktif yang sangat ringan. Dikombinasikan dengan Nominatim (OpenStreetMap) untuk pencarian koordinat dan area secara gratis tanpa API Key berbayar seperti Google Maps.
*   **Ikonografi:** Lucide React (Ikon vektor modern yang tajam).

## 2. Rekomendasi Arsitektur Database (Untuk Fase Produksi)

Untuk dibawa ke fase produksi (Live), berikut rekomendasinya:

*   **Database:** PostgreSQL (Relational Database)
    *   Sangat andal untuk mencatat relasi kompleks seperti User (Lead/Admin) -> Tiang (FAT) -> Port -> Calon Pelanggan (Capel).
*   **ORM (Object-Relational Mapping):** Prisma atau Drizzle ORM
*   **Autentikasi:** NextAuth.js atau Supabase Auth (Aman, terenkripsi, mendukung 2FA dan Social Login).

## 3. Estimasi Biaya Operasional Bulanan (OPEX / Hosting & Cloud)

Untuk menjalankan aplikasi ini secara live di internet, klien perlu menyewa infrastruktur Cloud. Berikut estimasinya (asumsi traffic menengah/standar operasional cabang):

**Opsi A: Hemat / Skala Menengah (Startup / Cabang Kecil)**
*   **Frontend Hosting (Vercel / Netlify):** Gratis (Hobby) hingga ~$20/bulan (Pro).
*   **Database Hosting (Supabase / Neon Postgres / AWS RDS Micro):** ~$15 - $25 / bulan.
*   **Layanan Peta (OpenStreetMap / CartoDB):** Gratis.
*   **Total Estimasi per Bulan: Rp 0 s.d. Rp 600.000,-**

**Opsi B: Enterprise (Skala Besar / Banyak Cabang)**
*   **Cloud VPS (AWS EC2 / DigitalOcean / Google Cloud):** ~$40 - $80 / bulan (Server khusus yang menangani komputasi Frontend & Backend sekaligus).
*   **Managed Database Berkinerja Tinggi:** ~$50 / bulan.
*   **Domain & SSL:** ~$15 / tahun.
*   **Total Estimasi per Bulan: Rp 1.500.000 s.d. Rp 2.500.000,-**

*Catatan untuk Klien: Keuntungan menggunakan teknologi OpenStreetMap adalah klien tidak perlu membayar tagihan ribuan dolar per bulan seperti halnya jika menggunakan Google Maps Enterprise API.*

## 4. Perkiraan Harga Jual Pengembangan (Development Cost / CAPEX)

Sistem ini masuk ke dalam kategori Sistem Informasi Geospasial (GIS) & CRM B2B Enterprise. Pembuatannya cukup kompleks karena melibatkan kalkulasi radius, manajemen port kustom, status progres pelanggan, dan sinkronisasi map secara real-time.

Berikut adalah panduan rentang harga yang bisa ditawarkan, tergantung kompleksitas akhir, dukungan pasca-peluncuran (maintenance), dan SLA:

*   **Tingkat Dasar (Basic - Rp 25.000.000 s.d. Rp 45.000.000)**
    *   *Deliverable:* Aplikasi sesuai prototype saat ini, disambungkan ke Database asli. 
    *   Fitur standar: CRUD FAT, CRUD Pelanggan, Peta Ketersediaan.
    *   Cocok untuk perusahaan ISP lokal berskala kecil.
*   **Tingkat Menengah (Pro - Rp 50.000.000 s.d. Rp 85.000.000)**
    *   *Deliverable:* Tambahan fitur seperti Dashboard Analytics (grafik penjualan/area), fitur cetak laporan PDF/Excel, notifikasi Email/WhatsApp untuk validasi pemasangan, dan integrasi API dengan sistem biling yang mungkin sudah mereka miliki.
*   **Tingkat Enterprise (Diatas Rp 100.000.000)**
    *   *Deliverable:* Aplikasi berskala nasional. Termasuk Mobile App terpisah (React Native/Flutter) khusus untuk teknisi lapangan memfoto bukti instalasi FAT, Service Level Agreement (SLA) pemeliharaan 1 tahun, dan arsitektur Microservices.
