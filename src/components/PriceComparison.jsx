import { useState, useMemo } from 'react';
import {
  Search,
  Scale,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  ZoomIn,
  X,
  Award,
  Check,
} from 'lucide-react';
import { formatRupiah } from '../data/mockVendors';

export default function PriceComparison({ vendors, onUpdatePrice }) {
  const [searchItem, setSearchItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Menyimpan draf ketikan sementara sebelum tombol centang/simpan diklik
  const [draftPrices, setDraftPrices] = useState({});
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

  const handleSaveRowPrice = (doc) => {
    const rawValue =
      draftPrices[doc.uniqueKey] !== undefined
        ? draftPrices[doc.uniqueKey]
        : doc.nilaiPenawaran || '';

    onUpdatePrice(doc.vendorId, doc.id, rawValue);

    // Bersihkan draf karena sudah masuk ke data utama
    setDraftPrices((prev) => {
      const copy = { ...prev };
      delete copy[doc.uniqueKey];
      return copy;
    });

    // Tampilkan tanda tersimpan selama 2 detik
    setSavedFeedback((prev) => ({ ...prev, [doc.uniqueKey]: true }));
    setTimeout(() => {
      setSavedFeedback((prev) => ({ ...prev, [doc.uniqueKey]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_1px_2px_rgba(60,40,0,0.04),0_10px_28px_-14px_rgba(120,90,20,0.25)] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-left">
            <h2 className="text-base! font-bold! text-slate-900! m-0! text-left flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-700" />
              Perbandingan Foto Katalog & Harga Vendor
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan nominal harga pada kolom yang tersedia, lalu klik tombol <strong>centang (✓)</strong> atau tekan <strong>Enter</strong> untuk menyimpan permanen.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyApproved}
              onChange={(e) => setOnlyApproved(e.target.checked)}
              className="rounded text-amber-700 focus:ring-amber-500"
            />
            Hanya Vendor Status &ldquo;Setuju&rdquo;
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama vendor atau nama file foto katalog..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
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
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_1px_2px_rgba(60,40,0,0.04),0_10px_28px_-14px_rgba(120,90,20,0.25)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Vendor & Status</th>
                <th className="py-3.5 px-6">Foto Katalog</th>
                <th className="py-3.5 px-6">Input & Simpan Harga (Rp)</th>
                <th className="py-3.5 px-6 text-right">Perbandingan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {allCatalogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-xs text-slate-400">
                    Belum ada foto katalog yang sesuai filter.
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
                    : doc.nilaiPenawaran || '';

                const isJustSaved = Boolean(savedFeedback[doc.uniqueKey]);

                return (
                  <tr
                    key={doc.uniqueKey}
                    className={isLowest ? 'bg-emerald-50/40' : 'hover:bg-amber-50/40'}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{doc.vendorNama}</p>
                        {isLowest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                            <Award className="w-3 h-3" /> Termurah
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.vendorKategori}</p>
                      <div className="mt-1">
                        {doc.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Setuju
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {doc.fotoKatalog ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                src: doc.fotoKatalog,
                                title: doc.namaFoto || 'Foto Katalog',
                              })
                            }
                            className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer"
                          >
                            <img
                              src={doc.fotoKatalog}
                              alt="Katalog"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {doc.namaFoto || 'Foto Katalog Barang'}
                          </p>
                          {doc.fotoKatalog && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  src: doc.fotoKatalog,
                                  title: doc.namaFoto || 'Foto Katalog',
                                })
                              }
                              className="text-[11px] text-amber-700 hover:underline font-medium mt-0.5 cursor-pointer"
                            >
                              Lihat Foto
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveRowPrice(doc);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          type="number"
                          min="0"
                          placeholder="Nominal Rp..."
                          value={currentInputValue}
                          onChange={(e) =>
                            setDraftPrices({
                              ...draftPrices,
                              [doc.uniqueKey]: e.target.value,
                            })
                          }
                          className="w-36 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        />
                        <button
                          type="submit"
                          title="Simpan Harga"
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isJustSaved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[linear-gradient(180deg,#F7D774,#D9A21B)] text-amber-950 shadow-[0_2px_0_0_#A97A14] hover:brightness-105 active:translate-y-px active:shadow-none'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isJustSaved ? 'Tersimpan' : 'Simpan'}
                        </button>
                      </form>
                    </td>

                    <td className="py-4 px-6 text-right text-xs">
                      {doc.recordedPrice === 0 ? (
                        <span className="text-slate-400 italic">Belum diisi</span>
                      ) : isLowest ? (
                        <div>
                          <p className="font-bold text-emerald-700 text-sm">
                            {formatRupiah(doc.recordedPrice)}
                          </p>
                          <p className="text-emerald-600 font-medium">Penawaran Terendah</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {formatRupiah(doc.recordedPrice)}
                          </p>
                          <p className="text-rose-600 font-medium">
                            +{formatRupiah(diff)} lebih mahal
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

      {/* Lightbox Preview Foto */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-xs font-bold text-slate-800 truncate">{previewImage.title}</p>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="w-full max-h-[75vh] object-contain rounded-xl bg-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}