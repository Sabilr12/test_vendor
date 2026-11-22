import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Users,
  Search,
  Trash2,
  LogOut,
  Eye,
  RefreshCw,
  Scale,
} from 'lucide-react';
import logoRdp from '../assets/logo-rdp.png';
import ReviewModal from './ReviewModal';
import PriceComparison from './PriceComparison';

/* ---------- Gaya bersama (tema emas 3D) ---------- */
const CARD =
  'bg-white rounded-2xl border border-stone-200/70 shadow-[0_1px_2px_rgba(60,40,0,0.04),0_10px_28px_-14px_rgba(120,90,20,0.25)]';
const GOLD_BTN =
  'bg-[linear-gradient(180deg,#F7D774,#D9A21B)] text-amber-950 shadow-[0_2px_0_0_#A97A14] hover:brightness-105 active:translate-y-px active:shadow-none';
const SOFT_BTN =
  'bg-[linear-gradient(180deg,#FFF8DC,#F3D687)] text-amber-950 shadow-[0_3px_0_0_#C9A24A] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_#C9A24A]';
const NAV_ACTIVE =
  'bg-[linear-gradient(180deg,#FFFFFF,#FFF1C4)] text-amber-800 -translate-y-0.5 shadow-[0_3px_0_0_#A97A14,0_8px_14px_-4px_rgba(120,80,0,0.5)]';
const NAV_IDLE = 'text-amber-950 hover:bg-white/35';

const TONES = {
  amber: { bar: 'from-amber-300 to-amber-500', tile: 'bg-amber-100 text-amber-700', num: 'text-slate-900' },
  orange: { bar: 'from-orange-300 to-orange-500', tile: 'bg-orange-100 text-orange-600', num: 'text-orange-600' },
  emerald: { bar: 'from-emerald-300 to-emerald-500', tile: 'bg-emerald-100 text-emerald-600', num: 'text-emerald-600' },
};

const normalizeStatus = (vendor) =>
  vendor.status === 'Lolos' ? 'Setuju' : vendor.status === 'Ditolak' ? 'Pending' : vendor.status;

const getInitials = (name = '') =>
  name
    .replace(/^(PT|CV|UD)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

export default function AdminDashboard({
  currentUser,
  vendors,
  onMarkAsRead,
  onSubmitDecision,
  onUpdateCatalogPrice,
  onDeleteVendor,
  onRefreshData,
  onResetDemo,
  onLogout,
}) {
  const [activeAdminMenu, setActiveAdminMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedVendor, setSelectedVendor] = useState(null);

  const totalVendor = vendors.length;
  const totalPending = vendors.filter((v) => normalizeStatus(v) === 'Pending').length;
  const totalSetuju = vendors.filter((v) => normalizeStatus(v) === 'Setuju').length;
  const newSubmissionsCount = vendors.filter((v) => v.isNew).length;

  const filteredVendors = vendors.filter((vendor) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      vendor.nama.toLowerCase().includes(q) ||
      vendor.kategori.toLowerCase().includes(q) ||
      vendor.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Semua' || normalizeStatus(vendor) === filterStatus;
    return matchSearch && matchStatus;
  });

  const filterCounts = { Semua: totalVendor, Pending: totalPending, Setuju: totalSetuju };

  const handleOpenReview = (vendor) => {
    setSelectedVendor(vendor);
    if (vendor.isNew) onMarkAsRead(vendor.id);
  };

  const handleSaveDecision = (vendorId, decisionPayload) => {
    onSubmitDecision(vendorId, decisionPayload);
    setSelectedVendor(null);
  };

  const handleDelete = (vendor) => {
    if (window.confirm(`Hapus data vendor "${vendor.nama}"?`)) onDeleteVendor(vendor.id);
  };

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const navItems = [
    { key: 'dashboard', label: 'Dashboard Evaluasi', icon: LayoutDashboard, badge: totalPending },
    { key: 'vendors', label: 'Data Masuk Vendor', icon: Users },
    { key: 'perbandingan', label: 'Perbandingan Penawaran', icon: Scale },
  ];

  const stats = [
    { label: 'Total Pengajuan Masuk', value: totalVendor, unit: 'Vendor', helper: 'Seluruh vendor yang mengajukan', icon: Users, tone: 'amber' },
    { label: 'Status Pending', value: totalPending, helper: 'Menunggu evaluasi admin', icon: Clock, tone: 'orange' },
    { label: 'Disetujui', value: totalSetuju, helper: 'Lolos kualifikasi rekanan', icon: CheckCircle, tone: 'emerald' },
  ];

  const isPriceMenu = activeAdminMenu === 'perbandingan';

  return (
    <div className="h-screen bg-[#FAF8F2] text-slate-800 flex overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[linear-gradient(160deg,#F8E08E_0%,#E8B94A_38%,#CB9722_72%,#E6BC4C_100%)] shadow-[inset_-1px_0_0_rgba(255,255,255,0.45),8px_0_24px_-10px_rgba(120,80,0,0.45)] flex flex-col shrink-0 relative z-20">
        <div className="p-5 border-b border-amber-900/15 flex items-center gap-3">
          <div className="shrink-0 p-1.5 rounded-xl bg-[linear-gradient(145deg,#FFFFFF,#FBEBB4)] shadow-[0_3px_0_0_#A97A14,0_8px_14px_-4px_rgba(120,80,0,0.5)]">
            <img src={logoRdp} alt="Logo Rifansi" className="h-8 w-auto" />
          </div>
          <div className="min-w-0 text-left">
            <h2 className="text-[15px]! font-extrabold! text-amber-950! leading-tight! tracking-tight! m-0! whitespace-nowrap">
              Rifansi Dwi Putra
            </h2>
            <p className="text-xs font-semibold text-amber-900/80">Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-widest text-amber-950/55 uppercase text-left">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeAdminMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveAdminMenu(item.key)}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-left whitespace-nowrap transition cursor-pointer ${
                  active ? NAV_ACTIVE : NAV_IDLE
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-white text-orange-700 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-amber-900/15 space-y-2.5">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-9 h-9 shrink-0 rounded-full bg-[linear-gradient(145deg,#FFFFFF,#FBEBB4)] shadow-[0_2px_0_0_#A97A14] flex items-center justify-center font-bold text-amber-800">
              {(currentUser.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-amber-950 leading-tight">Administrator</p>
              <p className="text-[11px] text-amber-900/80 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={onResetDemo}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${SOFT_BTN}`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Data Simulasi
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-[linear-gradient(180deg,#FFFFFF,#FFE9EC)] shadow-[0_3px_0_0_#C98A93] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_0_#C98A93] transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar dari Admin
          </button>
        </div>
      </aside>

      {/* ================= KONTEN ================= */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white shadow-[0_6px_16px_-12px_rgba(120,90,20,0.4)]">
          <header className="px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <h1 className="text-lg! font-bold! text-slate-900! tracking-tight! leading-tight! m-0!">
                {isPriceMenu
                  ? 'Perbandingan Foto Katalog & Harga Vendor'
                  : 'Verifikasi & Kualifikasi Vendor Masuk'}
              </h1>
              <p className="text-xs text-slate-500 m-0! mt-0.5!">
                {isPriceMenu
                  ? 'Bandingkan foto katalog barang dan catat harga penawaran dari seluruh rekanan.'
                  : 'Periksa profil perusahaan, foto katalog barang, dan berikan catatan evaluasi.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-stone-100 px-3 py-2 rounded-xl">
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                {todayLabel}
              </span>
              <button
                onClick={onRefreshData}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${SOFT_BTN}`}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Muat Ulang Data
              </button>
            </div>
          </header>
        </div>

        <main className="p-6 w-full max-w-[1600px] mx-auto space-y-6">
          {!isPriceMenu && (
            <>
              {newSubmissionsCount > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-3 flex items-center gap-3 text-xs text-amber-900">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${GOLD_BTN}`}>
                    {newSubmissionsCount} BARU
                  </span>
                  <span>Ada pengajuan kualifikasi / foto katalog baru dari vendor di baris paling atas.</span>
                </div>
              )}

              {activeAdminMenu === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {stats.map((st) => {
                    const Icon = st.icon;
                    const tone = TONES[st.tone];
                    return (
                      <div
                        key={st.label}
                        className={`${CARD} relative overflow-hidden p-5 flex items-center justify-between transition hover:-translate-y-0.5`}
                      >
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.bar}`} />
                        <div className="text-left">
                          <p className="text-sm font-medium text-slate-500">{st.label}</p>
                          <p className={`mt-1.5 text-3xl font-extrabold ${tone.num}`}>
                            {st.value}
                            {st.unit && (
                              <span className="ml-1.5 text-base font-semibold text-slate-400">{st.unit}</span>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">{st.helper}</p>
                        </div>
                        <div className={`p-3.5 rounded-2xl ${tone.tile}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Cari & filter */}
              <div className={`${CARD} p-3.5 flex flex-col sm:flex-row gap-3 justify-between items-center`}>
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama vendor, email, atau bidang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                  />
                </div>
                <div className="inline-flex p-1 rounded-xl bg-stone-100 gap-1">
                  {['Semua', 'Pending', 'Setuju'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        filterStatus === status ? GOLD_BTN : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      {status}
                      <span className="ml-1.5 text-[10px] opacity-70">{filterCounts[status]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabel vendor */}
              <div className={`${CARD} overflow-hidden`}>
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-900">Daftar Pengajuan Vendor</h3>
                    <p className="text-xs text-slate-400">
                      Menampilkan {filteredVendors.length} dari {totalVendor} vendor
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        <th className="py-3 px-6">Perusahaan / Akun</th>
                        <th className="py-3 px-6">Bidang & Foto Katalog</th>
                        <th className="py-3 px-6">Catatan Admin</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm">
                      {filteredVendors.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-14 text-center">
                            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                              <Inbox className="w-6 h-6 text-amber-500" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Tidak ada data vendor</p>
                            <p className="text-xs text-slate-400">Coba ubah kata kunci atau filter status.</p>
                          </td>
                        </tr>
                      )}
                      {filteredVendors.map((vendor) => {
                        const isApproved = normalizeStatus(vendor) === 'Setuju';
                        return (
                          <tr
                            key={vendor.id}
                            className={`transition ${
                              vendor.isNew ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-amber-50/40'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 shrink-0 rounded-full bg-[linear-gradient(145deg,#F9E08E,#D9A21B)] text-amber-950 font-bold text-sm flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_6px_-2px_rgba(120,80,0,0.5)]">
                                  {getInitials(vendor.nama)}
                                  {vendor.isNew && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-orange-500 ring-2 ring-white" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-900">{vendor.nama}</p>
                                    {vendor.isNew && (
                                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${GOLD_BTN}`}>
                                        BARU
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500">{vendor.email}</p>
                                  {vendor.submittedAt && (
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      Masuk: {vendor.submittedAt}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-slate-700">{vendor.kategori}</p>
                              <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded-full">
                                <ImageIcon className="w-3 h-3" />
                                {vendor.katalog?.length || 0} Foto Katalog
                              </span>
                            </td>
                            <td className="py-4 px-6 max-w-xs">
                              {vendor.catatanAdmin ? (
                                <p className="text-xs text-slate-600 line-clamp-2">{vendor.catatanAdmin}</p>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Belum ada catatan</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {isApproved ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                  <CheckCircle className="w-3.5 h-3.5" /> Setuju
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                                  <Clock className="w-3.5 h-3.5" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenReview(vendor)}
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${SOFT_BTN}`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Periksa
                                </button>
                                <button
                                  onClick={() => handleDelete(vendor)}
                                  title="Hapus"
                                  className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {isPriceMenu && (
            <PriceComparison vendors={vendors} onUpdatePrice={onUpdateCatalogPrice} />
          )}
        </main>
      </div>

      {selectedVendor && (
        <ReviewModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onSubmitDecision={handleSaveDecision}
        />
      )}
    </div>
  );
}