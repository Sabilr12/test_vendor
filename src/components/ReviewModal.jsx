import { useState } from 'react';
import {
  X,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  Briefcase,
  Mail,
  ExternalLink,
  FileText,
  Eye,
} from 'lucide-react';

export default function ReviewModal({ vendor, onClose, onSubmitDecision }) {
  const initialStatus =
    vendor.status === 'Setuju' || vendor.status === 'Lolos' ? 'Setuju' : 'Pending';

  const [status, setStatus] = useState(initialStatus);
  const [catatanAdmin, setCatatanAdmin] = useState(vendor.catatanAdmin || '');
  const [previewPdf, setPreviewPdf] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    onSubmitDecision(vendor.id, {
      status,
      catatanAdmin: catatanAdmin.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Evaluasi & Verifikasi Rekanan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tinjau data legalitas, dokumen katalog penawaran (PDF), dan tentukan status kualifikasi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-left">
          {/* Informasi Perusahaan */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-200/80 text-slate-700 rounded-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{vendor.nama}</h4>
                  <p className="text-xs text-orange-700 font-medium">{vendor.kategori}</p>
                </div>
              </div>
              {vendor.submittedAt && (
                <span className="text-[11px] text-slate-400">Masuk: {vendor.submittedAt}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{vendor.alamat || '-'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 text-xs">
              <p className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Ringkasan Pengalaman & Portofolio:
              </p>
              <p className="text-slate-600 leading-relaxed">{vendor.pengalaman || '-'}</p>
            </div>
          </div>

          {/* Dokumen Katalog (PDF) yang Diunggah Vendor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Dokumen Katalog & Brosur Penawaran (PDF) ({vendor.katalog?.length || 0})
              </label>
            </div>

            {!vendor.katalog || vendor.katalog.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Vendor belum melampirkan dokumen katalog dalam format PDF.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vendor.katalog.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-lg p-3 bg-white hover:border-slate-300 transition flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.namaFoto || 'Dokumen_Katalog.pdf'}
                        </p>
                        {item.uploadedAt && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.uploadedAt}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.fotoKatalog && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPdf({
                                src: item.fotoKatalog,
                                title: item.namaFoto || 'Dokumen Katalog (PDF)',
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                            title="Pratinjau PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={item.fotoKatalog}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-orange-700 hover:text-orange-800 hover:bg-orange-50 rounded-md transition cursor-pointer"
                            title="Buka di Tab Baru"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Keputusan Status Evaluasi */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Keputusan Kualifikasi Rekanan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Pending')}
                className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  status === 'Pending'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                Pending (Tinjau / Perlu Revisi)
              </button>

              <button
                type="button"
                onClick={() => setStatus('Setuju')}
                className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  status === 'Setuju'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Setuju (Lolos Kualifikasi)
              </button>
            </div>
          </div>

          {/* Catatan Admin untuk Vendor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Catatan Evaluasi (Akan tampil pada portal vendor)
            </label>
            <textarea
              rows="3"
              placeholder="Berikan instruksi revisi dokumen atau konfirmasi persetujuan rekanan..."
              value={catatanAdmin}
              onChange={(e) => setCatatanAdmin(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs cursor-pointer"
            >
              Simpan Evaluasi
            </button>
          </div>
        </form>
      </div>

      {/* Lightbox Modal Pratinjau PDF */}
      {previewPdf && (
        <div
          onClick={() => setPreviewPdf(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-60"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0 text-left">
                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                <p className="text-xs font-bold text-slate-800 truncate">{previewPdf.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdf.src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition"
                >
                  <span>Buka di Tab Baru</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPdf(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={previewPdf.src}
                className="w-full h-full border-none"
                title={previewPdf.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
