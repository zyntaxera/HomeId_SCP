import React, { useEffect, useState } from 'react';
import { useStore } from '../../lib/store';
import { checkServiceability } from '../../lib/serviceability';
import { VerdictReveal } from '../ui/VerdictReveal';
import { ServiceabilityResult } from '../../lib/types';

interface CoverageCheckProps {
  onRegisterCapel: (providerId: string, fatId: string, lat: number, lng: number, address: string) => void;
  onRegisterDemand: () => void;
  activePin: [number, number] | null;
}

export function CoverageCheck({ onRegisterCapel, onRegisterDemand, activePin }: CoverageCheckProps) {
  const { providers, fats, ports } = useStore();
  const [result, setResult] = useState<ServiceabilityResult | null>(null);

  useEffect(() => {
    if (activePin) {
      // Run serviceability engine on the active pin
      const res = checkServiceability(activePin[0], activePin[1], providers, fats, ports);
      setResult(res);
    } else {
      setResult(null);
    }
  }, [activePin, providers, fats, ports]);

  if (!activePin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-64">
        <div className="text-4xl mb-4">📍</div>
        <h3 className="text-lg font-bold text-slate-700">Tentukan Titik Lokasi</h3>
        <p className="text-sm text-slate-500 mt-2">
          Gunakan fitur pencarian di atas peta atau klik langsung pada peta untuk menaruh pin lokasi yang ingin dicek.
        </p>
      </div>
    );
  }

  if (!result) return <div className="p-8 text-center">Menghitung...</div>;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden">
      {/* We reuse the VerdictReveal UI but adapt it to not be a full-screen modal, 
          since this component is already inside a FloatingPanel. 
          Actually VerdictReveal has a fixed inset-0 overlay. Let's build the inner UI here instead of VerdictReveal to avoid double modals. */}
      
      <div className="p-2">
        <div className="text-center mb-6 border-b border-slate-100 pb-4">
           <div className="text-sm text-slate-500 mb-2">Vonis Kelayakan Lokasi:</div>
           <div className={`text-2xl font-black uppercase tracking-wider ${result.vonis === 'Siap Pasang' ? 'text-green-600' : result.vonis === 'Perlu Survei' ? 'text-yellow-600' : 'text-red-600'}`}>
             {result.vonis}
           </div>
           <div className="text-[10px] text-slate-400 font-mono mt-1">{activePin[0].toFixed(5)}, {activePin[1].toFixed(5)}</div>
        </div>

        <div className="space-y-4">
          {result.daftar_provider.length > 0 ? (
            result.daftar_provider.map(p => (
              <div key={p.provider.id_provider} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-inner" style={{ backgroundColor: p.provider.warna_peta }}>
                      {p.provider.inisial_logo}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{p.provider.nama}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{p.fat_terdekat.kode_fat}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap bg-slate-50 text-slate-700`}>
                    {p.level}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-sm">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Jarak Tarikan</span>
                    <span className="font-mono font-bold text-slate-700">{p.jarak_m}m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Port Tersedia</span>
                    <span className="font-mono font-bold text-slate-700">{p.port_kosong}</span>
                  </div>
                </div>

                {(p.level === 'Dalam Jangkauan' || (p.level === 'Perlu Survei' && p.port_kosong > 0)) && (
                  <button 
                    className="mt-1 w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    onClick={() => onRegisterCapel(p.provider.id_provider, p.fat_terdekat.id_fat, activePin[0], activePin[1], `Titik Koordinat: ${activePin[0].toFixed(5)}, ${activePin[1].toFixed(5)}`)}
                  >
                    Daftarkan Prospek di {p.provider.nama}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-6 bg-red-50 border border-red-100 rounded-2xl">
               <p className="text-red-600 font-bold mb-2">Belum Terjangkau Sama Sekali</p>
               <p className="text-xs text-red-500/80 mb-4">Tidak ada tiang provider manapun dalam radius standar di titik ini.</p>
               <button 
                  className="w-full py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                  onClick={onRegisterDemand}
               >
                 Catat Sebagai Demand
               </button>
            </div>
          )}

          {(result.vonis === 'Siap Pasang' || result.vonis === 'Perlu Survei') && (
             <div className="mt-4 text-center">
               <button onClick={onRegisterDemand} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">
                 Abaikan dan catat sebagai Demand
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
