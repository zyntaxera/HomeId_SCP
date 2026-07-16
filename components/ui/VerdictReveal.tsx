import React from 'react';
import { motion } from 'framer-motion';
import { ServiceabilityResult } from '../../lib/types';
import { Pill } from './Pill';
import { Button } from './Button';

interface VerdictRevealProps {
  result: ServiceabilityResult;
  onRegisterClick: (providerId: string, fatId: string) => void;
  onDemandClick: () => void;
  onClose: () => void;
}

export function VerdictReveal({ result, onRegisterClick, onDemandClick, onClose }: VerdictRevealProps) {
  // Animasi hero
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  const isEligible = result.vonis === 'Siap Pasang' || result.vonis === 'Perlu Survei';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-extrabold text-slate-800">Hasil Cek Ketersediaan</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200">
            &times;
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-5 max-h-[70vh] overflow-y-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-6">
             <div className="text-sm text-slate-500 mb-2">Vonis Kelayakan:</div>
             <div className={`text-2xl font-black uppercase tracking-wider ${result.vonis === 'Siap Pasang' ? 'text-green-600' : result.vonis === 'Perlu Survei' ? 'text-yellow-600' : 'text-red-600'}`}>
               {result.vonis}
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
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
                    <Pill status={p.level} />
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
                    <Button 
                      size="sm" 
                      fullWidth 
                      className="mt-1" 
                      onClick={() => onRegisterClick(p.provider.id_provider, p.fat_terdekat.id_fat)}
                    >
                      Daftarkan Prospek di {p.provider.nama}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-red-50 border border-red-100 rounded-2xl">
                 <p className="text-red-600 font-bold mb-2">Belum Terjangkau Sama Sekali</p>
                 <p className="text-xs text-red-500/80 mb-4">Tidak ada tiang provider manapun dalam radius standar di titik ini.</p>
                 <Button variant="danger" fullWidth onClick={onDemandClick}>Catat Sebagai Demand</Button>
              </div>
            )}

            {isEligible && (
               <div className="mt-4 text-center">
                 <button onClick={onDemandClick} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">
                   Abaikan dan catat sebagai Demand
                 </button>
               </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
