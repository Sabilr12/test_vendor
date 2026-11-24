import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.info(
    '[E-Procurement] Mode Penyimpanan: Offline/IndexedDB lokal. Untuk menghubungkan antar-device, tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
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
