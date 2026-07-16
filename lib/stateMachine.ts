import { ProspekStatus } from './types';

// Aturan transisi state yang diizinkan (Strict)
const ALLOWED_TRANSITIONS: Record<ProspekStatus, ProspekStatus[]> = {
  'Prospek Terdaftar': ['Divalidasi'],
  'Divalidasi': ['Proses Instalasi', 'Gagal'],
  'Proses Instalasi': ['Terpasang', 'Gagal'],
  'Terpasang': [], // Terminal
  'Gagal': []      // Terminal (kecuali dire-home secara khusus oleh Lead)
};

export function canTransition(current: ProspekStatus, next: ProspekStatus): boolean {
  return ALLOWED_TRANSITIONS[current].includes(next);
}

export function assertTransition(current: ProspekStatus, next: ProspekStatus) {
  if (!canTransition(current, next)) {
    throw new Error(`Transisi status tidak valid: dari '${current}' ke '${next}' tidak diizinkan.`);
  }
}
