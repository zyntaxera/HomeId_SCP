import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { getScopedCapels } from '../../lib/scope';
import dynamic from 'next/dynamic';

const CoverageMap = dynamic(
  () => import('../map/CoverageMap').then(mod => mod.CoverageMap),
  { ssr: false }
);

import { MapFilterPanel } from '../map/MapFilterPanel';
import { MapSearch } from '../map/MapSearch';
import { DataPelangganTab } from './DataPelangganTab';
import { DataTiangTab } from './DataTiangTab';
import { DataHomepassTab } from './DataHomepassTab';
import { UserProfile } from './UserProfile';
import { ProspekStatus } from '../../lib/types';
import { InsightDashboard } from '../lead/InsightDashboard';
import { CoverageCheck } from '../sales/CoverageCheck';
import { CapelForm } from '../sales/CapelForm';
import { UserApproval } from '../admin/UserApproval';
import { MasterData } from '../admin/MasterData';
import { SidebarNav } from './SidebarNav';
import { FloatingPanel } from './FloatingPanel';
import { AnimatePresence, motion } from 'framer-motion';

export type ActivePanel = 'coverage' | 'pelanggan' | 'tiang' | 'insight' | 'master' | 'homepass' | 'profile' | null;

export function UnifiedDashboard() {
  const { 
    currentUser, providers, fats, ports, demands, capels, users, 
    selectedMapItemId, setSelectedMapItemId, updateCapelStatus 
  } = useStore();

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  
  const [activeLayers, setActiveLayers] = useState({
    providers: providers.map(p => p.id_provider),
    showPelanggan: true,
    showProspek: true,
    showDemand: true
  });

  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [activePin, setActivePin] = useState<[number, number] | null>(null);
  const [salesCapelFormState, setSalesCapelFormState] = useState<any>(null);

  if (!currentUser) return null;

  const scopedCapels = getScopedCapels(capels, currentUser);

  const handleUpdateStatus = (id: string, newStatus: ProspekStatus) => {
    try {
      updateCapelStatus(id, newStatus, currentUser.id_user);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleMapSearchSelect = (lat: number, lng: number, addr: string) => {
    setMapCenter([lat, lng]);
    setActivePin([lat, lng]);
  };

  return (
    <div className="flex w-full h-screen bg-slate-900 overflow-hidden relative font-sans">
      
      {/* 1. MAP BACKGROUND (Absolute 100%) */}
      <div className="absolute inset-0 z-0">
        <CoverageMap 
          providers={providers}
          fats={fats}
          capels={scopedCapels}
          demands={demands}
          activeLayers={activeLayers}
          centerPosition={mapCenter}
          activePin={activePin}
          onMapClick={(lat, lng) => {
             setActivePin([lat, lng]);
             setMapCenter([lat, lng]);
          }}
        />
      </div>

      {/* 2. FLOATING MAP CONTROLS */}
      {/* Map Search Top Center/Right */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-32 z-20 pointer-events-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
        <MapSearch onLocationSelect={handleMapSearchSelect} />
      </div>

      {/* Map Filter Top Right */}
      <div className="absolute top-20 sm:top-6 right-4 sm:right-6 z-20 pointer-events-auto">
        <MapFilterPanel providers={providers} activeLayers={activeLayers} onChange={setActiveLayers} />
      </div>

      {/* 3. SIDEBAR NAVIGATION */}
      <SidebarNav currentUser={currentUser} activePanel={activePanel} setActivePanel={setActivePanel} />

      {/* 4. FLOATING PANELS (Glassmorphism Overlays) */}
      <AnimatePresence>
        {activePanel === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[200] bg-slate-50 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-4 sm:mt-12 relative">
              <button 
                onClick={() => setActivePanel(null)}
                className="absolute top-4 right-4 sm:-right-12 p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-700 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <h1 className="text-3xl font-black text-slate-900 mb-8">Profil Pengguna</h1>
              <UserProfile />
            </div>
          </motion.div>
        )}

        {activePanel === 'pelanggan' && (
          <FloatingPanel title="Data Pelanggan" onClose={() => setActivePanel(null)} width="3xl">
            <DataPelangganTab 
              capels={scopedCapels} 
              users={users} 
              providers={providers}
              fats={fats}
              currentUser={currentUser}
              onUpdateStatus={handleUpdateStatus}
              selectedId={selectedMapItemId}
              onSelectRow={setSelectedMapItemId}
            />
          </FloatingPanel>
        )}

        {activePanel === 'tiang' && (
          <FloatingPanel title="Data Infrastruktur (FAT)" onClose={() => setActivePanel(null)} width="3xl">
            <DataTiangTab 
              fats={fats}
              providers={providers}
              ports={ports}
              currentUser={currentUser}
              selectedId={selectedMapItemId}
              onSelectRow={setSelectedMapItemId}
            />
          </FloatingPanel>
        )}

        {activePanel === 'homepass' && (
          <FloatingPanel title="Coverage Area Database" onClose={() => setActivePanel(null)} width="3xl">
            <DataHomepassTab />
          </FloatingPanel>
        )}

        {activePanel === 'coverage' && (
          <FloatingPanel title="Cek Ketersediaan Titik" onClose={() => { setActivePanel(null); setSalesCapelFormState(null); }} width="xl">
            <div className="p-4">
              {!salesCapelFormState ? (
                <CoverageCheck 
                  activePin={activePin}
                  onRegisterCapel={(pId, fId, lat, lng, addr) => setSalesCapelFormState({ pId, fId, lat, lng, addr })}
                  onRegisterDemand={() => setActivePanel(null)}
                />
              ) : (
                <CapelForm 
                  providerId={salesCapelFormState.pId}
                  fatId={salesCapelFormState.fId}
                  lat={salesCapelFormState.lat}
                  lng={salesCapelFormState.lng}
                  address={salesCapelFormState.addr}
                  onSuccess={() => { setSalesCapelFormState(null); setActivePanel('pelanggan'); }}
                  onCancel={() => setSalesCapelFormState(null)}
                />
              )}
            </div>
          </FloatingPanel>
        )}

        {activePanel === 'insight' && (
          <FloatingPanel title="Dashboard Insight & Performa" onClose={() => setActivePanel(null)} width="3xl">
            <InsightDashboard />
          </FloatingPanel>
        )}

        {activePanel === 'master' && (
          <FloatingPanel title="Kelola Master Data" onClose={() => setActivePanel(null)} width="3xl">
            <MasterData />
          </FloatingPanel>
        )}

        {activePanel === 'approval' && (
          <FloatingPanel title="Validasi Akun Sales Baru" onClose={() => setActivePanel(null)} width="2xl">
            <UserApproval />
          </FloatingPanel>
        )}
      </AnimatePresence>

    </div>
  );
}
