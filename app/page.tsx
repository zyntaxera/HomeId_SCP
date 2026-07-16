'use client';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '../lib/store';
import { AuthView } from '../components/auth/AuthView';
import { UnifiedDashboard } from '../components/shared/UnifiedDashboard';

// Bypass SSR for Leaflet and Zustand persistence if any
const DynamicMapLoader = dynamic(() => Promise.resolve(() => null), { ssr: false });

export default function AppShell() {
  const { currentUser, setCurrentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthView />;
  }

  return (
    <div className="h-screen w-full bg-slate-100 font-sans selection:bg-indigo-200 selection:text-indigo-900 flex overflow-hidden">
      <UnifiedDashboard />
    </div>
  );
}
