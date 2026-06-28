import { createClient } from '@/utils/supabase/server'
import DashboardClient from './dashboard-client'
import { getUserRole } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { role } = await getUserRole()


  const supabase = createClient()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  // 1. Ambil Pemasukan
  const { data: incomes } = await supabase.from('incomes').select('amount, date, description, transaction_number')
  
  // 2. Ambil Pengeluaran
  const { data: expenses } = await supabase.from('expenses').select('amount, date, description, transaction_number')

  // 4. Ambil Tagihan Belum Dibayar & Menunggu
  const { data: unpaidBills } = await supabase
    .from('bills')
    .select('*, users(full_name, house_number)')
    .in('status', ['Belum Bayar', 'Menunggu Verifikasi'])
    .order('created_at', { ascending: false })

  // 5. Hitung Warga
  const { data: roles } = await supabase.from('roles').select('id').in('name', ['Admin', 'Superadmin'])
  const excludedRoleIds = roles?.map(r => r.id) || []
  
  let wargaCount = 0
  if (excludedRoleIds.length > 0) {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).not('role_id', 'in', `(${excludedRoleIds.join(',')})`)
    wargaCount = count || 0
  } else {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
    wargaCount = count || 0
  }

  // --- Perhitungan Saldo & Ringkasan Bulan Ini ---
  let totalPemasukanAllTime = 0
  let totalPengeluaranAllTime = 0
  
  let totalPemasukanBulanIni = 0
  let totalPengeluaranBulanIni = 0
  
  // Proses Incomes
  incomes?.forEach(inc => {
    const amt = Number(inc.amount)
    totalPemasukanAllTime += amt
    
    const d = new Date(inc.date)
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      totalPemasukanBulanIni += amt
    }
  })
  
  // Proses Expenses
  expenses?.forEach(exp => {
    const amt = Number(exp.amount)
    totalPengeluaranAllTime += amt
    
    const d = new Date(exp.date)
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      totalPengeluaranBulanIni += amt
    }
  })

  const saldoKas = totalPemasukanAllTime - totalPengeluaranAllTime
  
  const stats = {
    saldoKas,
    pemasukanBulanIni: totalPemasukanBulanIni,
    pengeluaranBulanIni: totalPengeluaranBulanIni,
    tagihanBelumDibayar: unpaidBills?.length || 0,
    wargaCount
  }

  // --- Gabungkan Transaksi Terbaru (5 data terakhir) ---
  const allTransactions = [
    ...(incomes?.map(i => ({ type: 'masuk', date: i.date, desc: i.description, amount: i.amount, trx: i.transaction_number })) || []),
    ...(expenses?.map(e => ({ type: 'keluar', date: e.date, desc: e.description, amount: e.amount, trx: e.transaction_number })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  // --- 5 Tagihan Tertunggak Terbaru ---
  const recentUnpaid = unpaidBills?.slice(0, 5).map(b => ({
    id: b.id,
    warga: (b.users as any)?.full_name || 'Tidak diketahui',
    rumah: (b.users as any)?.house_number || '-',
    periode: `${b.month}/${b.year}`,
    nominal: b.amount,
    status: b.status
  })) || []

  // --- Agregasi Chart (6 Bulan Terakhir) ---
  const chartData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    
    let incMonth = 0
    let expMonth = 0
    
    incomes?.forEach(inc => {
      const incD = new Date(inc.date)
      if (incD.getMonth() + 1 === m && incD.getFullYear() === y) incMonth += Number(inc.amount)
    })
    
    expenses?.forEach(exp => {
      const expD = new Date(exp.date)
      if (expD.getMonth() + 1 === m && expD.getFullYear() === y) expMonth += Number(exp.amount)
    })
    
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
    
    chartData.push({
      name: `${monthNames[m-1]} ${y}`,
      pemasukan: incMonth,
      pengeluaran: expMonth
    })
  }

  return (
    <DashboardClient 
      stats={stats} 
      chartData={chartData} 
      recentTransactions={allTransactions}
      recentUnpaid={recentUnpaid}
      role={role}
    />
  )
}
