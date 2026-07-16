import { Capel, Demand, User } from './types';

// Guarded Selectors (Ownership Scoping)
// PRINSIP KEAMANAN: "Sales hanya melihat datanya sendiri" adalah BATAS KEAMANAN

export function getScopedCapels(allCapels: Capel[], currentUser: User | null): Capel[] {
  if (!currentUser) return [];
  if (currentUser.role === 'Admin') return []; // Admin tidak ikut jualan, mungkin tidak perlu lihat prospek detail, tapi bisa lihat jika perlu. Sesuai PRD, Admin kelola data master.
  if (currentUser.role === 'Lead') return allCapels; // Lead melihat semua sales
  
  // Sales HANYA melihat miliknya
  return allCapels.filter(c => c.id_sales === currentUser.id_user);
}

export function getScopedDemands(allDemands: Demand[], currentUser: User | null): Demand[] {
  if (!currentUser) return [];
  if (currentUser.role === 'Admin') return [];
  if (currentUser.role === 'Lead') return allDemands;
  
  return allDemands.filter(d => d.id_sales === currentUser.id_user || d.id_sales === null); 
  // Jika null mungkin demand dari public check, tapi di prototipe ini demand nempel ke sales yg nyari.
}
