import React from 'react';
import { useStore } from '../../lib/store';
import { Pill } from '../ui/Pill';
import { Button } from '../ui/Button';

export function UserApproval() {
  const { users, approveUser, currentUser, _addLog } = useStore();
  const leadUsers = users.filter(u => u.role === 'Lead');

  const handleApproval = (id: string, status: 'Approved' | 'Rejected', email: string) => {
    approveUser(id, status);
    _addLog({
      entitas: 'User',
      id_entitas: id,
      aksi: 'Validasi Pendaftaran',
      nilai_lama: 'Pending',
      nilai_baru: status,
      id_user_eksekutor: currentUser!.id_user
    });
    alert(`Akun ${email} berhasil di-${status.toLowerCase()}`);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-800">Validasi Pendaftaran Lead</h2>
        <p className="text-sm text-slate-500">Setujui atau tolak akses sistem untuk pengguna baru.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 font-bold uppercase tracking-wider text-xs">Email Pengguna</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Status Validasi</th>
                <th className="p-4 pr-6 font-bold uppercase tracking-wider text-xs text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leadUsers.length === 0 ? (
                <tr><td colSpan={3} className="p-12 text-center text-slate-400">Belum ada data user.</td></tr>
              ) : (
                leadUsers.map(user => (
                  <tr key={user.id_user} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 font-bold text-slate-800">{user.email}</td>
                    <td className="p-4"><Pill status={user.status_validasi} /></td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {user.status_validasi === 'Pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApproval(user.id_user, 'Approved', user.email)}>Setujui</Button>
                          <Button size="sm" variant="danger" onClick={() => handleApproval(user.id_user, 'Rejected', user.email)}>Tolak</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
