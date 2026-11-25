import { useState, useMemo } from 'react';
import {
  Search,
  Scale,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  X,
  Award,
  Check,
  RefreshCw,
} from 'lucide-react';
import { formatRupiah } from '../data/mockVendors';
import { openPdfInNewTab } from '../utils/pdfHelper';

export default function PriceComparison({ vendors, onUpdatePrice }) {
  const [searchItem, setSearchItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Menyimpan draf ketikan sementara sebelum tombol centang/simpan diklik
  const [draftPrices, setDraftPrices] = useState({});
  // Indikator sedang menyimpan per baris
  const [savingRows, setSavingRows] = useState({});
  // Indikator centang berhasil disimpan per baris
  const [savedFeedback, setSavedFeedback] = useState({});

  const allCatalogs = useMemo(() => {
    const list = [];
    vendors.forEach((vendor) => {
      const isApproved = vendor.status === 'Setuju' || vendor.status === 'Lolos';
      if (onlyApproved && !isApproved) return;
      if (selectedCategory !== 'Semua' && vendor.kategori !== selectedCategory) return;

      (vendor.katalog || []).forEach((item) => {
        const uniqueKey = `${vendor.id}-${item.id}`;
        const recordedPrice = Number(item.nilaiPenawaran || 0);

        if (
          searchItem.trim() &&
          !vendor.nama.toLowerCase().includes(searchItem.toLowerCase()) &&
          !(item.namaFoto || '').toLowerCase().includes(searchItem.toLowerCase())
        ) {
          return;
        }

        list.push({
          ...item,
          uniqueKey,
          vendorId: vendor.id,
          vendorNama: vendor.nama,
          vendorKategori: vendor.kategori,
          isApproved,
          recordedPrice,
        });
      });
    });

    return list.sort((a, b) => {
      if (a.recordedPrice === 0 && b.recordedPrice === 0) return 0;
      if (a.recordedPrice === 0) return 1;
      if (b.recordedPrice === 0) return -1;
      return a.recordedPrice - b.recordedPrice;
    });
  }, [vendors, searchItem, selectedCategory, onlyApproved]);

  const categories = useMemo(() => {
    const set = new Set(vendors.map((v) => v.kategori));
    return ['Semua', ...Array.from(set)];
  }, [vendors]);

  const pricedItems = allCatalogs.filter((d) => d.recordedPrice > 0);
  const lowestPrice = pricedItems.length > 0 ? pricedItems[0].recordedPrice : 0;

  const handleSaveRowPrice = async (doc) => {
    const rawValue =
      draftPrices[doc.uniqueKey] !== undefined
        ? draftPrices[doc.uniqueKey]
        : doc.nilaiPenawaran !== undefined && doc.nilaiPenawaran !== null
        ? String(doc.nilaiPenawaran)
        : '';

    setSavingRows((prev) => ({ ...prev, [doc.uniqueKey]: true }));
    try {
      await onUpdatePrice(doc.vendorId, doc.id, rawValue);

      // Tetap pertahankan nilai input di draft agar tidak berkedip/kosong
      setDraftPrices((prev) => ({
        ...prev,
        [doc.uniqueKey]: rawValue,
      }));

      // Tampilkan tanda centang tersimpan selama 3 detik
      setSavedFeedback((prev) => ({ ...prev, [doc.uniqueKey]: true }));
      setTimeout(() => {
        setSavedFeedback((prev) => ({ ...prev, [doc.uniqueKey]: false }));
      }, 3000);
    } catch (err) {
      console.error('Gagal simpan harga:', err);
    } finally {
      setSavingRows((prev) => ({ ...prev, [doc.uniqueKey]: false }));
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-left">
            <h2 className="text-sm font-bold text-slate-900 m-0 text-left flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-700" />
              Perbandingan Katalog & Evaluasi Harga Penawaran
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan estimasi/penawaran harga pada kolom yang tersedia, lalu tekan <strong>Simpan (✓)</strong> atau tombol <strong>Enter</strong>.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={onlyApproved}
              onChange={(e) => setOnlyApproved(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-900"
            />
            Hanya Rekanan Disetujui
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama vendor atau nama file foto katalog..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 bg-slate-50 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Semua' ? 'Semua Bidang Usaha' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Perbandingan */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Vendor & Status</th>
                <th className="py-3 px-5">Spesifikasi / Foto Katalog</th>
                <th className="py-3 px-5">Catatan Harga Penawaran</th>
                <th className="py-3 px-5 text-right">Analisis Komparasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {allCatalogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-xs text-slate-400">
                    Belum ada foto katalog barang yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
              {allCatalogs.map((doc) => {
                const isLowest = lowestPrice > 0 && doc.recordedPrice === lowestPrice;
                const diff =
                  lowestPrice > 0 && doc.recordedPrice > lowestPrice
                    ? doc.recordedPrice - lowestPrice
                    : 0;

                const currentInputValue =
                  draftPrices[doc.uniqueKey] !== undefined
                    ? draftPrices[doc.uniqueKey]
                    : doc.nilaiPenawaran !== undefined && doc.nilaiPenawaran !== null && doc.nilaiPenawaran !== 0
                    ? String(doc.nilaiPenawaran)
                    : doc.nilaiPenawaran === 0
                    ? '0'
                    : '';

                const isSaving = Boolean(savingRows[doc.uniqueKey]);
                const isJustSaved = Boolean(savedFeedback[doc.uniqueKey]);

                return (
                  <tr
                    key={doc.uniqueKey}
                    className={`transition ${isLowest ? 'bg-emerald-50/30' : 'hover:bg-slate-50/70'}`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{doc.vendorNama}</p>
                        {isLowest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                            <Award className="w-3 h-3" /> Termurah
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.vendorKategori}</p>
                      <div className="mt-1">
                        {doc.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Disetujui
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {doc.fotoKatalog ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                src: doc.fotoKatalog,
                                title: doc.namaFoto || 'Dokumen PDF Katalog',
                              })
                            }
                            className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 hover:bg-rose-100 transition cursor-pointer text-rose-600"
                            title="Pratinjau Dokumen PDF"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                            {doc.namaFoto || 'Dokumen PDF Katalog'}
                          </p>
                          {doc.fotoKatalog && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  src: doc.fotoKatalog,
                                  title: doc.namaFoto || 'Dokumen PDF Katalog',
                                })
                              }
                              className="text-[11px] text-primary-600 hover:text-primary-700 underline font-medium mt-0.5 cursor-pointer inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              Pratinjau PDF
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveRowPrice(doc);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={currentInputValue}
                            onChange={(e) =>
                              setDraftPrices({
                                ...draftPrices,
                                [doc.uniqueKey]: e.target.value,
                              })
                            }
                            className="w-36 pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          title="Simpan Harga"
                          className={`inline-flex items-center justify-center gap-1.5 min-w-[90px] px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSaving
                              ? 'bg-slate-400 text-white cursor-wait'
                              : isJustSaved
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : isJustSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Tersimpan</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Simpan</span>
                            </>
                          )}
                        </button>
                      </form>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {doc.recordedPrice === 0 ? (
                        <span className="text-slate-400 italic text-[11px]">Belum dinilai</span>
                      ) : isLowest ? (
                        <div>
                          <p className="font-bold text-emerald-700 text-xs">
                            {formatRupiah(doc.recordedPrice)}
                          </p>
                          <p className="text-emerald-600 text-[10px] font-medium">Penawaran Terendah</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">
                            {formatRupiah(doc.recordedPrice)}
                          </p>
                          <p className="text-rose-600 text-[10px] font-medium">
                            +{formatRupiah(diff)} selisih
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Preview Dokumen PDF */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-4xl w-full h-[85vh] p-4 flex flex-col shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 truncate max-w-md">{previewImage.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openPdfInNewTab(previewImage.src, previewImage.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
              <iframe
                src={previewImage.src}
                title={previewImage.title}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
