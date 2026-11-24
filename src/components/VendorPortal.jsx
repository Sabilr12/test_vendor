import { useState } from 'react';
import {
  CheckCircle,
  FileText,
  Trash2,
  LogOut,
  Send,
  RotateCcw,
  Package,
  Lock,
  Image as ImageIcon,
  MessageSquare,
  UploadCloud,
} from 'lucide-react';
import logoRdp from '../assets/logo-rdp.png';

/* ---------- Gaya Bersih Enterprise (Non-AI Look & Mobile Responsive) ---------- */
const CARD = 'bg-white rounded-xl border border-slate-200/80 shadow-xs';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer shadow-xs';
const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs cursor-pointer';
const INPUT =
  'w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition';
const LABEL = 'block text-xs font-medium text-slate-700 mb-1';

function AdminNote({ text, compact = false }) {
  return (
    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-left">
      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md shrink-0 mt-0.5">
        <MessageSquare className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-bold text-amber-900">Catatan Evaluasi dari Tim Admin</p>
        <p className={`text-xs text-amber-800/90 leading-relaxed ${compact ? 'mt-0.5' : 'mt-1'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

export default function VendorPortal({
  currentUser,
  vendorData,
  onSubmitKualifikasi,
  onAddKatalog,
  onDeleteKatalog,
  onLogout,
}) {
  const [vendorMenu, setVendorMenu] = useState('kualifikasi');
  const [isRevising, setIsRevising] = useState(false);

  const [kualifikasiForm, setKualifikasiForm] = useState({
    nama: currentUser.initialCompanyName || '',
    kategori: '',
    alamat: '',
    pengalaman: '',
  });

  const [katalogForm, setKatalogForm] = useState({
    fotoKatalog: '',
    namaFoto: '',
  });

  const hasSubmittedKualifikasi = Boolean(vendorData);
  const hasAdminNote = Boolean(vendorData?.catatanAdmin && vendorData.catatanAdmin.trim() !== '');

  const handleFotoKatalogChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setKatalogForm({
        fotoKatalog: reader.result,
        namaFoto: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleKualifikasiSubmit = (e) => {
    e.preventDefault();
    onSubmitKualifikasi(kualifikasiForm);
    setIsRevising(false);
    setVendorMenu('katalog');
  };

  const handleStartRevision = (submission) => {
    setKualifikasiForm({
      nama: submission.nama,
      kategori: submission.kategori,
      alamat: submission.alamat,
      pengalaman: submission.pengalaman,
    });
    setIsRevising(true);
    setVendorMenu('kualifikasi');
  };

  const handleKatalogSubmit = (e) => {
    e.preventDefault();
    if (!katalogForm.fotoKatalog) return;
    onAddKatalog(katalogForm);
    setKatalogForm({
      fotoKatalog: '',
      namaFoto: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* ================= HEADER BERSIH (Oren Muda & Putih) ================= */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-orange-200/80 shadow-xs px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 p-1 bg-orange-50 rounded-lg border border-orange-200/80 shadow-xs">
            <img src={logoRdp} alt="Logo Rifansi" className="h-7 w-auto object-contain" />
          </div>
          <div className="text-left">
            <h1 className="text-sm font-bold text-slate-900 leading-tight tracking-tight whitespace-nowrap m-0">
              Rifansi Dwi Putra
            </h1>
            <p className="text-[11px] font-semibold text-orange-700/80 m-0">Portal Rekanan / Vendor</p>
          </div>
        </div>

        {/* Sub-navigasi Tab (Responsif di HP) */}
        <div className="order-3 sm:order-2 w-full sm:w-auto inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200/70">
          <button
            onClick={() => setVendorMenu('kualifikasi')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              vendorMenu === 'kualifikasi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Data Kualifikasi</span>
          </button>
          <button
            onClick={() => {
              if (hasSubmittedKualifikasi) setVendorMenu('katalog');
            }}
            disabled={!hasSubmittedKualifikasi}
            title={
              !hasSubmittedKualifikasi
                ? 'Selesaikan pengisian data kualifikasi terlebih dahulu'
                : 'Unggah Foto Katalog Barang'
            }
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              !hasSubmittedKualifikasi
                ? 'text-slate-400 cursor-not-allowed'
                : vendorMenu === 'katalog'
                ? 'bg-white text-slate-900 shadow-xs cursor-pointer'
                : 'text-slate-600 hover:text-slate-900 cursor-pointer'
            }`}
          >
            {!hasSubmittedKualifikasi ? (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Package className="w-3.5 h-3.5" />
            )}
            <span>2. Katalog Barang</span>
            {hasSubmittedKualifikasi && (
              <span className="ml-1 px-1.5 py-0.2 bg-orange-100 text-orange-800 rounded-full text-[10px] font-bold border border-orange-200">
                {vendorData.katalog?.length || 0}
              </span>
            )}
          </button>
        </div>

        {/* Profil & Logout */}
        <div className="order-2 sm:order-3 flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium truncate max-w-[200px]">
            {currentUser.email}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ================= AREA KONTEN ================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* TAB 1: FORMULIR KUALIFIKASI VENDOR */}
        {vendorMenu === 'kualifikasi' && (
          <>
            {!hasSubmittedKualifikasi || isRevising ? (
              <div className={`${CARD} p-5 sm:p-7 space-y-5 text-left`}>
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                      {isRevising ? 'Pembaruan Data' : 'Tahap Wajib 1 dari 2'}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5 tracking-tight">
                      Formulir Prakualifikasi Rekanan
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lengkapi data badan usaha Anda untuk proses verifikasi oleh tim pengadaan.
                    </p>
                  </div>
                  {isRevising && (
                    <button
                      onClick={() => setIsRevising(false)}
                      className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>

                <form onSubmit={handleKualifikasiSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Nama Badan Usaha / Perusahaan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: PT Nusantara Teknik Mandiri"
                        value={kualifikasiForm.nama}
                        onChange={(e) =>
                          setKualifikasiForm({ ...kualifikasiForm, nama: e.target.value })
                        }
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Bidang Usaha Utama *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Alat Berat & Konstruksi / IT"
                        value={kualifikasiForm.kategori}
                        onChange={(e) =>
                          setKualifikasiForm({ ...kualifikasiForm, kategori: e.target.value })
                        }
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Alamat Lengkap Kantor / Domisili *</label>
                    <input
                      type="text"
                      required
                      placeholder="Alamat kantor resmi perusahaan..."
                      value={kualifikasiForm.alamat}
                      onChange={(e) =>
                        setKualifikasiForm({ ...kualifikasiForm, alamat: e.target.value })
                      }
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Ringkasan Pengalaman & Portofolio Proyek *</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Jelaskan pengalaman pekerjaan atau proyek relevan dalam 3 tahun terakhir..."
                      value={kualifikasiForm.pengalaman}
                      onChange={(e) =>
                        setKualifikasiForm({ ...kualifikasiForm, pengalaman: e.target.value })
                      }
                      className={INPUT}
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button type="submit" className={BTN_PRIMARY}>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isRevising
                          ? 'Perbarui Data & Lanjut ke Katalog'
                          : 'Simpan Kualifikasi & Lanjut ke Katalog'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Kartu Ringkasan Kualifikasi Terdaftar */
              <div className={`${CARD} p-5 sm:p-7 space-y-5 text-left`}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Profil Rekanan Terverifikasi</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {vendorData.nama}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Data Terkirim
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 font-medium mt-0.5">
                      Bidang: {vendorData.kategori}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartRevision(vendorData)}
                    className={BTN_SECONDARY}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Perbarui Profil
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200/70 p-4 rounded-xl text-xs">
                  <div>
                    <p className="text-slate-400 font-medium">Alamat Kantor</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{vendorData.alamat}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Pengalaman & Portofolio</p>
                    <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed">
                      {vendorData.pengalaman}
                    </p>
                  </div>
                </div>

                {hasAdminNote && <AdminNote text={vendorData.catatanAdmin} />}

                <div className="pt-2 flex justify-end">
                  <button onClick={() => setVendorMenu('katalog')} className={BTN_PRIMARY}>
                    <Package className="w-3.5 h-3.5" /> Lanjut ke Katalog Barang
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: UPDATE FOTO KATALOG PRODUK */}
        {vendorMenu === 'katalog' && vendorData && (
          <div className="space-y-5 text-left">
            {hasAdminNote && <AdminNote text={vendorData.catatanAdmin} compact />}

            <div className={`${CARD} p-5 sm:p-7 space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Unggah Foto Katalog & Penawaran
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lampirkan foto brosur produk, alat, atau spesifikasi barang/jasa perusahaan Anda.
                  </p>
                </div>
                <span className="text-xs font-semibold text-orange-800 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">
                  {vendorData.nama}
                </span>
              </div>

              <form onSubmit={handleKatalogSubmit} className="space-y-4">
                <div>
                  <label className="border-2 border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 bg-slate-50/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[190px]">
                    {katalogForm.fotoKatalog ? (
                      <div className="w-full max-w-sm space-y-2">
                        <img
                          src={katalogForm.fotoKatalog}
                          alt="Preview Katalog"
                          className="w-full h-44 object-contain rounded-lg border border-slate-200 bg-white"
                        />
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {katalogForm.namaFoto}
                        </p>
                        <span className="inline-block text-[11px] text-orange-700 font-medium">
                          Klik untuk mengganti foto
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-xl mb-2 bg-orange-50 border border-orange-200 text-orange-600 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          Klik untuk Memilih Foto Katalog (JPG / PNG)
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Mendukung format gambar JPEG, JPG, atau PNG
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFotoKatalogChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!katalogForm.fotoKatalog}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition ${
                      !katalogForm.fotoKatalog
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : `${BTN_PRIMARY} cursor-pointer`
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" /> Kirim Foto Katalog
                  </button>
                </div>
              </form>
            </div>

            {/* Galeri Katalog Terkirim */}
            <div className={`${CARD} overflow-hidden`}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Foto Katalog Terkirim ({vendorData.katalog?.length || 0})
                </h3>
              </div>

              {!vendorData.katalog || vendorData.katalog.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Belum ada foto katalog</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Foto yang Anda unggah akan tampil di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {vendorData.katalog.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.fotoKatalog ? (
                          <img
                            src={item.fotoKatalog}
                            alt={item.namaFoto || 'Foto'}
                            className="w-14 h-14 rounded-md object-cover border border-slate-200 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {item.namaFoto || 'Foto Katalog'}
                          </p>
                          {item.uploadedAt && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {item.uploadedAt}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteKatalog(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
