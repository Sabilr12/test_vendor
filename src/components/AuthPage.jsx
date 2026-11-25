import { useState } from 'react';
import {
  AlertCircle,
  Lock,
  Mail,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import logoRdp from '../assets/logo-rdp.png';
import { vendorService } from '../services/vendorService';

// Akun Admin Resmi
const ADMIN_EMAILS = ['admin@procurement.id', 'admin@rifansi.co.id'];
const ADMIN_DEFAULT_PASS = 'admin123';

export default function AuthPage({ onLoginSuccess }) {
  // Mode: 'vendor_login', 'vendor_register', 'admin_login'
  const [authMode, setAuthMode] = useState('vendor_login');
  const [authError, setAuthError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    namaPerusahaan: '',
  });

  const resetForm = (newMode) => {
    setAuthMode(newMode);
    setAuthError('');
    setSuccessNotice('');
    setShowPassword(false);
    setAuthForm({
      email: '',
      password: '',
      confirmPassword: '',
      namaPerusahaan: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessNotice('');
    const emailClean = authForm.email.trim().toLowerCase();
    const pass = authForm.password;

    if (!emailClean) {
      setAuthError('Silakan masukkan alamat email.');
      return;
    }

    if (!pass) {
      setAuthError('Silakan masukkan kata sandi.');
      return;
    }

    // ================= 1. LOGIN ADMINISTRATOR =================
    if (authMode === 'admin_login') {
      const isAdminEmail = ADMIN_EMAILS.includes(emailClean);
      if (!isAdminEmail || pass !== ADMIN_DEFAULT_PASS) {
        setAuthError('Email atau kata sandi administrator tidak valid. Silakan periksa kembali.');
        return;
      }

      onLoginSuccess({ role: 'admin', email: emailClean });
      return;
    }

    // ================= 2. REGISTRASI VENDOR BARU =================
    if (authMode === 'vendor_register') {
      if (!authForm.namaPerusahaan.trim()) {
        setAuthError('Nama badan usaha / perusahaan wajib diisi.');
        return;
      }

      if (pass.length < 6) {
        setAuthError('Kata sandi minimal harus 6 karakter.');
        return;
      }

      if (pass !== authForm.confirmPassword) {
        setAuthError('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
        return;
      }

      setIsLoading(true);
      try {
        // Cek cepat apakah email sudah terdaftar (tanpa unduh semua file PDF besar)
        const isExists = await vendorService.checkEmailExists(emailClean);
        if (isExists) {
          setAuthError(
            'Email perusahaan ini sudah terdaftar. Silakan masuk melalui formulir Masuk Akun.'
          );
          setIsLoading(false);
          return;
        }

        const nowFormatted = new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const newVendorPayload = {
          id: Date.now(),
          email: emailClean,
          nama: authForm.namaPerusahaan.trim(),
          password: pass,
          kategori: '',
          alamat: '',
          pengalaman: '',
          katalog: [],
          rincianSkor: null,
          skor: null,
          catatanAdmin: '',
          status: 'Pending',
          isNew: true,
          submittedAt: nowFormatted,
        };

        // Simpan langsung ke Supabase
        await vendorService.upsertVendor(newVendorPayload);

        // Auto-login langsung ke VendorPortal tanpa delay
        onLoginSuccess({
          role: 'vendor',
          email: emailClean,
          initialCompanyName: newVendorPayload.nama,
        });
      } catch (err) {
        console.error('Registrasi gagal:', err);
        setAuthError('Terjadi kendala saat pendaftaran. Silakan coba kembali.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ================= 3. LOGIN VENDOR =================
    if (authMode === 'vendor_login') {
      setIsLoading(true);
      try {
        // Cari vendor secara spesifik (cepat & efisien)
        const existing = await vendorService.getVendorByEmail(emailClean);

        if (!existing) {
          setAuthError(
            'Akun belum terdaftar. Silakan daftarkan perusahaan Anda terlebih dahulu melalui tab Registrasi.'
          );
          setIsLoading(false);
          return;
        }

        // Cek kecocokan password jika akun memiliki password tersimpan
        const storedPass = existing.password || existing.rincianSkor?._authPassword;
        if (storedPass && storedPass !== pass) {
          setAuthError('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
          setIsLoading(false);
          return;
        }

        onLoginSuccess({
          role: 'vendor',
          email: existing.email,
          initialCompanyName: existing.nama,
        });
      } catch (err) {
        console.error('Login gagal:', err);
        setAuthError('Gagal memverifikasi akun. Silakan periksa koneksi Anda.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 selection:bg-orange-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          {/* Header Identitas Perusahaan */}
          <div className="flex items-center justify-center gap-3 mb-6 pb-5 border-b border-slate-100 text-left">
            <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-200/80 shadow-xs">
              <img src={logoRdp} alt="Logo Rifansi" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight m-0">
                PT Rifansi Dwi Putra
              </h1>
              <p className="text-xs font-semibold text-orange-700/80 m-0">
                Sistem E-Procurement Rekanan
              </p>
            </div>
          </div>

          {/* Segmented Tab Pilihan Akses */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 mb-5 w-full">
            <button
              type="button"
              onClick={() => resetForm('vendor_login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer text-center ${
                authMode === 'vendor_login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk Rekanan
            </button>
            <button
              type="button"
              onClick={() => resetForm('vendor_register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer text-center ${
                authMode === 'vendor_register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Registrasi Rekanan
            </button>
          </div>

          {/* Alert Khusus Mode Admin */}
          {authMode === 'admin_login' && (
            <div className="mb-4 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-[11px] tracking-wide uppercase text-amber-300">
                  Portal Internal Administrator
                </span>
              </div>
              <button
                type="button"
                onClick={() => resetForm('vendor_login')}
                className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
              >
                Kembali ke Rekanan
              </button>
            </div>
          )}

          {/* Notifikasi Pesan Sukses / Error */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{authError}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2.5 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successNotice}</span>
            </div>
          )}

          {/* Form Utama */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {authMode === 'vendor_register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Badan Usaha / Perusahaan *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Sumber Berkah Mandiri"
                    value={authForm.namaPerusahaan}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, namaPerusahaan: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {authMode === 'admin_login' ? 'Email Administrator' : 'Alamat Email Resmi Perusahaan *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder={
                    authMode === 'admin_login'
                      ? 'admin@procurement.id'
                      : 'kontak@perusahaan.co.id'
                  }
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi..."
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === 'vendor_register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi Anda..."
                    value={authForm.confirmPassword}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, confirmPassword: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl text-white transition cursor-pointer shadow-xs mt-3 ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <span>
                {isLoading
                  ? 'Memproses...'
                  : authMode === 'admin_login'
                  ? 'Masuk Administrator'
                  : authMode === 'vendor_register'
                  ? 'Daftar & Masuk ke Portal'
                  : 'Masuk ke Portal Rekanan'}
              </span>
              {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Footer Akses Admin & Informasi Hak Cipta */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
            {authMode !== 'admin_login' ? (
              <button
                type="button"
                onClick={() => resetForm('admin_login')}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Masuk sebagai <strong>Administrator Pengadaan</strong></span>
              </button>
            ) : (
              <p className="text-[11px] text-slate-400">
                Gunakan kredensial resmi tim Procurement Rifansi.
              </p>
            )}

            <p className="text-[10px] text-slate-400 m-0">
              © {new Date().getFullYear()} PT Rifansi Dwi Putra. Sistem Pengadaan Resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
