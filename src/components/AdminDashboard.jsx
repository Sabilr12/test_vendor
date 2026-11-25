import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Inbox,
  LayoutDashboard,
  Users,
  Search,
  Trash2,
  LogOut,
  Eye,
  RefreshCw,
  Scale,
  Menu,
  X,
} from 'lucide-react';
import logoRdp from '../assets/logo-rdp.png';
import ReviewModal from './ReviewModal';
import PriceComparison from './PriceComparison';

/* ---------- Gaya Desain Enterprise Bersih (Non-AI Look) ---------- */
const CARD = 'bg-white rounded-xl border border-slate-200/80 shadow-xs';
const BTN_SECONDARY =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs cursor-pointer';

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
  onLogout,
}) {
  const [activeAdminMenu, setActiveAdminMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    {
      label: 'Total Pengajuan Masuk',
      value: totalVendor,
      unit: 'Vendor',
      helper: 'Seluruh rekanan terdaftar',
      icon: Users,
      iconColor: 'text-slate-700 bg-slate-100',
    },
    {
      label: 'Menunggu Evaluasi',
      value: totalPending,
      unit: 'Pending',
      helper: 'Perlu ditinjau kelayakannya',
      icon: Clock,
      iconColor: 'text-amber-700 bg-amber-50 border border-amber-200/60',
    },
    {
      label: 'Telah Disetujui',
      value: totalSetuju,
      unit: 'Lolos',
      helper: 'Memenuhi syarat rekanan',
      icon: CheckCircle,
      iconColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
    },
  ];

  const isPriceMenu = activeAdminMenu === 'perbandingan';

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex overflow-hidden relative">
      {/* Backdrop Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* ================= SIDEBAR ENTERPRISE (Warna Oren Muda Bersih & Responsif Mobile) ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-orange-50/95 md:bg-orange-50/70 border-r border-orange-200/80 flex flex-col shrink-0 transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="p-4 border-b border-orange-200/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 p-1 bg-white rounded-lg border border-orange-200/90 shadow-xs">
              <img src={logoRdp} alt="Logo Rifansi" className="h-7 w-auto object-contain" />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="text-sm font-bold text-slate-900 leading-tight tracking-tight truncate m-0">
                Rifansi Dwi Putra
              </h2>
              <p className="text-[11px] font-semibold text-orange-700/80 m-0">Procurement System</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-orange-100 transition cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-wider text-orange-900/50 uppercase text-left">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeAdminMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveAdminMenu(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs text-left transition cursor-pointer ${
                  active
                    ? 'bg-white text-orange-950 font-semibold shadow-xs border border-orange-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100/60 font-medium'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-orange-600' : 'text-slate-500'}`} />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-800 rounded-full border border-orange-200/80">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar (User profile & action) */}
        <div className="p-3 border-t border-orange-200/70 space-y-2">
          <div className="flex items-center gap-2.5 px-2.5 py-2 bg-white/90 rounded-lg border border-orange-200/80 shadow-xs">
            <div className="w-8 h-8 shrink-0 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-xs text-orange-700">
              {(currentUser.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Admin Procurement</p>
              <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/70 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* ================= AREA KONTEN UTAMA ================= */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-slate-200/80">
          <header className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 text-left">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-700 bg-orange-50 border border-orange-200/80 hover:bg-orange-100 transition cursor-pointer shrink-0"
                title="Buka Menu"
              >
                <Menu className="w-4 h-4 text-orange-700" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight m-0 truncate">
                  {isPriceMenu
                    ? 'Perbandingan Foto Katalog & Penawaran Harga'
                    : 'Prakualifikasi & Verifikasi Vendor Masuk'}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 m-0 mt-0.5 truncate">
                  {isPriceMenu
                    ? 'Bandingkan spesifikasi katalog dan evaluasi harga rekanan.'
                    : 'Tinjau profil legalitas, foto katalog, dan berikan evaluasi.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                {todayLabel}
              </span>
              <button onClick={onRefreshData} className={BTN_SECONDARY}>
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Segarkan Data</span>
              </button>
            </div>
          </header>
        </div>

        <main className="p-6 w-full max-w-[1500px] mx-auto space-y-5">
          {!isPriceMenu && (
            <>
              {/* Notifikasi Pengajuan Baru (Subtle & Professional) */}
              {newSubmissionsCount > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 flex items-center gap-3 text-xs text-amber-900 shadow-xs">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white tracking-wider uppercase">
                    {newSubmissionsCount} BARU
                  </span>
                  <span>
                    Terdapat pengajuan data vendor atau pembaruan foto katalog baru yang menunggu verifikasi Anda.
                  </span>
                </div>
              )}

              {/* Stat Cards (Modern Enterprise Style) */}
              {activeAdminMenu === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((st) => {
                    const Icon = st.icon;
                    return (
                      <div
                        key={st.label}
                        className={`${CARD} p-5 flex items-start justify-between transition hover:border-slate-300`}
                      >
                        <div className="text-left">
                          <p className="text-xs font-medium text-slate-500 tracking-wide">{st.label}</p>
                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">
                              {st.value}
                            </span>
                            <span className="text-xs font-medium text-slate-400">{st.unit}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">{st.helper}</p>
                        </div>
                        <div className={`p-2.5 rounded-lg shrink-0 ${st.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search & Segmented Filter Bar */}
              <div className={`${CARD} p-3 flex flex-col sm:flex-row gap-3 justify-between items-center`}>
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama vendor, email, bidang usaha..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                  />
                </div>

                <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200/60 gap-1 w-full sm:w-auto justify-center">
                  {['Semua', 'Pending', 'Setuju'].map((status) => {
                    const isSelected = filterStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-md text-xs transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-white text-slate-900 font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 font-medium'
                        }`}
                      >
                        <span>{status}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            isSelected ? 'bg-slate-100 text-slate-700' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {filterCounts[status]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tabel Pengajuan Vendor */}
              <div className={`${CARD} overflow-hidden`}>
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-slate-900">Daftar Pengajuan Rekanan</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Menampilkan {filteredVendors.length} dari {totalVendor} vendor
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-200/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-5">Perusahaan & Akun</th>
                        <th className="py-3 px-5">Bidang & Dokumen</th>
                        <th className="py-3 px-5">Catatan Evaluasi</th>
                        <th className="py-3 px-5 text-center">Status</th>
                        <th className="py-3 px-5 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredVendors.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-14 text-center">
                            <div className="mx-auto w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center mb-2.5 text-orange-600">
                              <Inbox className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-slate-800">Belum Ada Rekanan yang Terdaftar</p>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                              {searchQuery || filterStatus !== 'Semua'
                                ? 'Tidak ada rekanan yang sesuai dengan filter pencarian.'
                                : 'Vendor baru yang mendaftar melalui portal publik akan otomatis muncul di sini secara realtime.'}
                            </p>
                          </td>
                        </tr>
                      )}
                      {filteredVendors.map((vendor) => {
                        const isApproved = normalizeStatus(vendor) === 'Setuju';
                        return (
                          <tr
                            key={vendor.id}
                            className={`transition hover:bg-slate-50/70 ${
                              vendor.isNew ? 'bg-amber-50/35' : ''
                            }`}
                          >
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center">
                                  {getInitials(vendor.nama)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-900 truncate">{vendor.nama}</p>
                                    {vendor.isNew && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                        BARU
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate">{vendor.email}</p>
                                  {vendor.submittedAt && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      Diajukan: {vendor.submittedAt}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-5">
                              <p className="text-slate-800 font-medium">{vendor.kategori}</p>
                              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 font-medium">
                                <FileText className="w-3 h-3 text-rose-500" />
                                {vendor.katalog?.length || 0} Dokumen PDF
                              </span>
                            </td>

                            <td className="py-3.5 px-5 max-w-xs">
                              {vendor.catatanAdmin ? (
                                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50/80 p-1.5 rounded-md border border-slate-200/50">
                                  {vendor.catatanAdmin}
                                </p>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Belum ada catatan</span>
                              )}
                            </td>

                            <td className="py-3.5 px-5 text-center">
                              {isApproved ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Setuju
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Pending
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button onClick={() => handleOpenReview(vendor)} className={BTN_SECONDARY}>
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  Periksa
                                </button>
                                <button
                                  onClick={() => handleDelete(vendor)}
                                  title="Hapus Rekanan"
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
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
