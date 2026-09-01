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
    providerId: '',
    province: '',
    city: '',
    subdistrict: '',
    village: '',
    street: '',
    number: '',
    postalCode: '',
    notes: '',
    homeId: '',
    projectId: '',
    projectName: '',
    customerStatus: 'Aktif',
    coordinate: '',
    lat: '',
    lng: '',
    radius: '250'
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
    setFormData(prev => ({
      ...prev,
      street: item.display_name.split(',')[0],
      notes: item.display_name,
      lat: String(item.lat),
      lng: String(item.lon)
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.providerId) return alert('Pilih provider!');

    const coordinateValue = (formData.coordinate || '').trim();
    let finalLat = formData.lat ? parseFloat(formData.lat) : NaN;
    let finalLng = formData.lng ? parseFloat(formData.lng) : NaN;

    if (coordinateValue && coordinateValue.includes(',')) {
      const [coordLat, coordLng] = coordinateValue.split(',').map(v => parseFloat(v.trim()));
      if (!Number.isNaN(coordLat)) finalLat = coordLat;
      if (!Number.isNaN(coordLng)) finalLng = coordLng;
    }

    if (!Number.isFinite(finalLat) || !Number.isFinite(finalLng)) {
      return alert('Masukkan koordinat valid, baik dari Latitude/Longitude maupun kolom Coordinate.');
    }

    const addressParts = [
      formData.street,
      formData.number,
      formData.village,
      formData.subdistrict,
      formData.city,
      formData.province
    ].filter(Boolean);

    const formattedAddress = addressParts.join(', ');
    const projectId = formData.projectId || formData.homeId || `FAT-${Date.now()}`;
    const projectName = formData.projectName || formData.street || 'Lokasi Baru';

    const newFat = addFat({
      id_provider: formData.providerId,
      kode_fat: projectId,
      nama_lokasi: projectName,
      alamat: formData.notes || formattedAddress || 'Alamat belum diisi',
      latitude: finalLat,
      longitude: finalLng,
      radius_layanan_m: parseInt(formData.radius) || 250,
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
    setFormData({
      providerId: '',
      province: '',
      city: '',
      subdistrict: '',
      village: '',
      street: '',
      number: '',
      postalCode: '',
      notes: '',
      homeId: '',
      projectId: '',
      projectName: '',
      customerStatus: 'Aktif',
      coordinate: '',
      lat: '',
      lng: '',
      radius: '250'
    });
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

  const parseExcelLikeRows = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));
    const tableRows = rows.filter(row => row.querySelectorAll('td,th').length > 0);
    if (tableRows.length === 0) return [] as Record<string, string>[];

    const headerRow = Array.from(tableRows[0].querySelectorAll('th,td')).map(cell => cell.textContent?.trim() ?? '');
    const dataRows = tableRows.slice(1);

    return dataRows.map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent?.trim() ?? '');
      const mapped: Record<string, string> = {};
      headerRow.forEach((header, index) => {
        mapped[normalizeKey(header)] = cells[index] ?? '';
      });
      return mapped;
    });
  };

  const buildFatFromRecord = (record: Record<string, string>, fallbackIndex: number) => {
    const province = record.province || record.provinsi || '';
    const city = record.city || record.kota || '';
    const subdistrict = record.subdistrict || record.kecamatan || '';
    const village = record.village || record.kelurahan || '';
    const street = record.street || record.jalan || record.alamattxt || record.alamat || '';
    const number = record.number || record.nomor || record.streetno || record.no || '';
    const projectId = record.projectid || record.project_id || record.idproyek || record.kode || '';
    const projectName = record.projectname || record.project_nm || record.namalokasi || record.nama_lokasi || record.locationname || '';
    const homeId = record.homeid || record.home_id || record.homeidvalue || '';
    const notes = record.notes || record.catatan || '';
    const coordinate = record.coordinate || record.coordiante || record.coordinates || record.kordinat || '';
    const radius = record.radius_layanan_m || record.radiusm || record.radius || '250';

    const parsedCoord = parseCoordinate(coordinate);
    const lat = safeNumber(
      record.latitude || record.lat || (parsedCoord[0] !== null ? String(parsedCoord[0]) : undefined),
      0
    );
    const lng = safeNumber(
      record.longitude || record.lng || record.lon || (parsedCoord[1] !== null ? String(parsedCoord[1]) : undefined),
      0
    );

    const formattedAddress = [street, number, village, subdistrict, city, province].filter(Boolean).join(', ');
    const finalCode = (projectId || homeId || `FAT-${fallbackIndex + 1}`).trim();
    const finalName = (projectName || homeId || notes || formattedAddress || `Lokasi ${finalCode}`).trim();

    return {
      kode_fat: finalCode,
      nama_lokasi: finalName,
      alamat: formattedAddress || notes || `Lokasi ${finalCode}`,
      latitude: lat,
      longitude: lng,
      radius_layanan_m: Math.max(1, Math.round(safeNumber(radius, 250)))
    };
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
      const rawData = event.target?.result as string;
      const lowerName = file.name.toLowerCase();
      const isHtmlTable = rawData.includes('<table') || lowerName.endsWith('.xls');
      const rows = isHtmlTable ? parseExcelLikeRows(rawData) : [];

      if (isHtmlTable && rows.length > 0) {
        let successCount = 0;

        rows.forEach((record, index) => {
          const hasAnyValue = Object.values(record).some(value => value && value.trim() !== '');
          if (!hasAnyValue) return;

          const built = buildFatFromRecord(record, index);
          if (!Number.isFinite(built.latitude) || !Number.isFinite(built.longitude)) return;

          const newFat = addFat({
            id_provider: bulkProviderId,
            kode_fat: built.kode_fat,
            nama_lokasi: built.nama_lokasi,
            alamat: built.alamat,
            latitude: built.latitude,
            longitude: built.longitude,
            radius_layanan_m: built.radius_layanan_m,
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
        });

        alert(`Berhasil mengimpor ${successCount} data FAT dari file Excel.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const csvData = rawData;
      const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) return alert('File kosong atau format tidak valid untuk import FAT.');

      const headers = parseCsvLine(lines[0]);
      const hasExcelStructure = ['province','city','subdistrict','village','street','number','postalcode','homeid','coordinate','projectid','projectname','custstatus']
        .some(key => headers.some(header => normalizeKey(header) === key || normalizeKey(header).includes(key)));

      let successCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        const mapped: Record<string, string> = {};
        headers.forEach((header, index) => {
          mapped[normalizeKey(header)] = row[index] ?? '';
        });

        const hasValue = Object.values(mapped).some(value => value && value.trim() !== '');
        if (!hasValue) continue;

        if (hasExcelStructure) {
          const built = buildFatFromRecord(mapped, i - 1);
          if (!Number.isFinite(built.latitude) || !Number.isFinite(built.longitude)) continue;

          const newFat = addFat({
            id_provider: bulkProviderId,
            kode_fat: built.kode_fat,
            nama_lokasi: built.nama_lokasi,
            alamat: built.alamat,
            latitude: built.latitude,
            longitude: built.longitude,
            radius_layanan_m: built.radius_layanan_m,
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
          continue;
        }

        const latitudeIndex = findColumnIndex(headers, ['latitude', 'lat', 'latitude_decimal', 'koordinat_lat', 'y']);
        const longitudeIndex = findColumnIndex(headers, ['longitude', 'lng', 'lon', 'longitude_decimal', 'koordinat_lng', 'x']);
        const coordinateIndex = findColumnIndex(headers, ['coordinate', 'coordinates', 'koordinat']);
        const kodeIndex = findColumnIndex(headers, ['kode_fat', 'kodefat', 'fat_code', 'homeid', 'kode', 'projectid']);
        const nameIndex = findColumnIndex(headers, ['nama_lokasi', 'namalokasi', 'locationname', 'projectname', 'project_name', 'street', 'nama', 'alamat_lokasi']);
        const addressIndex = findColumnIndex(headers, ['alamat', 'address', 'fulladdress', 'jalan', 'lokasi']);
        const radiusIndex = findColumnIndex(headers, ['radius_layanan_m', 'radiusm', 'radius', 'radius_meter']);

        const rawKode = kodeIndex >= 0 ? row[kodeIndex] : mapped.kodefat || mapped.kode || mapped.homeid || mapped.projectid || '';
        const rawName = nameIndex >= 0 ? row[nameIndex] : mapped.namalokasi || mapped.projectname || mapped.street || '';
        const rawAddress = addressIndex >= 0 ? row[addressIndex] : mapped.alamat || mapped.address || mapped.street || '';
        const rawLatitude = latitudeIndex >= 0 ? row[latitudeIndex] : mapped.latitude || mapped.lat || '';
        const rawLongitude = longitudeIndex >= 0 ? row[longitudeIndex] : mapped.longitude || mapped.lng || mapped.lon || '';
        const rawRadius = radiusIndex >= 0 ? row[radiusIndex] : mapped.radiuslayananm || mapped.radius || '';

        const coordinateValue = coordinateIndex >= 0 ? row[coordinateIndex] : '';
        const [parsedLat, parsedLng] = parseCoordinate(coordinateValue);
        const finalLat = safeNumber(rawLatitude || (parsedLat !== null ? String(parsedLat) : undefined));
        const finalLng = safeNumber(rawLongitude || (parsedLng !== null ? String(parsedLng) : undefined));

        if (!Number.isFinite(finalLat) || !Number.isFinite(finalLng)) continue;

        const finalCode = (rawKode || `FAT-${successCount + 1}`).trim();
        const finalName = (rawName || rawAddress || `Lokasi ${finalCode}`).trim();

        const newFat = addFat({
          id_provider: bulkProviderId,
          kode_fat: finalCode,
          nama_lokasi: finalName,
          alamat: rawAddress || `Lokasi ${finalCode}`,
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Province</label>
                <input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="Dki Jakarta" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">City</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="Jakarta Timur" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Subdistrict</label>
                <input type="text" value={formData.subdistrict} onChange={e => setFormData({...formData, subdistrict: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="Cipayung" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Village</label>
                <input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="Cilangkap" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Street</label>
                <input type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="Jl. Assyafiyah" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Number</label>
                <input type="text" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="~13870-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Postal Code</label>
                <input type="text" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="13870" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Radius Layanan (m)</label>
                <input type="number" min="1" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Notes</label>
              <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none" placeholder="Catatan lokasi / detail tambahan" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">HomeID</label>
                <input type="text" value={formData.homeId} onChange={e => setFormData({...formData, homeId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="13870H000.3.00007" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Cust. Status</label>
                <select value={formData.customerStatus} onChange={e => setFormData({...formData, customerStatus: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                  <option value="Calon">Calon</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Project ID</label>
                <input type="text" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="P2402501" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Project Name</label>
                <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="FBEOPA CKG RW 05 CILANGKAP TK" />
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
               <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Coordinate</label>
               <input type="text" value={formData.coordinate} onChange={e => setFormData({...formData, coordinate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="-6.33950034562618, 106.896479919066" />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Latitude</label>
                  <input type="number" step="any" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="-6.9147" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Longitude</label>
                  <input type="number" step="any" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="107.6098" />
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
                 const header = [
                   'Province',
                   'City',
                   'Subdistrict',
                   'Village',
                   'Street',
                   'Number',
                   'Postal Code',
                   'Notes',
                   'HomeID',
                   'Coordinate',
                   'Project ID',
                   'Project Name',
                   'Cust. Status'
                 ].join(',');
                 const example = [
                   'Dki Jakarta',
                   'Jakarta Timur',
                   'Cipayung',
                   'Cilangkap',
                   'Jl. Assyafiyah',
                   '~13870-1',
                   '13870',
                   'Cilangkap RT01/RW05 - Rumah NN 01',
                   '13870H000.3.00007',
                   '-6.33950034562618, 106.896479919066',
                   'P2402501',
                   'FBEOPA CKG RW 05 CILANGKAP TK',
                   'Aktif'
                 ].join(',');
                 const blob = new Blob([header + '\n' + example + '\n'], { type: 'text/csv;charset=utf-8;' });
                 const url = URL.createObjectURL(blob);
                 const link = document.createElement('a');
                 link.href = url;
                 link.download = 'Template_Import_FAT_Excel.csv';
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
             <p className="text-xs font-bold text-slate-700 mb-2 uppercase">Format Struktur Kolom (sesuai file Excel yang Anda kirim):</p>
             <ul className="text-xs text-slate-600 font-mono space-y-1 list-disc list-inside">
               <li>Province</li>
               <li>City</li>
               <li>Subdistrict</li>
               <li>Village</li>
               <li>Street</li>
               <li>Number</li>
               <li>Postal Code</li>
               <li>Notes</li>
               <li>HomeID</li>
               <li>Coordinate</li>
               <li>Project ID</li>
               <li>Project Name</li>
               <li>Cust. Status</li>
             </ul>
           </div>

           <input 
             type="file" 
             accept=".csv,.xls,.xlsx,.html" 
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
