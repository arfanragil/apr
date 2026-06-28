# Panduan Setup Supabase & Deploy Vercel

Panduan ini berisi langkah-langkah untuk menyiapkan backend Supabase dan melakukan deployment aplikasi Next.js ke Vercel.

## 1. Setup Supabase

### Langkah 1: Buat Project Baru
1. Kunjungi [supabase.com](https://supabase.com) dan login/daftar.
2. Klik **"New Project"**.
3. Pilih organisasi Anda, berikan nama project (misal: `AlifParkResidence`), masukkan database password yang kuat, dan pilih region terdekat (misal: Singapore).
4. Klik **"Create New Project"** dan tunggu beberapa menit hingga project selesai disiapkan.

### Langkah 2: Dapatkan API Keys
1. Di dashboard Supabase project Anda, buka menu **Settings** (ikon gerigi di kiri bawah).
2. Pilih tab **"API"**.
3. Salin nilai dari:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Project API Keys - `anon` `public`** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Langkah 3: Eksekusi Schema SQL
1. Buka menu **SQL Editor** dari navigasi sebelah kiri.
2. Klik **"New query"**.
3. Buka file `supabase/schema.sql` yang ada di kode sumber aplikasi, lalu *copy* semua isinya.
4. *Paste* ke dalam SQL Editor di Supabase.
5. Klik tombol **"Run"**. Ini akan membuat semua tabel (`users`, `residents`, `bills`, `expenses`, dll) serta mengaktifkan RLS dan trigger otomatis.

### Langkah 4: Setup Environment Variables
1. Di project kode Next.js lokal Anda, buat file `.env.local` di *root* direktori.
2. Masukkan keys yang disalin pada Langkah 2:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

---

## 2. Deploy ke Vercel

Karena aplikasi ini menggunakan Next.js, Vercel adalah platform terbaik dan termudah untuk deployment.

### Langkah 1: Push ke GitHub
1. Inisialisasi git di folder project (jika belum):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Buat repository baru di GitHub.
3. Hubungkan repository lokal Anda ke GitHub:
   ```bash
   git remote add origin https://github.com/username/AlifParkResidence.git
   git push -u origin main
   ```

### Langkah 2: Deploy dari Vercel
1. Kunjungi [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** > **"Project"**.
3. Cari repository `AlifParkResidence` dan klik **"Import"**.
4. Biarkan *Framework Preset* tetap **Next.js**.

### Langkah 3: Konfigurasi Environment Variables di Vercel
Pada langkah konfigurasi *Environment Variables*, buka dan tambahkan key yang sama dengan `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` = (URL Supabase Anda)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Anon Key Supabase Anda)

### Langkah 4: Deploy
1. Klik tombol **"Deploy"**.
2. Vercel akan otomatis melakukan build dan deploy aplikasi Anda.
3. Setelah selesai, Anda akan mendapatkan URL publik aplikasi (misal: `https://alifparkresidence.vercel.app`).

> [!TIP]
> Jika Anda menggunakan *custom domain*, Anda bisa mengaturnya di menu **Settings > Domains** di dashboard Vercel setelah aplikasi ter-deploy.
