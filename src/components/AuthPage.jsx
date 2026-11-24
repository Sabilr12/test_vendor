import { useState } from 'react';
import { AlertCircle, Lock, Mail, Building2, ArrowRight } from 'lucide-react';
import { ADMIN_EMAIL } from '../data/mockVendors';
import logoRdp from '../assets/logo-rdp.png';

export default function AuthPage({ vendors, onLoginSuccess }) {
  const [authTab, setAuthTab] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    namaPerusahaan: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const emailClean = authForm.email.trim().toLowerCase();
    if (!emailClean) return;

    // 1. Cek Login Admin
    if (emailClean === ADMIN_EMAIL) {
      if (authTab === 'register') {
        setAuthError('Email ini khusus untuk akun Administrator.');
        return;
      }
      onLoginSuccess({ role: 'admin', email: emailClean });
      return;
    }

    // 2. Cari apakah akun vendor sudah terdaftar
    const existingVendor = vendors.find((v) => v.email.toLowerCase() === emailClean);

    if (authTab === 'register') {
      if (existingVendor) {
        setAuthError('Email perusahaan sudah terdaftar. Silakan masuk melalui tab Masuk Akun.');
        return;
      }
      onLoginSuccess({
        role: 'vendor',
        email: emailClean,
        initialCompanyName: authForm.namaPerusahaan.trim(),
      });
    } else {
      if (!existingVendor) {
        setAuthError(
          'Akun vendor belum terdaftar. Silakan daftar melalui tab Registrasi Vendor Baru.'
        );
        return;
      }
      onLoginSuccess({
        role: 'vendor',
        email: existingVendor.email,
        initialCompanyName: existingVendor.nama,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          {/* Header Brand */}
          <div className="flex items-center justify-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200/80 shadow-xs">
              <img src={logoRdp} alt="Logo Rifansi" className="h-8 w-auto object-contain" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-slate-900 leading-tight tracking-tight m-0">
                Rifansi Dwi Putra
              </h2>
              <p className="text-[11px] font-semibold text-orange-700/80 m-0">
                Portal Pengadaan Rekanan
              </p>
            </div>
          </div>

          {/* Segmented Control Tab */}
          <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200/70 mb-5 w-full">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setAuthError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer text-center ${
                authTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setAuthError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer text-center ${
                authTab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Registrasi Rekanan Baru
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {authTab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Badan Usaha / Perusahaan
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="PT / CV Nama Perusahaan"
                    value={authForm.namaPerusahaan}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, namaPerusahaan: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Alamat Email Perusahaan
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="kontak@perusahaan.co.id"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer shadow-xs mt-3"
            >
              <span>{authTab === 'login' ? 'Masuk ke Sistem' : 'Daftar & Isi Kualifikasi'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Akun Uji Coba */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 text-left">
            <p className="font-semibold text-slate-700">Akun simulasi sekali klik:</p>
            {[
              { label: 'Admin:', email: ADMIN_EMAIL, pass: 'admin' },
              { label: 'Vendor (Pending):', email: 'vendor@mitrasolusi.id', pass: '123' },
              { label: 'Vendor (Disetujui):', email: 'budi@nusantarateknik.co.id', pass: '123' },
            ].map((acc) => (
              <div
                key={acc.email}
                className="flex justify-between items-center gap-2 bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-lg"
              >
                <span className="font-medium text-slate-600">{acc.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError('');
                    setAuthForm({ ...authForm, email: acc.email, password: acc.pass });
                  }}
                  className="font-mono text-orange-700 hover:text-orange-800 hover:underline cursor-pointer truncate font-semibold"
                >
                  {acc.email}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
