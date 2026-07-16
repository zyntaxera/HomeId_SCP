import React from 'react';
import { User } from '../../lib/types';
import { useStore } from '../../lib/store';
import { LogOut, Map, Users, Database, LayoutDashboard, ShieldCheck, Target, MapPin } from 'lucide-react';

interface SidebarNavProps {
  currentUser: User;
  activePanel: any;
  setActivePanel: (panel: any) => void;
}

export function SidebarNav({ currentUser, activePanel, setActivePanel }: SidebarNavProps) {
  const { setCurrentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const menuItems = [
    { id: 'pelanggan', label: 'Data Pelanggan', icon: <Users className="w-5 h-5" />, roles: ['Lead', 'Admin'] },
    { id: 'tiang', label: 'Data Tiang (FAT)', icon: <Database className="w-5 h-5" />, roles: ['Lead', 'Admin'] },
    { id: 'coverage', label: 'Cek Ketersediaan', icon: <Target className="w-5 h-5" />, roles: ['Lead'] },
    { id: 'insight', label: 'Dashboard Insight', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Lead'] },
    { id: 'master', label: 'Kelola Master Data', icon: <Map className="w-5 h-5" />, roles: ['Admin'] },
    { id: 'approval', label: 'Validasi Lead', icon: <ShieldCheck className="w-5 h-5" />, roles: ['Admin'] },
  ];

  const allowedMenus = menuItems.filter(m => m.roles.includes(currentUser.role));

  return (
    <div className="w-full h-16 sm:w-20 sm:h-full bg-slate-900 border-t sm:border-t-0 sm:border-r border-slate-800 flex flex-row sm:flex-col items-center py-2 sm:py-6 z-[60] fixed bottom-0 sm:relative sm:bottom-auto shadow-[0_-10px_30px_rgba(0,0,0,0.3)] sm:shadow-2xl flex-shrink-0 justify-around sm:justify-start px-2 sm:px-0">
      <div className="hidden sm:flex mb-8 w-12 h-14 relative items-center justify-center">
        <img 
          src="/logo.png" 
          alt="Logo Sedayu" 
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>

      <nav className="flex-1 w-full flex flex-row sm:flex-col items-center justify-center sm:justify-start px-1 sm:px-2 gap-1 sm:gap-4 sm:space-y-4">
        {allowedMenus.map(menu => {
          const isActive = activePanel === menu.id;
          return (
            <button
              key={menu.id}
              onClick={() => setActivePanel(isActive ? null : menu.id)}
              title={menu.label}
              className={`flex-1 sm:flex-none sm:w-full flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl transition-all group relative ${
                isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {menu.icon}
              <span className="hidden sm:block text-[9px] font-bold text-center mt-1.5 px-1 leading-tight">{menu.label}</span>
              
              {/* Tooltip for desktop */}
              <div className="hidden sm:block absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                {menu.label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-slate-800"></div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="flex sm:mt-auto sm:w-full flex-row sm:flex-col sm:px-2 gap-1 sm:gap-0">
        <div 
          className={`flex-1 sm:mb-4 text-center sm:border-t sm:border-slate-800 sm:pt-4 cursor-pointer transition-all hover:bg-slate-800 rounded-xl p-2 flex flex-col justify-center items-center ${activePanel === 'profile' ? 'bg-indigo-900/50 border-indigo-500/30' : ''}`}
          onClick={() => setActivePanel('profile')}
          title="Lihat Profil Saya"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full mx-auto flex items-center justify-center font-bold text-indigo-400 text-sm border border-slate-700 shadow-inner">
            {currentUser.nama.charAt(0)}
          </div>
          <div className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 group-hover:text-slate-300">{currentUser.role}</div>
        </div>
        
        <button
          onClick={handleLogout}
          title="Keluar"
          className="flex-1 sm:w-full flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 sm:w-5 sm:h-5" />
          <span className="hidden sm:block text-[9px] font-bold mt-1.5">Keluar</span>
        </button>
      </div>
    </div>
  );
}
