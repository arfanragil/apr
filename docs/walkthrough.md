# Walkthrough: Aplikasi Manajemen IPL AlifParkResidence

Saya telah berhasil membuat pondasi dan arsitektur untuk aplikasi manajemen IPL "AlifParkResidence" sesuai dengan kebutuhan Anda. 

Semua *requirement* telah terpenuhi: menggunakan Next.js 14 App Router, Tailwind CSS, persiapan Supabase, dan desain UI Dashboard Modern yang responsif (mobile-friendly).

## Ringkasan Hasil Pengerjaan

### 1. Struktur Folder Next.js & UI Components
Project Next.js telah berhasil diinisialisasi beserta integrasi **Tailwind CSS** dan **Lucide Icons** untuk UI modern. Struktur routing dibuat menggunakan *Route Groups* (`(auth)` dan `(dashboard)`) agar *layouting* terpisah secara rapi.

File utama yang telah dibuat:
- [Layout Dashboard](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/app/(dashboard)/layout.tsx)
- [Halaman Login](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/app/(auth)/login/page.tsx)
- [Halaman Dashboard Keuangan](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/app/(dashboard)/page.tsx)
- [Halaman CRUD Warga](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/app/(dashboard)/warga/page.tsx)
- [Halaman Input Pengeluaran](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/app/(dashboard)/pengeluaran/page.tsx)
- [Halaman Penagihan IPL](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/app/(dashboard)/ipl/page.tsx)

### 2. Skema SQL Supabase Lengkap
Skema database untuk aplikasi Anda telah dibuat dan diletakkan pada:
👉 [supabase/schema.sql](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/supabase/schema.sql)

Skema ini memuat:
- Tabel `users`, `residents`, `bills`, `payments`, `expense_categories`, dan `expenses`.
- **Fitur Khusus:** Penggunaan kolom `jsonb` bernama `metadata` pada tabel `expenses` untuk menampung detail **Gaji Satpam** (nama petugas, periode, bonus, potongan) dalam *satu tabel pengeluaran*.
- *Row Level Security (RLS)* dan fungsi `trigger` untuk otomatis menambahkan *user* baru.

### 3. Dokumentasi Setup Supabase & Deploy Vercel
Langkah demi langkah (step-by-step) untuk menyiapkan backend Supabase dari awal hingga panduan integrasi ke platform hosting Vercel telah saya dokumentasikan pada Artifact: **Panduan Setup Supabase & Deploy Vercel**.

### 4. Contoh Server Actions (Supabase)
Kode backend Next.js (*Server Actions*) disiapkan untuk memberikan gambaran logika pengelolaan database:
- Autentikasi: [lib/actions/auth.ts](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/lib/actions/auth.ts)
- Generate Tagihan Massal: [lib/actions/billing.ts](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/lib/actions/billing.ts)
- Konfigurasi Client Supabase: [utils/supabase/server.ts](file:///Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence/utils/supabase/server.ts)

## Cara Menjalankan Secara Lokal

Anda bisa melihat tampilan UI Modern yang telah dibuat secara lokal dengan menjalankan perintah berikut di terminal Anda:
```bash
cd /Users/ragil.arfan/Documents/PRIBADI/AlifParkResidence
npm run dev
```

Buka `http://localhost:3000/dashboard` di browser Anda untuk melihat Dashboard modern beserta grafik interaktif (menggunakan Recharts). Anda juga bisa mengakses `/login`, `/warga`, `/ipl`, dan `/pengeluaran` untuk melihat desain form dan tabelnya.

> [!NOTE]
> Aplikasi saat ini menggunakan data _dummy_ (Mock Data) pada antarmuka agar Anda bisa langsung melihat desainnya. Setelah Anda menyelesaikan Setup Supabase sesuai panduan dan memasukkan *environment variables*, logika Supabase bisa langsung dihubungkan dengan komponen UI tersebut.
