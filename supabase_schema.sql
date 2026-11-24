-- ==============================================================================
-- SKEMA TABEL VENDORS UNTUK E-PROCUREMENT PT RIFANSI DWI PUTRA
-- Jalankan skrip ini di menu SQL Editor di dashboard Supabase proyek Anda.
-- ==============================================================================

-- 1. Buat tabel vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id BIGINT PRIMARY KEY,
  email TEXT NOT NULL,
  nama TEXT NOT NULL,
  kategori TEXT DEFAULT '',
  alamat TEXT DEFAULT '',
  pengalaman TEXT DEFAULT '',
  katalog JSONB DEFAULT '[]'::JSONB,
  "rincianSkor" JSONB DEFAULT NULL,
  skor NUMERIC DEFAULT NULL,
  "catatanAdmin" TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending',
  "isNew" BOOLEAN DEFAULT true,
  "submittedAt" TEXT DEFAULT ''
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan akses (Buka izin baca & tulis untuk anon / public demo)
DROP POLICY IF EXISTS "Public Read Vendors" ON public.vendors;
CREATE POLICY "Public Read Vendors" ON public.vendors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Vendors" ON public.vendors;
CREATE POLICY "Public Insert Vendors" ON public.vendors
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Vendors" ON public.vendors;
CREATE POLICY "Public Update Vendors" ON public.vendors
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Delete Vendors" ON public.vendors;
CREATE POLICY "Public Delete Vendors" ON public.vendors
  FOR DELETE USING (true);

-- 4. Aktifkan fitur Realtime agar admin menerima update otomatis saat vendor beda device mengisi form
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;
