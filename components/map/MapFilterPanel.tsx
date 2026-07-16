import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { Provider } from '../../lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface MapFilterPanelProps {
  providers: Provider[];
  activeLayers: {
    providers: string[];
    showPelanggan: boolean;
    showProspek: boolean;
    showDemand: boolean;
  };
  onChange: (layers: any) => void;
}

export function MapFilterPanel({ providers, activeLayers, onChange }: MapFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleProvider = (id: string) => {
    const newProviders = activeLayers.providers.includes(id)
      ? activeLayers.providers.filter(p => p !== id)
      : [...activeLayers.providers, id];
    onChange({ ...activeLayers, providers: newProviders });
  };

  const toggleLayer = (key: keyof typeof activeLayers) => {
    onChange({ ...activeLayers, [key]: !activeLayers[key as keyof typeof activeLayers] });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden w-64 pointer-events-auto">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Layers className="w-4 h-4" />
          Filter & Legenda
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Infrastruktur */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Infrastruktur Provider</p>
                <div className="space-y-2">
                  {providers.map(p => (
                    <label key={p.id_provider} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={activeLayers.providers.includes(p.id_provider)}
                        onChange={() => toggleProvider(p.id_provider)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.warna_peta }}></span>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{p.nama}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Status Pelanggan */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status Pelanggan</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={activeLayers.showPelanggan} onChange={() => toggleLayer('showPelanggan')} className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">User Terpasang</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={activeLayers.showProspek} onChange={() => toggleLayer('showProspek')} className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500" />
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Prospek Aktif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={activeLayers.showDemand} onChange={() => toggleLayer('showDemand')} className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500" />
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Demand (Belum Terjangkau)</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
