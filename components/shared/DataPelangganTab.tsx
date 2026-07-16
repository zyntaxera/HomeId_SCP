import React, { useState } from 'react';
import { Capel, User, Provider, FAT, ProspekStatus } from '../../lib/types';
import { Pill } from '../ui/Pill';

interface DataPelangganTabProps {
  capels: Capel[];
  users: User[];
  providers: Provider[];
  fats: FAT[];
  currentUser: User;
  onUpdateStatus: (id: string, newStatus: ProspekStatus) => void;
  selectedId: string | null;
  onSelectRow: (id: string) => void;
}

export function DataPelangganTab({ capels, users, providers, fats, currentUser, onUpdateStatus, selectedId, onSelectRow }: DataPelangganTabProps) {
  const [search, setSearch] = useState('');

  const filteredCapels = capels.filter(c => 
    c.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
    c.no_telepon.includes(search) || 
    c.alamat_instalasi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border-t border-slate-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Cari Pelanggan:</span>
        <input 
          type="search" 
          placeholder="Nama, No HP, Alamat..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 w-64 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6 font-bold uppercase tracking-wider text-xs">Pelanggan</th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">Kontak & Alamat</th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">Provider / FAT</th>
              <th className="p-4 font-bold uppercase tracking-wider text-xs">Status</th>
              {(currentUser.role === 'Lead') && <th className="p-4 pr-6 font-bold uppercase tracking-wider text-xs text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCapels.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400">Pencarian tidak menemukan hasil.</td></tr>
            ) : (
              filteredCapels.map(capel => {
                const sales = users.find(u => u.id_user === capel.id_sales);
                const provider = providers.find(p => p.id_provider === capel.id_provider_terpilih);
                const fat = fats.find(f => f.id_fat === capel.id_fat_terpilih);
                const isSelected = selectedId === capel.id_capel;

                return (
                  <tr 
                    key={capel.id_capel} 
                    onClick={() => onSelectRow(capel.id_capel)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50/50 border-l-4 border-l-transparent'}`}
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{capel.nama_lengkap}</div>
                      {(currentUser.role === 'Lead' || currentUser.role === 'Admin') && (
                        <div className="text-xs text-slate-500 mt-0.5">Sales: {sales?.nama}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-600">{capel.no_telepon}</div>
                      <div className="text-[10px] text-slate-500 max-w-[200px] truncate">{capel.alamat_instalasi}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800" style={{color: provider?.warna_peta}}>{provider?.nama}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{fat?.kode_fat}</div>
                    </td>
                    <td className="p-4">
                      <Pill status={capel.status_prospek} />
                    </td>
                    {(currentUser.role === 'Lead') && (
                      <td className="p-4 pr-6 text-right space-x-2">
                        {capel.status_prospek === 'Prospek Terdaftar' && (
                          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(capel.id_capel, 'Divalidasi'); }} className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition-colors">Validasi</button>
                        )}
                        {capel.status_prospek === 'Divalidasi' && (
                          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(capel.id_capel, 'Proses Instalasi'); }} className="px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-xs font-bold transition-colors">Kirim Teknisi</button>
                        )}
                        {capel.status_prospek === 'Proses Instalasi' && (
                          <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(capel.id_capel, 'Terpasang'); }} className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-bold transition-colors">Selesai</button>
                        )}
                      </td>
                    )}
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
