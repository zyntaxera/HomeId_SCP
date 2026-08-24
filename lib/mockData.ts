import { Provider, FAT, Port, Capel, Demand, User, LogAktivitas, Homepass } from './types';
import { v4 as uuidv4 } from 'uuid';

// 1. Providers List (10 Providers)
export const mockProviders: Provider[] = [
  { id_provider: 'p-1', nama: 'IndiHome', warna_peta: '#ef4444', inisial_logo: 'ID', status_aktif: true },
  { id_provider: 'p-2', nama: 'Biznet Home', warna_peta: '#eab308', inisial_logo: 'BZ', status_aktif: true },
  { id_provider: 'p-3', nama: 'MyRepublic', warna_peta: '#a855f7', inisial_logo: 'MR', status_aktif: true },
  { id_provider: 'p-4', nama: 'First Media', warna_peta: '#3b82f6', inisial_logo: 'FM', status_aktif: true },
  { id_provider: 'p-5', nama: 'MNC Play', warna_peta: '#22c55e', inisial_logo: 'MP', status_aktif: true },
  { id_provider: 'p-6', nama: 'ICONNET', warna_peta: '#0ea5e9', inisial_logo: 'IC', status_aktif: true },
  { id_provider: 'p-7', nama: 'Oxygen.id', warna_peta: '#06b6d4', inisial_logo: 'OX', status_aktif: true },
  { id_provider: 'p-8', nama: 'CBN Fiber', warna_peta: '#f97316', inisial_logo: 'CB', status_aktif: true },
  { id_provider: 'p-9', nama: 'XL SATU Fiber', warna_peta: '#1d4ed8', inisial_logo: 'XL', status_aktif: true },
  { id_provider: 'p-10', nama: 'Indosat HiFi', warna_peta: '#f59e0b', inisial_logo: 'IH', status_aktif: true },
];

// 2. Users
export const mockUsers: User[] = [
  { id_user: 'u-1', nama: 'Ahmad Admin', email: 'admin@homeid.com', sandi: 'password123', role: 'Admin', no_hp: '0811000001', status_aktif: true, status_validasi: 'Approved', is_2fa_enabled: true, secret_2fa: '123456' },
  { id_user: 'u-2', nama: 'Budi Lead', email: 'lead@homeid.com', sandi: 'password123', role: 'Lead', no_hp: '0811000002', status_aktif: true, status_validasi: 'Approved', is_2fa_enabled: true, secret_2fa: '123456' },
  { id_user: 'u-3', nama: 'Citra Sales', email: 'sales1@homeid.com', sandi: 'password123', role: 'Lead', no_hp: '0811000003', status_aktif: true, status_validasi: 'Approved', is_2fa_enabled: true, secret_2fa: '123456' },
  { id_user: 'u-4', nama: 'Dodi Sales', email: 'sales2@homeid.com', sandi: 'password123', role: 'Lead', no_hp: '0811000004', status_aktif: true, status_validasi: 'Approved', is_2fa_enabled: true, secret_2fa: '123456' },
  { id_user: 'u-5', nama: 'Eko Baru', email: 'sales.baru@homeid.com', sandi: 'password123', role: 'Lead', no_hp: '0811000005', status_aktif: true, status_validasi: 'Pending', is_2fa_enabled: true, secret_2fa: '123456' },
];

// 3. FATs (Spread around Bandung -6.9147, 107.6098)
export const mockFATs: FAT[] = [
  { id_fat: 'f-1', id_provider: 'p-1', kode_fat: 'ID-BDO-01', nama_lokasi: 'Jl. Riau No. 10', alamat: 'Bandung', latitude: -6.911, longitude: 107.615, radius_layanan_m: 250, status_verifikasi: 'Terverifikasi', terakhir_dicek: new Date().toISOString(), foto_bukti_url: null },
  { id_fat: 'f-2', id_provider: 'p-2', kode_fat: 'BZ-BDO-05', nama_lokasi: 'Braga Area', alamat: 'Bandung', latitude: -6.917, longitude: 107.609, radius_layanan_m: 300, status_verifikasi: 'Terverifikasi', terakhir_dicek: new Date().toISOString(), foto_bukti_url: null },
  { id_fat: 'f-3', id_provider: 'p-3', kode_fat: 'MR-BDO-12', nama_lokasi: 'Dago Bawah', alamat: 'Bandung', latitude: -6.905, longitude: 107.610, radius_layanan_m: 200, status_verifikasi: 'Terverifikasi', terakhir_dicek: new Date().toISOString(), foto_bukti_url: null },
  { id_fat: 'f-4', id_provider: 'p-4', kode_fat: 'FM-BDO-02', nama_lokasi: 'Komp. Buah Batu', alamat: 'Bandung', latitude: -6.935, longitude: 107.625, radius_layanan_m: 250, status_verifikasi: 'Terverifikasi', terakhir_dicek: new Date().toISOString(), foto_bukti_url: null },
  { id_fat: 'f-5', id_provider: 'p-5', kode_fat: 'MP-BDO-99', nama_lokasi: 'Kopo Mas', alamat: 'Bandung', latitude: -6.940, longitude: 107.585, radius_layanan_m: 250, status_verifikasi: 'Terverifikasi', terakhir_dicek: new Date().toISOString(), foto_bukti_url: null },
  { id_fat: 'f-6', id_provider: 'p-6', kode_fat: 'IC-BDO-08', nama_lokasi: 'Antapani', alamat: 'Bandung', latitude: -6.915, longitude: 107.655, radius_layanan_m: 250, status_verifikasi: 'Terverifikasi', terakhir_dicek: new Date().toISOString(), foto_bukti_url: null },
  { id_fat: 'f-7', id_provider: 'p-1', kode_fat: 'ID-BDO-02', nama_lokasi: 'Gedung Sate', alamat: 'Bandung', latitude: -6.902, longitude: 107.618, radius_layanan_m: 250, status_verifikasi: 'Terverifikasi', terakhir_dicek: new Date().toISOString(), foto_bukti_url: null },
];

// Helper to generate Ports for a FAT
function generatePorts(fatId: string, capacity: number, offset: number): Port[] {
  const ports: Port[] = [];
  for (let i = 1; i <= capacity; i++) {
    ports.push({
      id_port: `port-${fatId}-${i}`,
      id_fat: fatId,
      nomor_port: i,
      status_port: i % (offset) === 0 ? 'Terisi' : (i % 7 === 0 ? 'Rusak' : 'Tersedia'),
      id_capel_aktif: null
    });
  }
  return ports;
}

export const mockPorts: Port[] = [
  ...generatePorts('f-1', 8, 2),
  ...generatePorts('f-2', 16, 3),
  ...generatePorts('f-3', 8, 1), // all full except broken! Wait, offset 1 means all 'Terisi'. Let's make it 2.
  ...generatePorts('f-4', 8, 4),
  ...generatePorts('f-5', 16, 2),
  ...generatePorts('f-6', 8, 3),
  ...generatePorts('f-7', 8, 8), // Mostly empty
];

// 4. Capels
export const mockCapels: Capel[] = [
  { id_capel: 'c-1', nama_lengkap: 'Bapak Roni', no_telepon: '0812345678', alamat_instalasi: 'Jl. Braga No 12', latitude: -6.9175, longitude: 107.6095, id_provider_terpilih: 'p-2', id_fat_terpilih: 'f-2', id_port_terpilih: 'port-f-2-3', jarak_ke_fat_m: 60, status_prospek: 'Terpasang', id_sales: 'u-3', tanggal_daftar: new Date().toISOString(), catatan: 'Lancar' },
  { id_capel: 'c-2', nama_lengkap: 'Ibu Siska', no_telepon: '0812345679', alamat_instalasi: 'Jl. Riau No 15', latitude: -6.9115, longitude: 107.6155, id_provider_terpilih: 'p-1', id_fat_terpilih: 'f-1', id_port_terpilih: 'port-f-1-2', jarak_ke_fat_m: 80, status_prospek: 'Proses Instalasi', id_sales: 'u-3', tanggal_daftar: new Date().toISOString(), catatan: null },
  { id_capel: 'c-3', nama_lengkap: 'Kopi Kenangan Dago', no_telepon: '0812345670', alamat_instalasi: 'Jl. Dago 50', latitude: -6.904, longitude: 107.6105, id_provider_terpilih: 'p-3', id_fat_terpilih: 'f-3', id_port_terpilih: 'port-f-3-2', jarak_ke_fat_m: 120, status_prospek: 'Prospek Terdaftar', id_sales: 'u-4', tanggal_daftar: new Date().toISOString(), catatan: 'Butuh cepat' },
];

// 5. Demands (Red dots)
export const mockDemands: Demand[] = [
  { id_demand: 'd-1', nama_lengkap: 'Toko Kelontong', no_telepon: '0899999', alamat: 'Jl. Jauh Sekali No 1', latitude: -6.890, longitude: 107.600, jarak_terdekat_m: 1500, id_provider_terdekat: null, id_sales: 'u-3', status_demand: 'Baru', tanggal: new Date().toISOString() },
  { id_demand: 'd-2', nama_lengkap: null, no_telepon: null, alamat: 'Kawasan Lembang', latitude: -6.850, longitude: 107.620, jarak_terdekat_m: 5000, id_provider_terdekat: null, id_sales: null, status_demand: 'Ditinjau', tanggal: new Date().toISOString() },
];

export const mockLogs: LogAktivitas[] = [];

// 6. Homepass (Coverage Area Database) based on legacy CISNETS II
export const mockHomepass: Homepass[] = [
  { id_homepass: 'hp-1', home_id: '12750H101.1.00182', tipe_lokasi: 'Residential', provinsi: 'Dki Jakarta', kota: 'Jakarta Selatan', kecamatan: 'PANCORAN', kelurahan: 'RAWAJATI', nama_proyek: 'Perum. Perindustrian RW 08 Rawajati', id_proyek: 'P1800628', blok_tower: 'Jl. Kaca Jendela', lantai: 1, nomor: '1', kode_pos: '12750', catatan: '', latitude: -6.2595766, longitude: 106.8533429, classing_area: 'C', customer_status: '' },
  { id_homepass: 'hp-2', home_id: '12750H101.1.00184', tipe_lokasi: 'Residential', provinsi: 'Dki Jakarta', kota: 'Jakarta Selatan', kecamatan: 'PANCORAN', kelurahan: 'RAWAJATI', nama_proyek: 'Perum. Perindustrian RW 08 Rawajati', id_proyek: 'P1800628', blok_tower: 'Jl. Kaca Jendela', lantai: 1, nomor: '2', kode_pos: '12750', catatan: '', latitude: -6.2597569, longitude: 106.8536343, classing_area: 'C', customer_status: '' },
  { id_homepass: 'hp-3', home_id: '12750H101.1.00185', tipe_lokasi: 'Residential', provinsi: 'Dki Jakarta', kota: 'Jakarta Selatan', kecamatan: 'PANCORAN', kelurahan: 'RAWAJATI', nama_proyek: 'Perum. Perindustrian RW 08 Rawajati', id_proyek: 'P1800628', blok_tower: 'Jl. Kaca Jendela', lantai: 1, nomor: '4', kode_pos: '12750', catatan: '', latitude: -6.2597859, longitude: 106.8536948, classing_area: 'C', customer_status: '' },
  { id_homepass: 'hp-4', home_id: '12750H101.1.00187', tipe_lokasi: 'Residential', provinsi: 'Dki Jakarta', kota: 'Jakarta Selatan', kecamatan: 'PANCORAN', kelurahan: 'RAWAJATI', nama_proyek: 'Perum. Perindustrian RW 08 Rawajati', id_proyek: 'P1800628', blok_tower: 'Jl. Kaca Jendela', lantai: 1, nomor: '5', kode_pos: '12750', catatan: '', latitude: -6.2598100, longitude: 106.8537192, classing_area: 'C', customer_status: '' },
  { id_homepass: 'hp-5', home_id: '12750H101.1.00186', tipe_lokasi: 'Residential', provinsi: 'Dki Jakarta', kota: 'Jakarta Selatan', kecamatan: 'PANCORAN', kelurahan: 'RAWAJATI', nama_proyek: 'Perum. Perindustrian RW 08 Rawajati', id_proyek: 'P1800628', blok_tower: 'Jl. Kaca Jendela', lantai: 1, nomor: '6', kode_pos: '12750', catatan: '', latitude: -6.2599018, longitude: 106.8539568, classing_area: 'C', customer_status: '' },
];

// Tie capel to ports
mockCapels.forEach(c => {
  const p = mockPorts.find(port => port.id_port === c.id_port_terpilih);
  if (p) {
    p.status_port = 'Terisi';
    p.id_capel_aktif = c.id_capel;
  }
});
