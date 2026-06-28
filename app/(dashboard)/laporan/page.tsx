import { createClient } from '@/utils/supabase/server'
import LaporanClient from './laporan-client'
import { getAppSettings } from '@/lib/settings'

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Parsing filter month/year dari URL
  const selectedMonth = searchParams.month ? parseInt(searchParams.month as string) : currentMonth
  const selectedYear = searchParams.year ? parseInt(searchParams.year as string) : currentYear
  
  const filterDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
  const filterDate = new Date(filterDateStr)
  
  const settings = await getAppSettings()
  const appName = settings['app_name'] || 'AlifPark Residence'
  
  // 1. Ambil Semua Pemasukan
  const { data: allIncomes } = await supabase.from('incomes').select(`
    amount, date, description, transaction_number, 
    income_categories(name), users!incomes_created_by_fkey(full_name)
  `)
  
  // 2. Ambil Semua Pengeluaran
  const { data: allExpenses } = await supabase.from('expenses').select(`
    amount, date, description, transaction_number, proof_url,
    expense_categories(name), users!expenses_created_by_fkey(full_name)
  `)

  // --- LOGIKA PERHITUNGAN SALDO AWAL (Total semua transaksi SEBELUM bulan yang dipilih) ---
  let saldoAwal = 0
  
  allIncomes?.forEach(inc => {
    if (new Date(inc.date) < filterDate) saldoAwal += Number(inc.amount)
  })
  
  allExpenses?.forEach(exp => {
    if (new Date(exp.date) < filterDate) saldoAwal -= Number(exp.amount)
  })

  // --- LOGIKA TRANSAKSI BULAN TERPILIH ---
  const transactions: any[] = []
  let totalPemasukanBulanIni = 0
  let totalPengeluaranBulanIni = 0

  allIncomes?.forEach(inc => {
    const d = new Date(inc.date)
    if (d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear) {
      const amt = Number(inc.amount)
      totalPemasukanBulanIni += amt
      transactions.push({
        id: `inc-${inc.transaction_number}`,
        type: 'Pemasukan',
        date: inc.date,
        kategori: inc.income_categories?.name || '-',
        deskripsi: inc.description,
        nominal: amt,
        pic: (inc.users as any)?.full_name || '-'
      })
    }
  })

  allExpenses?.forEach(exp => {
    const d = new Date(exp.date)
    if (d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear) {
      const amt = Number(exp.amount)
      totalPengeluaranBulanIni += amt
      transactions.push({
        id: `exp-${exp.transaction_number}`,
        type: 'Pengeluaran',
        date: exp.date,
        kategori: exp.expense_categories?.name || '-',
        deskripsi: exp.description,
        nominal: amt,
        pic: (exp.users as any)?.full_name || '-'
      })
    }
  })

  // Sort transaksi dari yang paling lama ke yang terbaru
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Saldo Akhir
  const saldoAkhir = saldoAwal + totalPemasukanBulanIni - totalPengeluaranBulanIni

  const reportData = {
    month: selectedMonth,
    year: selectedYear,
    saldoAwal,
    totalPemasukan: totalPemasukanBulanIni,
    totalPengeluaran: totalPengeluaranBulanIni,
    saldoAkhir,
    transactions
  }

  return <LaporanClient initialData={reportData} appName={appName} />
}
