import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui/Button';
import { ShieldCheck, Upload, Mail, Phone, Hash, Key, Lock } from 'lucide-react';

export function UserProfile() {
  const { currentUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!currentUser) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server. Here we just use object URL.
      const url = URL.createObjectURL(file);
      setProfilePic(url);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800">Profil Saya</h2>
        <p className="text-sm text-slate-500">Kelola informasi pribadi dan kredensial Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Foto & Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600"></div>
            
            <div className="relative mt-8">
              <div className="w-28 h-28 mx-auto bg-white rounded-full p-1 shadow-lg relative group">
                <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-300">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-slate-700">{currentUser.nama.charAt(0)}</span>
                  )}
                </div>
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Ubah</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <h3 className="mt-4 text-lg font-black text-slate-800">{currentUser.nama}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{currentUser.role}</p>

            <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-100">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-green-700">Akun Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Data Diri */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-extrabold text-slate-800">Informasi Pribadi</h3>
               <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                 {isEditing ? 'Batal' : 'Edit Profil'}
               </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-bold text-slate-800">{currentUser.nama}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor Induk Karyawan (NIK)</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <Hash className="w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      defaultValue="320101234567890" 
                      disabled={!isEditing}
                      className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Kredensial</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">{currentUser.email}</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Gmail Linked</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor WhatsApp Aktif</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    defaultValue={currentUser.no_hp} 
                    disabled={!isEditing}
                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full placeholder:text-slate-400"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button onClick={() => { alert('Profil berhasil diperbarui!'); setIsEditing(false); }}>Simpan Perubahan</Button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-extrabold text-slate-800">Keamanan & Kata Sandi</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kata Sandi Saat Ini</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Key className="w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full placeholder:text-slate-400"
                    placeholder="Masukkan kata sandi lama..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kata Sandi Baru</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full placeholder:text-slate-400"
                      placeholder="Kata sandi baru..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Konfirmasi Sandi Baru</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full placeholder:text-slate-400"
                      placeholder="Ulangi sandi baru..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button 
                  disabled={!oldPassword || !newPassword || newPassword !== confirmPassword}
                  onClick={() => { 
                    alert('Kata sandi berhasil diperbarui!'); 
                    setOldPassword(''); setNewPassword(''); setConfirmPassword(''); 
                  }}
                >
                  Ubah Kata Sandi
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
