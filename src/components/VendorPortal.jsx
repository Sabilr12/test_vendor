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
  MessageSquare,
  UploadCloud,
  ExternalLink,
  FileCheck,
  Eye,
  X,
} from 'lucide-react';
import logoRdp from '../assets/logo-rdp.png';
import { openPdfInNewTab } from '../utils/pdfHelper';

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
  const [previewPdfDoc, setPreviewPdfDoc] = useState(null);

  const [kualifikasiForm, setKualifikasiForm] = useState({
    nama: vendorData?.nama || currentUser.initialCompanyName || '',
    kategori: vendorData?.kategori || '',
    alamat: vendorData?.alamat || '',
    pengalaman: vendorData?.pengalaman || '',
  });

  const [katalogForm, setKatalogForm] = useState({
    fotoKatalog: '',
    namaFoto: '',
    ukuranFile: '',
  });

  // Kualifikasi dianggap sudah dikirim jika bidang usaha dan alamat sudah terisi
  const hasSubmittedKualifikasi = Boolean(
    vendorData?.kategori?.trim() && vendorData?.alamat?.trim()
  );
  const hasAdminNote = Boolean(vendorData?.catatanAdmin && vendorData.catatanAdmin.trim() !== '');

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Mohon pilih file berformat PDF dokumen katalog/penawaran.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setKatalogForm({
        fotoKatalog: reader.result,
        namaFoto: file.name,
        ukuranFile: (file.size / 1024).toFixed(0) + ' KB',
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
      ukuranFile: '',
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
                : 'Unggah Dokumen Katalog & Penawaran (PDF)'
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
            <span>2. Dokumen Katalog (PDF)</span>
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
                        placeholder="Contoh: Alat Berat & Konstruksi / Logistik"
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
                          ? 'Perbarui Data & Lanjut ke Katalog PDF'
                          : 'Simpan Kualifikasi & Lanjut ke Katalog PDF'}
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
                        <CheckCircle className="w-3.5 h-3.5" /> Data Terkirim
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
                    <Package className="w-3.5 h-3.5" /> Lanjut ke Dokumen Katalog (PDF)
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: UPDATE DOKUMEN KATALOG PRODUK (PDF) */}
        {vendorMenu === 'katalog' && vendorData && (
          <div className="space-y-5 text-left">
            {hasAdminNote && <AdminNote text={vendorData.catatanAdmin} compact />}

            <div className={`${CARD} p-5 sm:p-7 space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Unggah Dokumen Katalog & Penawaran (PDF)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lampirkan file brosur produk, daftar harga, atau spesifikasi barang/jasa perusahaan dalam format PDF.
                  </p>
                </div>
                <span className="text-xs font-semibold text-orange-800 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">
                  {vendorData.nama}
                </span>
              </div>

              <form onSubmit={handleKatalogSubmit} className="space-y-4">
                <div>
                  <label className="border-2 border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 bg-slate-50/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[180px]">
                    {katalogForm.fotoKatalog ? (
                      <div className="w-full max-w-sm p-4 bg-white rounded-xl border border-orange-200/80 shadow-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 text-left">
                          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {katalogForm.namaFoto}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {katalogForm.ukuranFile || 'File PDF Terpilih'}
                            </p>
                            <span className="text-[10px] text-orange-700 font-medium">
                              Klik area ini jika ingin mengganti file
                            </span>
                          </div>
                        </div>
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-xl mb-2 bg-orange-50 border border-orange-200 text-orange-600 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          Klik untuk Memilih File Dokumen Katalog (.PDF)
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Format dokumen wajib PDF resmi (Brosur, Spesifikasi, atau Daftar Harga)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf, .pdf"
                      onChange={handlePdfChange}
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
                    <Send className="w-3.5 h-3.5" /> Kirim Dokumen PDF
                  </button>
                </div>
              </form>
            </div>

            {/* Daftar Dokumen PDF Terkirim */}
            <div className={`${CARD} overflow-hidden`}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Dokumen PDF Terkirim ({vendorData.katalog?.length || 0})
                </h3>
              </div>

              {!vendorData.katalog || vendorData.katalog.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Belum ada dokumen katalog</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">File PDF yang Anda unggah akan tampil di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {vendorData.katalog.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {item.namaFoto || 'Dokumen_Katalog.pdf'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {item.uploadedAt && (
                              <span className="text-[10px] text-slate-400">
                                {item.uploadedAt}
                              </span>
                            )}
                            {item.fotoKatalog && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPdfDoc({
                                      src: item.fotoKatalog,
                                      title: item.namaFoto || 'Dokumen Katalog (PDF)',
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] text-orange-700 hover:text-orange-900 font-semibold hover:underline cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Lihat Dokumen</span>
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPdfInNewTab(item.fotoKatalog, item.namaFoto)
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
                                  title="Buka Dokumen PDF di Tab Baru"
                                >
                                  <span>Tab Baru</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteKatalog(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                        title="Hapus Dokumen"
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

      {/* Lightbox Modal Pratinjau PDF Vendor */}
      {previewPdfDoc && (
        <div
          onClick={() => setPreviewPdfDoc(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0 text-left">
                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                <p className="text-xs font-bold text-slate-800 truncate">{previewPdfDoc.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openPdfInNewTab(previewPdfDoc.src, previewPdfDoc.title)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition cursor-pointer"
                >
                  <span>Buka di Tab Baru</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPdfDoc(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={previewPdfDoc.src}
                className="w-full h-full border-none"
                title={previewPdfDoc.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
