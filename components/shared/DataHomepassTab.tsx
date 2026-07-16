import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { TipeLokasiHomepass } from '../../lib/types';
import { Button } from '../ui/Button';

export function DataHomepassTab() {
  const { homepasses, setSelectedMapItemId } = useStore();
  const [filterType, setFilterType] = useState<TipeLokasiHomepass | 'All'>('Residential');
  const [search, setSearch] = useState('');

  const filteredData = homepasses.filter(hp => {
    const matchType = filterType === 'All' || hp.tipe_lokasi === filterType;
    const matchSearch = search === '' || 
      hp.home_id.toLowerCase().includes(search.toLowerCase()) || 
      hp.nama_proyek.toLowerCase().includes(search.toLowerCase()) ||
      hp.id_proyek.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleExportCSV = () => {
    if (filteredData.length === 0) return alert('Tidak ada data untuk diexport');
    
    const headers = ['Province', 'City', 'Subdistrict', 'Village', 'Apartment/Cluster', 'Tower/Block', 'Floor', 'No', 'HomeID', 'Coordinate', 'Project ID', 'Project Name', 'Cust. Status', 'Classing Area'];
    const rows = filteredData.map(hp => [
      hp.provinsi,
      hp.kota,
      hp.kecamatan,
      hp.kelurahan,
      hp.nama_proyek,
      hp.blok_tower,
      hp.lantai,
      hp.nomor,
      hp.home_id,
      `"${hp.latitude}, ${hp.longitude}"`, // Quote to avoid splitting by comma
      hp.id_proyek,
      hp.nama_proyek, // Fallback if Project Name isn't separated
      hp.customer_status,
      hp.classing_area
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'CoverageArea_Export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border-t border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-orange-50/50 flex flex-col gap-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800">Database Coverage Area</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Repository Data Homepass Sedayu Cahaya Perkasa</p>
          </div>
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm">
            Export to Excel (CSV)
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase">Search By:</span>
            {(['Apartment', 'Mall/Ruko', 'Residential', 'Street', 'All'] as const).map(type => (
              <label key={type} className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-slate-700">
                <input 
                  type="radio" 
                  name="filterType" 
                  value={type} 
                  checked={filterType === type} 
                  onChange={() => setFilterType(type as any)} 
                  className="accent-indigo-600"
                />
                {type === 'All' ? 'Semua' : type}
              </label>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <span className="text-xs font-bold text-slate-500 uppercase">Value:</span>
            <input 
              type="search" 
              placeholder="Cari HomeID, ID Proyek..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="p-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 bg-slate-50">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-200 text-slate-600 border-b border-slate-300 shadow-sm sticky top-0 z-10">
            <tr>
              <th className="p-3 font-bold uppercase">No.</th>
              <th className="p-3 font-bold uppercase">Province</th>
              <th className="p-3 font-bold uppercase">City</th>
              <th className="p-3 font-bold uppercase">Subdistrict</th>
              <th className="p-3 font-bold uppercase">Village</th>
              <th className="p-3 font-bold uppercase">Apartment/Cluster</th>
              <th className="p-3 font-bold uppercase">Tower/Block</th>
              <th className="p-3 font-bold uppercase">Floor</th>
              <th className="p-3 font-bold uppercase">No</th>
              <th className="p-3 font-bold uppercase">HomeID</th>
              <th className="p-3 font-bold uppercase">Coordinate</th>
              <th className="p-3 font-bold uppercase">Project ID</th>
              <th className="p-3 font-bold uppercase">Project Name</th>
              <th className="p-3 font-bold uppercase">Cust. Status</th>
              <th className="p-3 font-bold uppercase">Classing Area</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredData.length === 0 ? (
              <tr><td colSpan={15} className="p-12 text-center text-slate-400 font-medium">Data tidak ditemukan.</td></tr>
            ) : (
              filteredData.map((hp, idx) => (
                <tr 
                  key={hp.id_homepass} 
                  className="hover:bg-indigo-50 cursor-pointer transition-colors"
                  onClick={() => {
                     // Update map center directly by exploiting the store (if map component listens to something)
                     // Since we don't have a direct flyTo for Homepass yet, we can trigger a generic map center if we add it,
                     // but for now, clicking doesn't break anything. 
                     // Ideally we would add setSelectedMapItemId(hp.id_homepass) if we render them on the map.
                  }}
                >
                  <td className="p-3 text-slate-500 font-bold">{idx + 1}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.provinsi}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.kota}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.kecamatan}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.kelurahan}</td>
                  <td className="p-3 font-medium text-slate-800">{hp.nama_proyek}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.blok_tower}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.lantai}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.nomor}</td>
                  <td className="p-3 font-mono font-bold text-indigo-600">{hp.home_id}</td>
                  <td className="p-3 font-mono text-xs text-slate-500">{hp.latitude.toFixed(6)}, {hp.longitude.toFixed(6)}</td>
                  <td className="p-3 font-mono font-bold text-slate-700">{hp.id_proyek}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.nama_proyek}</td>
                  <td className="p-3 font-medium text-slate-700">{hp.customer_status || '-'}</td>
                  <td className="p-3 font-bold text-slate-800 text-center">{hp.classing_area}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
