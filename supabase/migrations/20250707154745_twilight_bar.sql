-- ============================
-- 1. ENUM TYPES
-- ============================
CREATE TYPE member_category AS ENUM ('pelajar', 'umum');
CREATE TYPE loan_status AS ENUM ('dipinjam', 'dikembalikan');
CREATE TYPE visitor_category AS ENUM ('anak-anak', 'remaja', 'dewasa');
CREATE TYPE visit_purpose AS ENUM ('membaca', 'meminjam', 'membaca_dan_meminjam', 'lainnya');
CREATE TYPE book_category AS ENUM ('Pra-Sekolah', 'Materi Pelajaran', 'Pengetahuan Anak', 'Buku Cerita Anak', 'Novel/Sastra', 'Motivasi', 'Umum', 'Agama', 'Keluarga & Kesehatan', 'Keterampilan', 'Bahasa Inggris');

-- ============================
-- 2. BOOKS TABLE (Simplified)
-- ============================
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category book_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  total_copies INTEGER NOT NULL,
  available_copies INTEGER NOT NULL
);

-- ============================
-- 3. MEMBERS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  religion VARCHAR(50) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  category member_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- 4. LOANS TABLE (Peminjaman + Pengembalian)
-- ============================
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  loan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  status loan_status DEFAULT 'dipinjam',
  fine DECIMAL(10,2) DEFAULT 0.00
);

-- ============================
-- 5. VISITORS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  category visitor_category NOT NULL
);

-- ============================
-- 6. VISITS TABLE (Kunjungan)
-- ============================
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_date DATE DEFAULT CURRENT_DATE,
  checkin_time TIME DEFAULT CURRENT_TIME,
  checkout_time TIME,

  -- Relasi fleksibel: bisa member atau visitor
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  
  purpose visit_purpose NOT NULL
);

-- ============================
-- 7. USERS TABLE (LOGIN)
-- ============================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'member'
);

-- ============================
-- 8. RLS ENABLE + POLICIES
-- ============================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example: RLS Policies for 'authenticated' users
DO $$
BEGIN
  -- BOOKS
  CREATE POLICY books_select ON books FOR SELECT TO authenticated USING (true);
  CREATE POLICY books_all ON books FOR ALL TO authenticated USING (true);

  -- MEMBERS
  CREATE POLICY members_select ON members FOR SELECT TO authenticated USING (true);
  CREATE POLICY members_all ON members FOR ALL TO authenticated USING (true);

  -- LOANS
  CREATE POLICY loans_select ON loans FOR SELECT TO authenticated USING (true);
  CREATE POLICY loans_all ON loans FOR ALL TO authenticated USING (true);

  -- VISITORS
  CREATE POLICY visitors_select ON visitors FOR SELECT TO authenticated USING (true);
  CREATE POLICY visitors_all ON visitors FOR ALL TO authenticated USING (true);

  -- VISITS
  CREATE POLICY visits_select ON visits FOR SELECT TO authenticated USING (true);
  CREATE POLICY visits_all ON visits FOR ALL TO authenticated USING (true);

  -- USERS
  CREATE POLICY users_select ON users FOR SELECT TO authenticated USING (true);
  CREATE POLICY users_all ON users FOR ALL TO authenticated USING (true);
EXCEPTION WHEN others THEN
  -- avoid failure if policies already exist
  NULL;
END $$;

-- ============================
-- 9. INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_members_category ON members(category);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_book_id ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);

ALTER TABLE books ADD COLUMN kode_buku VARCHAR(50);
CREATE OR REPLACE FUNCTION get_category_prefix(cat book_category)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE cat
    WHEN 'Pra-Sekolah' THEN 'PRS'
    WHEN 'Materi Pelajaran' THEN 'MPJ'
    WHEN 'Pengetahuan Anak' THEN 'PNA'
    WHEN 'Buku Cerita Anak' THEN 'BCA'
    WHEN 'Novel/Sastra' THEN 'NSR'
    WHEN 'Motivasi' THEN 'MTV'
    WHEN 'Umum' THEN 'UMM'
    WHEN 'Agama' THEN 'AGM'
    WHEN 'Keluarga & Kesehatan' THEN 'KKS'
    WHEN 'Keterampilan' THEN 'KTM'
    WHEN 'Bahasa Inggris' THEN 'BIN'
    ELSE 'XXX'
  END;
END;
$$ LANGUAGE plpgsql;
WITH ranked_books AS (
  SELECT 
    id,
    get_category_prefix(category) || '-' || LPAD(ROW_NUMBER() OVER (PARTITION BY category ORDER BY title)::text, 3, '0') AS generated_code
  FROM books
)
UPDATE books
SET kode_buku = ranked_books.generated_code
FROM ranked_books
WHERE books.id = ranked_books.id;
ALTER TABLE books ADD CONSTRAINT unique_kode_buku UNIQUE(kode_buku);


-- Untuk membaca data visits di halaman publik
CREATE POLICY visits_select_for_anon ON visits FOR SELECT TO anon USING (true);

-- Untuk insert data visits (check-in) di halaman publik  
CREATE POLICY visits_insert_for_anon ON visits FOR INSERT TO anon WITH CHECK (true);

-- Untuk update data visits (check-out) di halaman publik
CREATE POLICY visits_update_for_anon ON visits FOR UPDATE TO anon USING (true);
