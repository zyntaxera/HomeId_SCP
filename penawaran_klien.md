# Proposal Penawaran Sistem Informasi Geospasial & Manajemen HomeID

Dokumen ini berisi rincian *Tech Stack*, rekomendasi infrastruktur produksi, dan estimasi biaya pengembangan serta operasional aplikasi **HomeID**.

---

## 1. Teknologi yang Digunakan (Tech Stack)

Aplikasi ini dibangun menggunakan tumpukan teknologi modern (*Modern Web Stack*) yang difokuskan pada kecepatan, interaktivitas, dan skalabilitas.

*   **Framework Utama:** **Next.js 14+ (React.js)**
    Standar industri saat ini untuk aplikasi web. Sangat cepat, mendukung Server-Side Rendering (SSR) untuk performa maksimal, dan skalabel.
*   **Bahasa Pemrograman:** **TypeScript**
    Menjamin kualitas kode dengan sistem tipe statis yang sangat *maintainable* untuk proyek jangka panjang.
*   **Desain Antarmuka (UI/UX):** **Tailwind CSS & Framer Motion**
    Tailwind memungkinkan pembuatan desain UI yang modern dan responsif. Framer Motion memberikan animasi mikro yang membuat aplikasi terasa premium dan hidup.
*   **Manajemen Status (State Management):** **Zustand**
    Sangat ringan dan cepat, cocok untuk mengelola data *real-time* seperti status Pelanggan, Port, dan Provider.
*   **Sistem Peta Geospasial (GIS):** **Leaflet.js & React-Leaflet**
    *Library* pemetaan *open-source* yang interaktif dan ringan. Menggunakan OpenStreetMap (Nominatim) untuk pencarian area secara gratis tanpa *API Key* berbayar.
*   **Ikonografi:** **Lucide React** (Ikon vektor modern yang tajam).

---

## 2. Rekomendasi Arsitektur Database (Fase Produksi)

Untuk fase produksi (*Live*), berikut arsitektur database dan *backend* yang disarankan:

*   **Database:** **PostgreSQL** (Relational Database)
    Sangat andal untuk mencatat relasi kompleks (*User -> Tiang/FAT -> Port -> Calon Pelanggan*).
*   **ORM (Object-Relational Mapping):** **Prisma** atau **Drizzle ORM**
*   **Autentikasi:** **NextAuth.js** atau **Supabase Auth** (Aman, terenkripsi, mendukung tingkat otorisasi berjenjang).

---

## 3. Estimasi Biaya Operasional Bulanan (OPEX / Cloud)

Untuk menjalankan aplikasi ini secara *live* di internet, diperlukan infrastruktur *Cloud*. Berikut estimasinya:

**Opsi A: Hemat / Skala Menengah (Startup / Area Lokal)**
*   **Frontend Hosting:** Gratis hingga ~$20/bulan (Vercel / Netlify).
*   **Database Hosting:** ~$15 - $25 / bulan (Supabase / AWS RDS Micro).
*   **Layanan Peta:** Gratis (OpenStreetMap).
*   **Total Estimasi per Bulan:** **Rp 0 s.d. Rp 600.000,-**

**Opsi B: Enterprise (Skala Besar / Nasional)**
*   **Cloud VPS:** ~$40 - $80 / bulan (AWS EC2 / DigitalOcean).
*   **Managed Database Berkinerja Tinggi:** ~$50 / bulan.
*   **Domain & SSL:** ~$15 / tahun.
*   **Total Estimasi per Bulan:** **Rp 1.500.000 s.d. Rp 2.500.000,-**

*(Keuntungan menggunakan OpenStreetMap adalah tidak perlu membayar biaya API per-request yang mahal seperti pada Google Maps Enterprise API).*

---

## 4. Perkiraan Harga Jual Pengembangan (Development Cost / CAPEX)

Sistem ini dikategorikan sebagai **Sistem Informasi Geospasial (GIS) & CRM B2B Enterprise**. Pembuatannya cukup kompleks melibatkan kalkulasi spasial dan pemetaan dinamis. Berikut adalah rentang penawaran pengembangan:

*   **Tingkat Dasar (Basic - Rp 25.000.000 s.d. Rp 45.000.000)**
    *   *Deliverable:* Aplikasi sesuai prototipe, disambungkan ke Database Cloud. 
    *   *Fitur:* CRUD FAT, Manajemen Provider, Manajemen Lead/Pelanggan, Peta Ketersediaan.
*   **Tingkat Menengah (Pro - Rp 50.000.000 s.d. Rp 85.000.000)**
    *   *Deliverable:* Fitur dasar + *Dashboard Analytics* (grafik penjualan/area), fitur Ekspor Laporan (PDF/Excel), integrasi sistem email untuk validasi, dan integrasi API *biling*.
*   **Tingkat Enterprise (Diatas Rp 100.000.000)**
    *   *Deliverable:* Skala nasional. Pembuatan *Mobile App* terpisah (React Native/Flutter) khusus untuk teknisi lapangan, Service Level Agreement (SLA) pemeliharaan 1 tahun, dan arsitektur *Microservices*.

**Keunggulan Utama Sistem Ini (ROI untuk Klien):**
Aplikasi ini akan **menghemat waktu survei teknisi di lapangan secara drastis** (karena tim operasional dapat mengecek ketersediaan port secara visual secara *real-time* saat berhadapan dengan pelanggan) dan **menekan *bounce rate* calon pelanggan** yang seringkali batal langganan akibat lambatnya kepastian hasil survei jaringan konvensional.
