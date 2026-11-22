import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ADMIN_EMAIL } from '../data/mockVendors';
import logoRdp from '../assets/logo-rdp.png';

const GOLD_BTN =
  'bg-[linear-gradient(180deg,#F7D774,#D9A21B)] text-amber-950 shadow-[0_3px_0_0_#A97A14] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_#A97A14]';
const INPUT =
  'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200';

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
    <div className="min-h-screen bg-[#FAF8F2] text-slate-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* Logo + nama perusahaan di dalam form */}
          <div className="flex items-center justify-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="p-1.5 rounded-xl bg-[linear-gradient(145deg,#FFFFFF,#FBEBB4)] shadow-[0_3px_0_0_#A97A14,0_8px_14px_-4px_rgba(120,80,0,0.5)]">
              <img src={logoRdp} alt="Logo Rifansi" className="h-10 w-auto" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Rifansi Dwi Putra
            </span>
          </div>

          <div className="flex border-b border-slate-100 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setAuthError('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                authTab === 'login'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
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
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                authTab === 'register'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Registrasi Vendor Baru
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {authTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan
                </label>
                <input
                  type="text"
                  required
                  placeholder="PT Contoh Sejahtera"
                  value={authForm.namaPerusahaan}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, namaPerusahaan: e.target.value })
                  }
                  className={INPUT}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                placeholder="nama@perusahaan.co.id"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className={INPUT}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className={INPUT}
              />
            </div>

            <button
              type="submit"
              className={`w-full text-sm font-bold py-2.5 rounded-xl transition cursor-pointer mt-2 ${GOLD_BTN}`}
            >
              {authTab === 'login' ? 'Masuk ke Sistem' : 'Daftar & Isi Kualifikasi'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500 text-left">
            <p className="font-semibold text-slate-700">Klik cepat akun uji coba:</p>
            {[
              { label: 'Login Admin:', email: ADMIN_EMAIL, pass: 'admin' },
              { label: 'Vendor (Pending):', email: 'vendor@mitrasolusi.id', pass: '123' },
              { label: 'Vendor (Lolos):', email: 'budi@nusantarateknik.co.id', pass: '123' },
            ].map((acc) => (
              <div
                key={acc.email}
                className="flex justify-between items-center gap-3 bg-slate-50 px-2.5 py-1.5 rounded-lg"
              >
                <span>{acc.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError('');
                    setAuthForm({ ...authForm, email: acc.email, password: acc.pass });
                  }}
                  className="font-mono text-amber-700 hover:underline cursor-pointer truncate"
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
