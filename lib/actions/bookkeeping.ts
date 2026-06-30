'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resetBukuTahunan() {
  const supabase = createClient()
  
  // 1. Cek Autentikasi dan Otorisasi (Hanya Admin / Superadmin)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Anda belum login' }

  const { data: userData } = await supabase.from('users').select('roles(name)').eq('id', user.id).single()
  const role = (userData?.roles as any)?.name
  if (role !== 'Admin' && role !== 'Superadmin') {
    return { success: false, message: 'Hanya Admin atau Superadmin yang dapat melakukan Tutup Buku' }
  }

  try {
    // 2. Hitung Saldo Saat Ini
    const { data: incomes } = await supabase.from('incomes').select('amount')
    const { data: expenses } = await supabase.from('expenses').select('amount, proof_url')
    
    const totalIncome = incomes?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0
    const totalExpense = expenses?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0
    const currentBalance = totalIncome - totalExpense

    // 3. Kumpulkan file bukti transfer untuk dihapus
    const filesToDelete: string[] = []
    
    // Dari pengeluaran
    expenses?.forEach(exp => {
      if (exp.proof_url) {
        const path = exp.proof_url.split('/finance/')[1]
        if (path) filesToDelete.push(path)
      }
    })

    // Dari tagihan lunas
    const { data: lunasBills } = await supabase.from('bills').select('proof_url').eq('status', 'Lunas')
    lunasBills?.forEach(bill => {
      if (bill.proof_url) {
        const path = bill.proof_url.split('/finance/')[1]
        if (path) filesToDelete.push(path)
      }
    })

    // 4. Hapus file dari Storage (Finance Bucket)
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from('finance').remove(filesToDelete)
      if (storageError) {
        console.error('Error deleting files from storage:', storageError)
        // Kita tetap lanjut hapus database walaupun file gagal terhapus
      }
    }

    // 5. Hapus Data dari Database
    // Hapus semua pengeluaran
    await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Hapus semua (trick: neq dummy UUID)
    
    // Hapus semua pemasukan
    await supabase.from('incomes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Hapus tagihan yang sudah lunas
    await supabase.from('bills').delete().eq('status', 'Lunas')

    // 6. Buat Kategori "Saldo Awal Pembukuan" jika belum ada
    let categoryId = null
    const { data: cat } = await supabase.from('income_categories').select('id').eq('name', 'Saldo Awal Pembukuan').single()
    
    if (cat) {
      categoryId = cat.id
    } else {
      const { data: newCat } = await supabase.from('income_categories').insert({ name: 'Saldo Awal Pembukuan' }).select('id').single()
      if (newCat) categoryId = newCat.id
    }

    // 7. Suntikkan Saldo Awal ke Pemasukan
    if (categoryId) {
      const transactionNumber = `SALDOAWAL-${new Date().getFullYear()}`
      await supabase.from('incomes').insert({
        transaction_number: transactionNumber,
        date: new Date().toISOString().split('T')[0],
        category_id: categoryId,
        amount: currentBalance,
        description: `Pemindahan sisa saldo kas dari pembukuan periode sebelumnya.`,
        created_by: user.id
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/keuangan/pemasukan')
    revalidatePath('/keuangan/pengeluaran')
    revalidatePath('/keuangan/tagihan')
    revalidatePath('/laporan')

    return { success: true, message: `Tutup Buku berhasil! Rp ${currentBalance.toLocaleString('id-ID')} disuntikkan sebagai Saldo Awal.` }

  } catch (error: any) {
    console.error('Error during Tutup Buku:', error)
    return { success: false, message: error.message || 'Terjadi kesalahan internal' }
  }
}
