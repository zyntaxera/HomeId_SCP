import React, { useState } from 'react';
import { Provider } from '../../lib/types';
import { Button } from '../ui/Button';

interface ProviderManagementProps {
  providers: Provider[];
  addProvider: (providerData: Omit<Provider, 'id_provider'>) => Provider;
  updateProvider: (id_provider: string, data: Partial<Provider>) => void;
  deleteProvider: (id_provider: string) => void;
}

export function ProviderManagement({ providers, addProvider, updateProvider, deleteProvider }: ProviderManagementProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nama: '', warna_peta: '#000000', inisial_logo: '', status_aktif: true });
  const [editData, setEditData] = useState({ nama: '', warna_peta: '', inisial_logo: '', status_aktif: true });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.inisial_logo) return;
    addProvider(formData);
    setFormData({ nama: '', warna_peta: '#000000', inisial_logo: '', status_aktif: true });
  };

  const handleSaveEdit = (id: string) => {
    updateProvider(id, editData);
    setIsEditing(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
      <h3 className="font-extrabold text-slate-800 mb-4">Manajemen Provider</h3>
      
      {/* Form Tambah */}
      <form onSubmit={handleAdd} className="flex gap-4 mb-6 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nama Provider</label>
          <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-indigo-500" placeholder="Contoh: IndiHome" />
        </div>
        <div className="w-24">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Inisial</label>
          <input required type="text" maxLength={2} value={formData.inisial_logo} onChange={e => setFormData({...formData, inisial_logo: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 text-center uppercase" placeholder="ID" />
        </div>
        <div className="w-24">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Warna Peta</label>
          <input required type="color" value={formData.warna_peta} onChange={e => setFormData({...formData, warna_peta: e.target.value})} className="w-full h-9 p-1 bg-white border border-slate-300 rounded-lg cursor-pointer" />
        </div>
        <Button type="submit">Tambah Provider</Button>
      </form>

      {/* List Provider */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-3 font-bold uppercase tracking-wider text-xs">Provider</th>
              <th className="p-3 font-bold uppercase tracking-wider text-xs text-center">Inisial</th>
              <th className="p-3 font-bold uppercase tracking-wider text-xs text-center">Warna</th>
              <th className="p-3 font-bold uppercase tracking-wider text-xs">Status</th>
              <th className="p-3 font-bold uppercase tracking-wider text-xs text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {providers.map(p => (
              <tr key={p.id_provider} className="hover:bg-slate-50">
                <td className="p-3">
                  {isEditing === p.id_provider ? (
                    <input type="text" value={editData.nama} onChange={e => setEditData({...editData, nama: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-indigo-500" />
                  ) : (
                    <span className="font-bold text-slate-800">{p.nama}</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {isEditing === p.id_provider ? (
                    <input type="text" maxLength={2} value={editData.inisial_logo} onChange={e => setEditData({...editData, inisial_logo: e.target.value})} className="w-16 mx-auto p-2 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 text-center uppercase" />
                  ) : (
                    <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded">{p.inisial_logo}</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {isEditing === p.id_provider ? (
                    <input type="color" value={editData.warna_peta} onChange={e => setEditData({...editData, warna_peta: e.target.value})} className="w-12 h-8 mx-auto p-1 bg-white border border-slate-300 rounded-lg cursor-pointer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full mx-auto shadow-sm" style={{ backgroundColor: p.warna_peta }}></div>
                  )}
                </td>
                <td className="p-3">
                  {isEditing === p.id_provider ? (
                    <select value={editData.status_aktif ? 'true' : 'false'} onChange={e => setEditData({...editData, status_aktif: e.target.value === 'true'})} className="p-2 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-indigo-500">
                      <option value="true">Aktif</option>
                      <option value="false">Nonaktif</option>
                    </select>
                  ) : (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${p.status_aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {p.status_aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  {isEditing === p.id_provider ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(p.id_provider)}>Simpan</Button>
                      <button onClick={() => setIsEditing(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800">Batal</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setIsEditing(p.id_provider); setEditData({ nama: p.nama, warna_peta: p.warna_peta, inisial_logo: p.inisial_logo, status_aktif: p.status_aktif }); }} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-colors">Edit</button>
                      <button onClick={() => confirm('Yakin hapus provider?') && deleteProvider(p.id_provider)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200 hover:bg-red-100 transition-colors">Hapus</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
