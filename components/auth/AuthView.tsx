import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../lib/store';
import { User } from '../../lib/types';
import { Button } from '../ui/Button';

export function AuthView() {
  const { users, registerUser, setCurrentUser } = useStore();

  const [mode, setMode] = useState<'Login' | 'Register'>('Login');
  const [step, setStep] = useState<'Credentials' | '2FA' | 'Pending'>('Credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [sandi, setSandi] = useState('');
  const [kode2fa, setKode2fa] = useState('');
  const [error, setError] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'Register') {
      try {
        const newUser = registerUser(email, sandi);
        setTempUser(newUser);
        setStep('Pending');
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      const user = users.find(u => u.email === email.toLowerCase() && u.sandi === sandi);
      if (!user) {
        setError('Kredensial tidak valid.');
        return;
      }

      setTempUser(user);
      if (user.status_validasi === 'Pending') setStep('Pending');
      else if (user.status_validasi === 'Rejected') setError('Akun ditolak Admin.');
      else setStep('2FA');
    }
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (kode2fa.length !== 6) return setError('Kode 2FA harus 6 digit angka.');
    if (tempUser) setCurrentUser(tempUser);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Simulate OAuth delay
    setTimeout(() => {
      // Check if a demo user exists, if not create one
      let gUser = users.find(u => u.email === 'demo@gmail.com');
      if (!gUser) {
        try {
          gUser = registerUser('demo@gmail.com', 'google-sso-bypass');
          // Auto approve for demo purposes
          gUser.status_validasi = 'Approved';
        } catch (err) {}
      }
      setIsGoogleLoading(false);
      setCurrentUser(gUser || users[0]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-8 text-center text-white relative">
          <div className="w-20 h-24 mx-auto mb-4 relative flex items-center justify-center">
            {/* Logo placeholder - Using a styled container for the provided logo shape */}
            <img
              src="/logo.png"
              alt="Logo Sedayu Cahaya Perkasa"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-xl font-black tracking-wider leading-tight">SEDAYU CAHAYA PERKASA</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Multi Database Internet Service Provider</p>
        </div>

        <div className="p-8">
          {step === 'Credentials' && (
            <motion.form initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-800">{mode === 'Login' ? 'Masuk ke Sistem' : 'Daftar Akun Baru'}</h2>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200">{error}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Alamat Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3.5 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm" placeholder="nama@sedayucahaya.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Kata Sandi</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} value={sandi} onChange={e => setSandi(e.target.value)} className="w-full p-3.5 pr-12 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" className="mt-2">{mode === 'Login' ? 'Masuk' : 'Daftar'}</Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-bold uppercase tracking-wider">Atau lanjutkan dengan</span>
                </div>
              </div>

              <button 
                type="button" 
                disabled={isGoogleLoading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 p-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span className="text-sm font-bold text-slate-700">{isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
              </button>

              <div className="text-center mt-4 text-sm font-medium text-slate-500">
                {mode === 'Login' ? (
                  <>Belum punya akun? <button type="button" onClick={() => { setMode('Register'); setError(''); }} className="font-bold text-indigo-600 hover:underline">Daftar</button></>
                ) : (
                  <>Sudah punya akun? <button type="button" onClick={() => { setMode('Login'); setError(''); }} className="font-bold text-indigo-600 hover:underline">Masuk</button></>
                )}
              </div>
            </motion.form>
          )}

          {step === '2FA' && (
            <motion.form initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onSubmit={handle2FA} className="space-y-5 text-center">
              <h2 className="text-xl font-extrabold text-slate-800">Verifikasi 2 Langkah</h2>
              <p className="text-sm text-slate-500">Masukkan 6 digit kode dari Authenticator Anda.</p>

              {error && <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200">{error}</div>}

              <input required type="text" maxLength={6} value={kode2fa} onChange={e => setKode2fa(e.target.value.replace(/\D/g, ''))} className="w-full p-4 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-center text-3xl tracking-[0.5em] font-mono outline-none text-slate-900 placeholder:text-slate-300 shadow-sm" placeholder="••••••" />

              <Button type="submit" fullWidth size="lg">Verifikasi</Button>
              <button type="button" onClick={() => setStep('Credentials')} className="text-sm font-bold text-slate-500 mt-4 hover:text-slate-800">Kembali</button>
            </motion.form>
          )}

          {step === 'Pending' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⏳</div>
              <h2 className="text-xl font-extrabold text-slate-800">Menunggu Persetujuan Admin</h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Akun <strong>{tempUser?.email}</strong> berhasil didaftarkan namun belum aktif. Silakan hubungi Administrator untuk menyetujui akses Anda.</p>
              <Button onClick={() => setStep('Credentials')} variant="secondary" fullWidth className="mt-4">Kembali ke Login</Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
