import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/Button';
import { ProviderManagement } from './ProviderManagement';
import { searchAddressNominatim, GeocodeResult } from '../../lib/geocode';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

function MiniMapFlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 16);
  }, [center, map]);
  return null;
}

export function MasterData() {
  const { providers, addProvider, updateProvider, deleteProvider, addFat, _addLog, currentUser } = useStore();
  
  const [formData, setFormData] = useState({
    providerId: '', kode: '', nama: '', alamat: '', lat: '', lng: '', radius: '250'
  });

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [bulkProviderId, setBulkProviderId] = useState<string>('');

  // Edit State
  const { fats, updateFat, deleteFat } = useStore();
  const [editingFatId, setEditingFatId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearching(true);
        const data = await searchAddressNominatim(query);
        setSuggestions(data);
        setShowSuggestions(true);
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (item: GeocodeResult) => {
    setQuery(item.display_name);
    setFormData({
      ...formData,
      nama: item.display_name.split(',')[0],
      alamat: item.display_name,
      lat: item.lat,
      lng: item.lon
    });
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.providerId) return alert('Pilih provider!');
    if (!formData.lat || !formData.lng) return alert('Pilih atau masukkan koordinat Valid!');
    
    const newFat = addFat({
      id_provider: formData.providerId,
      kode_fat: formData.kode,
      nama_lokasi: formData.nama,
      alamat: formData.alamat,
      latitude: parseFloat(formData.lat),
      longitude: parseFloat(formData.lng),
      radius_layanan_m: parseInt(formData.radius),
      status_verifikasi: 'Terverifikasi',
      terakhir_dicek: new Date().toISOString(),
      foto_bukti_url: null
    });

    _addLog({
      entitas: 'FAT',
      id_entitas: newFat.id_fat,
      aksi: 'Tambah FAT Manual',
      nilai_lama: null,
      nilai_baru: newFat.kode_fat,
      id_user_eksekutor: currentUser!.id_user
    });

    alert('Berhasil menambah FAT dan otomatis meng-generate Port!');
    setFormData({ providerId: '', kode: '', nama: '', alamat: '', lat: '', lng: '', radius: '250' });
    setQuery('');
  };

  const parseCsvLine = (line: string) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

  const safeNumber = (value: string | undefined, fallback = 0) => {
    if (value === undefined || value === null) return fallback;
    const cleaned = String(value).replace(/[^0-9.-]/g, '').trim();
    if (!cleaned) return fallback;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : fallback;
  };

  const findColumnIndex = (headers: string[], candidates: string[]) => {
    for (const candidate of candidates) {
      const normalized = normalizeKey(candidate);
      const index = headers.findIndex(header => normalizeKey(header) === normalized);
      if (index >= 0) return index;
    }
    return -1;
  };

  const parseCoordinate = (rawValue: string | undefined) => {
    if (!rawValue) return [null, null] as const;
    const cleaned = rawValue.replace(/\s+/g, ' ').trim();
    const match = cleaned.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
    if (match) {
      return [safeNumber(match[1]), safeNumber(match[2])] as const;
    }
    return [null, null] as const;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!bulkProviderId) {
      alert('Silakan pilih Provider terlebih dahulu dari dropdown sebelum mengunggah file.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) return alert('File CSV kosong atau format tidak valid.');

      const headers = parseCsvLine(lines[0]);
      const requiredKeys = ['kode_fat', 'nama_lokasi', 'alamat', 'latitude', 'longitude', 'radius_layanan_m'];
      const missingKeys = requiredKeys.filter(key => findColumnIndex(headers, [key, key.replace('_', ''), key.replace('radius_layanan_m', 'radius'), key.replace('latitude', 'lat'), key.replace('longitude', 'lng'), key.replace('nama_lokasi', 'nama'), key.replace('kode_fat', 'kode')]) < 0)
      const hasAddressFields = ['province', 'city', 'subdistrict', 'village', 'street', 'number', 'postalcode'].some(field => headers.some(header => normalizeKey(header) === field || normalizeKey(header).includes(field)));

      if (missingKeys.length > 0 && !hasAddressFields) {
        alert('Format CSV tidak sesuai. Pastikan file memuat kolom seperti: kode_fat, nama_lokasi, alamat, latitude, longitude, radius_layanan_m. Jika memakai template Excel, simpan dulu ke CSV lalu upload kembali.');
        return;
      }

      let successCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        const map = Object.fromEntries(headers.map((header, index) => [normalizeKey(header), row[index] ?? '']));

        const latitudeIndex = findColumnIndex(headers, ['latitude', 'lat', 'latitude_decimal', 'koordinat_lat', 'y']);
        const longitudeIndex = findColumnIndex(headers, ['longitude', 'lng', 'lon', 'longitude_decimal', 'koordinat_lng', 'x']);
        const coordinateIndex = findColumnIndex(headers, ['coordinate', 'coordinates', 'koordinat']);
        const kodeIndex = findColumnIndex(headers, ['kode_fat', 'kodefat', 'fat_code', 'homeid', 'kode', 'projectid']);
        const nameIndex = findColumnIndex(headers, ['nama_lokasi', 'namalokasi', 'locationname', 'projectname', 'project_name', 'street', 'nama', 'alamat_lokasi']);
        const addressIndex = findColumnIndex(headers, ['alamat', 'address', 'street', 'fulladdress', 'jalan', 'lokasi']);
        const radiusIndex = findColumnIndex(headers, ['radius_layanan_m', 'radiusm', 'radius', 'radius_meter']);

        const rawKode = kodeIndex >= 0 ? row[kodeIndex] : map.kodefat || map.kode || map.homeid || map.projectid || '';
        const rawName = nameIndex >= 0 ? row[nameIndex] : map.namalokasi || map.projectname || map.street || '';
        const rawAddress = addressIndex >= 0 ? row[addressIndex] : map.alamat || map.address || map.street || '';
        const rawLatitude = latitudeIndex >= 0 ? row[latitudeIndex] : map.latitude || map.lat || '';
        const rawLongitude = longitudeIndex >= 0 ? row[longitudeIndex] : map.longitude || map.lng || map.lon || '';
        const rawRadius = radiusIndex >= 0 ? row[radiusIndex] : map.radiuslayananm || map.radius || '';

        const coordinateValue = coordinateIndex >= 0 ? row[coordinateIndex] : '';
        const [parsedLat, parsedLng] = parseCoordinate(coordinateValue);
        const finalLat = safeNumber(rawLatitude || (parsedLat !== null ? String(parsedLat) : undefined));
        const finalLng = safeNumber(rawLongitude || (parsedLng !== null ? String(parsedLng) : undefined));

        if (!rawKode && !rawName && !rawAddress && !finalLat && !finalLng) continue;
        if (!Number.isFinite(finalLat) || !Number.isFinite(finalLng)) continue;

        const province = row[findColumnIndex(headers, ['province', 'provinsi'])] || '';
        const city = row[findColumnIndex(headers, ['city', 'kota'])] || '';
        const subdistrict = row[findColumnIndex(headers, ['subdistrict', 'kecamatan'])] || '';
        const village = row[findColumnIndex(headers, ['village', 'kelurahan'])] || '';
        const street = row[findColumnIndex(headers, ['street', 'jalan', 'alamat_jalan'])] || '';
        const number = row[findColumnIndex(headers, ['number', 'nomor', 'no'])] || '';

        const formattedAddress = rawAddress || [street, number, village, subdistrict, city, province].filter(Boolean).join(', ');
        const finalCode = (rawKode || `FAT-${successCount + 1}`).trim();
        const finalName = (rawName || formattedAddress || `Lokasi ${finalCode}`).trim();

        const newFat = addFat({
          id_provider: bulkProviderId,
          kode_fat: finalCode,
          nama_lokasi: finalName,
          alamat: formattedAddress || `Lokasi ${finalCode}`,
          latitude: finalLat,
          longitude: finalLng,
          radius_layanan_m: Math.max(1, Math.round(safeNumber(rawRadius || '250', 250))),
          status_verifikasi: 'Terverifikasi',
          terakhir_dicek: new Date().toISOString(),
          foto_bukti_url: null
        });

        _addLog({
          entitas: 'FAT',
          id_entitas: newFat.id_fat,
          aksi: 'Bulk Import FAT',
          nilai_lama: null,
          nilai_baru: newFat.kode_fat,
          id_user_eksekutor: currentUser!.id_user
        });
        successCount++;
      }

      alert(`Berhasil mengimpor ${successCount} infrastruktur FAT/ODP dari file CSV.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      alert('Gagal membaca file.');
    };
    reader.readAsText(file);
  };

  const handleEditClick = (fat: any) => {
    setEditingFatId(fat.id_fat);
    setEditFormData({ ...fat });
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    updateFat(editingFatId!, {
      nama_lokasi: editFormData.nama_lokasi,
      alamat: editFormData.alamat,
      latitude: parseFloat(editFormData.latitude),
      longitude: parseFloat(editFormData.longitude)
    });
    _addLog({
      entitas: 'FAT',
      id_entitas: editingFatId!,
      aksi: 'Edit FAT',
      nilai_lama: null,
      nilai_baru: editFormData.kode_fat,
      id_user_eksekutor: currentUser!.id_user
    });
    setEditingFatId(null);
    setEditFormData(null);
    alert('Data Tiang (FAT) berhasil diperbarui.');
  };

  const handleDelete = (id_fat: string) => {
    if (confirm('Yakin ingin menghapus infrastruktur FAT ini beserta seluruh port-nya? Aksi ini tidak dapat dibatalkan.')) {
      deleteFat(id_fat);
      alert('FAT berhasil dihapus.');
    }
  };

  const hasCoordinates = formData.lat && formData.lng;
  const mapCenter: [number, number] = hasCoordinates ? [parseFloat(formData.lat), parseFloat(formData.lng)] : [-6.92, 107.62];

  const markerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <ProviderManagement providers={providers} addProvider={addProvider} updateProvider={updateProvider} deleteProvider={deleteProvider} />

      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-800">Master Data Infrastruktur</h2>
        <p className="text-sm text-slate-500">Kelola FAT/ODP dan Port.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
          <h3 className="font-extrabold text-slate-800 mb-4">Input FAT Manual</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Provider</label>
              <select required value={formData.providerId} onChange={e => setFormData({...formData, providerId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                <option value="" disabled>-- Pilih Provider --</option>
                {providers.filter(p => p.status_aktif).map(p => <option key={p.id_provider} value={p.id_provider}>{p.nama}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Kode FAT</label>
                  <input required type="text" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="MIS-BDO-01" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Radius Layanan (m)</label>
                  <input required type="number" min="1" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
               </div>
            </div>

            <div className="relative">
               <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Cari Lokasi / Area (Nominatim)</label>
               <input 
                 type="text" 
                 value={query} 
                 onChange={e => setQuery(e.target.value)} 
                 className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                 placeholder="Ketik alamat/nama tempat..." 
               />
               {isSearching && <span className="absolute right-3 top-9 text-xs text-indigo-400 font-bold">Mencari...</span>}
               
               {showSuggestions && suggestions.length > 0 && (
                 <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-xl">
                   {suggestions.map((item, idx) => (
                     <div 
                       key={idx} 
                       onClick={() => handleSelectSuggestion(item)}
                       className="p-3 text-sm text-slate-200 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                     >
                       {item.display_name}
                     </div>
                   ))}
                 </div>
               )}
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Alamat Lengkap</label>
               <textarea required rows={2} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none" placeholder="Alamat instalasi..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Latitude</label>
                  <input required type="number" step="any" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="-6.9147" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Longitude</label>
                  <input required type="number" step="any" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="107.6098" />
               </div>
            </div>

            {hasCoordinates && (
              <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-300 mt-2 relative z-0">
                <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                  <MiniMapFlyTo center={mapCenter} />
                  <Marker position={mapCenter} icon={markerIcon} />
                </MapContainer>
              </div>
            )}

            <Button type="submit" fullWidth className="mt-4">Simpan & Generate Port</Button>
          </form>
        </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="font-extrabold text-slate-800">Bulk Import FAT (CSV)</h3>
               <p className="text-sm text-slate-500 mt-1">Unggah file CSV untuk menambahkan ratusan FAT massal.</p>
             </div>
             <button 
               onClick={() => {
                 const header = "kode_fat,nama_lokasi,alamat,latitude,longitude,radius_layanan_m\n";
                 const example = "ID-BDO-99,Gedung Sate,Jl. Diponegoro 22,-6.9024,107.6188,250\n";
                 const blob = new Blob([header + example], { type: 'text/csv' });
                 const url = URL.createObjectURL(blob);
                 const link = document.createElement('a');
                 link.href = url;
                 link.download = "Template_Import_FAT.csv";
                 link.click();
               }}
               className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
             >
               Unduh Template CSV
             </button>
           </div>
           
           <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Pilih Provider Tujuan</label>
              <select value={bulkProviderId} onChange={e => setBulkProviderId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                <option value="" disabled>-- Pilih Provider --</option>
                {providers.filter(p => p.status_aktif).map(p => <option key={p.id_provider} value={p.id_provider}>{p.nama}</option>)}
              </select>
           </div>

           <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
             <p className="text-xs font-bold text-slate-700 mb-2 uppercase">Format Struktur Kolom Wajib:</p>
             <ul className="text-xs text-slate-600 font-mono space-y-1 list-disc list-inside">
               <li>kode_fat <span className="text-[10px] text-slate-400 font-sans">(Unik, misal: BZ-JKT-01)</span></li>
               <li>nama_lokasi <span className="text-[10px] text-slate-400 font-sans">(Teks bebas)</span></li>
               <li>alamat <span className="text-[10px] text-slate-400 font-sans">(Alamat lengkap)</span></li>
               <li>latitude <span className="text-[10px] text-slate-400 font-sans">(Desimal, misal: -6.2)</span></li>
               <li>longitude <span className="text-[10px] text-slate-400 font-sans">(Desimal, misal: 106.8)</span></li>
               <li>radius_layanan_m <span className="text-[10px] text-slate-400 font-sans">(Angka bulat meter)</span></li>
             </ul>
           </div>

           <input 
             type="file" 
             accept=".csv" 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleFileUpload} 
           />
           <div 
             className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors border-slate-300 hover:bg-slate-50 hover:border-indigo-300"
             onClick={() => fileInputRef.current?.click()}
           >
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm font-bold text-slate-700">Klik untuk Unggah CSV Anda</p>
           </div>
        </div>
      </div>

      {/* Tabel Manajemen FAT Terdaftar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
        <h3 className="font-extrabold text-slate-800 mb-4">Manajemen Infrastruktur Terdaftar</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3 font-bold uppercase tracking-wider text-xs">Kode FAT</th>
                <th className="p-3 font-bold uppercase tracking-wider text-xs">Nama / Lokasi</th>
                <th className="p-3 font-bold uppercase tracking-wider text-xs">Koordinat</th>
                <th className="p-3 font-bold uppercase tracking-wider text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fats.map(fat => {
                const isEditing = editingFatId === fat.id_fat;
                return (
                  <tr key={fat.id_fat} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800 font-mono">{fat.kode_fat}</td>
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <input type="text" value={editFormData.nama_lokasi} onChange={e => setEditFormData({...editFormData, nama_lokasi: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-indigo-500" placeholder="Nama Lokasi" />
                          <input type="text" value={editFormData.alamat} onChange={e => setEditFormData({...editFormData, alamat: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-indigo-500" placeholder="Alamat Lengkap" />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-slate-800 truncate max-w-[200px]">{fat.nama_lokasi}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">{fat.alamat}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <input type="number" step="any" value={editFormData.latitude} onChange={e => setEditFormData({...editFormData, latitude: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-indigo-500" placeholder="Lat" />
                          <input type="number" step="any" value={editFormData.longitude} onChange={e => setEditFormData({...editFormData, longitude: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-indigo-500" placeholder="Lng" />
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 font-mono">{fat.latitude.toFixed(5)}, {fat.longitude.toFixed(5)}</div>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Simpan</Button>
                          <button onClick={() => setEditingFatId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800">Batal</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditClick(fat)} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(fat.id_fat)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200 hover:bg-red-100 transition-colors">Hapus</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
