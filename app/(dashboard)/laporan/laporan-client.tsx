'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileSpreadsheet, Printer, Download, Filter, 
  ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, FileText
} from 'lucide-react'
import * as XLSX from 'xlsx'

type Transaction = {
  id: string
  type: string
  date: string
  kategori: string
  deskripsi: string
  nominal: number
  pic: string
}

type ReportData = {
  month: number
  year: number
  saldoAwal: number
  totalPemasukan: number
  totalPengeluaran: number
  saldoAkhir: number
  transactions: Transaction[]
}

export default function LaporanClient({ initialData, appName }: { initialData: ReportData, appName: string }) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState(initialData.month.toString())
  const [selectedYear, setSelectedYear] = useState(initialData.year.toString())
  
  const handleFilter = () => {
    router.push(`/laporan?month=${selectedMonth}&year=${selectedYear}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = () => {
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    const monthName = monthNames[initialData.month - 1]
    
    // Create Summary Data
    const summaryData = [
      { Keterangan: `Laporan Arus Kas ${appName}`, Nilai: '' },
      { Keterangan: 'Periode', Nilai: `${monthName} ${initialData.year}` },
      { Keterangan: '', Nilai: '' },
      { Keterangan: 'Saldo Awal', Nilai: initialData.saldoAwal },
      { Keterangan: 'Total Pemasukan', Nilai: initialData.totalPemasukan },
      { Keterangan: 'Total Pengeluaran', Nilai: initialData.totalPengeluaran },
      { Keterangan: 'Saldo Akhir', Nilai: initialData.saldoAkhir },
      { Keterangan: '', Nilai: '' },
      { Keterangan: 'RINCIAN TRANSAKSI', Nilai: '' },
    ]

    const trxData = initialData.transactions.map((t, idx) => ({
      'No': idx + 1,
      'Tanggal': t.date,
      'Jenis': t.type,
      'Kategori': t.kategori,
      'Deskripsi': t.deskripsi,
      'Pemasukan (Rp)': t.type === 'Pemasukan' ? t.nominal : 0,
      'Pengeluaran (Rp)': t.type === 'Pengeluaran' ? t.nominal : 0,
      'PIC/Warga': t.pic
    }))

    const ws = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true })
    XLSX.utils.sheet_add_json(ws, trxData, { origin: "A10" })
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Cash_Flow")
    XLSX.writeFile(wb, `Laporan_Keuangan_${monthName}_${initialData.year}.xlsx`)
  }

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  
  // Create arrays for dropdowns
  const currentYear = new Date().getFullYear()
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header (Hide on Print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Laporan Keuangan Bulanan</h1>
          <p className="text-gray-500 text-sm mt-1">Laporan arus kas (Pemasukan & Pengeluaran) perumahan.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Printer size={16} /> Cetak / PDF
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filter Section (Hide on Print) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-end gap-4 print:hidden">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Bulan</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-32">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Tahun</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleFilter}
          className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors h-[38px]"
        >
          Tampilkan
        </button>
      </div>

      {/* Printable Report Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Report Header (Visible mainly on Print) */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 print:bg-white print:border-b-2 print:border-gray-900">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Laporan Arus Kas</h2>
            <p className="text-gray-500 font-medium">
              Periode: {monthNames[initialData.month - 1]} {initialData.year}
            </p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Saldo Awal</p>
              <p className="text-xl font-bold text-gray-900 mt-1">Rp {initialData.saldoAwal.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-green-700">Total Pemasukan</p>
              <div className="flex items-center gap-2 mt-1">
                <ArrowDownRight size={18} className="text-green-600" />
                <p className="text-xl font-bold text-green-700">Rp {initialData.totalPemasukan.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm font-medium text-red-700">Total Pengeluaran</p>
              <div className="flex items-center gap-2 mt-1">
                <ArrowUpRight size={18} className="text-red-600" />
                <p className="text-xl font-bold text-red-700">Rp {initialData.totalPengeluaran.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-blue-700">Saldo Akhir</p>
              <p className="text-xl font-bold text-blue-700 mt-1">Rp {initialData.saldoAkhir.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" /> Rincian Transaksi
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase border-b-2 border-gray-200">
                <tr>
                  <th className="py-3 pr-4 font-bold">Tanggal</th>
                  <th className="px-4 py-3 font-bold">Deskripsi & Kategori</th>
                  <th className="px-4 py-3 font-bold text-right">Pemasukan</th>
                  <th className="px-4 py-3 font-bold text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Tidak ada transaksi pada periode ini.
                    </td>
                  </tr>
                ) : (
                  initialData.transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50/50">
                      <td className="py-4 pr-4 whitespace-nowrap text-gray-600">
                        {trx.date}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-900">{trx.deskripsi}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            trx.type === 'Pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {trx.kategori}
                          </span>
                          <span className="text-xs text-gray-400">• PIC: {trx.pic}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-green-600">
                        {trx.type === 'Pemasukan' ? `Rp ${trx.nominal.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-red-600">
                        {trx.type === 'Pengeluaran' ? `Rp ${trx.nominal.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={2} className="py-4 px-4 font-bold text-gray-900 text-right">TOTAL BULAN INI</td>
                  <td className="py-4 px-4 font-bold text-green-600 text-right">Rp {initialData.totalPemasukan.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 font-bold text-red-600 text-right">Rp {initialData.totalPengeluaran.toLocaleString('id-ID')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-12 pt-8 flex justify-end print:block hidden">
             <div className="w-64 text-center">
               <p className="text-sm text-gray-500 mb-16">Mengetahui, Pengurus {appName}</p>
               <p className="font-bold text-gray-900 border-b border-gray-900 pb-1">( ........................................ )</p>
               <p className="text-xs text-gray-500 mt-1">Tanda Tangan & Nama Terang</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
