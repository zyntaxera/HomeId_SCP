import React from 'react';

interface PillProps {
  status: string;
  className?: string;
}

export function Pill({ status, className = '' }: PillProps) {
  const styles: Record<string, string> = {
    // Prospek
    'Prospek Terdaftar': 'bg-slate-100 text-slate-700 border-slate-200',
    'Divalidasi': 'bg-blue-100 text-blue-800 border-blue-200',
    'Proses Instalasi': 'bg-purple-100 text-purple-800 border-purple-200',
    'Terpasang': 'bg-green-100 text-green-800 border-green-200',
    'Gagal': 'bg-red-100 text-red-800 border-red-200',
    
    // Vonis
    'Siap Pasang': 'bg-green-100 text-green-800 border-green-200',
    'Dalam Jangkauan': 'bg-green-100 text-green-800 border-green-200',
    'Perlu Survei': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Penuh': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Belum Terjangkau': 'bg-red-100 text-red-800 border-red-200',

    // Validasi User
    'Approved': 'bg-green-100 text-green-700',
    'Pending': 'bg-yellow-100 text-yellow-700'
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${currentStyle} ${className}`}>
      {status}
    </span>
  );
}
