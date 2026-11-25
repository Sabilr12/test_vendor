import { createClient } from '@supabase/supabase-js';

// URL dan Anon Key Supabase resmi PT Rifansi Dwi Putra
// Disertakan sebagai fallback agar deployment di Vercel langsung tersambung otomatis
// tanpa risiko terputus jika konfigurasi Environment Variables di Vercel terlewat.
const DEFAULT_SUPABASE_URL = 'https://owogrraikbhwjtdlbbhn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_NBN7r_wzzg0hCnUSmCyadQ_82n8NBk4';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.info(
    '[E-Procurement] Mode Penyimpanan: Offline/IndexedDB lokal.'
  );
} else {
  console.info('[E-Procurement] Mode Penyimpanan: Cloud Database (Supabase terhubung).');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
