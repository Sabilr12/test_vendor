import { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { vendorService } from './services/vendorService';
import { formatRupiah } from './data/mockVendors';
import AuthPage from './components/AuthPage';
import VendorPortal from './components/VendorPortal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [vendors, setVendors] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const currentUserRef = useRef(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // --- RIWAYAT BROWSER: tombol Kembali dari dashboard -> halaman login ---
  useEffect(() => {
    window.history.replaceState({ page: 'login' }, '', '#/login');

    const handlePopState = (e) => {
      if (e.state?.page === 'app') {
        if (!currentUserRef.current) {
          window.history.replaceState({ page: 'login' }, '', '#/login');
        }
        return;
      }
      setCurrentUser(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- LOAD INITIAL DATA & REALTIME SYNC (LINTAS DEVICE) ---
  useEffect(() => {
    let isMounted = true;

    // 1. Tampilkan data dari cache lokal seketika agar tidak blank
    if (vendorService.getCachedVendors) {
      vendorService.getCachedVendors().then((cached) => {
        if (isMounted && Array.isArray(cached) && cached.length > 0) {
          setVendors(cached);
          setIsLoaded(true);
        }
      });
    }

    // 2. Ambil data cloud terbaru dari Supabase
    vendorService
      .getAllVendors()
      .then((savedData) => {
        if (isMounted) {
          setVendors(savedData || []);
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Gagal sinkron data awal:', err);
        if (isMounted) setIsLoaded(true);
      });

    // 3. Fallback keamanan: paksa halaman terbuka maksimal 1.5 detik jika sinyal lambat
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setIsLoaded(true);
    }, 1500);

    // 4. Berlangganan event Realtime dari Supabase (dan fallback antar tab)
    const unsubscribe = vendorService.subscribe((latestVendors) => {
      if (isMounted && Array.isArray(latestVendors)) {
        setVendors(latestVendors);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const getNowFormatted = () =>
    new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = async (userSession) => {
    const latest = await vendorService.getAllVendors();
    setVendors(latest);
    window.history.pushState({ page: 'app' }, '', `#/${userSession.role}`);
    setCurrentUser(userSession);
  };

  const handleLogout = () => {
    if (window.history.state?.page === 'app') {
      window.history.back();
    } else {
      setCurrentUser(null);
    }
  };

  // --- VENDOR HANDLERS ---
  const currentVendorData =
    currentUser?.role === 'vendor'
      ? vendors.find((v) => v.email.toLowerCase() === currentUser.email.toLowerCase())
      : null;

  const handleVendorSubmitKualifikasi = async (formData) => {
    const existing = vendors.find(
      (v) => v.email.toLowerCase() === currentUser.email.toLowerCase()
    );

    const payload = {
      id: existing ? existing.id : Date.now(),
      email: currentUser.email,
      nama: formData.nama.trim(),
      kategori: formData.kategori.trim(),
      alamat: formData.alamat.trim(),
      pengalaman: formData.pengalaman.trim(),
      katalog: existing ? existing.katalog || [] : [],
      rincianSkor: existing ? existing.rincianSkor || null : null,
      skor: existing ? existing.skor ?? null : null,
      catatanAdmin: existing ? existing.catatanAdmin || '' : '',
      status: existing ? existing.status : 'Pending',
      isNew: true,
      submittedAt: getNowFormatted(),
    };

    setVendors((prev) => {
      const others = prev.filter(
        (v) => v.email.toLowerCase() !== currentUser.email.toLowerCase()
      );
      return [payload, ...others];
    });

    await vendorService.upsertVendor(payload);
    showToast('Data kualifikasi berhasil dikirim! Silakan unggah foto katalog.');
  };

  const handleAddKatalogItem = async (katalogForm) => {
    if (!currentVendorData) return;

    const newItem = {
      id: Date.now(),
      fotoKatalog: katalogForm.fotoKatalog || '',
      namaFoto: katalogForm.namaFoto || 'Foto_Katalog.jpg',
      nilaiPenawaran: 0,
      uploadedAt: getNowFormatted(),
    };

    const updatedVendor = {
      ...currentVendorData,
      katalog: [newItem, ...(currentVendorData.katalog || [])],
      isNew: true,
    };

    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    );

    await vendorService.upsertVendor(updatedVendor);
    showToast('Foto katalog berhasil tersimpan & terkirim ke Admin.');
  };

  const handleDeleteKatalogItem = async (itemId) => {
    if (!currentVendorData) return;
    const updatedVendor = {
      ...currentVendorData,
      katalog: (currentVendorData.katalog || []).filter((item) => item.id !== itemId),
    };

    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    );

    await vendorService.upsertVendor(updatedVendor);
    showToast('Foto katalog berhasil dihapus.');
  };

  // --- ADMIN HANDLERS ---
  const handleMarkAsRead = async (vendorId) => {
    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return;
    const updated = { ...target, isNew: false };
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? updated : v)));
    await vendorService.upsertVendor(updated);
  };

  const handleAdminDecision = async (vendorId, decisionPayload) => {
    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return;
    const updated = { ...target, ...decisionPayload, isNew: false };
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? updated : v)));
    await vendorService.upsertVendor(updated);
    showToast(`Status evaluasi berhasil disimpan (${decisionPayload.status}).`);
  };

  const handleUpdateCatalogPrice = async (vendorId, itemId, newPrice) => {
    const numericPrice = newPrice === '' ? 0 : Math.max(0, Number(newPrice));
    const target = vendors.find((v) => String(v.id) === String(vendorId));
    if (!target) return;
    const updated = {
      ...target,
      katalog: (target.katalog || []).map((item) =>
        String(item.id) === String(itemId) ? { ...item, nilaiPenawaran: numericPrice } : item
      ),
    };
    setVendors((prev) =>
      prev.map((v) => (String(v.id) === String(vendorId) ? updated : v))
    );
    await vendorService.upsertVendor(updated);
    showToast(
      `Harga penawaran ${target.nama} berhasil disimpan (${formatRupiah(numericPrice)}).`
    );
  };

  const handleDeleteVendor = async (vendorId) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    await vendorService.deleteVendor(vendorId);
    showToast('Data vendor berhasil dihapus.');
  };

  const handleRefreshData = async () => {
    const latest = await vendorService.getAllVendors();
    setVendors(latest);
    showToast('Daftar pengajuan vendor diperbarui.');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-xs w-full text-center">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-xs font-bold text-slate-800">Menghubungkan Portal...</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Memuat data rekanan & penawaran</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {!currentUser && (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}

      {currentUser?.role === 'vendor' && (
        <VendorPortal
          key={currentUser.email}
          currentUser={currentUser}
          vendorData={currentVendorData}
          onSubmitKualifikasi={handleVendorSubmitKualifikasi}
          onAddKatalog={handleAddKatalogItem}
          onDeleteKatalog={handleDeleteKatalogItem}
          onLogout={handleLogout}
        />
      )}

      {currentUser?.role === 'admin' && (
        <AdminDashboard
          key={currentUser.email}
          currentUser={currentUser}
          vendors={vendors}
          onMarkAsRead={handleMarkAsRead}
          onSubmitDecision={handleAdminDecision}
          onUpdateCatalogPrice={handleUpdateCatalogPrice}
          onDeleteVendor={handleDeleteVendor}
          onRefreshData={handleRefreshData}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
