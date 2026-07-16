import React, { useState } from 'react';
import { FAT, Provider, Port, User } from '../../lib/types';
import { Pill } from '../ui/Pill';
import { searchAddressNominatim } from '../../lib/geocode';
import { Button } from '../ui/Button';

// Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface DataTiangTabProps {
  fats: FAT[];
  providers: Provider[];
  ports: Port[];
  currentUser: User;
  selectedId: string | null;
  onSelectRow: (id: string) => void;
}

export function DataTiangTab({ fats, providers, ports, currentUser, selectedId, onSelectRow }: DataTiangTabProps) {
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [radiusCenter, setRadiusCenter] = useState<{lat: number, lng: number, name: string} | null>(null);

  const handleGeoSearch = async () => {
    if (!search || search.length < 3) return;
    setIsSearchingGeo(true);
    setRadiusCenter(null);
    try {
      const results = await searchAddressNominatim(search);
      if (results && results.length > 0) {
        setRadiusCenter({
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
          name: results[0].display_name
        });
      } else {
        alert("Kawasan tidak ditemukan. Pencarian akan menggunakan teks biasa.");
      }
    } catch (e) {
      alert("Gagal menghubungi server pencarian.");
    } finally {
      setIsSearchingGeo(false);
    }
  };

  const filteredFats = fats.filter(f => {
    const matchProvider = filterProvider === 'all' || f.id_provider === filterProvider;
    
    // Status Port Logic
    const fatPorts = ports.filter(p => p.id_fat === f.id_fat);
    const emptyPorts = fatPorts.filter(p => p.status_port === 'Tersedia').length;
    const isSiap = emptyPorts > 0;
    const matchStatus = filterStatus === 'all' || 
                        (filterStatus === 'siap' && isSiap) || 
                        (filterStatus === 'penuh' && !isSiap);

    // Search Logic (Radius vs Text)
    let matchSearch = true;
    if (radiusCenter) {
      const distMeters = getDistance(radiusCenter.lat, radiusCenter.lng, f.latitude, f.longitude);
      matchSearch = distMeters <= 15000; // 15 KM radius
    } else if (search) {
      matchSearch = f.kode_fat.toLowerCase().includes(search.toLowerCase()) || 
                    f.nama_lokasi.toLowerCase().includes(search.toLowerCase()) ||
                    f.alamat.toLowerCase().includes(search.toLowerCase());
    }

    return matchProvider && matchStatus && matchSearch;
  });

  return (
    <div className="bg-white border-t border-slate-200">
      <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10 space-y-4">
        {/* Baris Pertama: Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider:</span>
            <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 outline-none w-40">
              <option value="all">Semua</option>
              {providers.map(p => <option key={p.id_provider} value={p.id_provider}>{p.nama}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 outline-none w-40">
              <option value="all">Semua</option>
              <option value="siap">Siap Pasang</option>
              <option value="penuh">Penuh</option>
            </select>
          </div>
        </div>

        {/* Baris Kedua: Pencarian Semantik */}
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="search" 
            placeholder="Ketik nama Tiang, Alamat, atau Kawasan (Cth: Kota Bandung)..." 
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (radiusCenter) setRadiusCenter(null); // Reset radius if they type again
            }}
            onKeyDown={e => e.key === 'Enter' && handleGeoSearch()}
            className="p-2.5 flex-1 min-w-[250px] bg-white border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
          />
          <Button onClick={handleGeoSearch} disabled={isSearchingGeo} className="shrink-0">
            {isSearchingGeo ? 'Mencari...' : 'Cari Kawasan (15km)'}
          </Button>
          {radiusCenter && (
            <button onClick={() => { setRadiusCenter(null); setSearch(''); }} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-200">
              Hapus Radius
            </button>
          )}
        </div>
        {radiusCenter && (
          <div className="text-xs font-medium text-slate-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Menampilkan hasil dalam radius 15 KM dari: <strong>{radiusCenter.name}</strong>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6 font-bold uppercase tracking-wider text-xs">Kode FAT</th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">Provider</th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">Lokasi</th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">Port Tersedia</th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFats.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400">Belum ada infrastruktur untuk filter ini.</td></tr>
            ) : (
              filteredFats.map(fat => {
                const provider = providers.find(p => p.id_provider === fat.id_provider);
                const fatPorts = ports.filter(p => p.id_fat === fat.id_fat);
                const emptyPorts = fatPorts.filter(p => p.status_port === 'Tersedia').length;
                const isSelected = selectedId === fat.id_fat;

                return (
                  <tr 
                    key={fat.id_fat} 
                    onClick={() => onSelectRow(fat.id_fat)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50/50 border-l-4 border-l-transparent'}`}
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800 font-mono">{fat.kode_fat}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800" style={{color: provider?.warna_peta}}>{provider?.nama}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-600 truncate max-w-[200px]">{fat.nama_lokasi}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold tabular-nums text-slate-800 bg-slate-100 inline-block px-3 py-1 rounded-lg">
                        {emptyPorts} Port(s)
                      </div>
                    </td>
                    <td className="p-4">
                      <Pill status={emptyPorts > 0 ? 'Siap Pasang' : 'Penuh'} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
