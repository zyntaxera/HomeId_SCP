export type Role = 'Admin' | 'Lead' | 'Sales';
export type ValidasiStatus = 'Pending' | 'Approved' | 'Rejected';
export type ProviderLevel = 'Dalam Jangkauan' | 'Penuh' | 'Perlu Survei' | 'Belum Terjangkau';
export type PortStatus = 'Tersedia' | 'Terisi' | 'Rusak';
export type ProspekStatus = 'Prospek Terdaftar' | 'Divalidasi' | 'Proses Instalasi' | 'Terpasang' | 'Gagal';
export type DemandStatus = 'Baru' | 'Ditinjau' | 'Direncanakan' | 'Terkonversi';
export type FATVerifikasi = 'Terverifikasi' | 'Belum Diverifikasi' | 'Perlu Survei Ulang';

export interface Provider {
  id_provider: string; // UUID
  nama: string; // UNIQUE
  warna_peta: string; // hex
  inisial_logo: string;
  status_aktif: boolean;
}

export interface FAT {
  id_fat: string; // UUID
  id_provider: string; // FK -> Provider
  kode_fat: string; // UNIQUE
  nama_lokasi: string;
  alamat: string;
  latitude: number;
  longitude: number;
  radius_layanan_m: number;
  status_verifikasi: FATVerifikasi;
  terakhir_dicek: string; // ISO datetime
  foto_bukti_url: string | null;
}

export interface Port {
  id_port: string; // UUID
  id_fat: string; // FK -> FAT
  nomor_port: number;
  status_port: PortStatus;
  id_capel_aktif: string | null; // FK -> Capel
}

export interface Capel {
  id_capel: string; // UUID
  nama_lengkap: string;
  no_telepon: string;
  alamat_instalasi: string;
  latitude: number;
  longitude: number;
  id_provider_terpilih: string; // FK -> Provider
  id_fat_terpilih: string; // FK -> FAT
  id_port_terpilih: string; // FK -> Port
  jarak_ke_fat_m: number;
  status_prospek: ProspekStatus;
  id_sales: string; // FK -> User
  tanggal_daftar: string; // ISO datetime
  catatan: string | null;
}

export interface Demand {
  id_demand: string; // UUID
  nama_lengkap: string | null;
  no_telepon: string | null;
  alamat: string;
  latitude: number;
  longitude: number;
  jarak_terdekat_m: number;
  id_provider_terdekat: string | null; // FK -> Provider
  id_sales: string | null; // FK -> User
  status_demand: DemandStatus;
  tanggal: string; // ISO datetime
}

export type TipeLokasiHomepass = 'Apartment' | 'Mall/Ruko' | 'Residential' | 'Street';

export interface Homepass {
  id_homepass: string; // UUID
  home_id: string; // e.g., 12750H101.1.00182
  tipe_lokasi: TipeLokasiHomepass;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  nama_proyek: string; // e.g., Perum. Perindustrian RW 08
  id_proyek: string;
  blok_tower: string; // e.g., Jl. Kaca Jendela
  lantai: number;
  nomor: string;
  latitude: number;
  longitude: number;
  classing_area: string; // e.g., C
  customer_status: string; // e.g., Aktif/Kosong
}

export interface User {
  id_user: string; // UUID
  nama: string;
  email: string; // UNIQUE
  sandi: string; // mock
  role: Role;
  no_hp: string;
  status_aktif: boolean;
  status_validasi: ValidasiStatus;
  is_2fa_enabled: boolean;
  secret_2fa: string; // mock 6-digit
}

export interface LogAktivitas {
  id_log: string; // UUID
  entitas: 'Capel' | 'User' | 'FAT' | 'Demand';
  id_entitas: string;
  aksi: string;
  nilai_lama: string | null;
  nilai_baru: string | null;
  id_user_eksekutor: string; // FK -> User
  timestamp: string; // ISO datetime
}

// Derived/Utility Types
export interface ServiceabilityProviderResult {
  provider: Provider;
  fat_terdekat: FAT;
  jarak_m: number;
  port_kosong: number;
  level: ProviderLevel;
}

export interface ServiceabilityResult {
  vonis: 'Siap Pasang' | 'Perlu Survei' | 'Belum Terjangkau';
  daftar_provider: ServiceabilityProviderResult[];
  titik: { lat: number; lng: number };
}
