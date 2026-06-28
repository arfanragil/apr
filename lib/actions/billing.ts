'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateMonthlyBills(formData: FormData) {
  const supabase = createClient()
  
  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  
  try {
    // 0. Ambil setting IPL
    const { data: settings } = await supabase.from('app_settings').select('*')
    
    // Gabungan total iuran (dasar + kas + sampah)
    const iuranDasar = parseInt(settings?.find(s => s.key === 'iuran_dasar')?.value || '100000')
    const iuranKas = parseInt(settings?.find(s => s.key === 'iuran_kas')?.value || '30000')
    const iuranSampah = parseInt(settings?.find(s => s.key === 'iuran_sampah')?.value || '20000')
    const defaultAmount = iuranDasar + iuranKas + iuranSampah

    const dueDate = `${year}-${String(month).padStart(2, '0')}-10` // Default jatuh tempo tgl 10

    // 1. Dapatkan role Admin dan Superadmin untuk di-skip
    const { data: excludedRoles } = await supabase.from('roles').select('id').in('name', ['Admin', 'Superadmin'])
    const excludedRoleIds = excludedRoles?.map(r => r.id) || []

    // 2. Dapatkan warga aktif (User dengan role selain Admin/Superadmin)
    let query = supabase.from('users').select('id')
    if (excludedRoleIds.length > 0) {
      // Supabase .not().in() is not directly supported this way, but we can use .not('role_id', 'in', `(${excludedRoleIds.join(',')})`) 
      // or fetch all and filter in JS for simplicity since residents count is usually < 1000.
    }
    
    const { data: users, error: resError } = await supabase.from('users').select('id, role_id')
    if (resError) throw resError

    const residents = users?.filter(u => !excludedRoleIds.includes(u.role_id)) || []

    // 3. Cek tagihan yang sudah ada untuk bulan ini (agar tidak double)
    const { data: existingBills } = await supabase
      .from('bills')
      .select('user_id')
      .eq('month', month)
      .eq('year', year)
      
    const existingUserIds = existingBills?.map(b => b.user_id) || []
    
    const usersToBill = residents.filter(r => !existingUserIds.includes(r.id))

    // 4. Siapkan data tagihan massal
    if (usersToBill.length > 0) {
      const bills = usersToBill.map((r) => ({
        user_id: r.id,
        month: month,
        year: year,
        amount: defaultAmount,
        due_date: dueDate,
        status: 'Belum Bayar'
      }))

      const { error: insertError } = await supabase.from('bills').insert(bills)
      if (insertError) throw insertError
    }

    revalidatePath('/keuangan/tagihan')
    return { success: true, message: `Berhasil membuat tagihan untuk ${usersToBill.length} warga.` }
  } catch (error: any) {
    console.error('Error generating bills:', error)
    return { success: false, message: error.message }
  }
}

export async function uploadProof(billId: string, proofUrl: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('bills')
    .update({ 
      proof_url: proofUrl, 
      status: 'Menunggu Verifikasi',
      paid_at: new Date().toISOString()
    })
    .eq('id', billId)
    
  if (error) return { error: error.message }
  
  revalidatePath('/keuangan/ipl-warga')
  return { success: true }
}

export async function approveBill(billId: string) {
  const supabase = createClient()
  
  // 1. Ambil data bill
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('*, users(full_name, house_number)')
    .eq('id', billId)
    .single()
    
  if (billError || !bill) return { error: billError?.message || 'Bill not found' }

  // 2. Ambil kategori pemasukan "Iuran Bulanan" (buat jika belum ada)
  let categoryId = null
  const { data: cat } = await supabase.from('income_categories').select('id').eq('name', 'Iuran Bulanan').single()
  
  if (cat) {
    categoryId = cat.id
  } else {
    const { data: newCat } = await supabase.from('income_categories').insert({ name: 'Iuran Bulanan' }).select('id').single()
    if (newCat) categoryId = newCat.id
  }

  // 3. Update status bill
  const { error } = await supabase
    .from('bills')
    .update({ status: 'Lunas' })
    .eq('id', billId)
    
  if (error) return { error: error.message }
  
  // 4. Insert ke incomes
  const transactionNumber = `IPL-${bill.month}${bill.year}-${(bill.users as any)?.house_number || 'X'}`
  
  // Cek apakah sudah terinsert (menghindari duplikasi jika diklik 2x)
  const { data: existingIncome } = await supabase.from('incomes').select('id').eq('transaction_number', transactionNumber).single()
  
  if (!existingIncome && categoryId) {
    await supabase.from('incomes').insert({
      transaction_number: transactionNumber,
      date: new Date().toISOString().split('T')[0],
      category_id: categoryId,
      amount: bill.amount,
      description: `Pembayaran IPL ${bill.month}/${bill.year} - ${(bill.users as any)?.full_name} (${(bill.users as any)?.house_number})`,
      created_by: bill.user_id
    })
  }
  
  revalidatePath('/keuangan/tagihan')
  revalidatePath('/keuangan/pemasukan')
  revalidatePath('/dashboard')
  revalidatePath('/laporan')
  return { success: true }
}
