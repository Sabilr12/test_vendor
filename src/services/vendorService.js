import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_VENDORS } from '../data/mockVendors';

const DB_NAME = 'eprocurement_db_v2';
const STORE_NAME = 'vendors_store';
const DATA_KEY = 'vendors_list';
const SYNC_SIGNAL_KEY = 'eprocurement_last_updated';

// --- HELPER LOCAL INDEXEDDB (FALLBACK) ---
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadFromIndexedDB(fallbackData = INITIAL_VENDORS) {
  try {
    const db = await openIndexedDB();
    if (!db) return fallbackData;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(DATA_KEY);
      req.onsuccess = () => {
        if (Array.isArray(req.result)) {
          resolve(req.result);
        } else {
          saveToIndexedDB(fallbackData);
          resolve(fallbackData);
        }
      };
      req.onerror = () => resolve(fallbackData);
    });
  } catch {
    return fallbackData;
  }
}

async function saveToIndexedDB(data) {
  try {
    const db = await openIndexedDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, DATA_KEY);
      req.onsuccess = () => {
        try {
          localStorage.setItem(SYNC_SIGNAL_KEY, String(Date.now()));
        } catch {
          // Abaikan jika quota localStorage penuh
        }
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal menyimpan cache ke IndexedDB:', err);
  }
}

// --- VENDOR SERVICE (HYBRID: SUPABASE CLOUD + LOCAL FALLBACK) ---
export const vendorService = {
  isCloudActive: isSupabaseConfigured,

  /**
   * Mengambil seluruh data vendor:
   * Prioritas 1: Dari Supabase Cloud Database (lintas device)
   * Prioritas 2: Dari IndexedDB lokal jika Supabase belum disetting
   */
  async getAllVendors() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('id', { ascending: false });

        if (!error && Array.isArray(data)) {
          // Normalisasi password dari rincianSkor jika tersimpan di sana
          const normalized = data.map((v) => ({
            ...v,
            password: v.rincianSkor?._authPassword || v.password || '',
          }));
          saveToIndexedDB(normalized);
          return normalized;
        }
        console.warn('Supabase fetch error, menggunakan data lokal:', error?.message);
      } catch (err) {
        console.warn('Koneksi Supabase gagal, beralih ke cache lokal:', err);
      }
    }
    return await loadFromIndexedDB([]);
  },

  /**
   * Simpan atau perbarui data 1 vendor ke cloud
   */
  async upsertVendor(vendorItem) {
    if (isSupabaseConfigured && supabase) {
      try {
        // Amankan password ke rincianSkor._authPassword agar kompatibel dengan skema tabel
        const payload = { ...vendorItem };
        if (payload.password) {
          payload.rincianSkor = {
            ...(payload.rincianSkor || {}),
            _authPassword: payload.password,
          };
          delete payload.password;
        }

        const { error } = await supabase.from('vendors').upsert(payload, {
          onConflict: 'id',
        });
        if (error) {
          console.error('Gagal upsert vendor ke Supabase:', error.message);
        }
      } catch (err) {
        console.error('Koneksi Supabase error saat upsert:', err);
      }
    }

    // Selalu simpan juga ke IndexedDB lokal sebagai backup
    const local = await loadFromIndexedDB([]);
    const existingIndex = local.findIndex((v) => String(v.id) === String(vendorItem.id));
    let nextList;
    if (existingIndex !== -1) {
      nextList = local.map((v) => (String(v.id) === String(vendorItem.id) ? vendorItem : v));
    } else {
      nextList = [vendorItem, ...local];
    }
    await saveToIndexedDB(nextList);
    return nextList;
  },

  /**
   * Hapus vendor berdasarkan ID
   */
  async deleteVendor(vendorId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
        if (error) {
          console.error('Gagal menghapus vendor dari Supabase:', error.message);
        }
      } catch (err) {
        console.error('Koneksi Supabase error saat delete:', err);
      }
    }

    const local = await loadFromIndexedDB([]);
    const nextList = local.filter((v) => String(v.id) !== String(vendorId));
    await saveToIndexedDB(nextList);
    return nextList;
  },

  /**
   * Reset data kembali ke INITIAL_VENDORS
   */
  async resetDemo() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('vendors').delete().gte('id', 0);
        await supabase.from('vendors').insert(INITIAL_VENDORS);
      } catch (err) {
        console.error('Gagal reset demo di Supabase:', err);
      }
    }
    await saveToIndexedDB(INITIAL_VENDORS);
    return INITIAL_VENDORS;
  },

  /**
   * Berlangganan sinkronisasi data (Realtime lintas device dan lintas tab)
   */
  subscribe(onUpdate) {
    let supabaseChannel = null;

    if (isSupabaseConfigured && supabase) {
      // Realtime listener dari Supabase (berjalan antar device!)
      supabaseChannel = supabase
        .channel('public:vendors_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vendors' },
          async () => {
            const latest = await this.getAllVendors();
            onUpdate(latest);
          }
        )
        .subscribe();
    }

    // Fallback sync untuk antar tab pada browser yang sama
    const handleStorageEvent = async (e) => {
      if (e.key === SYNC_SIGNAL_KEY) {
        const latest = await this.getAllVendors();
        onUpdate(latest);
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
      window.removeEventListener('storage', handleStorageEvent);
    };
  },
};
