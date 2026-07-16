import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { calculateDistance } from '../../lib/serviceability';
import { Button } from '../ui/Button';

interface CapelFormProps {
  providerId: string;
  fatId: string;
  lat: number;
  lng: number;
  address: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CapelForm({ providerId, fatId, lat, lng, address, onSuccess, onCancel }: CapelFormProps) {
  const { providers, fats, ports, registerCapel, currentUser } = useStore();
  const provider = providers.find(p => p.id_provider === providerId);
  const fat = fats.find(f => f.id_fat === fatId);
  
  const [formData, setFormData] = useState({ nama: '', telp: '', alamat: address, catatan: '' });
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [error, setError] = useState('');

  // Auto-select first available port
  const availablePorts = ports.filter(p => p.id_fat === fatId && p.status_port === 'Tersedia');
  useEffect(() => {
    if (availablePorts.length > 0 && !selectedPort) {
      setSelectedPort(availablePorts[0].id_port);
    }
  }, [availablePorts, selectedPort]);

  if (!provider || !fat) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPort) return setError('Pilih port yang tersedia.');

    try {
      registerCapel({
        nama_lengkap: formData.nama,
        no_telepon: formData.telp,
        alamat_instalasi: formData.alamat,
        latitude: lat,
        longitude: lng,
        id_provider_terpilih: providerId,
        id_fat_terpilih: fatId,
        id_port_terpilih: selectedPort,
        jarak_ke_fat_m: calculateDistance(lat, lng, fat.latitude, fat.longitude),
        id_sales: currentUser!.id_user,
        catatan: formData.catatan
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-lg mx-auto mt-4">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg">Form Pendaftaran Prospek</h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Provider: <span style={{color: provider.warna_peta}}>{provider.nama}</span> | FAT: {fat.kode_fat}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200">{error}</div>}
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nama Lengkap KTP</label>
          <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl text-sm font-medium outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">No. WhatsApp Aktif</label>
          <input required type="tel" value={formData.telp} onChange={e => setFormData({...formData, telp: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl text-sm font-medium outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Alamat Detail (No. Rumah, RT/RW)</label>
          <textarea required rows={3} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl text-sm font-medium outline-none resize-none" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Alokasi Port (FAT: {fat.kode_fat})</label>
          <select required value={selectedPort} onChange={e => setSelectedPort(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl text-sm font-bold outline-none">
            <option value="" disabled>-- Pilih Port --</option>
            {availablePorts.map(p => (
              <option key={p.id_port} value={p.id_port}>Port {p.nomor_port}</option>
            ))}
          </select>
          {availablePorts.length === 0 && <p className="text-xs text-red-500 mt-1 font-bold">Semua port penuh/rusak!</p>}
        </div>

        <div>
           <label className="flex items-start gap-2 mt-4 cursor-pointer">
             <input required type="checkbox" className="mt-1" />
             <span className="text-xs text-slate-500">Saya telah mendapatkan persetujuan dari calon pelanggan terkait penyimpanan data pribadi sesuai UU PDP.</span>
           </label>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Batal</Button>
          <Button type="submit" fullWidth disabled={availablePorts.length === 0}>Submit Prospek</Button>
        </div>
      </form>
    </div>
  );
}
