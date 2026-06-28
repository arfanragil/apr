import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('Error: Missing Supabase URL or Key in environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Menguji koneksi ke Supabase:', supabaseUrl)
  
  // Test 1: Fetch expense_categories (should be public)
  const { data, error } = await supabase.from('expense_categories').select('*').limit(1)
  
  if (error) {
    console.error('Koneksi GAGAL atau tabel belum ada:', error.message)
  } else {
    console.log('Koneksi BERHASIL! Data kategori pengeluaran ditemukan:', data)
  }
}

testConnection()
