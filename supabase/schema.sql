-- DROP EXISTING TABLES AND TYPES TO ENSURE CLEAN SLATE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.expense_categories CASCADE;
DROP TABLE IF EXISTS public.incomes CASCADE;
DROP TABLE IF EXISTS public.income_categories CASCADE;
DROP TABLE IF EXISTS public.residents CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;

DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS user_role;

-- 1. Roles Table (Master Role)
CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Roles
INSERT INTO public.roles (name) VALUES ('Superadmin'), ('Admin'), ('Pengurus'), ('Warga');

-- 2. Users Table (Extends auth.users, Merges Residents)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  house_number TEXT, -- Includes Block in the string or separate. User requested "Nomor Rumah". We'll store it as 'Blok A1 No 05'.
  role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'Aktif', -- Aktif / Non Aktif
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Tables
CREATE TABLE public.income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Categories
INSERT INTO public.income_categories (name) VALUES ('Iuran Bulanan'), ('Donasi'), ('Dana Sosial'), ('Denda');
INSERT INTO public.expense_categories (name) VALUES ('Kebersihan'), ('Keamanan'), ('Lampu Jalan'), ('Administrasi'), ('Perbaikan'), ('Lainnya');

-- 4. Transactions Tables (Keuangan)
CREATE TABLE public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  category_id UUID REFERENCES public.income_categories(id) ON DELETE RESTRICT,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  proof_url TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  proof_url TEXT, -- Nota
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bills Table (Tagihan Warga)
CREATE TYPE payment_status AS ENUM ('Belum Bayar', 'Menunggu Verifikasi', 'Lunas');

CREATE TABLE public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status payment_status DEFAULT 'Belum Bayar' NOT NULL,
  paid_at TIMESTAMPTZ,
  proof_url TEXT, -- Bukti Transfer dari Warga
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. App Settings
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Settings
INSERT INTO public.app_settings (key, value) VALUES
('app_name', 'AlifPark Residence'),
('app_logo', ''),
('app_favicon', ''),
('app_address', 'Jl. Contoh Alamat No 123'),
('app_phone', '628123456789'),
('app_email', 'admin@alifpark.com'),
('app_footer', '© 2024 AlifPark Residence. All rights reserved.'),
('iuran_dasar', '100000'),
('iuran_kas', '30000'),
('iuran_sampah', '20000');


-- SECURITY & RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is superadmin/admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_id AND r.name IN ('Superadmin', 'Admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Everyone authenticated can read roles, categories, and settings
CREATE POLICY "Auth view roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth view inc_cat" ON public.income_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth view exp_cat" ON public.expense_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth view settings" ON public.app_settings FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access to masters
CREATE POLICY "Admin manage roles" ON public.roles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin manage inc_cat" ON public.income_categories FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin manage exp_cat" ON public.expense_categories FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admin manage settings" ON public.app_settings FOR ALL USING (is_admin(auth.uid()));

-- Users table policies
CREATE POLICY "Users can view users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage users" ON public.users FOR ALL USING (is_admin(auth.uid()));

-- Transactions (Incomes & Expenses)
CREATE POLICY "Auth view incomes" ON public.incomes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage incomes" ON public.incomes FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Auth view expenses" ON public.expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage expenses" ON public.expenses FOR ALL USING (is_admin(auth.uid()));

-- Bills
CREATE POLICY "Admin manage bills" ON public.bills FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Warga view own bills" ON public.bills FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Warga update own bills" ON public.bills FOR UPDATE USING (user_id = auth.uid()); -- To upload proof_url

-- Auto Registration Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Dapatkan ID role 'Warga'
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'Warga' LIMIT 1;

  INSERT INTO public.users (id, email, full_name, phone_number, house_number, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'house_number',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role_id', '')::UUID, default_role_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
