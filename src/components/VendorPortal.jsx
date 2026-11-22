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
} from 'lucide-react';
import logoRdp from '../assets/logo-rdp.png';

/* ---------- Gaya bersama (tema emas 3D) ---------- */
const CARD =
  'bg-white rounded-2xl border border-stone-200/70 shadow-[0_1px_2px_rgba(60,40,0,0.04),0_10px_28px_-14px_rgba(120,90,20,0.25)]';
const GOLD_BTN =
  'bg-[linear-gradient(180deg,#F7D774,#D9A21B)] text-amber-950 shadow-[0_3px_0_0_#A97A14] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_#A97A14]';
const SOFT_BTN =
  'bg-[linear-gradient(180deg,#FFF8DC,#F3D687)] text-amber-950 shadow-[0_3px_0_0_#C9A24A] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_#C9A24A]';
const INPUT =
  'w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition';
const LABEL = 'block text-xs font-semibold text-slate-700 mb-1.5';
const LOGO_TILE =
  'shrink-0 p-1.5 rounded-xl bg-[linear-gradient(145deg,#FFFFFF,#FBEBB4)] shadow-[0_3px_0_0_#A97A14,0_8px_14px_-4px_rgba(120,80,0,0.5)]';
const TAB_ACTIVE =
  'bg-[linear-gradient(180deg,#FFFFFF,#FFF1C4)] text-amber-800 shadow-[0_2px_0_0_#A97A14]';

function AdminNote({ text, compact = false }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-left">
      <div className="p-2 bg-amber-100 rounded-lg shrink-0">
        <MessageSquare className="w-4 h-4 text-amber-700" />
      </div>
      <div>
        <p className="text-xs font-bold text-amber-900">Catatan dari Admin</p>
        <p className={`text-xs text-amber-900/90 leading-relaxed ${compact ? 'mt-0.5' : 'mt-1'}`}>
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
    <div className="min-h-screen bg-[#FAF8F2] text-slate-800 flex flex-col">
      {/* ================= HEADER (emas) ================= */}
      <header className="relative z-10 bg-[linear-gradient(100deg,#F8E08E_0%,#E8B94A_42%,#CB9722_78%,#E6BC4C_100%)] shadow-[0_8px_20px_-10px_rgba(120,80,0,0.55)] px-6 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={LOGO_TILE}>
            <img src={logoRdp} alt="Logo Rifansi" className="h-8 w-auto" />
          </div>
          <div className="text-left">
            <h1 className="text-[15px] font-extrabold text-amber-950 leading-tight tracking-tight whitespace-nowrap">
              Rifansi Dwi Putra
            </h1>
            <p className="text-xs font-semibold text-amber-900/80">Portal Rekanan / Vendor</p>
          </div>
        </div>

        {/* Navigasi Sub-Halaman Vendor */}
        <div className="flex items-center gap-1.5 bg-white/30 p-1 rounded-xl">
          <button
            onClick={() => setVendorMenu('kualifikasi')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              vendorMenu === 'kualifikasi' ? TAB_ACTIVE : 'text-amber-950 hover:bg-white/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            1. Data Kualifikasi
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              !hasSubmittedKualifikasi
                ? 'text-amber-900/45 cursor-not-allowed'
                : vendorMenu === 'katalog'
                ? `${TAB_ACTIVE} cursor-pointer`
                : 'text-amber-950 hover:bg-white/40 cursor-pointer'
            }`}
          >
            {!hasSubmittedKualifikasi ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Package className="w-3.5 h-3.5" />
            )}
            2. Update Katalog
            {hasSubmittedKualifikasi && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                {vendorData.katalog?.length || 0}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-950 bg-white/60 px-3 py-1.5 rounded-lg font-medium">
            {currentUser.email}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-[linear-gradient(180deg,#FFFFFF,#FFE9EC)] shadow-[0_3px_0_0_#C98A93] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_#C98A93] px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
        {/* TAB 1: HALAMAN KUALIFIKASI VENDOR */}
        {vendorMenu === 'kualifikasi' && (
          <>
            {!hasSubmittedKualifikasi || isRevising ? (
              <div className={`${CARD} relative overflow-hidden p-8`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 to-amber-500" />
                <div className="border-b border-stone-100 pb-4 mb-6 flex items-center justify-between gap-3 text-left">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                      {isRevising ? 'Perbaikan Data Kualifikasi' : 'Tahap Wajib'}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">
                      Formulir Prakualifikasi Vendor
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Setelah data dikirim, Anda dapat langsung mengunggah foto katalog produk/jasa Anda.
                    </p>
                  </div>
                  {isRevising && (
                    <button
                      onClick={() => setIsRevising(false)}
                      className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal Perbarui
                    </button>
                  )}
                </div>

                <form onSubmit={handleKualifikasiSubmit} className="space-y-5 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Nama Badan Usaha</label>
                      <input
                        type="text"
                        required
                        placeholder="PT / CV..."
                        value={kualifikasiForm.nama}
                        onChange={(e) =>
                          setKualifikasiForm({ ...kualifikasiForm, nama: e.target.value })
                        }
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Bidang Usaha Utama</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: IT & Pengadaan Hardware"
                        value={kualifikasiForm.kategori}
                        onChange={(e) =>
                          setKualifikasiForm({ ...kualifikasiForm, kategori: e.target.value })
                        }
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Alamat Lengkap Kantor</label>
                    <input
                      type="text"
                      required
                      placeholder="Alamat domisili perusahaan..."
                      value={kualifikasiForm.alamat}
                      onChange={(e) =>
                        setKualifikasiForm({ ...kualifikasiForm, alamat: e.target.value })
                      }
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Ringkasan Pengalaman & Portofolio Proyek</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Jelaskan pengalaman proyek relevan dalam 3 tahun terakhir..."
                      value={kualifikasiForm.pengalaman}
                      onChange={(e) =>
                        setKualifikasiForm({ ...kualifikasiForm, pengalaman: e.target.value })
                      }
                      className={INPUT}
                    />
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      type="submit"
                      className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition cursor-pointer ${GOLD_BTN}`}
                    >
                      <Send className="w-4 h-4" />
                      {isRevising
                        ? 'Kirim Ulang & Lanjut ke Katalog'
                        : 'Simpan Kualifikasi & Lanjut ke Katalog'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className={`${CARD} relative overflow-hidden p-8 space-y-6`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 to-amber-500" />
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5 text-left">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Profil Perusahaan Terdaftar</p>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1">
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {vendorData.nama}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Berhasil dikirim
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Bidang Usaha: {vendorData.kategori}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartRevision(vendorData)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${SOFT_BTN}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Perbarui Data Profil
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-xs text-left">
                  <div>
                    <p className="text-slate-500">Alamat Kantor</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{vendorData.alamat}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Pengalaman & Portofolio</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{vendorData.pengalaman}</p>
                  </div>
                </div>

                {hasAdminNote && <AdminNote text={vendorData.catatanAdmin} />}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setVendorMenu('katalog')}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${GOLD_BTN}`}
                  >
                    <Package className="w-4 h-4" /> Lanjut ke Update Katalog
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: HALAMAN UPDATE KATALOG (HANYA FOTO KATALOG) */}
        {vendorMenu === 'katalog' && vendorData && (
          <div className="space-y-6">
            {hasAdminNote && <AdminNote text={vendorData.catatanAdmin} compact />}

            <div className={`${CARD} relative overflow-hidden p-6 md:p-8`}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 to-amber-500" />
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1 text-left">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Unggah Foto Katalog Barang
                </h2>
                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  {vendorData.nama}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6 text-left">
                Pilih foto katalog barang atau brosur produk Anda dalam format JPG atau PNG.
              </p>

              <form onSubmit={handleKatalogSubmit} className="space-y-5">
                <div className="text-left">
                  <label className={`${LABEL} mb-2`}>Foto Katalog Barang (JPG / PNG) *</label>
                  <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-50 bg-amber-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[220px]">
                    {katalogForm.fotoKatalog ? (
                      <div className="w-full max-w-md space-y-2.5">
                        <img
                          src={katalogForm.fotoKatalog}
                          alt="Preview Katalog"
                          className="w-full h-48 object-contain rounded-xl border border-stone-200 bg-white"
                        />
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {katalogForm.namaFoto}
                        </p>
                        <span className="inline-block text-[11px] text-amber-700 font-semibold">
                          Klik area ini untuk mengganti foto
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3.5 rounded-2xl mb-3 bg-[linear-gradient(145deg,#FFFFFF,#FBEBB4)] shadow-[0_3px_0_0_#C9A24A,0_8px_14px_-6px_rgba(120,80,0,0.4)]">
                          <ImageIcon className="w-7 h-7 text-amber-700" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          Klik untuk Memilih Foto Katalog
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          Mendukung format JPG, JPEG, atau PNG
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

                <div className="pt-3 border-t border-stone-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={!katalogForm.fotoKatalog}
                    className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition ${
                      !katalogForm.fotoKatalog
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : `${GOLD_BTN} cursor-pointer`
                    }`}
                  >
                    <Send className="w-4 h-4" /> Kirim Foto Katalog
                  </button>
                </div>
              </form>
            </div>

            {/* Daftar Foto Katalog yang Sudah Diunggah */}
            <div className={`${CARD} overflow-hidden`}>
              <div className="px-6 py-4 border-b border-stone-100 text-left">
                <h3 className="text-sm font-bold text-slate-900">
                  Foto Katalog Terkirim ({vendorData.katalog?.length || 0})
                </h3>
              </div>

              {!vendorData.katalog || vendorData.katalog.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Belum ada foto katalog</p>
                  <p className="text-xs text-slate-400">Foto yang Anda unggah akan tampil di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                  {vendorData.katalog.map((item) => (
                    <div
                      key={item.id}
                      className="border border-stone-200 rounded-xl p-3.5 flex items-center justify-between gap-3 transition hover:bg-amber-50/50 hover:border-amber-200"
                    >
                      <div className="flex items-center gap-3 min-w-0 text-left">
                        {item.fotoKatalog ? (
                          <img
                            src={item.fotoKatalog}
                            alt={item.namaFoto || 'Foto Katalog'}
                            className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-6 h-6 text-amber-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.namaFoto || 'Foto Katalog Barang'}
                          </p>
                          {item.uploadedAt && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Diunggah: {item.uploadedAt}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteKatalog(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer shrink-0"
                        title="Hapus Foto Katalog"
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