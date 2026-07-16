import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { StatCounter } from '../ui/StatCounter';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../ui/Button';

export function InsightDashboard() {
  const { capels, demands, users, providers, fats } = useStore();
  const [activeSalesId, setActiveSalesId] = useState<string | null>(null);

  const totalProspek = capels.length;
  const totalTerpasang = capels.filter(c => c.status_prospek === 'Terpasang').length;
  const conversionRate = totalProspek > 0 ? ((totalTerpasang / totalProspek) * 100).toFixed(1) : '0.0';
  const totalDemand = demands.length;

  // Leaderboard logic
  const salesUsers = users.filter(u => u.role === 'Sales');
  const leaderboard = salesUsers.map(sales => {
    const sCapels = capels.filter(c => c.id_sales === sales.id_user);
    const terpasang = sCapels.filter(c => c.status_prospek === 'Terpasang').length;
    return {
      id_user: sales.id_user,
      nama: sales.nama,
      total: sCapels.length,
      terpasang,
    };
  }).sort((a, b) => b.terpasang - a.terpasang);

  if (activeSalesId) {
    const sales = users.find(u => u.id_user === activeSalesId);
    if (!sales) return null;
    
    const salesCapels = capels.filter(c => c.id_sales === activeSalesId).sort((a, b) => new Date(b.tanggal_daftar).getTime() - new Date(a.tanggal_daftar).getTime());
    
    return (
      <div className="p-4 sm:p-6 space-y-6 flex flex-col h-full">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Button variant="outline" onClick={() => setActiveSalesId(null)} className="shrink-0">
            &larr; Kembali
          </Button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Rincian Performa: {sales.nama}</h2>
            <p className="text-sm text-slate-500">Menampilkan seluruh riwayat prospek dan pelanggan.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Total Prospek</p>
             <p className="text-2xl font-black text-indigo-700">{salesCapels.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
             <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Sukses Terpasang</p>
             <p className="text-2xl font-black text-green-700">{salesCapels.filter(c => c.status_prospek === 'Terpasang').length}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
             <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Proses / Pending</p>
             <p className="text-2xl font-black text-amber-700">{salesCapels.filter(c => c.status_prospek !== 'Terpasang' && c.status_prospek !== 'Gagal').length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-4 font-bold">Tanggal</th>
                  <th className="p-4 font-bold">Nama Pelanggan</th>
                  <th className="p-4 font-bold">Lokasi / Alamat</th>
                  <th className="p-4 font-bold">Provider & FAT</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesCapels.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada riwayat prospek.</td></tr>
                ) : (
                  salesCapels.map(c => {
                    const prov = providers.find(p => p.id_provider === c.id_provider_terpilih);
                    const fat = fats.find(f => f.id_fat === c.id_fat_terpilih);
                    return (
                      <tr key={c.id_capel} className="hover:bg-slate-50">
                        <td className="p-4 text-slate-500">{new Date(c.tanggal_daftar).toLocaleDateString('id-ID')}</td>
                        <td className="p-4 font-bold text-slate-800">{c.nama_lengkap} <br/><span className="text-xs text-slate-400 font-normal">{c.no_telepon}</span></td>
                        <td className="p-4 text-slate-600">
                          <div className="max-w-[200px] truncate" title={c.alamat_instalasi}>{c.alamat_instalasi}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{c.latitude.toFixed(5)}, {c.longitude.toFixed(5)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-700">{prov?.nama || '-'}</div>
                          <div className="text-xs text-slate-500">Jarak: {c.jarak_ke_fat_m}m • {fat?.kode_fat}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.status_prospek === 'Terpasang' ? 'bg-green-100 text-green-700' : 
                            c.status_prospek === 'Gagal' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {c.status_prospek}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-xs max-w-[150px] truncate" title={c.catatan || '-'}>{c.catatan || '-'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-800">Insight & Performa</h2>
        <p className="text-sm text-slate-500">Statistik keseluruhan performa lapangan.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCounter label="Total Prospek" value={totalProspek} />
        <StatCounter label="User Terpasang" value={totalTerpasang} />
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Conversion Rate</p>
           <p className="text-3xl font-black text-slate-800">{conversionRate}%</p>
        </div>
        <StatCounter label="Total Demand" value={totalDemand} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 mb-4">Leaderboard Sales (Instalasi Sukses)</h3>
           <div className="h-64 w-full min-h-[256px]">
             <ResponsiveContainer width="100%" height={256} minWidth={1} minHeight={1}>
               <BarChart data={leaderboard} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                 <XAxis type="number" hide />
                 <YAxis dataKey="nama" type="category" axisLine={false} tickLine={false} fontSize={12} fontWeight="bold" />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="terpasang" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} name="Terpasang" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Detailed Leaderboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Rincian Performa Sales</h3>
          <div className="space-y-4">
            {leaderboard.map((item, idx) => (
              <div 
                key={item.id_user} 
                onClick={() => setActiveSalesId(item.id_user)}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors group"
                title="Klik untuk melihat rincian riwayat pelanggan"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{item.nama}</span>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-black text-slate-800">{item.terpasang} <span className="text-[10px] text-slate-400 font-bold uppercase">Terpasang</span></span>
                  <span className="text-xs text-slate-500">dari {item.total} prospek</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
